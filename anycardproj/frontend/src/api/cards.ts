import { BACKEND_BASE_PATH } from "../constants/Navigation";
import { newUser, userData, Set, Card } from "@full-stack/types";

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

export interface SerperResult {
  title: string;
  imageUrl: string | null;
}

export const searchSerper = async (query: string): Promise<SerperResult> => {
  const response = await fetch(
    `${BACKEND_BASE_PATH}/api/serperSearch?query=${encodeURIComponent(query)}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to search Serper API");
  }

  return response.json();
};

export interface OpenRouterResponse {
  id?: string;
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
  }>;
  error?: string;
  details?: any;
}

export const callOpenRouter = async (
  input: string
): Promise<OpenRouterResponse> => {
  const response = await fetch(`${BACKEND_BASE_PATH}/api/openrouter`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to call OpenRouter");
  }

  return response.json();
};

export const createRandomSet = async (): Promise<any> => {
  const response = await fetch(`${BACKEND_BASE_PATH}/api/createRandomSet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create random set");
  }

  return response.json();
};

export const createDailyPacks = async (): Promise<Set[]> => {
  const response = await fetch(`${BACKEND_BASE_PATH}/api/createDailyPacks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create daily packs");
  }

  return response.json();
};

export const getDailyPacks = async (): Promise<Set[]> => {
  const response = await fetch(`${BACKEND_BASE_PATH}/api/getDailyPacks`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get daily packs");
  }

  return response.json();
};

export const getAllSets = async (): Promise<Set[]> => {
  const response = await fetch(`${BACKEND_BASE_PATH}/api/getAllSets`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get all sets");
  }

  return response.json();
};

export interface OpenPackResponse {
  awarded: Card[];
  message: string;
}

export const openPack = async (
  userUid: string,
  packId: string,
  collection: string
): Promise<OpenPackResponse> => {
  const response = await fetch(`${BACKEND_BASE_PATH}/api/openPack/${userUid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ packId, collection }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to open pack");
  }

  return response.json();
};

export const getCustomSetPrompt = async (
  themeInput: string
): Promise<string> => {
  const response = await fetch(`${BACKEND_BASE_PATH}/api/getCustomSetPrompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ themeInput }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get custom set prompt");
  }

  const data = await response.json();
  return data.prompt;
};

export const createCustomSet = async (themeInput: string): Promise<Set> => {
  const response = await fetch(`${BACKEND_BASE_PATH}/api/createCustomSet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ themeInput }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create custom set");
  }

  return response.json();
};

export const getAllCustomSets = async (): Promise<Set[]> => {
  const response = await fetch(`${BACKEND_BASE_PATH}/api/getAllCustomSets`, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get custom sets");
  }

  return response.json();
};
