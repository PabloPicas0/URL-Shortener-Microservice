require("dotenv").config();
const express = require("express");
const cors = require("cors");

const mongoose = require("mongoose");

const bodyParser = require("body-parser");

const url = require("url");
const dns = require("dns");

mongoose.connect(process.env.MONGO_URI);

const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
  },
});

const urlModel = mongoose.model("urlModel", urlSchema);

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

  const newUrl = new urlModel({
    original_url: submittedURL,
  });

  urlModel.findOne({ original_url: submittedURL }).then((doc) => {
    const verifyUrl = (hostname, doc) => {
      dns.lookup(hostname, (err, address) => {
        if (err) {
          console.error(err);
          return res.json({ error: "Some error occured" });
        }
        return res.json({ orginal_URL: doc.original_url, short_url: doc._id });
      });
    };

    if (!doc) {
      newUrl.save().then((doc) => {
        verifyUrl(hostname, doc);
      });
    }

    verifyUrl(hostname, doc);
  });
});

const port = process.env.PORT || 3000;
const listener = app.listen(port, () => {
  console.log(`Your app is listening at localhost:${listener.address().port}`);
  console.log("Press ctrl + c to exit");
});
