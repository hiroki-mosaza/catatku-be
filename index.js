import express from "express";
import cors from "cors";
import { usersRoute } from "./router/users.js";
import { notesRouter } from "./router/notes.js";
import { upload } from "./middleware/multer.js";
import helmet from "helmet";
import { configDotenv } from "dotenv";
configDotenv();

const app = express();

app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/users", usersRoute);
app.use("/notes", notesRouter);
app.use(express.static("public/"));

app.get("/", (req, res) => {
  return res.json({
    message: "Mantap slur!!!",
  });
});

app.post("/upload", upload.single("foto"), (req, res) => {
  return res.json({
    message: "foto berhasil diupload",
  });
});

app.listen(process.env.PORT, () => {
  console.log(
    `Server CATATKU berhasil dijalankan dengan port ${process.env.PORT} !`
  );
});

export default app;
