"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challengeController = __importStar(require("../controllers/challengeController"));
const verifyToken_1 = require("../middleware/verifyToken");
const router = (0, express_1.Router)();
// Public routes - anyone can view challenges
router.get('/', challengeController.getChallenges);
router.get('/:id', challengeController.getChallengeById);
router.get('/:id/leaderboard', challengeController.getLeaderboard);
// Protected routes - require authentication
router.post('/', verifyToken_1.verifyToken, challengeController.createChallenge); // TODO: Add admin middleware
router.post('/:id/submit', verifyToken_1.verifyToken, challengeController.submitEntry);
router.post('/:id/vote/:submissionId', verifyToken_1.verifyToken, challengeController.voteForSubmission);
router.delete('/:id/vote/:submissionId', verifyToken_1.verifyToken, challengeController.removeVote);
router.get('/:id/submission', verifyToken_1.verifyToken, challengeController.getUserSubmission);
exports.default = router;
