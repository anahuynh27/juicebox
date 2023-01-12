const { Console } = require('console');
const { client, getAllUsers } = require('./index');

async function dropTables() {
  try {
    console.log('Starting to drop tables (and some beats)...');

    await client.query(`
      DROP TABLES IF EXISTS users;
    `);

    console.log('Finished droping tables');
  } catch (error) {
    console.error('Error dropping tables :(');
    throw error; 
  }
}

async function createTables() {
  try {
    console.log('Starting to build tables...');

    await client.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username varchar(225) UNIQUE NOT NULL,
      password varchar(225) NOT NULL
    )
    `);

    console.log('Finished building tables')
  } catch (error) {
    console.error("Error building tables :(");
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
  } catch (error) {
    console.error(error);
  } 
}


async function testDB() {
  try {
    console.log("Starting to test database...")
    
    // queries are promises, so we can await them
    const users = await getAllUsers();
    console.log("getAllUsers:", users);
    
    console.log('finshed DB tests!');
  } catch (error) {
    console.error('Error testing database :(');
    throw error
  } 
}

rebuildDB()
  .then(testDB())
  .catch(console.error)
  .finally(() => client.end());
