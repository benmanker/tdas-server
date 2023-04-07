const Test = require("../models/Test");

const handleGetTestList = async (req, res) => {
  try {
    const list = await Test.find({}, { _id: 1, "test_setup.title": 1 });
    res.send(list);
  } catch (e) {
    res.sendStatus(400);
  }
};

module.exports = { handleGetTestList };
