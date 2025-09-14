import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key" });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};
