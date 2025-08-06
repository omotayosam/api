// src/routes/season.route.ts
import { Router } from 'express';
import { SeasonController } from '../controllers/season.controller';

const router: Router = Router();
const seasonController = new SeasonController();

// Season CRUD operations
router.post('/', seasonController.createSeason.bind(seasonController));
router.get('/', seasonController.getAllSeasons.bind(seasonController));
router.get('/:id', seasonController.getSeasonById.bind(seasonController));
router.put('/:id', seasonController.updateSeason.bind(seasonController));
router.delete('/:id', seasonController.deleteSeason.bind(seasonController));

// Season management
router.get('/active', seasonController.getActiveSeason.bind(seasonController));
router.patch('/:id/activate', seasonController.setActiveSeason.bind(seasonController));

// Season queries
router.get('/year/:year', seasonController.getSeasonsByYear.bind(seasonController));

export default router; 