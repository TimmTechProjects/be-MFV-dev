import { Router } from 'express';
import * as challengeController from '../controllers/challengeController';
import verifyToken from '../middleware/verifyToken';

const router = Router();

// Public routes - anyone can view challenges
router.get('/', challengeController.getChallenges);
router.get('/:id', challengeController.getChallengeById);
router.get('/:id/leaderboard', challengeController.getLeaderboard);

// Protected routes - require authentication
router.post('/', verifyToken, challengeController.createChallenge); // TODO: Add admin middleware
router.post('/:id/submit', verifyToken, challengeController.submitEntry);
router.post('/:id/vote/:submissionId', verifyToken, challengeController.voteForSubmission);
router.delete('/:id/vote/:submissionId', verifyToken, challengeController.removeVote);
router.get('/:id/submission', verifyToken, challengeController.getUserSubmission);

export default router;
