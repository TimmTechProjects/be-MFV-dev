import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Request interface to allow adding `user` property
interface AuthenticatedRequest extends Request {
  user?: string; // user Id
}

const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };
    req.user = decoded.id;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default verifyToken;
