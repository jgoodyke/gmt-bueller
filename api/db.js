const mongoose = require("mongoose");
const config = require('./config/config');

const options = {
  reconnectTries: 60,
  reconnectInterval: 1000,
  useNewUrlParser: true
};

mongoose.connect(config.db_uri, options).then(() => {
    console.log("Company database connection established!");
}, err => {
    console.log("Error connecting company database: ", err);
});
