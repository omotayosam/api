// src/routes/discipline.route.ts
import { Router } from 'express';
import { DisciplineController } from '../controllers/discipline.controller';

const router: Router = Router();
const disciplineController = new DisciplineController();

// Discipline CRUD operations
router.post('/', disciplineController.createDiscipline.bind(disciplineController));
router.get('/', disciplineController.getAllDisciplines.bind(disciplineController));
router.get('/:id', disciplineController.getDisciplineById.bind(disciplineController));
router.put('/:id', disciplineController.updateDiscipline.bind(disciplineController));
router.delete('/:id', disciplineController.deleteDiscipline.bind(disciplineController));

// Discipline queries
router.get('/sport/:sportId', disciplineController.getDisciplinesBySport.bind(disciplineController));

// Discipline athlete management
router.get('/:disciplineId/athletes', disciplineController.getDisciplineAthletes.bind(disciplineController));
router.post('/athletes', disciplineController.addAthleteToDiscipline.bind(disciplineController));
router.delete('/:disciplineId/athletes/:athleteId', disciplineController.removeAthleteFromDiscipline.bind(disciplineController));
router.patch('/:disciplineId/athletes/:athleteId/rank', disciplineController.updateAthleteRank.bind(disciplineController));

export default router; 