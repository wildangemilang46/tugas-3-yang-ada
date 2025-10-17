// controllers/orders.js
const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();

/**
 * POST payload accepted:
 * {
 *   order_code, userId, buyerId, voucherId, status, notes,
 *   details: [{ productId, price, quantity, subtotal }, ...] // optional
 * }
 * If details provided, total will be computed if not given.
 */

module.exports = {
  get: async (req, res) => {
    try {
      const { search, limit = 10, page = 1 } = req.query;
      const where = {};

      if (search) {
        where.OR = [
          { order_code: { contains: search } },
          { status: { contains: search } },
          { notes: { contains: search } }
        ];
      }

      const offset = (Number(page) - 1) * Number(limit);

      const orders = await prisma.order.findMany({
        where,
        take: Number(limit),
        skip: offset,
        include: {
          details: { include: { product: true } },
          user: true,
          buyer: true,
          voucher: true
        }
      });

      const total_data = await prisma.order.count({ where });
      const total_page = Math.ceil(total_data / Number(limit));

      return res.json({
        status: true,
        message: "Berhasil mengambil data order",
        data: orders,
        pagination: { total_data, total_page, page: Number(page), limit: Number(limit) }
      });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  post: async (req, res) => {
    try {
      const { order_code, userId, buyerId, voucherId, status, notes, total, details } = req.body;

      // cek unik order_code jika ada
      if (order_code) {
        const exist = await prisma.order.findFirst({ where: { order_code } });
        if (exist) throw new Error("Order code sudah ada");
      }

      // jika details disertakan, hitung total jika tidak diberikan
      let computedTotal = total !== undefined ? Number(total) : null;
      if (Array.isArray(details) && details.length > 0) {
        const sum = details.reduce((acc, d) => acc + (Number(d.subtotal ?? (Number(d.price) * Number(d.quantity))) ), 0);
        computedTotal = computedTotal === null ? sum : computedTotal;
      }

      const createData = {
        order_code,
        userId: userId ? Number(userId) : null,
        buyerId: buyerId ? Number(buyerId) : null,
        voucherId: voucherId ? Number(voucherId) : null,
        total: computedTotal !== null ? Number(computedTotal) : 0,
        status,
        notes
      };

      if (Array.isArray(details) && details.length > 0) {
        createData.details = {
          create: details.map(d => ({
            productId: Number(d.productId),
            price: Number(d.price),
            quantity: Number(d.quantity),
            subtotal: Number(d.subtotal ?? (Number(d.price) * Number(d.quantity)))
          }))
        };
      }

      const order = await prisma.order.create({
        data: createData,
        include: { details: true }
      });

      return res.json({ status: true, message: "Berhasil menambahkan order", data: order });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  put: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;

      const exist = await prisma.order.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("Order tidak ditemukan");

      // jika mengubah total, pastikan number
      if (payload.total !== undefined) payload.total = Number(payload.total);
      if (payload.userId) payload.userId = Number(payload.userId);
      if (payload.buyerId) payload.buyerId = Number(payload.buyerId);
      if (payload.voucherId) payload.voucherId = Number(payload.voucherId);

      const updated = await prisma.order.update({
        where: { id: Number(id) },
        data: payload,
        include: { details: true }
      });

      return res.json({ status: true, message: "Order berhasil diubah", data: updated });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const exist = await prisma.order.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("Order tidak ditemukan");

      // prisma akan cascade delete detail jika model di-schema diatur cascade,
      // jika tidak, Anda mungkin perlu menghapus detail manual dulu.
      const deleted = await prisma.order.delete({ where: { id: Number(id) } });

      return res.json({ status: true, message: "Order berhasil dihapus", data: deleted });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  }
};
