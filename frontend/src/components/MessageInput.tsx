"use client";

import { useState } from "react";

import { Send } from "lucide-react";
import { useChatStore } from "@/lib/useChatStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const MessageInput = () => {
    const [text, setText] = useState("");
    const { sendMessage } = useChatStore();

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        try {
            await sendMessage({
                text: text.trim(),
            });

            // Clear form
            setText("");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <div className="p-4 w-full">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2">
                    <Input
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>
                <Button
                    type="submit"
                    className="btn btn-sm btn-circle"
                    disabled={!text.trim()}
                >
                    <Send size={22} />
                </Button>
            </form>
        </div>
    );
};
export default MessageInput;
