import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { notesController } from "../controller/notes.js";
import { upload } from "../middleware/multer.js";

export const notesRouter = express.Router();

notesRouter.get("/", authMiddleware, notesController.getNotesController);
notesRouter.post(
  "/",
  authMiddleware,
  upload.single(""),
  notesController.createNoteController
);
notesRouter.get(
  "/:id_note",
  authMiddleware,
  notesController.getDetailNoteController
);
notesRouter.put(
  "/:id_note",
  authMiddleware,
  upload.single(""),
  notesController.editNoteController
);
notesRouter.delete(
  "/:id_note",
  authMiddleware,
  notesController.deleteNoteController
);
