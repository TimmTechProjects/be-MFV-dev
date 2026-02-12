"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsageStats = exports.rejectContent = exports.approveContent = exports.getPendingContent = exports.generateMedicinalContent = exports.askAI = void 0;
const openai_1 = __importDefault(require("openai"));
const tiktoken_1 = require("tiktoken");
const client_1 = __importDefault(require("../prisma/client"));
const crypto_1 = __importDefault(require("crypto"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4';
/**
 * Count tokens in text
 */
const countTokens = (text) => {
    try {
        const encoding = (0, tiktoken_1.encoding_for_model)('gpt-4');
        const tokens = encoding.encode(text);
        encoding.free();
        return tokens.length;
    }
    catch (error) {
        // Fallback: rough estimate
        return Math.ceil(text.length / 4);
    }
};
/**
 * Create hash for query caching
 */
const createQueryHash = (query, model) => {
    return crypto_1.default
        .createHash('sha256')
        .update(`${query}:${model}`)
        .digest('hex');
};
/**
 * Check cache for existing AI response
 */
const checkCache = async (queryHash) => {
    const cached = await client_1.default.aIQueryCache.findUnique({
        where: { queryHash },
    });
    if (cached) {
        // Update hit count and last used time
        await client_1.default.aIQueryCache.update({
            where: { queryHash },
            data: {
                hitCount: { increment: 1 },
                lastUsedAt: new Date(),
            },
        });
        return cached.response;
    }
    return null;
};
/**
 * Save AI response to cache
 */
const saveToCache = async (queryHash, query, response, model, tokenCount) => {
    await client_1.default.aIQueryCache.create({
        data: {
            queryHash,
            query,
            response,
            model,
            tokenCount,
        },
    });
};
/**
 * Log AI usage for cost tracking
 */
const logUsage = async (endpoint, model, query, tokenCount, cost, userId, success = true, error) => {
    await client_1.default.aIUsageLog.create({
        data: {
            endpoint,
            model,
            query: query.substring(0, 1000), // Limit stored query length
            tokenCount,
            cost,
            userId,
            success,
            error,
        },
    });
};
/**
 * Calculate approximate cost based on token count
 * GPT-4 pricing: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
 */
const calculateCost = (inputTokens, outputTokens) => {
    const inputCost = (inputTokens / 1000) * 0.03;
    const outputCost = (outputTokens / 1000) * 0.06;
    return inputCost + outputCost;
};
/**
 * AI Q&A for Apothecary - answers questions about medicinal plants
 */
const askAI = async (params) => {
    const { query, userId } = params;
    const queryHash = createQueryHash(query, AI_MODEL);
    try {
        // Check cache first
        const cachedResponse = await checkCache(queryHash);
        if (cachedResponse) {
            return {
                answer: cachedResponse,
                cached: true,
                model: AI_MODEL,
            };
        }
        // Search database for relevant plants
        const relevantPlants = await client_1.default.medicinalProperty.findMany({
            where: {
                OR: [
                    {
                        properties: {
                            hasSome: [query],
                        },
                    },
                    {
                        activeCompounds: {
                            hasSome: [query],
                        },
                    },
                    {
                        plant: {
                            commonName: {
                                contains: query,
                                mode: 'insensitive',
                            },
                        },
                    },
                    {
                        plant: {
                            botanicalName: {
                                contains: query,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
            },
            include: {
                plant: {
                    include: {
                        images: true,
                    },
                },
            },
            take: 10,
        });
        // Prepare context from database
        const databaseContext = relevantPlants.map((mp) => ({
            name: mp.plant.commonName,
            botanicalName: mp.plant.botanicalName,
            properties: mp.properties,
            traditionalUses: mp.traditionalUses,
            modernUses: mp.modernUses,
            activeCompounds: mp.activeCompounds,
            preparations: mp.preparations,
            safetyWarnings: mp.safetyWarnings,
            contraindications: mp.contraindications,
        }));
        const systemPrompt = `You are an expert herbalist and ethnobotanist with deep knowledge of medicinal plants, traditional medicine, and modern herbal applications. 

Your role is to provide accurate, evidence-based information about medicinal plants while emphasizing safety and responsible use.

IMPORTANT GUIDELINES:
1. Always include medical disclaimers - you provide educational information, not medical advice
2. Emphasize consulting healthcare professionals before using any herbal remedies
3. Highlight safety warnings, contraindications, and potential drug interactions
4. Cite traditional uses AND modern research when available
5. Be honest about what is scientifically proven vs. traditional belief
6. Encourage users to start with low doses and monitor reactions
7. Mention preparation methods (tea, tincture, poultice, etc.)
8. Include dosage information when known

Format your responses as follows:
- Clear, conversational answer to the user's question
- Relevant plants from the MFV database (if any match)
- Preparation methods and dosages
- Safety warnings and contraindications
- Sources or references (when applicable)

MEDICAL DISCLAIMER: Always end responses with:
"⚠️ IMPORTANT: This information is for educational purposes only and is not medical advice. Always consult with a qualified healthcare provider before using any herbal remedies, especially if you are pregnant, nursing, taking medications, or have existing health conditions."`;
        const userMessage = relevantPlants.length > 0
            ? `User Question: ${query}

Relevant plants from MFV database:
${JSON.stringify(databaseContext, null, 2)}

Please answer the user's question using the database information and your expertise.`
            : `User Question: ${query}

No matching plants found in the MFV database. Please answer based on your general knowledge of medicinal plants.`;
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });
        const answer = completion.choices[0].message.content || '';
        const inputTokens = countTokens(systemPrompt + userMessage);
        const outputTokens = countTokens(answer);
        const cost = calculateCost(inputTokens, outputTokens);
        // Save to cache
        await saveToCache(queryHash, query, answer, AI_MODEL, inputTokens + outputTokens);
        // Log usage
        await logUsage('/api/apothecary/ai/ask', AI_MODEL, query, inputTokens + outputTokens, cost, userId);
        return {
            answer,
            relevantPlants: relevantPlants.map((mp) => ({
                id: mp.plant.id,
                commonName: mp.plant.commonName,
                botanicalName: mp.plant.botanicalName,
                slug: mp.plant.slug,
                mainImage: mp.plant.images.find((img) => img.isMain)?.url,
            })),
            cached: false,
            model: AI_MODEL,
            tokenCount: inputTokens + outputTokens,
        };
    }
    catch (error) {
        // Log error
        await logUsage('/api/apothecary/ai/ask', AI_MODEL, query, 0, 0, userId, false, error.message);
        throw error;
    }
};
exports.askAI = askAI;
/**
 * AI Content Generation - auto-populate medicinal properties for a plant
 */
const generateMedicinalContent = async (params) => {
    const { plantId, plantName, botanicalName, family, userId } = params;
    try {
        // Check if content already exists
        const existingContent = await client_1.default.aIGeneratedContent.findFirst({
            where: {
                plantId,
                contentType: 'medicinal_property',
                status: 'pending',
            },
        });
        if (existingContent) {
            throw new Error('Content generation already pending for this plant');
        }
        const systemPrompt = `You are an expert ethnobotanist and herbalist tasked with generating comprehensive medicinal information about plants based on reputable sources including:
- Peer-reviewed scientific research (PubMed, medical journals)
- Traditional medicine systems (Ayurveda, TCM, indigenous practices)
- Ethnobotany databases
- Modern clinical studies

Generate accurate, evidence-based medicinal information. Be thorough but honest about what is scientifically proven vs. traditional belief.

IMPORTANT: Return ONLY valid JSON matching this exact schema:
{
  "properties": ["property1", "property2"],
  "traditionalUses": ["traditional use 1", "traditional use 2"],
  "modernUses": ["modern use 1", "modern use 2"],
  "activeCompounds": ["compound1", "compound2"],
  "preparations": ["tea", "tincture", "poultice"],
  "dosage": "Dosage information as a string",
  "safetyWarnings": ["warning 1", "warning 2"],
  "contraindications": ["contraindication 1", "contraindication 2"],
  "drugInteractions": ["interaction 1", "interaction 2"],
  "references": ["source 1", "source 2"]
}

If information is not available for a field, use an empty array [] or empty string "". Do NOT add explanatory text outside the JSON.`;
        const userMessage = `Generate comprehensive medicinal information for:

Common Name: ${plantName}
Botanical Name: ${botanicalName}
${family ? `Family: ${family}` : ''}

Provide detailed information including:
- Medicinal properties (anti-inflammatory, antimicrobial, etc.)
- Traditional uses from various medicine systems
- Modern applications backed by research
- Active compounds and phytochemicals
- Preparation methods (tea, tincture, poultice, etc.)
- Dosage guidelines
- Safety warnings and side effects
- Contraindications (pregnancy, conditions, etc.)
- Drug interactions
- Scientific references and sources

Return ONLY the JSON object, no additional text.`;
        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.5, // Lower temperature for more factual responses
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        });
        const rawContent = completion.choices[0].message.content || '{}';
        const generatedData = JSON.parse(rawContent);
        const inputTokens = countTokens(systemPrompt + userMessage);
        const outputTokens = countTokens(rawContent);
        const cost = calculateCost(inputTokens, outputTokens);
        // Save generated content for admin review
        const aiContent = await client_1.default.aIGeneratedContent.create({
            data: {
                plantId,
                contentType: 'medicinal_property',
                status: 'pending',
                aiModel: AI_MODEL,
                generatedData,
            },
        });
        // Log usage
        await logUsage('/api/apothecary/ai/generate', AI_MODEL, `Generate for ${plantName}`, inputTokens + outputTokens, cost, userId);
        return {
            id: aiContent.id,
            generatedData,
            status: 'pending',
            message: 'Content generated successfully. Awaiting admin review.',
            tokenCount: inputTokens + outputTokens,
        };
    }
    catch (error) {
        await logUsage('/api/apothecary/ai/generate', AI_MODEL, `Generate for ${plantName}`, 0, 0, userId, false, error.message);
        throw error;
    }
};
exports.generateMedicinalContent = generateMedicinalContent;
/**
 * Get pending AI-generated content for admin review
 */
const getPendingContent = async () => {
    return await client_1.default.aIGeneratedContent.findMany({
        where: {
            status: 'pending',
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
};
exports.getPendingContent = getPendingContent;
/**
 * Approve AI-generated content and create MedicinalProperty
 */
const approveContent = async (contentId, reviewerId, reviewNotes) => {
    const content = await client_1.default.aIGeneratedContent.findUnique({
        where: { id: contentId },
    });
    if (!content) {
        throw new Error('Content not found');
    }
    if (content.status !== 'pending') {
        throw new Error('Content already reviewed');
    }
    const data = content.generatedData;
    // Create MedicinalProperty from generated content
    const medicinalProperty = await client_1.default.medicinalProperty.upsert({
        where: { plantId: content.plantId },
        update: {
            properties: data.properties || [],
            traditionalUses: data.traditionalUses || [],
            modernUses: data.modernUses || [],
            activeCompounds: data.activeCompounds || [],
            preparations: data.preparations || [],
            dosage: data.dosage || '',
            safetyWarnings: data.safetyWarnings || [],
            contraindications: data.contraindications || [],
            drugInteractions: data.drugInteractions || [],
            references: data.references || [],
        },
        create: {
            plantId: content.plantId,
            properties: data.properties || [],
            traditionalUses: data.traditionalUses || [],
            modernUses: data.modernUses || [],
            activeCompounds: data.activeCompounds || [],
            preparations: data.preparations || [],
            dosage: data.dosage || '',
            safetyWarnings: data.safetyWarnings || [],
            contraindications: data.contraindications || [],
            drugInteractions: data.drugInteractions || [],
            references: data.references || [],
        },
    });
    // Update content status
    await client_1.default.aIGeneratedContent.update({
        where: { id: contentId },
        data: {
            status: 'approved',
            reviewedBy: reviewerId,
            reviewNotes,
            approvedAt: new Date(),
        },
    });
    return medicinalProperty;
};
exports.approveContent = approveContent;
/**
 * Reject AI-generated content
 */
const rejectContent = async (contentId, reviewerId, reviewNotes) => {
    const content = await client_1.default.aIGeneratedContent.findUnique({
        where: { id: contentId },
    });
    if (!content) {
        throw new Error('Content not found');
    }
    if (content.status !== 'pending') {
        throw new Error('Content already reviewed');
    }
    await client_1.default.aIGeneratedContent.update({
        where: { id: contentId },
        data: {
            status: 'rejected',
            reviewedBy: reviewerId,
            reviewNotes,
            rejectedAt: new Date(),
        },
    });
    return { message: 'Content rejected successfully' };
};
exports.rejectContent = rejectContent;
/**
 * Get AI usage statistics
 */
const getUsageStats = async (startDate, endDate) => {
    const where = {};
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate)
            where.createdAt.gte = startDate;
        if (endDate)
            where.createdAt.lte = endDate;
    }
    const logs = await client_1.default.aIUsageLog.findMany({
        where,
        orderBy: {
            createdAt: 'desc',
        },
    });
    const totalRequests = logs.length;
    const successfulRequests = logs.filter((log) => log.success).length;
    const totalTokens = logs.reduce((sum, log) => sum + log.tokenCount, 0);
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
    const byEndpoint = logs.reduce((acc, log) => {
        if (!acc[log.endpoint]) {
            acc[log.endpoint] = { count: 0, tokens: 0, cost: 0 };
        }
        acc[log.endpoint].count++;
        acc[log.endpoint].tokens += log.tokenCount;
        acc[log.endpoint].cost += log.cost;
        return acc;
    }, {});
    return {
        totalRequests,
        successfulRequests,
        failedRequests: totalRequests - successfulRequests,
        totalTokens,
        totalCost: Math.round(totalCost * 100) / 100,
        byEndpoint,
    };
};
exports.getUsageStats = getUsageStats;
