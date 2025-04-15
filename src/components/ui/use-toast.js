"use client";

import { Toaster, toast as toastPrimitive } from "sonner";
import { useEffect, useState } from "react";

export function ToasterProvider() {
  return <Toaster position="top-center" />;
}

export function useToast() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function toast(options) {
    if (!isMounted) return;

    if (options.variant === "destructive") {
      toastPrimitive.error(options.title, {
        description: options.description,
        duration: options.duration || 5000,
      });
    } else {
      toastPrimitive.success(options.title, {
        description: options.description,
        duration: options.duration || 5000,
      });
    }
  };

  return { toast };
}