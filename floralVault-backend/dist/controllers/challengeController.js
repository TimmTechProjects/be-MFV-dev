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
exports.getUserSubmission = exports.getLeaderboard = exports.removeVote = exports.voteForSubmission = exports.submitEntry = exports.createChallenge = exports.getChallengeById = exports.getChallenges = void 0;
const challengeService = __importStar(require("../services/challengeService"));
/**
 * GET /api/challenges
 * List all challenges with optional status filter
 */
const getChallenges = async (req, res) => {
    try {
        const { status } = req.query;
        const challenges = await challengeService.getChallenges(status);
        res.json(challenges);
    }
    catch (error) {
        console.error('Error fetching challenges:', error);
        res.status(500).json({ error: 'Failed to fetch challenges' });
    }
};
exports.getChallenges = getChallenges;
/**
 * GET /api/challenges/:id
 * Get challenge details including submissions
 */
const getChallengeById = async (req, res) => {
    try {
        const { id } = req.params;
        const challenge = await challengeService.getChallengeById(id);
        if (!challenge) {
            return res.status(404).json({ error: 'Challenge not found' });
        }
        res.json(challenge);
    }
    catch (error) {
        console.error('Error fetching challenge:', error);
        res.status(500).json({ error: 'Failed to fetch challenge' });
    }
};
exports.getChallengeById = getChallengeById;
/**
 * POST /api/challenges
 * Create a new challenge (admin only)
 */
const createChallenge = async (req, res) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // TODO: Add admin check middleware
        const challengeData = {
            ...req.body,
            createdBy: userId,
        };
        const challenge = await challengeService.createChallenge(challengeData);
        res.status(201).json(challenge);
    }
    catch (error) {
        console.error('Error creating challenge:', error);
        res.status(500).json({ error: 'Failed to create challenge' });
    }
};
exports.createChallenge = createChallenge;
/**
 * POST /api/challenges/:id/submit
 * Submit an entry to a challenge
 */
const submitEntry = async (req, res) => {
    try {
        const { id: challengeId } = req.params;
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const submissionData = {
            ...req.body,
            challengeId,
            userId,
        };
        const submission = await challengeService.submitEntry(submissionData);
        res.status(201).json(submission);
    }
    catch (error) {
        console.error('Error submitting entry:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'You have already submitted an entry to this challenge' });
        }
        res.status(500).json({ error: 'Failed to submit entry' });
    }
};
exports.submitEntry = submitEntry;
/**
 * POST /api/challenges/:id/vote/:submissionId
 * Vote for a submission
 */
const voteForSubmission = async (req, res) => {
    try {
        const { id: challengeId, submissionId } = req.params;
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const vote = await challengeService.voteForSubmission({
            submissionId,
            userId,
        });
        res.status(201).json(vote);
    }
    catch (error) {
        console.error('Error voting for submission:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'You have already voted for this submission' });
        }
        res.status(500).json({ error: 'Failed to vote' });
    }
};
exports.voteForSubmission = voteForSubmission;
/**
 * DELETE /api/challenges/:id/vote/:submissionId
 * Remove vote from a submission
 */
const removeVote = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        await challengeService.removeVote(submissionId, userId);
        res.json({ message: 'Vote removed successfully' });
    }
    catch (error) {
        console.error('Error removing vote:', error);
        res.status(500).json({ error: 'Failed to remove vote' });
    }
};
exports.removeVote = removeVote;
/**
 * GET /api/challenges/:id/leaderboard
 * Get challenge leaderboard/rankings
 */
const getLeaderboard = async (req, res) => {
    try {
        const { id } = req.params;
        const leaderboard = await challengeService.getLeaderboard(id);
        res.json(leaderboard);
    }
    catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};
exports.getLeaderboard = getLeaderboard;
/**
 * GET /api/challenges/:id/submission
 * Get current user's submission for a challenge
 */
const getUserSubmission = async (req, res) => {
    try {
        const { id: challengeId } = req.params;
        const userId = req.user?.uid;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const submission = await challengeService.getUserSubmission(challengeId, userId);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        res.json(submission);
    }
    catch (error) {
        console.error('Error fetching user submission:', error);
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
};
exports.getUserSubmission = getUserSubmission;
