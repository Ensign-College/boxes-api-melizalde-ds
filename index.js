// Load modules
// Express
const express = require("express");
const app = express();

// Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// File Writer
const fs = require("fs");
// Decycle function
function decycle(obj, stack = []) {
  if (!obj || typeof obj !== "object") return obj;

  if (stack.includes(obj)) return null;

  let s = stack.concat([obj]);

  return Array.isArray(obj)
    ? obj.map((x) => decycle(x, s))
    : Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, decycle(v, s)])
      );
}

// Redis
const redis = require("redis");

// CORS
const cors = require("cors");
app.use(cors());

// Create Redis Client
const redisClient = redis.createClient({
  host: "localhost",
  port: 6379,
});

// Connect to Redis
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();

app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.get("/shoes", async (req, res) => {
  if (req.body.color) {
    const shoesGet = await redisClient.json.get(
      "shoe:",
      "color",
      req.body.color
    );
    return res.send(shoesGet);
  } else {
    const shoesGet = await redisClient.json.get("shoe:");
    return res.send(shoesGet);
  }
});

app.post("/shoes", async (req, res) => {
  const shoe = {
    id: 1,
    name: "Nike Air Max 90",
    color: "White",
    price: 100,
  };
  await redisClient.json.set("shoe:", "$", shoe, (err, reply) => {
    if (err) {
      console.log(err);
    }
  });
  return res.send("Shoe added");
});

app.post("/shoes", async (req, res) => {
  const query = req.query;
  if (query.owner) {
    const owner = query.owner;
    const body = req.body;
    if (body.brand && body.color) {
      body.id = Math.floor(Math.random() * 1000);
      await redisClient.rPush(owner, JSON.stringify(body));
      return res.status(200).send("Shoe added to Redis");
    }
    return res.status(400).send("Brand and color are required");
  }
  return res.status(400).send("Owner is required");
});

app.get("/owners", async (req, res) => {
  const owners = await redisClient.keys("*");
  res.send(owners);
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
