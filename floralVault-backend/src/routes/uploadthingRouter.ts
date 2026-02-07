import { createUploadthing, type FileRouter } from "uploadthing/express";
import { UploadThingError } from "uploadthing/server";
import jwt from "jsonwebtoken";

const uploadThing = createUploadthing();

interface JWTPayload {
  id: string;
  iat: number;
  exp: number;
}

const auth = async (req: import("express").Request) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    return { id: decoded.id };
  } catch (err) {
    console.error("Invalid JWT in UploadThing middleware:", err);
    return null;
  }
};

export const ourFileRouter = {
  imageUploader: uploadThing({
    image: { maxFileSize: "32MB", maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete:", metadata.userId, file.url);
    }),
} satisfies FileRouter;
