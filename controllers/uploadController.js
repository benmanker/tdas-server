const fs = require("fs");
const Test = require("../models/Test");

const handleUpload = async (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(req.body.filepath, "utf8"));

    const test = new Test(data);
    test.save();

    res.send("Test was uploaded");
  } catch (e) {
    res.sendStatus(400);
  }
};

module.exports = { handleUpload };
