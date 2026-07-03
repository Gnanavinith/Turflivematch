import { Request, Response } from 'express';
import { Match, Player, Team } from '../models/index';
import { SEED_PLAYERS, SEED_TEAMS, SEED_MATCHES } from '../models/seed';

export const matchController = {
  getAll: async (_req: Request, res: Response) => {
    try {
      const matches = await Match.find().sort({ createdAt: -1 }).lean();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const match = await Match.findOne({ id: req.params.id }).lean();
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json(match);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch match' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const match = new Match(req.body);
      await match.save();
      res.status(201).json(match);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create match' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const match = await Match.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true }
      ).lean();
      if (!match) return res.status(404).json({ error: 'Match not found' });
      res.json(match);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update match' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      await Match.findOneAndDelete({ id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete match' });
    }
  },

  reset: async (_req: Request, res: Response) => {
    try {
      await Player.deleteMany({});
      await Team.deleteMany({});
      await Match.deleteMany({});

      await Player.insertMany(SEED_PLAYERS);
      await Team.insertMany(SEED_TEAMS);
      await Match.insertMany(SEED_MATCHES);

      res.json({ success: true, message: 'Database reset and re-seeded' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reset database' });
    }
  },

  sync: async (req: Request, res: Response) => {
    try {
      const { players, teams, matches } = req.body;
      
      if (players) {
        await Player.deleteMany({});
        await Player.insertMany(players);
      }
      if (teams) {
        await Team.deleteMany({});
        await Team.insertMany(teams);
      }
      if (matches) {
        await Match.deleteMany({});
        await Match.insertMany(matches);
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to sync data' });
    }
  }
};
