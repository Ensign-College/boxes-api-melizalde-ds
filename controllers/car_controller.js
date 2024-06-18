const Car = require("../models/car");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const { validationResult } = require("express-validator");

exports.createCar = async (req, res, next) => {
  try {
    // Error handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed");
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }

    if (!req.body) {
      return res.status(400).json({ message: "No car data provided" });
    }
    if (!req.body.make || !req.body.model || !req.body.year) {
      return res.status(400).json({ message: "Missing car data" });
    }

    const car = new Car({
      stockId: req.body.stockId,
      make: req.body.make,
      model: req.body.model,
      year: req.body.year,
      color: req.body.color,
      odometer: req.body.odometer,
      owner: req.body.owner,
      description: req.body.description,
    });
    await car.save();
    res.status(201).json({
      message: "Car created successfully",
      car: car,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    res.status(error.statusCode).json({ error: error.data });
  }
};

exports.getCars = async (req, res, next) => {
  try {
    const cars = await Car.find();
    if (!cars) {
      return res.status(404).json({ message: "No cars found" });
    }
    res.status(200).json({
      message: "User authenticated and logged in",
      cars: cars,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    res.status(error.statusCode).json({ error: error.data });
  }
};

exports.getCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "No car found" });
    }
    res.status(200).json({
      message: "User authenticated and logged in",
      car: car,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    res.status(error.statusCode).json({ error: error.data });
  }
};

// TODO: Implement the createCar, updateCar, and deleteCar controller functions
exports.updateCar = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed");
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }

    if (!req.body) {
      return res.status(400).json({ message: "No car data provided" });
    }
    if (!req.body.make || !req.body.model || !req.body.year) {
      return res.status(400).json({ message: "Missing car data" });
    }
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "No car found" });
    }
    car.stockId = req.body.stockId ? req.body.stockId : car.stockId;
    car.make = req.body.make ? req.body.make : car.make;
    car.model = req.body.model ? req.body.model : car.model;
    car.year = req.body.year ? req.body.year : car.year;
    car.color = req.body.color ? req.body.color : car.color;
    car.odometer = req.body.odometer ? req.body.odometer : car.odometer;
    car.owner = req.body.owner ? req.body.owner : car.owner;
    car.description = req.body.description
      ? req.body.description
      : car.description;
    await car.save();
    res.status(200).json({
      message: "Car updated successfully",
      car: car,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    res.status(error.statusCode).json({ error: error.data });
  }
};

exports.deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "No car found" });
    }
    await Car.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Car deleted successfully",
      car: car,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    res.status(error.statusCode).json({ error: error.data });
  }
};
