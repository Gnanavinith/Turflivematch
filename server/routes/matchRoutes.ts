import { Router } from 'express';
import { matchController } from '../controllers/matchController';

const router = Router();

router.get('/', matchController.getAll);
router.get('/:id', matchController.getById);
router.post('/', matchController.create);
router.put('/:id', matchController.update);
router.delete('/:id', matchController.delete);

export default router;
