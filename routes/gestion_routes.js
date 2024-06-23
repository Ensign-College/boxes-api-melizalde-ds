const express = require("express");
const Gestion = require("../models/gestion");
const { body } = require("express-validator");

const router = express.Router();
const gestionController = require("../controllers/gestion_controller");

// Create gestion route
router.post(
  "/create",
  [
    body("veliz").notEmpty().withMessage("Veliz cannot be empty"),
    body("adeudo").notEmpty().withMessage("Adeudo cannot be empty"),
    body("estatus").notEmpty().withMessage("Estatus cannot be empty"),
    body("codigo").notEmpty().withMessage("Codigo cannot be empty"),
    body("descripcion").notEmpty().withMessage("Descripcion cannot be empty"),
    body("estado").notEmpty().withMessage("Estado cannot be empty"),
  ],
  gestionController.createGestion
);

// Get all gestions route
router.get("/getall", gestionController.getAllGestions);

// Get one gestion route
router.get("/getone/:gestionId", gestionController.getOneGestion);

// Update gestion route
router.put(
  "/update/:gestionId",
  [
    body("veliz").notEmpty().withMessage("Veliz cannot be empty"),
    body("adeudo").notEmpty().withMessage("Adeudo cannot be empty"),
    body("estatus").notEmpty().withMessage("Estatus cannot be empty"),
    body("codigo").notEmpty().withMessage("Codigo cannot be empty"),
    body("descripcion").notEmpty().withMessage("Descripcion cannot be empty"),
    body("estado").notEmpty().withMessage("Estado cannot be empty"),
  ],
  gestionController.updateGestion
);

// Delete gestion route
router.delete("/delete/:gestionId", gestionController.deleteGestion);
