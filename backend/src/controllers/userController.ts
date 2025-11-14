import { Request, Response } from "express";
//import { User } from "../models/model.ts";

export const getUserByEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.params;
    console.log("Find specific user by their userID");

    // find user
    // const user = await User.findById(uniqueId)
    res.status(200).json();
  } catch {
    console.log("Could not find user");
    res.status(500).json();
  }
};

export const findUserByUserName = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    // find user
    // const user = await User.findById(id);
    const user = null;
    if (!user) {
      res.status(400).json();
      console.log("No user found");
    }

    // found user
    res.status(200).json();
    console.log("Found User");
  } catch {
    // server error
    res.status(500).json();
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check first if user exists
    // if so, do no do anything. send 418 'Im a teapot'

    // If user does not exist, create user with user email and username as identfiers.
    const { useremail, username } = req.body;
  } catch {
    res.status(500).json();
  }
};

export const swapCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, userSwappedCard, targetUser, targetUserSwapperCard } =
      req.body;
  } catch {
    res.status(500).json();
  }
};

export const addToUserDeck = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cardsToAdd } = req.body;

    // check if user already has any cards in body
    // if so, do NOT add those cards
    // add remaining NON-duplicate cards to user info
  } catch {
    res.status(500).json();
  }
};

export const deleteCard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { deletedCard } = req.body;

    // first find the deleted card
    // if card does not exist, throw 499 error, card not found

    // if it does, delete it!
  } catch {
    res.status(500).json();
  }
};
