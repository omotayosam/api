// src/routes/team.route.ts
import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';

const router: Router = Router();
const teamController = new TeamController();

// Team CRUD operations
router.post('/', teamController.createTeam.bind(teamController));
router.get('/', teamController.getAllTeams.bind(teamController));
router.get('/:id', teamController.getTeamById.bind(teamController));
router.put('/:id', teamController.updateTeam.bind(teamController));
router.delete('/:id', teamController.deleteTeam.bind(teamController));

// Team by sport
router.get('/sport/:sportId', teamController.getTeamsBySport.bind(teamController));

// Team member operations
//router.post('/members', teamController.addTeamMember.bind(teamController));
router.delete('/members/:memberId', teamController.removeTeamMember.bind(teamController));

export default router; 