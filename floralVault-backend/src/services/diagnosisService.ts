import prisma from '../prisma/client';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const diagnosisService = {
  // Create diagnosis request
  async createDiagnosis(data: {
    userId: string;
    plantId: string | null;
    symptoms: string[];
    photos: string[];
    severity: string | null;
  }) {
    return await prisma.diagnosis.create({
      data: {
        userId: data.userId,
        plantId: data.plantId,
        symptoms: data.symptoms,
        photos: data.photos,
        severity: data.severity,
        status: 'pending',
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
  },

  // Get diagnosis by ID
  async getDiagnosisById(id: string) {
    return await prisma.diagnosis.findUnique({
      where: { id },
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
            images: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  // Generate AI diagnosis using GPT-4 Vision
  async generateAIDiagnosis(diagnosisId: string) {
    const diagnosis = await prisma.diagnosis.findUnique({
      where: { id: diagnosisId },
      include: {
        plant: true,
      },
    });

    if (!diagnosis) {
      throw new Error('Diagnosis not found');
    }

    // Prepare the prompt
    const symptomsText = diagnosis.symptoms.join(', ');
    const plantInfo = diagnosis.plant
      ? `Plant: ${diagnosis.plant.commonName} (${diagnosis.plant.botanicalName})`
      : 'Unknown plant';

    const promptText = `You are a plant disease expert. Analyze the following plant problem and provide a diagnosis and treatment plan.

${plantInfo}
Symptoms: ${symptomsText}
${diagnosis.severity ? `Severity: ${diagnosis.severity}` : ''}

Please provide:
1. A diagnosis of what's likely wrong with the plant
2. A detailed treatment plan with step-by-step instructions
3. Preventive measures for the future
4. Timeline for expected recovery

Format your response as JSON with the following structure:
{
  "diagnosis": "Brief diagnosis",
  "treatment": "Detailed treatment plan",
  "confidence": "high/medium/low",
  "timeToRecovery": "estimated time"
}`;

    try {
      let messages: any[] = [
        {
          role: 'user',
          content: [{ type: 'text', text: promptText }],
        },
      ];

      // Add images if available
      if (diagnosis.photos && diagnosis.photos.length > 0) {
        const imageContents = diagnosis.photos.slice(0, 4).map(photoUrl => ({
          type: 'image_url',
          image_url: { url: photoUrl },
        }));

        messages = [
          {
            role: 'user',
            content: [{ type: 'text', text: promptText }, ...imageContents],
          },
        ];
      }

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const aiResponse = completion.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      const parsedResponse = JSON.parse(aiResponse);

      // Update diagnosis with AI results
      const updated = await prisma.diagnosis.update({
        where: { id: diagnosisId },
        data: {
          diagnosis: parsedResponse.diagnosis,
          treatment: parsedResponse.treatment,
          aiGenerated: true,
          status: 'diagnosed',
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
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      return {
        ...updated,
        aiMetadata: {
          confidence: parsedResponse.confidence,
          timeToRecovery: parsedResponse.timeToRecovery,
        },
      };
    } catch (error) {
      console.error('Error generating AI diagnosis:', error);
      throw new Error('Failed to generate AI diagnosis');
    }
  },

  // Add comment to diagnosis
  async addComment(data: {
    diagnosisId: string;
    userId: string;
    comment: string;
    isExpert: boolean;
  }) {
    return await prisma.diagnosisComment.create({
      data: {
        diagnosisId: data.diagnosisId,
        userId: data.userId,
        comment: data.comment,
        isExpert: data.isExpert,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  },

  // Update diagnosis status
  async updateStatus(id: string, status: string) {
    return await prisma.diagnosis.update({
      where: { id },
      data: { status },
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
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  // Search diagnoses by symptoms
  async searchBySymptoms(symptoms: string[]) {
    return await prisma.diagnosis.findMany({
      where: {
        symptoms: {
          hasSome: symptoms,
        },
        status: { not: 'pending' }, // Only show diagnosed cases
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  },

  // Get user's diagnoses
  async getUserDiagnoses(userId: string, status?: string) {
    const where: any = { userId };
    if (status) where.status = status;

    return await prisma.diagnosis.findMany({
      where,
      include: {
        plant: {
          select: {
            id: true,
            commonName: true,
            botanicalName: true,
            images: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Browse community diagnoses
  async browseDiagnoses(options: {
    status?: string;
    severity?: string;
    limit: number;
    offset: number;
  }) {
    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.severity) where.severity = options.severity;

    return await prisma.diagnosis.findMany({
      where,
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
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit,
      skip: options.offset,
    });
  },

  // Increment comment helpful count
  async incrementCommentHelpful(commentId: string) {
    return await prisma.diagnosisComment.update({
      where: { id: commentId },
      data: {
        helpful: { increment: 1 },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  },
};
