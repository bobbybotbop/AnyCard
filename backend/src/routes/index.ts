import { Request, Response, Router } from "express";

import {
  getUserByEmail,
  findUserByUserName,
  createUser,
  swapCards,
  deleteCard,
  addToUserDeck,
} from "../controllers/userController";

const router = Router();

router.get("/id/:id", getUserByEmail);
router.get("/id/:username", findUserByUserName);

router.post("/createUser", createUser);
router.post("/swap-cards/:id", swapCards);

router.put("/updateDeck/:id", addToUserDeck);

router.delete("/deleteCard/:id", deleteCard);

export default router;
