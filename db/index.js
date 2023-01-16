const { Client } = require("pg"); // imports the pg module

// supply the db name and location of the database
const client = new Client("postgres://localhost:5432/juicebox-dev");

async function createUser({ username, password, name, location }) {
  const {
    rows: [user],
  } = await client.query(
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

async function createPost({ authorId, title, content }) {
  const {
    rows: [posts],
  } = await client.query(
    `INSERT INTO posts("authorId", title, content)
    VALUES($1, $2, $3)
    RETURNING *;
    `,
    [authorId, title, content]
  );

  return { rows: [posts] };
}

async function getAllUsers() {
  const { rows } = await client.query(
    "SELECT id, username, name, location FROM users;"
  );
  return rows;
}

async function getAllPosts() {

  try {
    const { rows: postIds } = await client.query(`
      SELECT id
      FROM posts;
    `)

    const posts = await Promise.all(postIds.map(
      post => getPostById(post.id)
    ));

    return posts;
  } catch (error) {
    throw error;
  }
  // const { rows } = await client.query(
  //   'SELECT id, "authorId", title, content FROM posts;'
  // );
  // return rows;
}

async function updateUser(id, fields = {}) {
  console.log("Viewing Update Users");
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    UPDATE users
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
  `,
      Object.values(fields)
    );

    return { rows: [user] };
  } catch (error) {
    console.error("Issues updating user");
    throw error;
  }
}

async function updatePost(id, fields = {}) {
  console.log("Viewing Update Posts", fields, id);
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [post],
    } = await client.query(
      `
    UPDATE posts
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `,
      Object.values(fields)
    );

    return post;
  } catch (error) {
    console.error("Issues updating Post");
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows: postIds } = await client.query(`
      SELECT id
      FROM posts
      WHERE "authorId"=${userId};
    `);

    const posts = await Promise.all(postIds.map(
      post => getPostById(post.id)
    ));

    return posts;
  } catch (error) {
    console.log("err in getPostsbyUser")
    throw error;
  }
}

async function getUserById(authorId) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM users
      WHERE id=${authorId};
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

//tags
async function createTags(tagList) {
  if (tagList.length === 0) {
    return;
  }

  const insertValues = tagList.map((_, index) => `$${index + 1}`).join("), (");

  const selectValues = tagList.map((_, index) => `$${index + 1}`).join(", ");

  try {
    await client.query(
      `INSERT INTO tags(name)
      VALUES (${insertValues})
      ON CONFLICT (name) DO NOTHING;`, tagList
    );

    const { rows } = await client.query(`
    SELECT * FROM tags
    WHERE name 
    IN (${selectValues});
    `, tagList)

    return rows;

  } catch (error) {
    console.error("eek! error creating tags in createTags");
    throw error;
  }
}

async function createPostTag(postId, tagId) {
  try {
    await client.query(`
      INSERT INTO post_tags("postId", "tagId")
      VALUES ($1, $2)
      ON CONFLICT ("postId", "tagId") DO NOTHING;
    `, [postId, tagId]);
  } catch (error) {
    console.error("err on createPostTag function")
    throw error;
  }
}

async function addTagsToPost(postId, tagList) {
  try {
    const createPostTagPromises = tagList.map(
      tag => createPostTag(postId, tag.id)
      );

    await Promise.all(createPostTagPromises);

    return await getPostById(postId);
  } catch (error) {
    console.error("error on addTagsToPost")
    throw error;
  }
}

async function getPostById(postId) {
  try {
    const { rows: [ post ]  } = await client.query(`
      SELECT *
      FROM posts
      WHERE id=$1;
    `, [postId]);

    const { rows: tags } = await client.query(`
      SELECT tags.*
      FROM tags
      JOIN post_tags ON tags.id=post_tags."tagId"
      WHERE post_tags."postId"=$1;
    `, [postId])

    const { rows: [author] } = await client.query(`
      SELECT id, username, name, location
      FROM users
      WHERE id=$1;
    `, [post.authorId])

    post.tags = tags;
    post.author = author;

    console.log("post", post);
    console.log("tag", tags);

    delete post.authorId;

    return post;
  } catch (error) {
    console.error("err on getPostById")
    throw error;
  }
}

module.exports = {
  client,
  getAllUsers,
  updateUser,
  createUser,
  createPost,
  createTags,
  getAllPosts,
  updatePost,
  getPostsByUser,
  getUserById,
  addTagsToPost,
};
