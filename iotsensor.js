const mongoose = require("mongoose");
const Sensor = require("./models/sensor"); // Make sure to import the appropriate model
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const COMMPORT = "COM4"; // Replace with the actual COM port
const plotly = require("plotly")("your-username", "your-api-key"); // Replace with your Plotly credentials

const port = new SerialPort({ path: `${COMMPORT}`, baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));
const uri = "mongodb://your-mongodb-uri"; // Replace with your MongoDB URI

const plotlyData = {
  x: [],
  y: [],
  type: "scatter",
};

// Connect to MongoDB
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    setInterval(sensortest, 10000);
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

function sensortest() {
  // Read sensor data from your hardware or source
  // For example, you can use parser.on('data', data => { ... }) to read data from the serial port

  // Replace the following simulated data with actual sensor readings
  const sensorData = {
    id: 0,
    name: "temperaturesensor",
    address: "221 Burwood Hwy, Burwood VIC 3125",
    data: [
      {
        time: Date.now(),
        temperature: 20.0, // Replace with actual temperature reading
      },
    ],
  };

  // Push data for Plotly
  plotlyData.x.push(new Date().toISOString());
  plotlyData.y.push(sensorData.data[sensorData.data.length - 1].temperature);

  const graphOptions = {
    filename: "iot-performance",
    fileopt: "overwrite",
  };

  plotly.plot(plotlyData, graphOptions, function (err, msg) {
    if (err) return console.log(err);
    console.log(msg);
  });

  // Update existing sensor document in MongoDB or create a new one if it doesn't exist
  Sensor.findOneAndUpdate(
    { id: sensorData.id },
    { $push: { data: sensorData.data[sensorData.data.length - 1] } },
    { new: true, upsert: true }
  )
    .then((doc) => {
      console.log(doc);
    })
    .catch((error) => {
      console.error(error);
    });
}
