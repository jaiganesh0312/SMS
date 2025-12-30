"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

export function Providers({ children }) {
  return (
    <HeroUIProvider labelPlacement="outside">
      <AuthProvider>
        <SocketProvider>
          <ToastProvider placement="top-right" />
          {children}
        </SocketProvider>
      </AuthProvider>
    </HeroUIProvider>
  );
}
