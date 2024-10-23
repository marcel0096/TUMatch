import config from "../config.js";
import jwt from "jsonwebtoken";

const checkAuthentication = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).json({
      error: "Access denied",
    });
  }
  jwt.verify(token, config.TOKEN_KEY, async (err, decoded) => {
    if (err) {
      return res.status(403).json({
        error: "Unauthorized",
        message: "Failed to authenticate token.",
      });
    }
    req.userId = decoded.id;
    next();
  });
};

export default checkAuthentication;
