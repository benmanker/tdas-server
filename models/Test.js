const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TestSchema = new Schema({
  test_setup: {},
  test_details: {},
  daq: {
    headers: [],
    data: [[]],
  },
});

const Test = mongoose.model("Test", TestSchema);

module.exports = Test;
