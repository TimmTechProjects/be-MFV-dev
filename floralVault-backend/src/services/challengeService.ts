import prisma from '../prisma/client';

interface ChallengeData {
  title: string;
  description: string;
  category: string;
  startDate: Date | string;
  endDate: Date | string;
  prizes?: any;
  rules?: string;
  status?: string;
  createdBy: string;
}

interface SubmissionData {
  challengeId: string;
  userId: string;
  plantId?: string;
  title: string;
  description?: string;
  photos: string[];
}

interface VoteData {
  submissionId: string;
  userId: string;
}

/**
 * Get all challenges with optional status filter
 */
export const getChallenges = async (status?: string) => {
  const where: any = {};
  
  if (status) {
    where.status = status;
  }
  
  return await prisma.challenge.findMany({
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

/**
 * Get challenge by ID with full details
 */
export const getChallengeById = async (id: string) => {
  return await prisma.challenge.findUnique({
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

/**
 * Create a new challenge
 */
export const createChallenge = async (data: ChallengeData) => {
  // Convert dates to DateTime if they're strings
  const startDate = typeof data.startDate === 'string' ? new Date(data.startDate) : data.startDate;
  const endDate = typeof data.endDate === 'string' ? new Date(data.endDate) : data.endDate;
  
  return await prisma.challenge.create({
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

/**
 * Submit an entry to a challenge
 */
export const submitEntry = async (data: SubmissionData) => {
  return await prisma.challengeSubmission.create({
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

/**
 * Vote for a submission
 */
export const voteForSubmission = async (data: VoteData) => {
  // Create vote and update submission vote count in a transaction
  return await prisma.$transaction(async (tx) => {
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

/**
 * Remove vote from a submission
 */
export const removeVote = async (submissionId: string, userId: string) => {
  return await prisma.$transaction(async (tx) => {
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

/**
 * Get leaderboard for a challenge
 */
export const getLeaderboard = async (challengeId: string) => {
  const submissions = await prisma.challengeSubmission.findMany({
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

/**
 * Get user's submission for a specific challenge
 */
export const getUserSubmission = async (challengeId: string, userId: string) => {
  return await prisma.challengeSubmission.findUnique({
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

/**
 * Update challenge status (for automated jobs or admin)
 */
export const updateChallengeStatus = async (id: string, status: string) => {
  return await prisma.challenge.update({
    where: { id },
    data: { status },
  });
};

/**
 * Check if user has voted for a submission
 */
export const hasUserVoted = async (submissionId: string, userId: string) => {
  const vote = await prisma.challengeVote.findUnique({
    where: {
      submissionId_userId: {
        submissionId,
        userId,
      },
    },
  });
  
  return !!vote;
};
