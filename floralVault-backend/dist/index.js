"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const tagRoutes_1 = __importDefault(require("./routes/tagRoutes"));
const plantRoutes_1 = __importDefault(require("./routes/plantRoutes"));
const collectionRoutes_1 = __importDefault(require("./routes/collectionRoutes"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
const preferencesRoutes_1 = __importDefault(require("./routes/preferencesRoutes"));
const careReminderRoutes_1 = __importDefault(require("./routes/careReminderRoutes"));
const likeRoutes_1 = __importDefault(require("./routes/likeRoutes"));
const traitRoutes_1 = __importDefault(require("./routes/traitRoutes"));
const uploadthing_routes_1 = require("./routes/uploadthing.routes");
const subscriptionController_1 = require("./controllers/subscriptionController");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const corsOptions = {
    origin: (origin, callback) => {
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
        if (allowedOrigins.includes(origin) ||
            origin.match(/^https:\/\/fe-mfv-.*\.vercel\.app$/) ||
            origin.match(/^https:\/\/fe-.*-jztimms-projects\.vercel\.app$/)) {
            return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// Stripe webhook MUST be before JSON parsing - requires raw body
app.post("/api/subscriptions/webhook", express_1.default.raw({ type: 'application/json' }), (req, res, next) => {
    (0, subscriptionController_1.webhook)(req, res).catch(next);
});
// Increase JSON body size limit to handle descriptions with rich HTML content
// Default 100kb can truncate or reject large plant descriptions
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
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
app.use("/api/users", userRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/v1/auth", authRoutes_1.default); // Also mount at v1 for frontend compatibility
app.use("/api/tags", tagRoutes_1.default);
app.use("/api/plants", plantRoutes_1.default);
app.use("/api/collections", collectionRoutes_1.default);
app.use("/api/search", searchRoutes_1.default);
app.use("/api/subscriptions", subscriptionRoutes_1.default);
app.use("/api/preferences", preferencesRoutes_1.default);
app.use("/api/care-reminders", careReminderRoutes_1.default);
app.use("/api/likes", likeRoutes_1.default);
app.use("/api/traits", traitRoutes_1.default);
app.use("/api/uploadthing", uploadthing_routes_1.uploadthingHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
