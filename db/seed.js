const { Console } = require("console");
const { resourceLimits } = require("worker_threads");
const { client, getAllUsers, createUser, updateUser } = require("./index");

async function dropTables() {
  try {
    console.log("Starting to drop tables (and some beats)...");

    await client.query(`
      DROP TABLE IF EXISTS users;
    `);

    console.log("Finished droping tables");
  } catch (error) {
    console.error("Error dropping tables :(");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username varchar(225) UNIQUE NOT NULL,
      password varchar(225) NOT NULL,
      name VARCHAR(255) NOT NULL, 
      location VARCHAR(255) NOT NULL, 
      active BOOLEAN DEFAULT true
    )
    `);

    console.log("Finished building tables");
  } catch (error) {
    console.error("Error building tables :(");
    throw error;
  }
}

async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    const albert = await createUser({
      username: "albert",
      password: "bertie99",
      name: "Al Bert",
      location: "Sydney, Australia",
    });
    const sandra = await createUser({
      username: "sandra",
      password: "2sandy4me",
      name: "Just Sandra",
      location: "Ain't tellin'",
    });
    const glamgal = await createUser({
      username: "glamgal",
      password: "soglam",
      name: "Joshua",
      location: "Upper East Side",
    });

    console.log(albert);
    console.log(sandra);
    console.log(glamgal);

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

// async function updateUsers(id, fields = {}) {
//   console.log("Viewing Update Users");
//   const setString = Object.keys(fields)
//     .map((key, index) => `"${key}"=$${index + 1}`)
//     .join(", ");

//   if (setString.length === 0) {
//     return;
//   }

//   try {
//     const result = await client.query(
//       `
//     UPDATE users
//     SET "${setString}"
//     WHERE is=${id}
//     RETURNING *;
//     `,
//       Object.values(fields)
//     );

//     console.log("Finished updating user!!!");
//     return result;
//   } catch (error) {
//     console.log("issue updating user");
//     throw error;
//   }
// }

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await updateUser();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// async function testDB() {
//   try {
//     console.log("Starting to test database...");

//     // queries are promises, so we can await them
//     console.log("calling getAllUsers");
//     const users = await getAllUsers();
//     console.log("getAllUsers:", users);

//     console.log("Calling updateUser on users[0]");
//     const updateUserResult = await updateUser(users[0].id, {
//       name: "Newname Sogood",
//       location: "Lesterville, KY",
//     });
//     console.log("Result:", updateUserResult);

//     console.log("Finshed DB tests!");
//   } catch (error) {
//     console.error("Error testing database :(");
//     throw error;
//   }
// }

async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Calling getAllUsers")
    const users = await getAllUsers();
    console.log("Result:", users);

    console.log("Calling updateUser on users[0]")
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY"
    });
    console.log("Result:", updateUserResult);

    console.log("Finished database tests!");
  } catch (error) {
    console.error("Error testing database!");
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
