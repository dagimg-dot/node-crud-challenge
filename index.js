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

const personSchema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().required(),
  hobbies: Joi.array().items(Joi.string()).required(),
});

// Routes
app.get("/person", (req, res) => {
  res.json(persons);
});

app.get("/person/:id", (req, res) => {
  const person = persons.find((p) => p.id === req.params.id);
  if (!person) {
    return res.status(404).json({ message: "Person not found" });
  }
  res.json(person);
});

app.post("/person", (req, res) => {
  const { error } = personSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const newPerson = {
    id: uuidv4(),
    ...req.body,
  };

  const persons = req.app.get("db");
  persons.push(newPerson);
  res.status(201).json(newPerson);
});

app.put("/person/:id", (req, res) => {
  const { error } = personSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const persons = req.app.get("db");
  const index = persons.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Person not found" });
  }

  persons[index] = {
    id: req.params.id,
    ...req.body,
  };

  res.json(persons[index]);
});

app.delete("/person/:id", (req, res) => {
  const index = persons.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Person not found" });
  }

  persons.splice(index, 1);
  res.status(204).send();
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
  });
}

module.exports = app;
