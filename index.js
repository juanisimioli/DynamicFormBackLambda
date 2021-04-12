"use strict";

const mailsenderEnd = require("./mailsender.js");

const serverless = require("serverless-http");
const express = require("express");
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.post("/dynamicform", mailsenderEnd.endpoint);

app.get("/hi", function (req, res) {
  res.send("Hello World!");
});

module.exports.handler = serverless(app);
