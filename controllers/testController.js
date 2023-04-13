const TestInfo = require("../models/TestInfo");
const TestData = require("../models/TestData");

const handleGetList = async (req, res) => {
  try {
    const list = await TestInfo.find({}, { _id: 1, "setup.title": 1 });
    res.send(list);
  } catch (e) {
    console.log(e);
    res.sendStatus(400);
  }
};

const handleGetTest = async (req, res) => {
  try {
    const SCALE = 1;

    const testId = req.query.testId;
    const testInfo = await TestInfo.findById(testId, { headers: 1 });
    // get all documents that belong to the current test
    const testData = await TestData.find(
      { ["metadata.testId"]: testId },
      { scan: 1, timestamp: 1 }
    );

    // replace volt and amp values with calculated power
    const voltIndexes = testInfo.headers
      .map((value, index) => (value.indexOf("Volt") !== -1 ? index : -1))
      .filter((index) => index !== -1);

    const timestamps = []; // string array
    const powers = []; // float array
    const sensors = []; // list of sensors, each sensor contains all its readings
    const n = voltIndexes.length * 2; // number of volt and amp columns to remove

    for (var i = 0; i < testData.length; i++) {
      var totalPower = 0;
      for (var k = 0; k < voltIndexes.length; k++) {
        const power =
          testData[i].scan[voltIndexes[k]] *
          testData[i].scan[voltIndexes[k] + 1];
        totalPower = totalPower + power;
      }

      // round each power to 3 decimal places
      powers.push(Math.round(parseFloat(totalPower) * 1000) / 1000);
      // remove the volt and amp values from each scan
      testData[i].scan.splice(-n, n);

      timestamps.push(testData[i].timestamp);

      for (var k = 0; k < testData[i].scan.length; k++) {
        if (typeof sensors[k] === "undefined") {
          sensors[k] = [];
        }
        // round every temperature reading to 3 decimal places
        sensors[k].push(
          Math.round(parseFloat(testData[i].scan[k]) * 1000) / 1000
        );
      }
    }

    // remove the volt and amp header names from testInfo.headers
    testInfo.headers.splice(-n, n);

    // scale down data for graph
    const scaledTimestamps = timestamps.filter(
      (e, i) => i % SCALE === SCALE - 1
    );
    const scaledPowers = powers.filter((e, i) => i % SCALE === SCALE - 1);
    const scaledSensors = [];
    for (var i = 0; i < sensors.length; i++) {
      scaledSensors.push(sensors[i].filter((e, i) => i % SCALE === SCALE - 1));
    }

    // TIME AVERAGE TABLE
    const powerSteps = [];
    var count = 0;
    for (var i = 3; i < powers.length; i++) {
      const diff = powers[i] - powers[i - 3];
      if (diff > 10 || diff < -10) {
        count++;
        // if we are on a step up, make a new powerSteps object
        if (count == 1) {
          powerSteps.push({
            start: { time: timestamps[i], index: i },
            end: { time: null, index: null },
          });
          i = i + 20;
        }
        // if we are on a step down, modify the end object in the correct powerStep object
        if (count == 2) {
          powerSteps[powerSteps.length - 1].end.time = timestamps[i - 1];
          powerSteps[powerSteps.length - 1].end.index = i - 1;
          i = i + 20;
          count = 0;
        }
      }
    }

    // create an array sensors, each element has the sensor averages for each power step
    const timeAveragedSensors = [];
    for (var i = 0; i < sensors.length; i++) {
      const powerStepAveragesForTheCurrentSensor = [];
      for (var k = 0; k < powerSteps.length; k++) {
        var sumOfTemps = 0;
        var numberOfTemps = 0;
        for (var x = 0; x < sensors[i].length; x++) {
          if (x >= powerSteps[k].start.index && x <= powerSteps[k].end.index) {
            sumOfTemps = sumOfTemps + sensors[i][x];
            numberOfTemps++;
          }
        }

        powerStepAveragesForTheCurrentSensor.push(
          Math.round(parseFloat(sumOfTemps / numberOfTemps) * 1000) / 1000
        );
      }
      timeAveragedSensors.push(powerStepAveragesForTheCurrentSensor);
    }

    // create an array that holds the average power for each power step
    const powerStepValues = [];
    for (var i = 0; i < powerSteps.length; i++) {
      var sumOfPowers = 0;
      var numberOfPowers = 0;
      for (var k = 0; k < powers.length; k++) {
        if (k >= powerSteps[i].start.index && k <= powerSteps[i].end.index) {
          sumOfPowers = sumOfPowers + powers[k];
          numberOfPowers++;
        }
      }
      powerStepValues.push(Math.round(sumOfPowers / numberOfPowers));
    }

    // create an array that holds all the averages for each sensor for each power step
    const sensorAveragesByPowerStep = [];
    for (var i = 0; i < timeAveragedSensors.length; i++) {
      for (var k = 0; k < timeAveragedSensors[i].length; k++) {
        if (typeof sensorAveragesByPowerStep[k] === "undefined") {
          sensorAveragesByPowerStep[k] = [];
        }
        sensorAveragesByPowerStep[k].push(timeAveragedSensors[i][k]);
      }
    }

    // create an array of objects containing the power of the power step and the step averages for each sensor
    const timeAveragedTable = [];
    for (var i = 0; i < powerStepValues.length; i++) {
      timeAveragedTable.push({
        powerStepValue: powerStepValues[i],
        sensorAverages: sensorAveragesByPowerStep[i],
      });
    }

    res.json({
      graph: {
        powers: scaledPowers,
        sensorData: scaledSensors,
        sensorNames: testInfo.headers,
        timestamps: scaledTimestamps,
      },
      timeAveragedTable,
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports = { handleGetList, handleGetTest };
