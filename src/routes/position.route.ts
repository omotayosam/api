// src/routes/position.route.ts
import { Router } from 'express';
import { PositionController } from '../controllers/position.controller';

const router: Router = Router();
const positionController = new PositionController();

// Position CRUD operations
router.post('/', positionController.createPosition.bind(positionController));
router.get('/', positionController.getAllPositions.bind(positionController));
router.get('/:id', positionController.getPositionById.bind(positionController));
router.put('/:id', positionController.updatePosition.bind(positionController));
router.delete('/:id', positionController.deletePosition.bind(positionController));

// Position queries
router.get('/sport/:sportId', positionController.getPositionsBySport.bind(positionController));

export default router; 