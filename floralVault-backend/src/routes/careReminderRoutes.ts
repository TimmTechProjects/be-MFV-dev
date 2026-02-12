import { Router } from 'express';
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
  getDueReminders,
  snoozeReminder,
} from '../controllers/careReminderController';
import verifyToken from '../middleware/verifyToken';

const router = Router();

router.get('/:userId', verifyToken, (req, res, next) => {
  getReminders(req, res).catch(next);
});

router.get('/:userId/due', verifyToken, (req, res, next) => {
  getDueReminders(req, res).catch(next);
});

router.post('/', verifyToken, (req, res, next) => {
  createReminder(req, res).catch(next);
});

router.put('/:id', verifyToken, (req, res, next) => {
  updateReminder(req, res).catch(next);
});

router.post('/:id/complete', verifyToken, (req, res, next) => {
  completeReminder(req, res).catch(next);
});

router.post('/:id/snooze', verifyToken, (req, res, next) => {
  snoozeReminder(req, res).catch(next);
});

router.delete('/:id', verifyToken, (req, res, next) => {
  deleteReminder(req, res).catch(next);
});

export default router;
