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
const { type } = require("os");
app.use(cors(options));

// Axios
const axios = require("axios");
const e = require("express");

// Create Redis Client
const redisClient = redis.createClient({
  host: "localhost",
  port: 6379,
});

// Connect to Redis
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();

// Hello World Endpoint
app.get("/", async (req, res) => {
  res.send("Hello World!");
});

// Head in Shoes endpoint
app.head("/shoes", async (req, res) => {
  res.setHeader("Allow", "GET, POST, OPTIONS");
  res.status(200).end();
});

// Get all shoes from Redis Endpoint
app.get("/shoes", async (req, res) => {
  const query = req.query;
  if (query.owner) {
    const owner = query.owner;
    try {
      const shoes = await redisClient.ft.search("idx:shoe", `@owner:${owner}`);
      const shoesArray = shoes.documents.map((shoe) => {
        const refactID = shoe.id.split(":");
        return {
          id: refactID[1],
          color: shoe.value.color,
          brand: shoe.value.brand,
          material: shoe.value.material,
          type: shoe.value.type,
          size: shoe.value.size,
          price: shoe.value.price,
        };
      });
      return res.status(200).json({ owner: owner, shoes: shoesArray });
    } catch (error) {
      return res.status(404).send(error.message);
    }
  }
  const owners = await redisClient.SMEMBERS("owners");
  const jsonArray = [];
  for (const owner of owners) {
    try {
      const shoes = await redisClient.ft.search("idx:shoe", `@owner:${owner}`);
      const shoesArray = shoes.documents.map((shoe) => {
        const refactID = shoe.id.split(":");
        return {
          id: refactID[1],
          color: shoe.value.color,
          brand: shoe.value.brand,
          material: shoe.value.material,
          type: shoe.value.type,
          size: shoe.value.size,
          price: shoe.value.price,
        };
      });
      jsonArray.push({ owner: owner, shoes: shoesArray });
    } catch (error) {
      return res.status(404).send(error.message);
    }
  }
  return res.status(200).json(jsonArray);
});

// Add a shoe to Redis Endpoint
app.post("/shoes", async (req, res) => {
  const query = req.query;
  if (query.owner) {
    const owner = query.owner;
    const color = req.body.color;
    const brand = req.body.brand;
    const material = req.body.material;
    const type = req.body.type;
    const size = req.body.size;
    const price = req.body.price;
    if (brand && color) {
      const id = Math.floor(Math.random() * 100000);
      await redisClient.hSet(
        `shoe:${id}`,
        ["owner", owner, "color", color, "brand", brand],
        (err) => {
          if (err) {
            return res.status(400).send(err.message);
          }
        }
      );
      await redisClient.SADD("owners", owner);
      return res.status(201).json({
        id: id,
        owner: owner,
        color: color,
        brand: brand,
        material: material,
        type: type,
        size: size,
        price: price,
      });
    }
    return res.status(400).send("Brand and color are required");
  }
  return res.status(400).send("Owner is required");
});

// Options in Shoes endpoint
app.options("/shoes", async (req, res) => {
  res.setHeader("Allow", "GET, POST, OPTIONS");
  res.status(200).end();
});

// Head in a Shoe endpoint
app.head("/shoes/:id", async (req, res) => {
  res.setHeader("Allow", "GET, PUT, PATCH, DELETE, OPTIONS");
  res.status(200).end();
});

// Get a shoe from Redis Endpoint
app.get("/shoes/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const shoe = await redisClient.hGetAll(`shoe:${id}`);
    const shoeJson = {
      id: id,
      owner: shoe.owner,
      color: shoe.color,
      brand: shoe.brand,
      type: shoe.type,
      material: shoe.material,
      size: shoe.size,
      price: shoe.price,
    };
    return res.status(200).json(shoeJson);
  } catch (error) {
    return res.status(404).send(error.message);
  }
});

// Delete a shoe from Redis Endpoint
app.delete("/shoes/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const owner = await redisClient.hGet(`shoe:${id}`, "owner");
    const response = await redisClient.del(`shoe:${id}`);
    if (response === 1) {
      const otherKeys = await redisClient.ft.search(
        "idx:shoe",
        `@owner:${owner}`
      );
      console.log(otherKeys);
      if (otherKeys.total === 0) {
        await redisClient.SREM("owners", owner);
      }
      return res.status(200).send("Shoe deleted from Redis");
    }
    return res.status(404).send("Shoe not found");
  } catch (error) {
    return res.status(404).send(error.message);
  }
});

// Update a shoe in Redis Endpoint
app.put("/shoes/:id", async (req, res) => {
  const id = req.params.id;
  const color = req.body.color;
  const brand = req.body.brand;
  const owner = req.body.owner;
  const material = req.body.material;
  const type = req.body.type;
  const size = req.body.size;
  const price = req.body.price;
  if (!id) {
    return res.status(400).send("ID is required");
  }
  if (!color || !brand || !owner || !material || !type || !size || !price) {
    return res
      .status(400)
      .send(
        "Brand, color, owner, material, type, size, and price are required"
      );
  }
  try {
    const otherShoes = await redisClient.ft.search(
      "idx:shoe",
      `@owner:${owner}`
    );
    if (otherShoes.total === 1) {
      await redisClient.SREM("owners", owner);
    }
    const response = await redisClient.hSet(
      `shoe:${id}`,
      [
        "owner",
        owner,
        "color",
        color,
        "brand",
        brand,
        "material",
        material,
        "type",
        type,
        "size",
        size,
        "price",
        price,
      ],
      (err) => {
        if (err) {
          return res.status(400).send(err.message);
        }
      }
    );
    if (response === 1) {
      return res.status(200).send("Shoe updated in Redis");
    }
    return res.status(404).send("Shoe not found");
  } catch (error) {
    return res.status(404).send(error.message);
  }
});

// Patch a shoe in Redis Endpoint
app.patch("/shoes/:id", async (req, res) => {
  const id = req.params.id;
  const color = req.body.color;
  const brand = req.body.brand;
  const owner = req.body.owner;
  const material = req.body.material;
  const type = req.body.type;
  const size = req.body.size;
  const price = req.body.price;
  if (!id) {
    return res.status(400).send("ID is required");
  }
  if (!color && !brand && !owner && !material && !type && !size && !price) {
    return res.status(400).send("At least one field is required to update");
  }
  try {
    const shoe = await redisClient.hGetAll(`shoe:${id}`);
    if (shoe) {
      if (color) {
        await redisClient.hSet(`shoe:${id}`, ["color", color]);
      }
      if (brand) {
        await redisClient.hSet(`shoe:${id}`, ["brand", brand]);
      }
      if (material) {
        await redisClient.hSet(`shoe:${id}`, ["material", material]);
      }
      if (type) {
        await redisClient.hSet(`shoe:${id}`, ["type", type]);
      }
      if (size) {
        await redisClient.hSet(`shoe:${id}`, ["size", size]);
      }
      if (price) {
        await redisClient.hSet(`shoe:${id}`, ["price", price]);
      }
      if (owner) {
        const otherShoes = await redisClient.ft.search(
          "idx:shoe",
          `@owner:${owner}`
        );
        if (otherShoes.total === 1) {
          await redisClient.SREM("owners", owner);
        }
        await redisClient.hSet(`shoe:${id}`, ["owner", owner]);
      }
      return res.status(200).send("Shoe updated in Redis");
    }
    return res.status(404).send("Shoe not found");
  } catch (error) {
    return res.status(404).send(error.message);
  }
});

// Options in a Shoe endpoint
app.options("/shoes/:id", async (req, res) => {
  res.setHeader("Allow", "GET, PUT, PATCH, DELETE, OPTIONS");
  res.status(200).end();
});

// Add n-number of sample shoes to Redis Endpoint
app.post("/dev-shoes", async (req, res) => {
  const number = req.query.number;
  const owners = ["John", "Jane", "Doe", "Smith", "Brown"];
  const colors = ["Black", "White", "Red", "Blue", "Green"];
  const brands = ["Nike", "Adidas", "Puma", "Reebok", "Converse"];
  const materials = [
    "Natural Materials",
    "Synthetic Materials",
    "Woven/Fabric Materials",
  ];
  const types = ["Athletic", "Casual", "Specialty"];
  const sizes = ["6", "7", "8", "9", "10"];
  if (!number) {
    number = 10;
  }
  const shoesArray = [];
  for (let index = 0; index < number; index++) {
    const shoe = {
      brand: brands[Math.floor(Math.random() * brands.length)],
      material: materials[Math.floor(Math.random() * materials.length)],
      type: types[Math.floor(Math.random() * types.length)],
      size: sizes[Math.floor(Math.random() * sizes.length)],
    };
    const price = await axios.get("http://localhost:5000/prediction", {
      data: shoe,
    });
    shoe.id = Math.floor(Math.random() * 100000);
    shoe.owner = owners[Math.floor(Math.random() * owners.length)];
    shoe.color = colors[Math.floor(Math.random() * colors.length)];
    shoe.price = price.data.Prediction;
    shoesArray.push(shoe);
  }
  try {
    const multi = redisClient.multi();
    shoesArray.forEach((shoe) => {
      multi.hSet(`shoe:${shoe.id}`, [
        "owner",
        shoe.owner,
        "color",
        shoe.color,
        "brand",
        shoe.brand,
        "material",
        shoe.material,
        "type",
        shoe.type,
        "size",
        shoe.size,
        "price",
        shoe.price,
      ]);
      multi.SADD("owners", shoe.owner);
    });
    multi.exec();
  } catch (error) {
    return res.status(500).send(error.message);
  }
  return res
    .status(201)
    .json({ shoes: shoesArray, message: "Shoes added to Redis" });
});

app.post("/dev-shoes-redis", async (req, res) => {
  const shoes = {
    Brand: "Nike",
    Material: "Woven/Fabric Materials",
    Type: "Casual",
    Size: 10,
  };
  try {
    console.log(price.data);
    return res.status(200).send(price.data);
  } catch (error) {
    return res.status(500).send(error.message);
  }
});

app.delete("/dev-shoes", async (req, res) => {
  const response = await redisClient.flushAll();
  await redisClient.ft.create("idx:shoe", {
    owner: "TEXT",
    color: "TEXT",
    brand: "TEXT",
    material: "TEXT",
    type: "TEXT",
    size: "TEXT",
    price: "TEXT",
  });
  console.log(`All shoes deleted from Redis: ${response}`);
  return res.status(200).send("All shoes deleted from Redis");
});

// Get all owners from Redis Endpoint
app.get("/owners", async (req, res) => {
  const owners = await redisClient.SMEMBERS("owners");
  return res.send(owners);
});

// General Search Endpoint
app.get("/search", async (req, res) => {
  const searchTerm = req.body.search;
  const result = redisClient.ft.search("idx:shoe", searchTerm);
  return res.status(200).send(result);
});

// Define a port
const port = process.env.PORT || 3001;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
