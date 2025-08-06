// src/controllers/team.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { TeamService } from '../service/team.service';

export class TeamController {
    private teamService: TeamService;

    constructor() {
        const prisma = new PrismaClient();
        this.teamService = new TeamService();
    }

    async createTeam(req: Request, res: Response): Promise<void> {
        try {
            const team = await this.teamService.createTeam(req.body);
            res.status(201).json({
                success: true,
                message: 'Team created successfully',
                data: team
            });
        } catch (error) {
            console.error('Error creating team:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAllTeams(req: Request, res: Response): Promise<void> {
        try {
            const teams = await this.teamService.getAllTeams();
            res.status(200).json({
                success: true,
                message: 'Teams retrieved successfully',
                data: teams
            });
        } catch (error) {
            console.error('Error getting teams:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getTeamById(req: Request, res: Response): Promise<void> {
        try {
            const teamId = parseInt(req.params.id);

            if (isNaN(teamId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid team ID'
                });
                return;
            }

            const team = await this.teamService.getTeamById(teamId);

            if (!team) {
                res.status(404).json({
                    success: false,
                    message: 'Team not found'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Team retrieved successfully',
                data: team
            });
        } catch (error) {
            console.error('Error getting team:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updateTeam(req: Request, res: Response): Promise<void> {
        try {
            const teamId = parseInt(req.params.id);

            if (isNaN(teamId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid team ID'
                });
                return;
            }

            const team = await this.teamService.updateTeam(teamId, req.body);
            res.status(200).json({
                success: true,
                message: 'Team updated successfully',
                data: team
            });
        } catch (error) {
            console.error('Error updating team:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async deleteTeam(req: Request, res: Response): Promise<void> {
        try {
            const teamId = parseInt(req.params.id);

            if (isNaN(teamId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid team ID'
                });
                return;
            }

            await this.teamService.deleteTeam(teamId);
            res.status(200).json({
                success: true,
                message: 'Team deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting team:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getTeamsBySport(req: Request, res: Response): Promise<void> {
        try {
            const sportId = parseInt(req.params.sportId);

            if (isNaN(sportId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid sport ID'
                });
                return;
            }

            const teams = await this.teamService.getTeamsBySport(sportId);
            res.status(200).json({
                success: true,
                message: 'Teams retrieved successfully',
                data: teams
            });
        } catch (error) {
            console.error('Error getting teams by sport:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // async addTeamMember(req: Request, res: Response): Promise<void> {
    //     try {
    //         const teamMember = await this.teamService.addTeamMember(req.body);
    //         res.status(201).json({
    //             success: true,
    //             message: 'Team member added successfully',
    //             data: teamMember
    //         });
    //     } catch (error) {
    //         console.error('Error adding team member:', error);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Internal server error',
    //             error: error instanceof Error ? error.message : 'Unknown error'
    //         });
    //     }
    // }

    async removeTeamMember(req: Request, res: Response): Promise<void> {
        try {
            const teamMemberId = parseInt(req.params.memberId);

            if (isNaN(teamMemberId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid team member ID'
                });
                return;
            }

            const teamMember = await this.teamService.removeTeamMember(teamMemberId);
            res.status(200).json({
                success: true,
                message: 'Team member removed successfully',
                data: teamMember
            });
        } catch (error) {
            console.error('Error removing team member:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 