// controllers/vouchers.js
const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();

module.exports = {
  get: async (req, res) => {
    try {
      const { search, limit = 10, page = 1 } = req.query;
      const where = {};

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { code: { contains: search } }
        ];
      }

      const offset = (Number(page) - 1) * Number(limit);

      const vouchers = await prisma.voucher.findMany({
        where,
        take: Number(limit),
        skip: offset
      });

      const total_data = await prisma.voucher.count({ where });
      const total_page = Math.ceil(total_data / Number(limit));

      return res.json({
        status: true,
        message: "Berhasil mengambil data voucher",
        data: vouchers,
        pagination: { total_data, total_page, page: Number(page), limit: Number(limit) }
      });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  post: async (req, res) => {
    try {
      const { name, code, expired_time, quantity } = req.body;

      const exist = await prisma.voucher.findFirst({ where: { code } });
      if (exist) throw new Error("Kode voucher sudah ada");

      const voucher = await prisma.voucher.create({
        data: {
          name,
          code,
          expired_time: expired_time ? new Date(expired_time) : null,
          quantity: quantity ? Number(quantity) : 0
        }
      });

      return res.json({ status: true, message: "Berhasil menambahkan voucher", data: voucher });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  put: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;

      const exist = await prisma.voucher.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("Voucher tidak ditemukan");

      if (payload.expired_time) payload.expired_time = new Date(payload.expired_time);
      if (payload.quantity !== undefined) payload.quantity = Number(payload.quantity);

      const updated = await prisma.voucher.update({
        where: { id: Number(id) },
        data: payload
      });

      return res.json({ status: true, message: "Voucher berhasil diubah", data: updated });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const exist = await prisma.voucher.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("Voucher tidak ditemukan");

      const deleted = await prisma.voucher.delete({ where: { id: Number(id) } });
      return res.json({ status: true, message: "Voucher berhasil dihapus", data: deleted });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  }
};
