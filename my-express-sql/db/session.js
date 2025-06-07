const session = require("express-session");
const { createClient } = require("redis");
const { RedisStore } = require("connect-redis")

// CREATE REDIS CLIENT
const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// EVENT HANDLER
redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

redisClient.on("ready", () => {
  console.log("✅ Redis Ready");
});

// CONNECT REDIS
const initRedis = async () => {
  try {
    await redisClient.connect();
    console.log("🎯 Redis Connected Successfully");
    return true;
  } catch (error) {
    console.error("Redis Connection failed:", error);
    return false;
  }
};
const createSessionConfig = async () => {
  const redisConnected = await initRedis();
  
  let store;

  if (redisConnected) {
    store = new RedisStore({
      client: redisClient,
      prefix: "sess:",
      ttl: 86400 * 7, // 7 วัน
    });
    console.log("🔥 Using RedisStore for sessions");
  } else {
    store = undefined; // ใช้ MemoryStore
    console.log("⚠️  Using MemoryStore for sessions");
  }
  return {
    store,
    name: "sessionId",
    secret: process.env.SESSION_SECRET || "change-this-secret-in-production",

    // แก้ deprecation warnings - ต้องระบุทุกตัว
    resave: false,
    saveUninitialized: false,

    rolling: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 วัน
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
  };
};

// --- GRACEFUL SHUTDOWN
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down...");
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  } catch (error) {
    console.error("Error closing Redis:", error);
  }
  process.exit(0);
});

module.exports = {
  createSessionConfig,
  redisClient,
};