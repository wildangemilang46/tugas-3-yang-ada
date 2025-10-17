const router = require("express").Router();
const { get, post, put, destroy } = require('../controllers/buyers')

router.get("/", get);
router.post("/", post);
router.put("/:id", put);
router.delete("/:id", destroy);

module.exports = router;
