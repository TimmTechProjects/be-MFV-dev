import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import tagRoutes from "./routes/tagRoutes";
import plantRoutes from "./routes/plantRoutes";
import collectionRoutes from "./routes/collectionRoutes";
import searchRoutes from "./routes/searchRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import preferencesRoutes from "./routes/preferencesRoutes";
import careReminderRoutes from "./routes/careReminderRoutes";
import likeRoutes from "./routes/likeRoutes";
import traitRoutes from "./routes/traitRoutes";
import marketplaceRoutes from "./routes/marketplaceRoutes";
import { uploadthingHandler } from "./routes/uploadthing.routes";
import { webhook } from "./controllers/subscriptionController";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://fe-mfv.vercel.app",
      "https://flora-vault.vercel.app",
      "https://myfloralvault.com",
      "https://www.myfloralvault.com",
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

// Stripe webhook MUST be before JSON parsing - requires raw body
app.post("/api/subscriptions/webhook", express.raw({ type: 'application/json' }), (req, res, next) => {
  webhook(req, res).catch(next);
});

// Increase JSON body size limit to handle descriptions with rich HTML content
// Default 100kb can truncate or reject large plant descriptions
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the Floral Vault API 🌿");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "floralvault-api",
    version: "1.0.0",
  });
});

//
app.use("/api/users", userRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/v1/auth", authRoutes); // Also mount at v1 for frontend compatibility

app.use("/api/tags", tagRoutes);

app.use("/api/plants", plantRoutes);

app.use("/api/collections", collectionRoutes);

app.use("/api/search", searchRoutes);

app.use("/api/subscriptions", subscriptionRoutes);

app.use("/api/preferences", preferencesRoutes);

app.use("/api/care-reminders", careReminderRoutes);

app.use("/api/likes", likeRoutes);

app.use("/api/traits", traitRoutes);

app.use("/api/marketplace", marketplaceRoutes);

app.use("/api/uploadthing", uploadthingHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
