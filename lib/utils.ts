import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getImage = async (imageUrl: string) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/images/${imageUrl}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }
    const data = await response.text();
    return data;
  } catch (error) {
    console.error("Error fetching image:", error);
  }
};
