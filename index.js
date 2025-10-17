const router = require('express').Router();

router.use('/book', require('./book'));
router.use('/users', require('./users'));
router.use('/buyers', require('./buyers'));
router.use('/vouchers', require('./vouchers'));
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));
router.use('/detail_orders', require('./detail_orders'));
router.use('/ratings', require('./ratings'));
router.use('/ratings', require('./ratings'));
router.use('/auth', require('./auth'));




router.get('/', (req, res) => {
  res.json({
    message: 'Saya berhasil menginstall express!'
  })
});


router.post('/', (req, res) => {
  res.json({
    message: 'Ini adalah halaman POST!'
  })
});

router.put('/', (req, res) => {
  res.json({
    message: 'Ini adalah halaman PUT!'
  })
});

router.delete('/', (req, res) => {
  res.json({
    message: 'Ini adalah halaman DELETE!'
  })
});

// 404 untuk route yang tidak ditemukan
router.use((req, res) => {
  res.status(404).json({ status: false, message: 'Route tidak ditemukan' });
});

module.exports = router;

// npm install prisma
// npm install @prisma/client
// npx prisma init

 