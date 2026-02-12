"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagnosisController = void 0;
const diagnosisService_1 = require("../services/diagnosisService");
exports.diagnosisController = {
    // Create diagnosis request
    async createDiagnosis(req, res) {
        try {
            const { plantId, symptoms, photos, severity } = req.body;
            const userId = req.user;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            if (!symptoms || symptoms.length === 0) {
                res.status(400).json({ error: 'Symptoms are required' });
                return;
            }
            const diagnosis = await diagnosisService_1.diagnosisService.createDiagnosis({
                userId,
                plantId: plantId || null,
                symptoms,
                photos: photos || [],
                severity: severity || null,
            });
            res.status(201).json(diagnosis);
        }
        catch (error) {
            console.error('Error creating diagnosis:', error);
            res.status(500).json({ error: 'Failed to create diagnosis' });
        }
    },
    // Get diagnosis by ID
    async getDiagnosis(req, res) {
        try {
            const { id } = req.params;
            const diagnosis = await diagnosisService_1.diagnosisService.getDiagnosisById(id);
            if (!diagnosis) {
                res.status(404).json({ error: 'Diagnosis not found' });
                return;
            }
            res.json(diagnosis);
        }
        catch (error) {
            console.error('Error fetching diagnosis:', error);
            res.status(500).json({ error: 'Failed to fetch diagnosis' });
        }
    },
    // Get AI diagnosis using GPT-4 Vision
    async generateAIDiagnosis(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const diagnosis = await diagnosisService_1.diagnosisService.getDiagnosisById(id);
            if (!diagnosis) {
                res.status(404).json({ error: 'Diagnosis not found' });
                return;
            }
            // Check ownership
            if (diagnosis.userId !== userId) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            const aiDiagnosis = await diagnosisService_1.diagnosisService.generateAIDiagnosis(id);
            res.json(aiDiagnosis);
        }
        catch (error) {
            console.error('Error generating AI diagnosis:', error);
            res.status(500).json({ error: 'Failed to generate AI diagnosis' });
        }
    },
    // Add community comment/help
    async addComment(req, res) {
        try {
            const { id } = req.params;
            const { comment, isExpert } = req.body;
            const userId = req.user;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            if (!comment) {
                res.status(400).json({ error: 'Comment is required' });
                return;
            }
            const diagnosisComment = await diagnosisService_1.diagnosisService.addComment({
                diagnosisId: id,
                userId,
                comment,
                isExpert: isExpert || false,
            });
            res.status(201).json(diagnosisComment);
        }
        catch (error) {
            console.error('Error adding comment:', error);
            res.status(500).json({ error: 'Failed to add comment' });
        }
    },
    // Update diagnosis status
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const userId = req.user;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            if (!['pending', 'diagnosed', 'resolved'].includes(status)) {
                res.status(400).json({ error: 'Invalid status' });
                return;
            }
            const diagnosis = await diagnosisService_1.diagnosisService.getDiagnosisById(id);
            if (!diagnosis) {
                res.status(404).json({ error: 'Diagnosis not found' });
                return;
            }
            // Check ownership
            if (diagnosis.userId !== userId) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            const updated = await diagnosisService_1.diagnosisService.updateStatus(id, status);
            res.json(updated);
        }
        catch (error) {
            console.error('Error updating status:', error);
            res.status(500).json({ error: 'Failed to update status' });
        }
    },
    // Search by symptoms
    async searchBySymptoms(req, res) {
        try {
            const { symptoms } = req.query;
            if (!symptoms || typeof symptoms !== 'string') {
                res.status(400).json({ error: 'Symptoms query parameter required' });
                return;
            }
            const symptomArray = symptoms.split(',').map(s => s.trim());
            const diagnoses = await diagnosisService_1.diagnosisService.searchBySymptoms(symptomArray);
            res.json(diagnoses);
        }
        catch (error) {
            console.error('Error searching diagnoses:', error);
            res.status(500).json({ error: 'Failed to search diagnoses' });
        }
    },
    // Get user's diagnoses
    async getUserDiagnoses(req, res) {
        try {
            const userId = req.user;
            const { status } = req.query;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const diagnoses = await diagnosisService_1.diagnosisService.getUserDiagnoses(userId, status);
            res.json(diagnoses);
        }
        catch (error) {
            console.error('Error fetching user diagnoses:', error);
            res.status(500).json({ error: 'Failed to fetch diagnoses' });
        }
    },
    // Browse community diagnoses
    async browseDiagnoses(req, res) {
        try {
            const { status, severity, limit = '20', offset = '0' } = req.query;
            const diagnoses = await diagnosisService_1.diagnosisService.browseDiagnoses({
                status: status,
                severity: severity,
                limit: parseInt(limit),
                offset: parseInt(offset),
            });
            res.json(diagnoses);
        }
        catch (error) {
            console.error('Error browsing diagnoses:', error);
            res.status(500).json({ error: 'Failed to browse diagnoses' });
        }
    },
    // Mark comment as helpful
    async markCommentHelpful(req, res) {
        try {
            const { commentId } = req.params;
            const userId = req.user;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const comment = await diagnosisService_1.diagnosisService.incrementCommentHelpful(commentId);
            res.json(comment);
        }
        catch (error) {
            console.error('Error marking comment helpful:', error);
            res.status(500).json({ error: 'Failed to mark comment helpful' });
        }
    },
};
