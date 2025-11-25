import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "./axios";
import { useAuthStore } from "./useAuthStore";

interface Message {
    _id: string;
    sender: {
        _id: string;
        name: string;
        avatar: string;
    };
    content: string;
    image?: string;
    chatId: string;
    createdAt: string;
}

interface Chat {
    _id: string;
    users: any[];
    isGroup: boolean;
    groupName?: string;
    lastMessage?: Message;
}

interface ChatStore {
    messages: Message[];
    users: any[];
    chats: Chat[];
    selectedChat: Chat | null;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
    isChatsLoading: boolean;
    isTyping: boolean;

    getChats: () => Promise<void>;
    getMessages: (chatId: string) => Promise<void>;
    sendMessage: (messageData: { text: string; image?: string | null }) => Promise<void>;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
    subscribeToTyping: () => void;
    unsubscribeFromTyping: () => void;
    sendTyping: (chatId: string) => void;
    sendStopTyping: (chatId: string) => void;
    deleteMessage: (messageId: string) => Promise<void>;
    setSelectedChat: (selectedChat: Chat | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    messages: [],
    users: [],
    chats: [],
    selectedChat: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isChatsLoading: false,
    isTyping: false,

    getChats: async () => {
        set({ isChatsLoading: true });
        try {
            const res = await axiosInstance.get("/chats");
            set({ chats: res.data });
        } catch (error: any) {
            toast.error(error.response.data.message);
        } finally {
            set({ isChatsLoading: false });
        }
    },

    getMessages: async (chatId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${chatId}`);
            set({ messages: res.data });

            const socket = useAuthStore.getState().socket;
            if (socket) {
                socket.emit("join chat", chatId);
            }
        } catch (error: any) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedChat, messages } = get();
        try {
            const socket = useAuthStore.getState().socket;
            if (socket && selectedChat) {
                socket.emit("sendMessage", {
                    content: messageData.text,
                    image: messageData.image,
                    chatId: selectedChat._id,
                    senderId: useAuthStore.getState().authUser?._id
                });
            }
        } catch (error: any) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("message received", (newMessage: Message) => {
            // Check if the message belongs to the currently selected chat
            // The newMessage.chatId might be an object or string depending on population
            // Based on worker, it populates chatId, so it's an object.
            // Wait, in worker: message = await message.populate("chatId");
            // So newMessage.chatId is the Chat object.

            const currentChatId = get().selectedChat?._id;
            const messageChatId = typeof newMessage.chatId === 'object' ? (newMessage.chatId as any)._id : newMessage.chatId;

            if (messageChatId !== currentChatId) {
                // Play notification sound if not in the chat
                const sound = new Audio("/notification.mp3");
                sound.play().catch(error => console.log("Error playing sound:", error));
                return;
            }

            set({
                messages: [...get().messages, newMessage],
            });
        });

        socket.on("messageDeleted", (deletedMessage: Message) => {
            const currentChatId = get().selectedChat?._id;
            const messageChatId = typeof deletedMessage.chatId === 'object' ? (deletedMessage.chatId as any)._id : deletedMessage.chatId;

            if (messageChatId !== currentChatId) return;

            set({
                messages: get().messages.map(msg => msg._id === deletedMessage._id ? deletedMessage : msg),
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("message received");
        socket.off("messageDeleted");
    },

    subscribeToTyping: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("typing", () => set({ isTyping: true }));
        socket.on("stop typing", () => set({ isTyping: false }));
    },

    unsubscribeFromTyping: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("typing");
        socket.off("stop typing");
    },

    sendTyping: (chatId) => {
        const socket = useAuthStore.getState().socket;
        if (socket) socket.emit("typing", chatId);
    },

    sendStopTyping: (chatId) => {
        const socket = useAuthStore.getState().socket;
        if (socket) socket.emit("stop typing", chatId);
    },

    deleteMessage: async (messageId) => {
        try {
            await axiosInstance.delete(`/messages/${messageId}`);
            // Optimistic update or wait for socket? Socket is safer for consistency.
            // But we can update local state too.
            set({
                messages: get().messages.map(msg =>
                    msg._id === messageId
                        ? { ...msg, content: "This message was deleted" }
                        : msg
                )
            });
        } catch (error: any) {
            toast.error(error.response.data.message);
        }
    },

    setSelectedChat: (selectedChat) => set({ selectedChat }),
}));
