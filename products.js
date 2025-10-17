// controllers/products.js
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
          { product_code: { contains: search } },
          { description: { contains: search } }
        ];
      }

      const offset = (Number(page) - 1) * Number(limit);

      const products = await prisma.product.findMany({
        where,
        take: Number(limit),
        skip: offset
      });

      const total_data = await prisma.product.count({ where });
      const total_page = Math.ceil(total_data / Number(limit));

      return res.json({
        status: true,
        message: "Berhasil mengambil data product",
        data: products,
        pagination: { total_data, total_page, page: Number(page), limit: Number(limit) }
      });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  post: async (req, res) => {
    try {
      const { product_code, name, image, price, stock, description } = req.body;

      if (!name || price === undefined) throw new Error("Field name dan price wajib diisi");

      const exist = product_code ? await prisma.product.findFirst({ where: { product_code } }) : null;
      if (exist) throw new Error("Product code sudah terdaftar");

      const product = await prisma.product.create({
        data: {
          product_code,
          name,
          image,
          price: Number(price),
          stock: stock !== undefined ? Number(stock) : 0,
          description
        }
      });

      return res.json({ status: true, message: "Berhasil menambahkan product", data: product });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  put: async (req, res) => {
    try {
      const { id } = req.params;
      const payload = req.body;

      const exist = await prisma.product.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("Product tidak ditemukan");

      if (payload.price !== undefined) payload.price = Number(payload.price);
      if (payload.stock !== undefined) payload.stock = Number(payload.stock);

      // jika product_code diubah, cek unik
      if (payload.product_code) {
        const conflict = await prisma.product.findFirst({
          where: { product_code: payload.product_code, NOT: { id: Number(id) } }
        });
        if (conflict) throw new Error("Product code sudah digunakan");
      }

      const updated = await prisma.product.update({
        where: { id: Number(id) },
        data: payload
      });

      return res.json({ status: true, message: "Product berhasil diubah", data: updated });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },

  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const exist = await prisma.product.findFirst({ where: { id: Number(id) } });
      if (!exist) throw new Error("Product tidak ditemukan");

      const deleted = await prisma.product.delete({ where: { id: Number(id) } });
      return res.json({ status: true, message: "Product berhasil dihapus", data: deleted });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  }
};
