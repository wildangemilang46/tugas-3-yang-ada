// controllers/authController.js
const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';
const TOKEN_EXPIRE = '7d';

// Register user baru
exports.register = async (req, res) => {
  try {
    const { email, username, password, full_name, phone, role } = req.body;

    // Cek apakah email atau username sudah digunakan
    const existUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existUser) {
      return res.status(400).json({ message: 'Email atau username sudah digunakan.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        full_name,
        phone,
        role: role || 'MEMBER',
      },
    });

    res.status(201).json({
      message: 'Registrasi berhasil.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Password salah.' });

    // Buat JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRE }
    );

    // Simpan token ke tabel AuthToken
    await prisma.authToken.create({
      data: {
        token,
        userId: user.id,
        expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(200).json({
      message: 'Login berhasil.',
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// 🚪 Logout user
exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'Token tidak ditemukan.' });

    // Hapus token dari database
    await prisma.authToken.deleteMany({ where: { token } });
    res.json({ message: 'Logout berhasil.' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server.' });
  }
};

// Middleware Authorization
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: 'Akses ditolak. Token tidak tersedia.' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Pastikan token masih ada di database
    const tokenRecord = await prisma.authToken.findUnique({ where: { token } });
    if (!tokenRecord) return res.status(401).json({ message: 'Token tidak valid atau sudah logout.' });

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid.' });
  }
};

// Middleware untuk peran tertentu (role-based authorization)
exports.authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin.' });
    }
    next();
  };
};
