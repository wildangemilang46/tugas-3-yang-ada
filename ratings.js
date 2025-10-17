// controllers/ratings.js
const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();

module.exports = {
  get: async (req, res) => {
    try {
      const { productId, buyerId, limit = 10, page = 1 } = req.query;
      const where = {};

      if (productId) where.productId = Number(productId);
      if (buyerId) where.buyerId = Number(buyerId);

      const offset = (Number(page) - 1) * Number(limit);

      const ratings = await prisma.rating.findMany({
        where,
        take: Number(limit),
        skip: offset,
        include: { product: true, order: true, buyer: true }
      });

      const total_data = await prisma.rating.count({ where });
      const total_page = Math.ceil(total_data / Number(limit));

      return res.json({
        status: true,
        message: "Berhasil mengambil data rating",
        data: ratings,
        pagination: { total_data, total_page, page: Number(page), limit: Number(limit) }
      });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  post: async (req, res) => {
    try {
      const { orderId, productId, buyerId, rating, review } = req.body;

      if (!productId || rating === undefined) throw new Error("productId dan rating wajib diisi");

      const product = await prisma.product.findFirst({ where: { id: Number(productId) } });
      if (!product) throw new Error("Product tidak ditemukan");

      if (orderId) {
        const order = await prisma.order.findFirst({ where: { id: Number(orderId) } });
        if (!order) throw new Error("Order tidak ditemukan");
      }

      // optional: cek buyer exists if provided
      if (buyerId) {
        const buyer = await prisma.buyer.findFirst({ where: { id: Number(buyerId) } });
        if (!buyer) throw new Error("Buyer tidak ditemukan");
      }

      const created = await prisma.rating.create({
        data: {
          orderId: orderId ? Number(orderId) : null,
          productId: Number(productId),
          buyerId: buyerId ? Number(buyerId) : null,
          rating: Number(rating),
          review
        },
        include: { product: true, buyer: true, order: true }
      });

      return res.json({ status: true, message: "Berhasil menambahkan rating", data: created });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  put: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;

      const exist = await prisma.rating.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("Rating tidak ditemukan");

      if (payload.rating !== undefined) payload.rating = Number(payload.rating);

      const updated = await prisma.rating.update({
        where: { id: Number(id) },
        data: payload
      });

      return res.json({ status: true, message: "Rating berhasil diubah", data: updated });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const exist = await prisma.rating.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("Rating tidak ditemukan");

      const deleted = await prisma.rating.delete({ where: { id: Number(id) } });
      return res.json({ status: true, message: "Rating berhasil dihapus", data: deleted });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  }
};
