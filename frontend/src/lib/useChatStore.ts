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

    getChats: () => Promise<void>;
    getMessages: (chatId: string) => Promise<void>;
    sendMessage: (messageData: { text: string }) => Promise<void>;
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void;
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

            if (messageChatId !== currentChatId) return;

            set({
                messages: [...get().messages, newMessage],
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("message received");
    },

    setSelectedChat: (selectedChat) => set({ selectedChat }),
}));
