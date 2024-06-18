const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const carController = require("../controllers/car_controller");

// Get cars route
router.get("/", carController.getCars);

// Get car route
router.get("/:id", carController.getCar);

// Create car route
router.post(
  "/",
  [
    body("stockId").trim().isLength({ min: 1 }),
    body("make").trim().isLength({ min: 1 }),
    body("model").trim().isLength({ min: 1 }),
    body("year").isInt(),
    body("color").trim().isLength({ min: 1 }),
    body("odometer").isInt(),
    body("owner").trim().isLength({ min: 1 }),
    body("description").trim().isLength({ min: 1 }),
  ],
  carController.createCar
);

// Patch car route
router.patch(
  "/:id",
  [
    body("stockId").trim().isLength({ min: 1 }),
    body("make").trim().isLength({ min: 1 }),
    body("model").trim().isLength({ min: 1 }),
    body("year").isInt(),
    body("color").trim().isLength({ min: 1 }),
    body("odometer").isInt(),
    body("owner").trim().isLength({ min: 1 }),
    body("description").trim().isLength({ min: 1 }),
  ],
  carController.updateCar
);

// Delete car route
router.delete("/:id", carController.deleteCar);

module.exports = router;
