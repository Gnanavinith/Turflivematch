import { Router } from 'express';
import { playerController } from '../controllers/playerController';

const router = Router();

router.get('/', playerController.getAll);
router.get('/:id', playerController.getById);
router.post('/', playerController.create);
router.put('/:id', playerController.update);
router.delete('/:id', playerController.delete);

export default router;
