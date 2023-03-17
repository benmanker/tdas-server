const Test = require("../models/Test");

const handleGetTests = async (req, res) => {
  try {
    const testData = await Test.find({}); // exclude daq object
    // console.log(JSON.stringify(data));
    const daqData = testData[0].daq.data;
    // console.log(daqData[0]);

    const arr = [];
    for (let i = 0; i < daqData.length; i++) {
      for (let k = 0; k < daqData[i].length - 4; k++) {
        if (!arr[k]) {
          arr[k] = [];
        }
        //
        if (
          typeof daqData[i][k] === "string" ||
          daqData[i][k] instanceof String
        ) {
          arr[k][i] = daqData[i][k];
        } else {
          arr[k][i] = Number(daqData[i][k].toFixed(3));
        }
      }
    }

    var powerArr = [];
    for (let i = 0; i < daqData.length; i++) {
      const power =
        daqData[i][40] * daqData[i][41] + daqData[i][42] * daqData[i][43];
      powerArr.push(Number(power.toFixed(3)));
    }
    // console.log(powerArr);

    var newHeaders = testData[0].daq.headers.slice(0, -4);
    newHeaders.push("power");
    // console.log(newHeaders);

    // console.log(arr[1]);
    arr.push(powerArr);
    testData[0].daq.data = arr;
    testData[0].daq.headers = newHeaders;
    res.send(testData[0]);
  } catch (e) {
    res.sendStatus(400);
    console.log(e);
  }
};

module.exports = { handleGetTests };
