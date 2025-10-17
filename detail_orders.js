// controllers/detail_orders.js
const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();

module.exports = {
  get: async (req, res) => {
    try {
      const { orderId, productId, limit = 10, page = 1 } = req.query;
      const where = {};

      if (orderId) where.orderId = Number(orderId);
      if (productId) where.productId = Number(productId);

      const offset = (Number(page) - 1) * Number(limit);

      const details = await prisma.detailOrder.findMany({
        where,
        take: Number(limit),
        skip: offset,
        include: { order: true, product: true }
      });

      const total_data = await prisma.detailOrder.count({ where });
      const total_page = Math.ceil(total_data / Number(limit));

      return res.json({
        status: true,
        message: "Berhasil mengambil data detail order",
        data: details,
        pagination: { total_data, total_page, page: Number(page), limit: Number(limit) }
      });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  post: async (req, res) => {
    try {
      const { orderId, productId, price, quantity, subtotal } = req.body;

      if (!orderId || !productId) throw new Error("orderId dan productId wajib diisi");

      // cek order & product ada
      const order = await prisma.order.findFirst({ where: { id: Number(orderId) } });
      if (!order) throw new Error("Order tidak ditemukan");

      const product = await prisma.product.findFirst({ where: { id: Number(productId) } });
      if (!product) throw new Error("Product tidak ditemukan");

      const detail = await prisma.detailOrder.create({
        data: {
          orderId: Number(orderId),
          productId: Number(productId),
          price: Number(price),
          quantity: Number(quantity),
          subtotal: subtotal !== undefined ? Number(subtotal) : Number(price) * Number(quantity)
        },
        include: { product: true, order: true }
      });

      return res.json({ status: true, message: "Berhasil menambahkan detail order", data: detail });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  put: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;

      const exist = await prisma.detailOrder.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("Detail order tidak ditemukan");

      if (payload.price !== undefined) payload.price = Number(payload.price);
      if (payload.quantity !== undefined) payload.quantity = Number(payload.quantity);
      if (payload.subtotal !== undefined) payload.subtotal = Number(payload.subtotal);

      const updated = await prisma.detailOrder.update({
        where: { id: Number(id) },
        data: payload
      });

      return res.json({ status: true, message: "Detail order berhasil diubah", data: updated });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const exist = await prisma.detailOrder.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("Detail order tidak ditemukan");

      const deleted = await prisma.detailOrder.delete({ where: { id: Number(id) } });
      return res.json({ status: true, message: "Detail order berhasil dihapus", data: deleted });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  }
};
