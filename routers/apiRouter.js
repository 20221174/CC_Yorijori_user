const express = require("express");
const router = express.Router();

const apiController = require("../controllers/apiController");

router.get("/user/:userId", apiController.getUserByUserId);
router.post("/user/login", apiController.loginUser);

module.exports = router;
