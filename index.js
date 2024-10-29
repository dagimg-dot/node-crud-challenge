const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const bodyParser = require("body-parser");
const Joi = require("joi");

const app = express();

// Server Configuration
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

let persons = [
  {
    id: "1",
    name: "Sam",
    age: 26,
    hobbies: [],
  },
];

app.set("db", persons);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
  });
}

module.exports = app;
