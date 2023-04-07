const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const getTestsController = require("../controllers/getTestsController");
const getTestListController = require("../controllers/getTestListController");

router.get("/", getTestsController.handleGetTests);
router.get("/testlist", getTestListController.handleGetTestList);
router.post("/upload", uploadController.handleUpload);

module.exports = router;
