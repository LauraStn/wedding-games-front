"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "./queryClient";
import { ThemeProvider } from "../features/theme/ThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  // Une instance par montage (et non un singleton de module) : en SSR, un
  // singleton partagerait du cache entre requêtes/utilisateurs différents.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
