import express from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import { getItems, createItem, updateItem, deleteItem } from '../controllers/itemController.js';

const router = express.Router();
router.get('/getAllItems', verifyToken, getItems);
router.post('/createItem', verifyToken, createItem);
router.patch('/updateItem/:item_id', verifyToken, updateItem);
router.delete('/deleteItem/:item_id', verifyToken, deleteItem);

export default router;
