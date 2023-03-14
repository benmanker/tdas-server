const express = require("express");
const app = express();
const mongoose = require("mongoose");
const connectDatabase = require("./config/connectDatabase");

const PORT = 3001;

connectDatabase();

mongoose.connection.once("connected", () => {
  console.log("[INFO] Database connection was successful");
  app.listen(PORT, () =>
    console.log(`[INFO] Server is running on port ${PORT}`)
  );
});
