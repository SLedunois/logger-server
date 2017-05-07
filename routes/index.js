const router = require('express').Router();

router.get('/', function (req, res, next) {
  res.sendFile('../public/dist/index.html');
});

module.exports = router;
