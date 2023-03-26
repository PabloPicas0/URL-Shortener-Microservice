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
  short_url: {
    type: Number,
    required: true,
    unique: true,
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
  const number = new Date().getTime();

  // If user enter different url than this in example the hostname = null
  if (!hostname) {
    return res.json({ error: "invalid url" });
  }

  const newUrl = new urlModel({
    original_url: submittedURL,
    short_url: number,
  });

  urlModel.findOne({ original_url: submittedURL }).then((doc) => {
    const verifyUrl = (hostname, doc) => {
      dns.lookup(hostname, (err, address) => {
        if (err) {
          console.error(err);
          return res.json({ error: "Some error occured" });
        }

        return res.json({ orginal_URL: doc.original_url, short_url: doc.short_url });
      });
    };

    if (!doc) {
      newUrl.save().then((doc) => {
        verifyUrl(hostname, doc);
      });
    } else {
      verifyUrl(hostname, doc);
    }
  });
});

app.get("/api/shorturl/:word", (req, res) => {
  const { word } = req.params;
  const regex = /^\d{13}/;

  if (regex.test(word)) {
    const number = Number(word); // In db short_url are numbers so we need convert string to number

    urlModel.findOne({ short_url: number }).then((doc) => {
      if (!doc) {
        res.json("Not in database");
      } else {
        res.status(301).redirect(doc.original_url);
      }
    });
  } else {
    res.json("invalid url");
  }
});

const port = process.env.PORT || 3000;
const listener = app.listen(port, () => {
  console.log(`Your app is listening at localhost:${listener.address().port}`);
  console.log("Press ctrl + c to exit");
});
