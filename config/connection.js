import { configDotenv } from "dotenv";
import mysql from "mysql2";

configDotenv();
export const connection = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

// connection.connect((error) => {
//   if (error) {
//     console.log("KONEKSI ERROR BOS!!!");
//   } else {
//     console.log("KONEKSI BERHASIL BOS!!!");
//   }
// });
