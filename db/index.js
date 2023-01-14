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

  return user;
}

async function createPost({
  authorId,
  title,
  content
}) {
  const { rows: [posts]} = await client.query(
    `INSERT INTO posts("authorId", title, content)
    VALUES($1, $2, $3)
    RETURNING *;
    `,
    [authorId, title, content]
  );

  return { rows: [posts]};
}

async function getAllUsers() {
  const { rows } = await client.query(
    "SELECT id, username, name, location FROM users;"
  );
  return rows;
}

async function getAllPosts() {
  const { rows } = await client.query(
    'SELECT id, "authorId", title, content FROM posts;'
  );
  return rows ;
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
  console.error("Issues updating user")
  throw error;
}
}

async function updatePost(id, fields = {}) {
  console.log(fields[0])
  console.log("Viewing Update Posts",  fields, id);
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  if (setString.length === 0) {
    console.log("in if statement of Update Post")
    return;
  }

  try {
    console.log("in update post try")
    const { rows: [ post ] } = await client.query(`
    UPDATE posts
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `, Object.values(fields));

    console.log("end of try of update post")
    return post;
  } catch (error) {
    console.error("Issues updating Post")
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM posts
      WHERE "authorId"=${ userId };
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(authorId) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM users
      WHERE id=${ authorId };
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}


module.exports = {
  client,
  getAllUsers,
  updateUser,
  createUser,
  createPost, 
  getAllPosts,
  updatePost,
  getPostsByUser,
  getUserById,
};
