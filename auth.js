// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.verifyToken, authController.logout);

// Contoh route yang butuh autentikasi
router.get('/profile', authController.verifyToken, (req, res) => {
  res.json({
    message: 'Data profil berhasil diakses',
    user: req.user,
  });
});

// Contoh route untuk role ADMIN saja
router.get(
  '/admin',
  authController.verifyToken,
  authController.authorizeRole('ADMIN'),
  (req, res) => {
    res.json({ message: 'Halo Admin!' });
  }
);

module.exports = router;
