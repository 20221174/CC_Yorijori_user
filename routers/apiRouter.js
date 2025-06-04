const express = require("express");
const router = express.Router();

const apiController = require("../controllers/apiController");

router.get("/user/:userId", apiController.getUserByUserId);

module.exports = router;
