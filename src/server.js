const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

function verifyIfExistsAccounCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    response.status(400).json({ error: "Customer not found" });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const cpfAlreadyExists = costumers.some((customer) => customer.cpf === cpf);

  if (cpfAlreadyExists) {
    throw new Error(
      response.status(400).json({ message: "CPF already exists" })
    );
  }

  customer = Object.assign({ cpf, name, id: uuidv4(), statement: [] });

  costumers.push(customer);

  return response.status(201).json({ customer });
});

app.put("/account", verifyIfExistsAccounCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).json({ customer });
});

app.get("/statement", verifyIfExistsAccounCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistsAccounCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const statementOperation = Object.assign({
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  });

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post("/whitdraw", verifyIfExistsAccounCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "Insufficients funds!" });
  }

  const statementOperation = Object.assign({
    amount,
    created_at: new Date(),
    type: "debit",
  });

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.get("/statement/date", verifyIfExistsAccounCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter((statements) => {
    statements.created_at.toDateString() ===
      new Date(dateFormat).toDateString();
  });

  return response.json(statement);
});

app.get("/balance", verifyIfExistsAccounCPF, (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement);

  response.json(balance);
});

app.delete("/account", verifyIfExistsAccounCPF, (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.json(customers);
});

app.listen(3333, () => {
  console.log("Server listening on port 3333");
});
