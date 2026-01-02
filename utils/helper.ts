import { AppwriteException } from "appwrite";

export const menuOptions: {
  label: string;
  value: string;
  type?: "default" | "danger";
}[] = [
  {
    label: "My Profile",
    value: "myProfile",
  },
  {
    label: "My Added Restaurants",
    value: "myAddedRestaurants",
  },
  {
    label: "Contact Us",
    value: "contactUs",
  },
  {
    label: "Logout",
    value: "logout",
    type: "danger",
  },
];

export function toTitleCase(str?: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppwriteException) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
