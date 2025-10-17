// controllers/users.js
const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();

module.exports = {
  get: async (req, res) => {
    try {
      const { search, limit = 10, page = 1 } = req.query;
      const where = {};

      if (search) {
        where.OR = [
          { username: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } }
        ];
      }

      const offset = (Number(page) - 1) * Number(limit);

      const users = await prisma.user.findMany({
        where,
        take: Number(limit),
        skip: offset,
      });

      const total_data = await prisma.user.count({ where });
      const total_page = Math.ceil(total_data / Number(limit));

      return res.json({
        status: true,
        message: "Berhasil mengambil data user",
        data: users,
        pagination: { total_data, total_page, page: Number(page), limit: Number(limit) }
      });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  post: async (req, res) => {
    try {
      const { email, username, password, full_name, phone, gender, dob, avatar } = req.body;

      const exist = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
      if (exist) throw new Error("Email atau username sudah terdaftar");

      const user = await prisma.user.create({
        data: {
          email,
          username,
          password,
          full_name,
          phone,
          gender,
          dob: dob ? new Date(dob) : null,
          avatar
        }
      });

      return res.json({ status: true, message: "Berhasil menambahkan user", data: user });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  put: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;

      const exist = await prisma.user.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("User tidak ditemukan");

      // Cek uniqueness untuk email/username jika diubah
      if (payload.email || payload.username) {
        const conflict = await prisma.user.findFirst({
          where: {
            OR: [
              payload.email ? { email: payload.email } : undefined,
              payload.username ? { username: payload.username } : undefined
            ].filter(Boolean),
            NOT: { id: Number(id) }
          }
        });
        if (conflict) throw new Error("Email atau username sudah digunakan oleh user lain");
      }

      if (payload.dob) payload.dob = new Date(payload.dob);

      const updated = await prisma.user.update({
        where: { id: Number(id) },
        data: payload
      });

      return res.json({ status: true, message: "User berhasil diubah", data: updated });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const exist = await prisma.user.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("User tidak ditemukan");

      const deleted = await prisma.user.delete({ where: { id: Number(id) } });
      return res.json({ status: true, message: "User berhasil dihapus", data: deleted });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  }
};
