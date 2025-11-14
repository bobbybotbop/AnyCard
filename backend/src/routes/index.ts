import { Request, Response, Router } from "express";

import {
  getUser,
  getUserByEmail,
  findUserByUserName,
  createUser,
  swapCards,
  deleteCard,
  addToUserCards,
} from "../controllers/userController";

const router = Router();

router.get("/:id", getUser);
router.get("/email/:email", getUserByEmail);
router.get("/username/:username", findUserByUserName);

router.post("", createUser);
router.post("/:id/swap-cards", swapCards);

router.put("/:id/cards", addToUserCards);

router.delete("/:id/cards/:cardId", deleteCard);

export default router;
