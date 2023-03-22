require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/shorturl", (req, res) => {
  res.json({ message: "panw3d" });
});

const port = process.env.PORT || 3000;
const listener = app.listen(port, () => {
  console.log(`Your app is listening at localhost:${listener.address().port}`);
  console.log("Press ctrl + c to exit");
});
