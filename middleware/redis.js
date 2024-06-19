let redisClient = undefined;
const { createClient } = require("redis");

async function initializeRedisClient() {
  const redisUrl = process.env.REDIS_URI;
  if (redisUrl) {
    redisClient = createClient({ url: redisUrl }).on("error", (e) => {
      console.error("Failed to create the Redis client with error:");
      console.error(e);
    });
    try {
      await redisClient.connect();
      redisClient.hset("jhjhj", "hfhf");
      console.log("Connected to Redis successfully!");
    } catch (error) {
      console.error(`Connection to Redis failed with error:`);
      console.error(e);
    }
  }
}
