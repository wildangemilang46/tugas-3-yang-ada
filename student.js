const router = require('express').Router();

router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    message: 'Ini adalah endpoint student',
    id: id
  });
});

router.get('/', (req, res) => {
  const { search } = req.query;
  res.json({
    message: 'Ini adalah endpoint student',
    search: search
  });
});

router.post('/', (req, res) => {
  const { name, usia } = req.body;
  res.json({
    message: 'Ini adalah endpoint student',
    name: name,
    usia: usia
  });
});

module.exports = router;