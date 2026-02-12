"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const preferencesController_1 = require("../controllers/preferencesController");
const verifyToken_1 = __importDefault(require("../middleware/verifyToken"));
const router = (0, express_1.Router)();
router.get('/:userId', verifyToken_1.default, (req, res, next) => {
    (0, preferencesController_1.getPreferences)(req, res).catch(next);
});
router.put('/:userId', verifyToken_1.default, (req, res, next) => {
    (0, preferencesController_1.updatePreferences)(req, res).catch(next);
});
exports.default = router;
