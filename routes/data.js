const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const getTestsController = require("../controllers/getTestsController");

router.get("/", getTestsController.handleGetTests);
router.post("/upload", uploadController.handleUpload);

module.exports = router;
