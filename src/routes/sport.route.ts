// src/routes/sport.route.ts
import { Router } from 'express';
import { SportController } from '../controllers/sport.controller';

const sportRoutes: Router = Router();
const sportController = new SportController();

// Sport CRUD operations
sportRoutes.post('/', sportController.createSport.bind(sportController));
sportRoutes.get('/', sportController.getAllSports.bind(sportController));
sportRoutes.get('/:id', sportController.getSportById.bind(sportController));

// Sport discipline management
// sportRoutes.post('/:sportId/disciplines', sportController.createDiscipline.bind(sportController));
// sportRoutes.get('/:sportId/disciplines', sportController.getDisciplinesBySport.bind(sportController));

export default sportRoutes; 