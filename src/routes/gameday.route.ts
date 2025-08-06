// src/routes/gameday.route.ts
import { Router } from 'express';
import { GamedayController } from '../controllers/gameday.controller';

const router: Router = Router();
const gamedayController = new GamedayController();

// Gameday CRUD operations
router.post('/', gamedayController.createGameday.bind(gamedayController));
router.get('/', gamedayController.getAllGamedays.bind(gamedayController));
router.get('/:id', gamedayController.getGamedayById.bind(gamedayController));
router.put('/:id', gamedayController.updateGameday.bind(gamedayController));
router.delete('/:id', gamedayController.deleteGameday.bind(gamedayController));

// Gameday management
router.get('/season/:seasonId', gamedayController.getGamedaysBySeason.bind(gamedayController));
router.get('/current', gamedayController.getCurrentGameday.bind(gamedayController));
router.get('/next', gamedayController.getNextGameday.bind(gamedayController));
router.get('/previous', gamedayController.getPreviousGameday.bind(gamedayController));

// Gameday actions
router.patch('/:id/set-current', gamedayController.setCurrentGameday.bind(gamedayController));
router.patch('/:id/finish', gamedayController.finishGameday.bind(gamedayController));

export default router; 