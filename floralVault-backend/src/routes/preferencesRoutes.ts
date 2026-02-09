import { Router } from 'express';
import {
  getPreferences,
  updatePreferences,
} from '../controllers/preferencesController';
import verifyToken from '../middleware/verifyToken';

const router = Router();

router.get('/:userId', verifyToken, (req, res, next) => {
  getPreferences(req, res).catch(next);
});

router.put('/:userId', verifyToken, (req, res, next) => {
  updatePreferences(req, res).catch(next);
});

export default router;
