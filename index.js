require("dotenv").config();
const express = require("express");
const cors = require("cors");
let mongoose = require("mongoose")
const bodyParser = require("body-parser");
const url = require("url");
const dns = require("dns");

mongoose.connect(process.env.MONGO_URI)

const app = express();

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/shorturl", (req, res) => {
  const submittedURL = req.body.url;
  const parsedURL = url.parse(submittedURL);
  const hostname = parsedURL.hostname;

  // If user enter different url than this in example the hostname = null 
  if (!hostname) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(hostname, (err, address) => {
    if (err) {
      console.error(err);
      return res.json({ error: "Some error occured" });
    }
    return res.json({ orginal_URL: req.body.url });
  });
});

const port = process.env.PORT || 3000;
const listener = app.listen(port, () => {
  console.log(`Your app is listening at localhost:${listener.address().port}`);
  console.log("Press ctrl + c to exit");
});
