"use client";

import { create } from "zustand";

// Define the shape of the store's state
interface UserState {
  email: string;
  setEmail: (email: string) => void;
}

// Create the Zustand store
const useUserStore = create<UserState>((set) => ({
  email: localStorage.getItem("userEmail") || "",
  setEmail: (email: string) => {
    localStorage.setItem("userEmail", email);
    set({ email });
  },
}));
