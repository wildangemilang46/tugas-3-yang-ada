const { PrismaClient } = require("../generated/prisma/client");
const prisma = new PrismaClient();

module.exports = {
  get: async (req, res) => {
    try {
      const books = await prisma.book.findMany();
      res.json({
        status: true,
        message: "Berhasil mengambil data buku",
        data: books,
      });
    } catch (error) {
      res.json({
        status: false,
        message: error.message,
      });
    }
  },

  post: async (req, res) => {
    try {
      const { title, author, publisher, year } = req.body;
      const book = await prisma.book.create({
        data: { title, author, publisher, year: Number(year) },
      });
      res.json({
        status: true,
        message: "Berhasil menambahkan buku",
        data: book,
      });
    } catch (error) {
      res.json({
        status: false,
        message: error.message,
      });
    }
  },

  put: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, author, publisher, year } = req.body;
      const book = await prisma.book.update({
        where: { id: Number(id) },
        data: { title, author, publisher, year: Number(year) },
      });
      res.json({
        status: true,
        message: "Berhasil mengubah buku",
        data: book,
      });
    } catch (error) {
      res.json({
        status: false,
        message: error.message,
      });
    }
  },

  destroy: async (req, res) => {
    try {
      const { id } = req.params;
      const book = await prisma.book.delete({
        where: { id: Number(id) },
      });
      res.json({
        status: true,
        message: "Berhasil menghapus buku",
        data: book,
      });
    } catch (error) {
      res.json({
        status: false,
        message: error.message,
      });
    }
  },
};
