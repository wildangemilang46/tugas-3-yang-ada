// controllers/buyers.js
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
          { phone: { contains: search } },
          { activation_code: { contains: search } }
        ];
      }

      const offset = (Number(page) - 1) * Number(limit);

      const buyers = await prisma.buyer.findMany({
        where,
        take: Number(limit),
        skip: offset
      });

      const total_data = await prisma.buyer.count({ where });
      const total_page = Math.ceil(total_data / Number(limit));

      return res.json({
        status: true,
        message: "Berhasil mengambil data buyer",
        data: buyers,
        pagination: { total_data, total_page, page: Number(page), limit: Number(limit) }
      });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  post: async (req, res) => {
    try {
      const { phone, username, activation_code, expired } = req.body;

      const exist = await prisma.buyer.findFirst({ where: { phone } });
      if (exist) throw new Error("Buyer dengan phone tersebut sudah terdaftar");

      const buyer = await prisma.buyer.create({
        data: {
          phone, username, activation_code, expired: expired ? new Date(expired) : null
        }
      });

      return res.json({ status: true, message: "Berhasil menambahkan buyer", data: buyer });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  put: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;

      const exist = await prisma.buyer.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("Buyer tidak ditemukan");

      if (payload.expired) payload.expired = new Date(payload.expired);

      const updated = await prisma.buyer.update({
        where: { id: Number(id) },
        data: payload
      });

      return res.json({ status: true, message: "Buyer berhasil diubah", data: updated });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const exist = await prisma.buyer.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("Buyer tidak ditemukan");

      const deleted = await prisma.buyer.delete({ where: { id: Number(id) } });
      return res.json({ status: true, message: "Buyer berhasil dihapus", data: deleted });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  }
};
