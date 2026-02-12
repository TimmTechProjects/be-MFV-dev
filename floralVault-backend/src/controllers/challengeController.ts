import { Request, Response } from 'express';
import * as challengeService from '../services/challengeService';

// Extend Request to include user
interface AuthRequest extends Request {
  user?: string; // userId from JWT
}

/**
 * GET /api/challenges
 * List all challenges with optional status filter
 */
export const getChallenges = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    
    const challenges = await challengeService.getChallenges(status as string);
    
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
};

/**
 * GET /api/challenges/:id
 * Get challenge details including submissions
 */
export const getChallengeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const challenge = await challengeService.getChallengeById(id);
    
    if (!challenge) {
      res.status(404).json({ error: 'Challenge not found' });
      return;
    }
    
    res.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
};

/**
 * POST /api/challenges
 * Create a new challenge (admin only)
 */
export const createChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    // TODO: Add admin check middleware
    
    const challengeData = {
      ...req.body,
      createdBy: userId,
    };
    
    const challenge = await challengeService.createChallenge(challengeData);
    
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
};

/**
 * POST /api/challenges/:id/submit
 * Submit an entry to a challenge
 */
export const submitEntry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: challengeId } = req.params;
    const userId = req.user;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const submissionData = {
      ...req.body,
      challengeId,
      userId,
    };
    
    const submission = await challengeService.submitEntry(submissionData);
    
    res.status(201).json(submission);
  } catch (error: any) {
    console.error('Error submitting entry:', error);
    
    if ((error as any).code === 'P2002') {
      res.status(400).json({ error: 'You have already submitted an entry to this challenge' });
      return;
    }
    
    res.status(500).json({ error: 'Failed to submit entry' });
  }
};

/**
 * POST /api/challenges/:id/vote/:submissionId
 * Vote for a submission
 */
export const voteForSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: challengeId, submissionId } = req.params;
    const userId = req.user;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const vote = await challengeService.voteForSubmission({
      submissionId,
      userId,
    });
    
    res.status(201).json(vote);
  } catch (error: any) {
    console.error('Error voting for submission:', error);
    
    if ((error as any).code === 'P2002') {
      res.status(400).json({ error: 'You have already voted for this submission' });
      return;
    }
    
    res.status(500).json({ error: 'Failed to vote' });
  }
};

/**
 * DELETE /api/challenges/:id/vote/:submissionId
 * Remove vote from a submission
 */
export const removeVote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const userId = req.user;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    await challengeService.removeVote(submissionId, userId);
    
    res.json({ message: 'Vote removed successfully' });
  } catch (error) {
    console.error('Error removing vote:', error);
    res.status(500).json({ error: 'Failed to remove vote' });
  }
};

/**
 * GET /api/challenges/:id/leaderboard
 * Get challenge leaderboard/rankings
 */
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const leaderboard = await challengeService.getLeaderboard(id);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

/**
 * GET /api/challenges/:id/submission
 * Get current user's submission for a challenge
 */
export const getUserSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: challengeId } = req.params;
    const userId = req.user;
    
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const submission = await challengeService.getUserSubmission(challengeId, userId);
    
    if (!submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }
    
    res.json(submission);
  } catch (error) {
    console.error('Error fetching user submission:', error);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
};
