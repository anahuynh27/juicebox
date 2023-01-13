const { Client } = require("pg"); // imports the pg module

// supply the db name and location of the database
const client = new Client("postgres://localhost:5432/juicebox-dev");

async function createUser({ username, password, name, location }) {
  const { rows: [ user ]} = await client.query(
    `
  INSERT INTO users(username, password, name, location) 
  VALUES($1, $2, $3, $4) 
  ON CONFLICT (username) DO NOTHING 
  RETURNING *;
  `,
    [username, password, name, location]
  );

  return { rows: [ user ]};
}

async function getAllUsers() {
  const { rows } = await client.query(
    "SELECT id, username, name, location FROM users;"
  );
  return rows;
}

async function updateUser(id, fields = {}) {
  console.log("Viewing Update Users");
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    return;
  }
try {
  const { rows: [ user ]} = await client.query(`
    UPDATE users
    SET ${ setString }
    WHERE id=${ id }
    RETURNING *;
  `, Object.values(fields));

  return { rows: [ user ]};
} catch (error) {
  throw error;
}
}


module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
};
