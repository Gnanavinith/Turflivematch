import { Router } from 'express';
import { teamController } from '../controllers/teamController';

const router = Router();

router.get('/', teamController.getAll);
router.get('/:id', teamController.getById);
router.post('/', teamController.create);
router.put('/:id', teamController.update);
router.delete('/:id', teamController.delete);

export default router;
