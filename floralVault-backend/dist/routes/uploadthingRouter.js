"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ourFileRouter = void 0;
const express_1 = require("uploadthing/express");
const server_1 = require("uploadthing/server");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uploadThing = (0, express_1.createUploadthing)();
const auth = async (req) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer "))
        return null;
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return { id: decoded.id };
    }
    catch (err) {
        console.error("Invalid JWT in UploadThing middleware:", err);
        return null;
    }
};
exports.ourFileRouter = {
    imageUploader: uploadThing({
        image: { maxFileSize: "32MB", maxFileCount: 10 },
    })
        .middleware(async ({ req }) => {
        const user = await auth(req);
        if (!user)
            throw new server_1.UploadThingError("Unauthorized");
        return { userId: user.id };
    })
        .onUploadComplete(async ({ metadata, file }) => {
        console.log("Upload complete:", metadata.userId, file.url);
    }),
};
