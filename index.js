// Load modules
// Express
const express = require("express");
const app = express();

// file writer
const fs = require("fs");

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

app.post("/shoes", async (req, res) => {
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

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
