const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const { readdirSync } = require("fs");
const dotenv = require("dotenv");
const session = require("express-session");
const { createSessionConfig } = require("./db/session");
dotenv.config();

const app = express();
const PORT = 4000;

const startServer = async () => {
  app.use(express.json());
  // middleware
  
  // รอให้ Redis พร้อมก่อน แล้วค่อยสร้าง session config
  const sessionConfig = await createSessionConfig();
  
  app.use(session(sessionConfig));
  
  app.use(
    cors({
      origin: ["http://localhost:3000"],
    })
  );
  // connect database
  const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  db.connect((error) => {
    if (error) {
      console.error("Database connection failed:", error);
      return;
    }
    console.log("Connected to MySQL database.");
  });

  readdirSync("./routes").map((route) => {
    app.use("/api", require("./routes/" + route));

  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
