import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import tagRoutes from "./routes/tagRoutes";
import plantRoutes from "./routes/plantRoutes";
import collectionRoutes from "./routes/collectionRoutes";
import searchRoutes from "./routes/searchRoutes";
import { uploadthingHandler } from "./routes/uploadthing.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://fe-mfv.vercel.app",
      "https://flora-vault.vercel.app",
    ];
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow all Vercel preview deployments for fe-mfv
    if (
      allowedOrigins.includes(origin) ||
      origin.match(/^https:\/\/fe-mfv-.*\.vercel\.app$/) ||
      origin.match(/^https:\/\/fe-.*-jztimms-projects\.vercel\.app$/)
    ) {
      return callback(null, true);
    }
    
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
// Increase JSON body size limit to handle descriptions with rich HTML content
// Default 100kb can truncate or reject large plant descriptions
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the Floral Vault API 🌿");
});

//
app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/v1/auth", authRoutes); // Also mount at v1 for frontend compatibility

app.use("/api/tags", tagRoutes);

app.use("/api/plants", plantRoutes);

app.use("/api/collections", collectionRoutes);

app.use("/api/search", searchRoutes);

app.use("/api/uploadthing", uploadthingHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
