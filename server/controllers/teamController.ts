import { Request, Response } from 'express';
import { Team } from '../models/index';

export const teamController = {
  getAll: async (_req: Request, res: Response) => {
    try {
      const teams = await Team.find().lean();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch teams' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const team = await Team.findOne({ id: req.params.id }).lean();
      if (!team) return res.status(404).json({ error: 'Team not found' });
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch team' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const team = new Team(req.body);
      await team.save();
      res.status(201).json(team);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create team' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const team = await Team.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true }
      ).lean();
      if (!team) return res.status(404).json({ error: 'Team not found' });
      res.json(team);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update team' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      await Team.findOneAndDelete({ id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete team' });
    }
  }
};
