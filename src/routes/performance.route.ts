// src/routes/performance.route.ts
import { Router } from 'express';
import { PerformanceController } from '../controllers/performance.controller';

const router: Router = Router();
const performanceController = new PerformanceController();

// Performance CRUD operations
router.get('/', performanceController.getAllPerformances.bind(performanceController));
router.post('/', performanceController.createPerformance.bind(performanceController));

// Bulk operations
router.post('/bulk', performanceController.bulkCreatePerformances.bind(performanceController));

// Athlete performance queries
router.get('/athlete/:athleteId', performanceController.getPerformancesByAthlete.bind(performanceController));
router.get('/athlete/:athleteId/personal-bests', performanceController.getPersonalBests.bind(performanceController));
router.get('/athlete/:athleteId/season/:seasonId/bests', performanceController.getSeasonBests.bind(performanceController));
router.get('/athlete/:athleteId/summary', performanceController.getAthletePerformanceSummary.bind(performanceController));

// Event results
router.get('/event/:eventId/results', performanceController.getEventResults.bind(performanceController));

// Top performances and records
router.get('/discipline/:disciplineId/top', performanceController.getTopPerformances.bind(performanceController));
router.get('/discipline/:disciplineId/records', performanceController.getDisciplineRecords.bind(performanceController));

// Team stats
router.get('/team/:teamCode/event/:eventId/stats', performanceController.getTeamStats.bind(performanceController));

// Sport-specific queries
router.get('/sport/:sportType', performanceController.getPerformancesBySport.bind(performanceController));

// Performance analysis
router.post('/compare', performanceController.compareAthletes.bind(performanceController));
router.get('/athlete/:athleteId/discipline/:disciplineId/trends', performanceController.getPerformanceTrends.bind(performanceController));

// Individual performance operations (must come after specific routes)
router.put('/:id', performanceController.updatePerformance.bind(performanceController));
router.delete('/:id', performanceController.deletePerformance.bind(performanceController));
router.get('/:id', performanceController.getPerformanceById.bind(performanceController));

export default router; 