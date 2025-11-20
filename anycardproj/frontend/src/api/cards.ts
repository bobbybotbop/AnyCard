import { BACKEND_BASE_PATH } from "../constants/Navigation";
import { newUser, userData } from "@full-stack/types";

export interface Card {
  id?: string;
  name: string;
  description?: string;
  // Add other card properties here
}

// CREATE - POST /api/createCard
export const createCard = async (cardData: Omit<Card, "id">): Promise<Card> => {
  const response = await fetch(`${BACKEND_BASE_PATH}/api/createCard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cardData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create card");
  }

  return response.json();
};

export const createUser = async (userData: newUser): Promise<userData> => {
  const response = await fetch(`${BACKEND_BASE_PATH}/api/createUser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create user");
  }

  return response.json();
};

export const getUserData = async (uid: string): Promise<userData> => {
  const response = await fetch(`${BACKEND_BASE_PATH}/api/getUserData/${uid}`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get user data");
  }

  return response.json();
};
