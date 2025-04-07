import { nanoid } from "nanoid";
import { connection } from "../config/connection.js";
import { configDotenv } from "dotenv";
configDotenv();

const getNotesController = async (req, res) => {
  try {
    connection.query(
      "SELECT * FROM notes WHERE id_user = ?",
      [req.user.id_user],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            error: true,
            message: `GET NOTES GAGAL DI AMBIL!`,
          });
        }
        return res.status(200).json({
          error: false,
          message: `GET NOTES DENGAN ID USER ${req.user.id_user} BERHASIL DI AMBIL!`,
          data: result,
        });
      }
    );
  } catch (e) {
    return res.status(500).json({
      error: true,
      message: `GET NOTES GAGAL DIAMBIL!`,
    });
  }
};

const createNoteController = async (req, res) => {
  const id_notes = nanoid();
  const { name, content } = req.body;
  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(",", "")
    .replace(/\./g, ":");

  if (!name) {
    return res.status(400).json({
      error: true,
      message: `JUDUL CATATAN TIDAK BOLEH KOSONG`,
    });
  }

  const query =
    "INSERT INTO notes (id_note, name, content, date, id_user) VALUES (?,?,?,?,?)";
  const value = [id_notes, name, content, formattedDate, req.user.id_user];
  try {
    connection.query(query, value, async (err, result) => {
      if (err) {
        return res.status(500).json({
          error: true,
          message: `CREATE NOTES GAGAL DI BUAT!`,
        });
      }
      return res.status(200).json({
        error: false,
        message: `CREATE NOTES BERHASIL DI BUAT!`,
      });
    });
  } catch (e) {
    return res.status(500).json({
      error: true,
      message: `CREATE NOTES GAGAL DI BUAT!`,
    });
  }
};

const getDetailNoteController = async (req, res) => {
  const { id_note } = req.params;
  const query = "SELECT * FROM notes WHERE id_note = ? AND id_user = ?";
  const value = [id_note, req.user.id_user];
  try {
    connection.query(query, value, async (err, result) => {
      if (err) {
        return res.status(500).json({
          error: true,
          message: `GET DETAIL NOTES GAGAL DI AMBIL!`,
        });
      }
      return res.status(200).json({
        error: false,
        message: `GET DETAIL NOTES DENGAN ID NOTE ${id_note} BERHASIL DI AMBIL!`,
        data: result,
      });
    });
  } catch (e) {
    return res.status(500).json({
      error: true,
      message: `GET DETAIL NOTES GAGAL DI AMBIL!`,
    });
  }
};

const editNoteController = async (req, res) => {
  const { id_note } = req.params;
  const queryDetail = "SELECT * FROM notes WHERE id_note = ? AND id_user = ?";
  const valueDetail = [id_note, req.user.id_user];
  try {
    connection.query(queryDetail, valueDetail, async (err, result) => {
      if (err) {
        return res.status(500).json({
          error: true,
          message: `GET DETAIL NOTES GAGAL DI AMBIL!`,
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          error: true,
          message: `NOTES DENGAN ID ${id_note} TIDAK DITEMUKAN!`,
        });
      }

      const { name, content } = req.body;

      const now = new Date();
      const formattedDate = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .format(now)
        .replace(",", "")
        .replace(/\./g, ":");

      if (!name) {
        return res.status(400).json({
          error: true,
          message: `JUDUL CATATAN TIDAK BOLEH KOSONG`,
        });
      }

      const query =
        "UPDATE notes SET name = ?, content = ?, date = ? WHERE id_note = ? AND id_user = ?";
      const value = [
        name || result[0].name,
        content || result[0].content,
        formattedDate,
        id_note,
        req.user.id_user,
      ];

      try {
        connection.query(query, value, (err, result) => {
          if (err) {
            return res.status(500).json({
              error: true,
              message: `EDIT NOTE GAGAL DI EDIT!`,
            });
          }
          return res.status(200).json({
            error: false,
            message: `EDIT NOTE DENGAN ID NOTE ${id_note} BERHASIL DI EDIT!`,
          });
        });
      } catch (e) {
        return res.status(500).json({
          error: true,
          message: `EDIT NOTE GAGAL DI EDIT!`,
        });
      }
    });
  } catch (e) {
    return res.status(500).json({
      error: true,
      message: `GET DETAIL NOTES GAGAL DI AMBIL!`,
    });
  }
};

const deleteNoteController = async (req, res) => {
  const { id_note } = req.params;
  const query = "DELETE FROM notes WHERE id_note = ? AND id_user = ?";
  const value = [id_note, req.user.id_user];
  try {
    connection.query(query, value, (err, result) => {
      if (err) {
        return res.status(500).json({
          error: true,
          message: `DELETE NOTE GAGAL!`,
        });
      }
      return res.status(200).json({
        error: false,
        message: `DELETE NOTE BERHASIL!`,
      });
    });
  } catch (e) {
    return res.status(500).json({
      error: true,
      message: `DELETE NOTE GAGAL!`,
    });
  }
};

export const notesController = {
  getNotesController,
  createNoteController,
  getDetailNoteController,
  editNoteController,
  deleteNoteController,
};
