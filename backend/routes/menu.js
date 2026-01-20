import express from 'express';
import {
  getAllMenuItems,
  getMenuItemById,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
} from '../controllers/menuController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItemById);

// Protected routes (Admin only)
router.post('/', protect, addMenuItem);
router.put('/:id', protect, updateMenuItem);
router.delete('/:id', protect, deleteMenuItem);
router.patch('/:id/toggle-availability', protect, toggleAvailability);

export default router;
