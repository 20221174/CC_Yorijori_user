const express = require("express");
const router = express.Router();

const apiController = require("../controllers/apiController");

router.get("/user/:userId", apiController.getUserByUserId);
router.post("/user/login", passport.authenticate("local"), (req, res) => {
  const { password: pw, mysalt, ...userWithoutPassword } = req.user.dataValues;

  return res.json(userWithoutPassword);
});

module.exports = router;
