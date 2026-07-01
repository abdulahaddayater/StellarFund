"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "glass border border-white/10",
        },
      }}
    />
  );
}
