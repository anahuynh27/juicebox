const { Client } = require("pg"); // imports the pg module

// supply the db name and location of the database
const client = new Client("postgres://localhost:5432/juicebox-dev");

async function createUser({ username, password, name, location }) {
  const result = await client.query(
    `
  INSERT INTO users(username, password, name, location) 
  VALUES($1, $2, $3, $4) 
  ON CONFLICT (username) DO NOTHING 
  RETURNING *;
  `,
    [username, password, name, location]
  );

  return result;
}

async function getAllUsers() {
  const { rows } = await client.query(
    "SELECT id, username, name, location FROM users;"
  );
  return rows;
}

module.exports = {
  client,
  getAllUsers,
  createUser,
};
