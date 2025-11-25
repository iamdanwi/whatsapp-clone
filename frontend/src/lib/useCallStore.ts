import { create } from "zustand";

interface CallStore {
    isCallIncoming: boolean;
    isCallActive: boolean;
    caller: any;
    callType: "audio" | "video" | null;
    signal: any;

    isInitiator: boolean;

    setIncomingCall: (caller: any, signal: any, type: "audio" | "video") => void;
    startCall: (caller: any, type: "audio" | "video") => void;
    setCallActive: (active: boolean) => void;
    endCall: () => void;
    reset: () => void;
}

export const useCallStore = create<CallStore>((set) => ({
    isCallIncoming: false,
    isCallActive: false,
    isInitiator: false,
    caller: null,
    callType: null,
    signal: null,

    setIncomingCall: (caller, signal, type) => set({ isCallIncoming: true, caller, signal, callType: type, isInitiator: false }),
    startCall: (caller, type) => set({ isCallActive: true, caller, callType: type, isInitiator: true }),
    setCallActive: (active) => set({ isCallActive: active, isCallIncoming: false }),
    endCall: () => set({ isCallActive: false, isCallIncoming: false, caller: null, signal: null, callType: null, isInitiator: false }),
    reset: () => set({ isCallIncoming: false, isCallActive: false, caller: null, signal: null, callType: null, isInitiator: false }),
}));
