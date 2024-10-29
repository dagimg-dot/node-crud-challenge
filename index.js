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

const ErrorTypes = {
  NOT_FOUND: "NOT_FOUND",
  VALIDATION: "VALIDATION",
  INTERNAL: "INTERNAL",
};

const ErrorMessages = {
  PERSON_NOT_FOUND: "Person not found",
  RESOURCE_NOT_FOUND: "Resource not found",
  INTERNAL_ERROR: "Internal Server Error",
};

const createError = (type, message) => ({
  type,
  message,
  timestamp: new Date().toISOString(),
});

const sendError = (res, error) => {
  const statusCodes = {
    [ErrorTypes.NOT_FOUND]: 404,
    [ErrorTypes.VALIDATION]: 400,
    [ErrorTypes.INTERNAL]: 500,
  };

  res.status(statusCodes[error.type]).json({
    error: error.message,
    timestamp: error.timestamp,
  });
};

const validatePerson = (req, res, next) => {
  const { error } = personSchema.validate(req.body);
  if (error) {
    return sendError(
      res,
      createError(ErrorTypes.VALIDATION, error.details[0].message)
    );
  }
  next();
};

const findPerson = (req, res, next) => {
  const person = persons.find((p) => p.id === req.params.id);
  if (!person) {
    return sendError(
      res,
      createError(ErrorTypes.NOT_FOUND, ErrorMessages.PERSON_NOT_FOUND)
    );
  }
  req.person = person;
  next();
};

// Routes
app.get("/person", (req, res) => {
  res.json(persons);
});

app.get("/person/:id", findPerson, (req, res) => {
  res.json(req.person);
});

app.post("/person", validatePerson, (req, res) => {
  const newPerson = {
    id: uuidv4(),
    name: req.body.name,
    age: req.body.age,
    hobbies: req.body.hobbies,
  };

  persons.push(newPerson);
  res.status(201).json(newPerson);
});

app.put("/person/:id", validatePerson, findPerson, (req, res) => {
  const index = persons.findIndex((p) => p.id === req.params.id);
  persons[index] = {
    id: req.params.id,
    name: req.body.name,
    age: req.body.age,
    hobbies: req.body.hobbies,
  };

  res.json(persons[index]);
});

app.delete("/person/:id", findPerson, (req, res) => {
  const index = persons.findIndex((p) => p.id === req.params.id);
  persons.splice(index, 1);
  res.status(204).send();
});

// Special routes
app.use((req, res) => {
  sendError(
    res,
    createError(ErrorTypes.NOT_FOUND, ErrorMessages.RESOURCE_NOT_FOUND)
  );
});

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  sendError(
    res,
    createError(ErrorTypes.INTERNAL, ErrorMessages.INTERNAL_ERROR)
  );
};

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
  });
}

module.exports = app;
