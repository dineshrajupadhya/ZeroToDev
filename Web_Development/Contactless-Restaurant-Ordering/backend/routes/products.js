const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../utils/upload');

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize(['admin']), createProduct);
router.put('/:id', protect, authorize(['admin']), updateProduct);
router.delete('/:id', protect, authorize(['admin']), deleteProduct);

router.post('/upload', protect, authorize(['admin']), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    const result = await uploadToCloudinary(req.file);
    res.status(200).json({ success: true, image_url: result.secure_url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
