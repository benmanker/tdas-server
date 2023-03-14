const Test = require("../models/Test");

const handleGetTests = async (req, res) => {
  try {
    const data = await Test.find({}, { daq: 0 }); // exclude daq object
    res.send(data);
  } catch (e) {
    res.sendStatus(400);
    console.log(e);
  }
};

module.exports = { handleGetTests };
