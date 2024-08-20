const router = require('express').Router();

const customerRoutes = require('./customer-routes');
const productDetailRoutes = require('./product-detail-routes');
const transactionRoutes = require('./transaction');

router.use('/customer', customerRoutes);
router.use('/products', productDetailRoutes);
router.use('/transaction', transactionRoutes);

module.exports = router;