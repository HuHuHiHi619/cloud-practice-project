const pool = require("../db/index");
const { hashPassword } = require("../utils/hash");

async function createUser(name, email, password) {
  try {
    const hashedPassword = await hashPassword(password);
    const query =
      "INSERT INTO users (name , email , password) VALUE (? , ? , ?)";
    const [result] = await pool.execute(query, [name, email, hashedPassword]);

    return {
      id: result.insertId,
      name: name,
      email: email,
    };
  } catch (error) {
    console.error("Error in userService.createUser:", error);

    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Email already registered.");
    }
    throw new Error("Could not create user.");
  }
}

async function findByEmail(email) {
  try {
    const query = "SELECT * FROM users WHERE email = ? LIMIT 1";
    const [rows] = await pool.execute(query, [email]);
    return rows[0];
  } catch (error) {
    console.error("Error in userService.createUser:", error);

    if (error.code !== "ER_DUP_ENTRY") {
      throw new Error("Cannot find this email.");
    }
    throw new Error("Could not find email.");
  }
}

async function findALL() {
  try {
    const query = "SELECT * FROM users";
    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    console.error("Error executing query", error);
  }
}

module.exports = {
  createUser,
  findByEmail,
  findALL
};
