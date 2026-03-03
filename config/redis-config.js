const redis = require('ioredis');

const redisClient = new redis({
  host: process.env.MY_REDIS_HOST,
  port: process.env.MY_REDIS_PORT,
//   password: process.env.REDIS_PASSWORD,
});

redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("error", (err) => console.error("Redis error:", err));

module.exports = redisClient;