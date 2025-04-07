import { nanoid } from "nanoid";
import { connection } from "../config/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
configDotenv();

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const getUsersController = async (req, res) => {
  const query = "SELECT * FROM users";
  try {
    connection.query(query, (err, result) => {
      if (err) {
        return res.status(500).json({
          error: true,
          message: "GET USERS GAGAL DIAMBIL!",
          data: result,
        });
      }
      return res.status(200).json({
        error: false,
        message: "GET USERS BERHASIL DIAMBIL!",
        data: result,
      });
    });
  } catch (e) {
    return res.status(500).json({
      error: false,
      message: "GET USERS GAGAL DIJALANKAN!",
      data: result,
    });
  }
};

const createUserController = async (req, res) => {
  const { email, firstname, lastname, password } = req.body;
  const profile_img = req.file ? req.file.filename : "account.png";
  const id = nanoid();

  if (!firstname) {
    return res.status(400).json({
      error: true,
      message: "NAMA DEPAN TIDAK BOLEH KOSONG ATAU HARUS DIISI!",
    });
  }

  if (!email || !validateEmail(email)) {
    return res.status(400).json({
      error: true,
      message: "EMAIL YANG DIMASUKKAN TIDAK VALID ATAU TIDAK BOLEH KOSONG!",
    });
  }

  if (password.length <= 7) {
    return res.status(400).json({
      error: true,
      message: "PASSWORD HARUS LEBIH DARI 8!",
    });
  }

  const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
  connection.query(checkEmailQuery, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({
        error: true,
        message: "GAGAL MELAKUKAN PENGECEKAN EMAIL!",
      });
    }

    if (results.length > 0) {
      return res.status(400).json({
        error: true,
        message: "EMAIL SUDAH TERDAFTAR!",
      });
    }

    // Email belum terdaftar, lanjut insert
    const query =
      "INSERT INTO users (id_user, email, firstname, lastname, password, profile_img) VALUES (?,?,?,?,?,?)";
    const hashedPassword = await bcrypt.hash(password, 10);
    const value = [id, email, firstname, lastname, hashedPassword, profile_img];

    connection.query(query, value, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: true,
          message: "CREATE USER GAGAL DIBUAT!",
        });
      }
      return res.status(200).json({
        error: false,
        message: "CREATE USER BERHASIL DIBUAT!",
      });
    });
  });
};

const getDetailUserController = async (req, res) => {
  const { id_user } = req.params;
  const query = "SELECT * FROM users WHERE id_user = ?";
  const value = [id_user];

  try {
    connection.query(query, value, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: true,
          message: "GET DETAIL USER GAGAL DIAMBIL!",
        });
      }
      return res.status(200).json({
        error: false,
        message: "GET DETAIL USER BERHASIL DIAMBIL!",
        data: result[0],
      });
    });
  } catch (e) {
    return res.status(500).json({
      error: true,
      message: "EDIT USER GAGAL DIJALANKAN!",
    });
  }
};

const editUserController = async (req, res) => {
  const { id_user } = req.params;
  const queryDetail = "SELECT * FROM users WHERE id_user = ?";
  const valueDetail = [id_user];

  try {
    connection.query(queryDetail, valueDetail, async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: true,
          message: "GET DETAIL USER GAGAL DIAMBIL!",
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          error: true,
          message: `USER DENGAN ID ${id_user} TIDAK DITEMUKAN!`,
        });
      }

      const {
        firstname,
        lastname,
        oldPassword,
        newPassword,
        confirmNewPassword,
      } = req.body;
      const profile_img = req.file ? req.file.filename : null;

      if (
        !result[0].firstname ||
        !result[0].password ||
        !result[0].profile_img
      ) {
        return res.status(400).json({
          error: true,
          message: "DATA KOSONG!",
        });
      }

      if (!firstname) {
        return res.status(400).json({
          error: true,
          message: "NAMA DEPAN TIDAK BOLEH KOSONG ATAU HARUS DIISI!",
        });
      }

      if (
        oldPassword !== "" ||
        newPassword !== "" ||
        confirmNewPassword !== ""
      ) {
        const isMatch = await bcrypt.compare(oldPassword, result[0].password);
        if (!isMatch) {
          return res.status(400).json({
            error: true,
            message: `PASSWORD LAMA SALAH!`,
          });
        }
        if (newPassword.length <= 7) {
          return res.status(400).json({
            error: true,
            message: "PASSWORD BARU HARUS LEBIH DARI 8!",
          });
        }
        const isMatchNewAndOld = await bcrypt.compare(
          newPassword,
          result[0].password
        );
        if (isMatchNewAndOld) {
          return res.status(400).json({
            error: true,
            message: "PASSWORD BARU TIDAK BOLEH SAMA DENGAN YANG LAMA!",
          });
        }
        if (newPassword !== confirmNewPassword) {
          return res.status(400).json({
            error: true,
            message: "KONFIRMASI PASSWORD BARU TIDAK SESUAI!",
          });
        }
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      const queryEdit =
        "UPDATE users SET firstname = ?, lastname = ?, password = ?, profile_img = ? WHERE id_user = ?";
      const valueEdit = [
        firstname || result[0].firstname,
        lastname,
        hashedNewPassword,
        profile_img || result[0].profile_img,
        id_user,
      ];

      connection.query(queryEdit, valueEdit, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            error: true,
            message: "EDIT USER GAGAL DIUBAH!",
          });
        }
        return res.status(200).json({
          error: false,
          message: `EDIT USER ${id_user} BERHASIL DIUBAH!`,
        });
      });
    });
  } catch (e) {
    return res.status(500).json({
      error: true,
      message: "DETAIL USER GAGAL DIJALANKAN!",
    });
  }
};

const deleteUserController = async (req, res) => {
  const { id_user } = req.params;
  try {
    connection.query(
      "DELETE FROM users WHERE id_user = ?",
      [id_user],
      (err, result) => {
        if (err) {
          res.status(500).json({
            error: true,
            message: "DELETE USER GAGAL DIHAPUS!",
          });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({
            error: true,
            message: `USER DENGAN ID ${id_user} TIDAK DITEMUKAN!`,
          });
        }
        res.status(200).json({
          error: false,
          message: `DELETE USER ${id_user} GAGAL DIJALANKAN!`,
        });
      }
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({
      error: true,
      message: "DELETE USER GAGAL DIJALANKAN!",
    });
  }
};

const loginUserController = async (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";
  try {
    connection.query(query, [email], async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          error: true,
          message: "EMAIL ATAU PASSWORD SALAH!",
        });
      }

      if (result.length === 0) {
        console.log(result.length);
        return res.status(500).json({
          error: true,
          message: "EMAIL ATAU PASSWORD SALAH!",
        });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        result[0].password
      );

      if (!isPasswordValid) {
        return res.status(500).json({
          error: true,
          message: "EMAIL ATAU PASSWORD SALAH!",
        });
      }

      const token = jwt.sign(
        { id_user: result[0].id_user, email: result[0].email },
        process.env.SECRET_KEY
      );
      return res.status(200).json({
        error: false,
        message: "LOGIN BERHASIL BOS!!!",
        id_user: result[0].id_user,
        token,
      });
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      error: true,
      message: "EMAIL ATAU PASSWORD SALAH!",
    });
  }
};

export const usersController = {
  getUsersController,
  createUserController,
  getDetailUserController,
  editUserController,
  deleteUserController,
  loginUserController,
};
