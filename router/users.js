import express from "express";
import { usersController } from "../controller/users.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.js";

export const usersRoute = express.Router();

usersRoute.get("/", usersController.getUsersController);
usersRoute.post(
  "/",
  upload.single("profile_img"),
  usersController.createUserController
);
usersRoute.get(
  "/:id_user",
  authMiddleware,
  usersController.getDetailUserController
);
usersRoute.put(
  "/:id_user",
  authMiddleware,
  upload.single("profile_img"),
  usersController.editUserController
);
usersRoute.delete(
  "/:id_user",
  authMiddleware,
  usersController.deleteUserController
);
usersRoute.post(
  "/login",
  //upload.single("profile_img"),
  usersController.loginUserController
);
