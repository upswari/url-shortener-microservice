const express = require("express");
const bodyParser = require("body-parser");
const dns = require("dns");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public"));

storage = {
  original_url: "",
  short_url: 0,
};

function logger(req, res, next) {
  console.log(`
    url : ${req.body.f_url}
    protocol : ${req._protocol}, valid: ${req.isValidProtocol}
    hostname : ${req._hostname}, valid: ${req.isValidHostname}
  `);

  next();
}

function getRandomInt() {
  return Math.floor(Math.random() * Math.floor(100));
}

function getProtocolAndHostname(req, res, next) {
  req._protocol = req.body.f_url.split("://")[0];
  req._hostname = req.body.f_url.split("://")[1];

  next();
}

function validateProtocol(req, res, next) {
  const validProtocol = ["http", "https"];

  req.isValidProtocol =
    validProtocol.filter((item) => item == req._protocol).length > 0
      ? true
      : false;

  next();
}

function validateHostname(req, res, next) {
  req.isValidHostname = false;

  if (req._hostname != undefined) {
    dns.lookup(req._hostname, (err) => {
      if (err) {
        next();
      } else {
        req.isValidHostname = true;
        next();
      }
    });
  } else {
    next();
  }
}

function shortURL(req, res) {
  if (req.isValidProtocol && req.isValidHostname) {
    storage.original_url = req.body.f_url;
    storage.short_url = getRandomInt();

    res.json(storage);
  } else {
    res.json({ error: "Invalid URL" });
  }
}

app.get("/", (req, res) => {
  res.render("index.html");
});

app.post(
  "/api/shorturl/new",
  getProtocolAndHostname,
  validateProtocol,
  validateHostname,
  // logger,
  shortURL
);

app.get("/api/shorturl/:number", (req, res) => {
  if (req.params.number == storage.short_url) {
    res.redirect(storage.original_url);
  }

  res.end();
});

app.listen(port, () => console.log(`Running on port ${port}`));
