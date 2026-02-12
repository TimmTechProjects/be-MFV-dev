"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasUserVoted = exports.updateChallengeStatus = exports.getUserSubmission = exports.getLeaderboard = exports.removeVote = exports.voteForSubmission = exports.submitEntry = exports.createChallenge = exports.getChallengeById = exports.getChallenges = void 0;
const client_1 = __importDefault(require("../prisma/client"));
/**
 * Get all challenges with optional status filter
 */
const getChallenges = async (status) => {
    const where = {};
    if (status) {
        where.status = status;
    }
    return await client_1.default.challenge.findMany({
        where,
        include: {
            creator: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                },
            },
            _count: {
                select: {
                    submissions: true,
                },
            },
        },
        orderBy: [
            { status: 'asc' },
            { endDate: 'desc' },
        ],
    });
};
exports.getChallenges = getChallenges;
/**
 * Get challenge by ID with full details
 */
const getChallengeById = async (id) => {
    return await client_1.default.challenge.findUnique({
        where: { id },
        include: {
            creator: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                },
            },
            submissions: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatarUrl: true,
                        },
                    },
                    plant: {
                        select: {
                            id: true,
                            commonName: true,
                            botanicalName: true,
                        },
                    },
                    _count: {
                        select: {
                            votes: true,
                        },
                    },
                },
                orderBy: {
                    voteCount: 'desc',
                },
            },
            _count: {
                select: {
                    submissions: true,
                },
            },
        },
    });
};
exports.getChallengeById = getChallengeById;
/**
 * Create a new challenge
 */
const createChallenge = async (data) => {
    // Convert dates to DateTime if they're strings
    const startDate = typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate;
    const endDate = typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate;
    return await client_1.default.challenge.create({
        data: {
            title: data.title,
            description: data.description,
            category: data.category,
            startDate,
            endDate,
            prizes: data.prizes,
            rules: data.rules,
            status: data.status || 'upcoming',
            createdBy: data.createdBy,
        },
        include: {
            creator: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                },
            },
        },
    });
};
exports.createChallenge = createChallenge;
/**
 * Submit an entry to a challenge
 */
const submitEntry = async (data) => {
    return await client_1.default.challengeSubmission.create({
        data: {
            challengeId: data.challengeId,
            userId: data.userId,
            plantId: data.plantId,
            title: data.title,
            description: data.description,
            photos: data.photos,
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                },
            },
            plant: {
                select: {
                    id: true,
                    commonName: true,
                    botanicalName: true,
                },
            },
        },
    });
};
exports.submitEntry = submitEntry;
/**
 * Vote for a submission
 */
const voteForSubmission = async (data) => {
    // Create vote and update submission vote count in a transaction
    return await client_1.default.$transaction(async (tx) => {
        // Create the vote
        const vote = await tx.challengeVote.create({
            data: {
                submissionId: data.submissionId,
                userId: data.userId,
            },
        });
        // Increment the vote count
        await tx.challengeSubmission.update({
            where: { id: data.submissionId },
            data: {
                voteCount: {
                    increment: 1,
                },
            },
        });
        return vote;
    });
};
exports.voteForSubmission = voteForSubmission;
/**
 * Remove vote from a submission
 */
const removeVote = async (submissionId, userId) => {
    return await client_1.default.$transaction(async (tx) => {
        // Delete the vote
        await tx.challengeVote.deleteMany({
            where: {
                submissionId,
                userId,
            },
        });
        // Decrement the vote count
        await tx.challengeSubmission.update({
            where: { id: submissionId },
            data: {
                voteCount: {
                    decrement: 1,
                },
            },
        });
    });
};
exports.removeVote = removeVote;
/**
 * Get leaderboard for a challenge
 */
const getLeaderboard = async (challengeId) => {
    const submissions = await client_1.default.challengeSubmission.findMany({
        where: { challengeId },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                },
            },
            plant: {
                select: {
                    id: true,
                    commonName: true,
                    botanicalName: true,
                    images: {
                        where: { isMain: true },
                        take: 1,
                    },
                },
            },
            _count: {
                select: {
                    votes: true,
                },
            },
        },
        orderBy: {
            voteCount: 'desc',
        },
    });
    // Assign ranks
    return submissions.map((submission, index) => ({
        ...submission,
        rank: index + 1,
    }));
};
exports.getLeaderboard = getLeaderboard;
/**
 * Get user's submission for a specific challenge
 */
const getUserSubmission = async (challengeId, userId) => {
    return await client_1.default.challengeSubmission.findUnique({
        where: {
            challengeId_userId: {
                challengeId,
                userId,
            },
        },
        include: {
            plant: {
                select: {
                    id: true,
                    commonName: true,
                    botanicalName: true,
                },
            },
            votes: {
                select: {
                    userId: true,
                },
            },
        },
    });
};
exports.getUserSubmission = getUserSubmission;
/**
 * Update challenge status (for automated jobs or admin)
 */
const updateChallengeStatus = async (id, status) => {
    return await client_1.default.challenge.update({
        where: { id },
        data: { status },
    });
};
exports.updateChallengeStatus = updateChallengeStatus;
/**
 * Check if user has voted for a submission
 */
const hasUserVoted = async (submissionId, userId) => {
    const vote = await client_1.default.challengeVote.findUnique({
        where: {
            submissionId_userId: {
                submissionId,
                userId,
            },
        },
    });
    return !!vote;
};
exports.hasUserVoted = hasUserVoted;
