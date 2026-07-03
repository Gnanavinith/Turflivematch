import { Request, Response } from 'express';
import { Player } from '../models/index';

export const playerController = {
  getAll: async (_req: Request, res: Response) => {
    try {
      const players = await Player.find().lean();
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch players' });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const player = await Player.findOne({ id: req.params.id }).lean();
      if (!player) return res.status(404).json({ error: 'Player not found' });
      res.json(player);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch player' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const player = new Player(req.body);
      await player.save();
      res.status(201).json(player);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create player' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const player = await Player.findOneAndUpdate(
        { id: req.params.id },
        req.body,
        { new: true }
      ).lean();
      if (!player) return res.status(404).json({ error: 'Player not found' });
      res.json(player);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update player' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      await Player.findOneAndDelete({ id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete player' });
    }
  }
};
