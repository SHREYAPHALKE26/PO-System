import express from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import { getItemCategories, createItemCategory, updateItemCategory, deleteItemCategory } from '../controllers/item_categoryController.js';

const router = express.Router();
router.get('/getAllItemCategories',verifyToken, getItemCategories);
router.post('/createItemCategory', verifyToken, createItemCategory);
router.patch('/updateItemCategory/:category_id', verifyToken, updateItemCategory);
router.delete('/deleteItemCategory/:category_id', verifyToken, deleteItemCategory);

export default router;
