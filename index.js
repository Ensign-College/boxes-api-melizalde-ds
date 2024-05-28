// Load modules
// Express
const express = require("express");
const app = express();

// Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// File System
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
const options = {
  origin: "http://localhost:3000",
};
const cors = require("cors");
app.use(cors(options));

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
  const query = req.query;
  if (query.owner) {
    const owner = query.owner;
    try {
      const shoe = await redisClient.lRange(owner, 0, -1);
      if (shoe.length === 0) {
        const owners = await redisClient.keys("*");
        if (owners.includes(owner)) {
          return res.send([{ owner: owner, shoes: [] }]);
        }
        throw new Error("Owner not found");
      }
      const listshoe = shoe.map((shoe) => JSON.parse(shoe));
      const ownerShoes = { owner: owner, shoes: listshoe };
      return res.send(ownerShoes);
    } catch (error) {
      return res.status(404).send(error.message);
    }
  }
  const owners = await redisClient.keys("*");
  const shoes = [];
  for (const owner of owners) {
    const shoe = await redisClient.lRange(owner, 0, -1);
    const listshoe = shoe.map((shoe) => JSON.parse(shoe));
    const ownerShoes = { owner: owner, shoes: listshoe };
    shoes.push(ownerShoes);
  }
  res.send(shoes);
});

app.post("/dev-shoes", async (req, res) => {
  const owners = ["John", "Jane", "Doe"];
  const colors = ["red", "blue", "green"];
  const brands = ["nike", "adidas", "reebok"];
  const shoe = {
    id: Math.floor(Math.random() * 1000),
    brand: brands[Math.floor(Math.random() * brands.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
  };
  const owner = owners[Math.floor(Math.random() * owners.length)];
  await redisClient.rPush(owner, JSON.stringify(shoe));
  return res.json("Shoe added to Redis");
});

// Added a new endpoint to add a shoe to a specific owner
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
