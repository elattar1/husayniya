import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Removes embedded chat logs from the notes field so user-facing views only see the original order note.
 */
export function cleanOrderNotes(notes?: string | null): string {
  if (!notes) return "";
  return notes.replace(/<!-- CHAT_V1: [\s\S]*? -->/, "").trim();
}
