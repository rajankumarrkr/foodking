import express from 'express';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private (Admin only)
router.post('/', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded',
        });
    }

    res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        url: req.file.path, // Multer-Cloudinary adds the path to the file object
    });
});

export default router;
