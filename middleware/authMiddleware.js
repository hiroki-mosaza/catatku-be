import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: true,
      message: "TOKEN BELUM DITERIMA",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({
      error: true,
      message: "TOKEN TIDAK VALID BOS!",
    });
  }
};
