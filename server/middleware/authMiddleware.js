import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // если токена нет → гость
  if (!authHeader) {
    req.user = { role: "guest" };
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded; // { id, role }
    next();
  } catch (e) {
    req.user = { role: "guest" };
    next();
  }
};
