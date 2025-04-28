import "express";

declare module "express" {
  interface Request {
    user?: any; // or better: user: { id: string, email: string } depending on your token
  }
}
