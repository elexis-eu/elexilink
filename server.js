const configurationFile = require("./config.json");
const express = require("express");
const path = require("path");
const request = require("request");
const bodyParser = require('body-parser');
const app = express();
const config = configurationFile[process.env.CONFIG || "testing"];
const refreshRateInMs = config.cacheRefreshRate * 1000;
app.use(bodyParser.json({ extended: true }));
app.use(express.static(__dirname + "/dist/elexilink"));

const auth = {
  email: config.email,
  apikey: config.apiKey,
};

let cachedDictionaries = require("./src/assets/dictionaries.json");
const isString = (t) => typeof t === "string" || t instanceof String;

const refreshDictionaryCache = (callbackFn = undefined) => {
  request.post({ url: config.serverUrl + "/api/listDict", body: auth, json: true }, (err, res_, body) => {
    if (!isString()) {
      cachedDictionaries = body;
    }
    if (!!callbackFn) callbackFn(err);
  });
};

if (config.useCache && refreshRateInMs > 0) {
  setInterval(refreshDictionaryCache, refreshRateInMs);
}

app.get("/refreshCache", function (req, res) {
  if (config.useCache && req.params.apikey === config.apiKey) {
    refreshDictionaryCache((err) => {
      res.sendStatus(!!err ? 500 : 200);
    });
    return;
  }
  res.sendStatus(400);
});


app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname + "/dist/elexilink/index.html"));
});

app.post("/api/*", function (req, res) {
  if (req.params.apikey === config.apiKey) {
    res.json({error: "Not correctly authenticated!"});
    return;
  }
  if (req.url === "/api/listDict" && config.useCache) {
    res.json(cachedDictionaries);
    return;
  }
  request.post({ url: config.serverUrl + req.url, body: req.body, json: true }, (err, res_, body) => {
    res.json(body);
  });
});

app.listen(process.env.PORT || 8080);
