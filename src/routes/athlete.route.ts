import { Router, Request, Response, NextFunction } from 'express';
import { AthleteController } from '../controllers/athlete.controller';
import { AthleteValidation } from '../middleware/athlete.validation';
import { validateRequest } from '../middleware/validation.middleware';
import { catchAsync } from '../middleware/error';



const athleteRoutes: Router = Router();
const athleteController = new AthleteController();
const validation = new AthleteValidation

athleteRoutes.get('/', athleteController.getAllAthletes);
athleteRoutes.get('/:id', athleteController.getAthleteById);
athleteRoutes.get('/code/:code', athleteController.getAthleteByCode);
athleteRoutes.post('/individual',
    validateRequest(validation.createIndividualAthleteSchema),
    athleteController.createIndividualAthlete
)
athleteRoutes.post('/team',
    validateRequest(validation.createTeamAthleteSchema),
    athleteController.createTeamAthlete
);
athleteRoutes.put('/:id',
    validateRequest(validation.updateAthleteSchema),
    athleteController.updateAthlete
);
athleteRoutes.delete('/:id', athleteController.deleteAthlete);
athleteRoutes.get('/team/:teamCode', athleteController.getAthletesByTeam);
athleteRoutes.get('/position/:positionCode', athleteController.getAthletesByPosition);
athleteRoutes.get('/sport/:sportType', athleteController.getAthletesBySport);
athleteRoutes.get('/discipline/:disciplineCode', athleteController.getAthletesByDiscipline);
athleteRoutes.put('/:athleteId/discipline-rank', athleteController.updateDisciplineRank);
athleteRoutes.get('/:athleteId/stats', athleteController.getAthleteStats);
athleteRoutes.get('/:athleteId/season/:seasonId/summary', athleteController.getAthleteSeasonSummary);
athleteRoutes.post('/:athleteId/disciplines', athleteController.addDisciplineToAthlete);
athleteRoutes.delete('/:athleteId/disciplines/:disciplineCode', athleteController.removeDisciplineFromAthlete);

//athleteRoutes.get('/:athleteId/performances', athleteController.getAthletePerformances);

export default athleteRoutes;
