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
const uploadthing_routes_1 = require("./routes/uploadthing.routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const corsOptions = {
    origin: ["http://localhost:3000", "https://flora-vault.vercel.app"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Welcome to the Floral Vault API 🌿");
});
//
app.use("/api/users", userRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/tags", tagRoutes_1.default);
app.use("/api/plants", plantRoutes_1.default);
app.use("/api/collections", collectionRoutes_1.default);
app.use("/api/search", searchRoutes_1.default);
app.use("/api/uploadthing", uploadthing_routes_1.uploadthingHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
