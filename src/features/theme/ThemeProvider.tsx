"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTheme, type EventTheme } from "./api";

interface ThemeContextValue {
  theme: EventTheme | null;
  isLoading: boolean;
  isError: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyCssVariables(theme: EventTheme): void {
  const root = document.documentElement;
  if (theme.colors.primary) root.style.setProperty("--color-primary", theme.colors.primary);
  if (theme.colors.secondary) root.style.setProperty("--color-secondary", theme.colors.secondary);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ["theme"],
    queryFn: fetchTheme,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (query.data) {
      applyCssVariables(query.data);
      document.title = query.data.eventTitle;
    }
  }, [query.data]);

  return (
    <ThemeContext.Provider
      value={{ theme: query.data ?? null, isLoading: query.isLoading, isError: query.isError }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useEventTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useEventTheme doit être utilisé sous ThemeProvider");
  }
  return context;
}
