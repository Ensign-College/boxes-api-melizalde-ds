const Gestion = require("../models/gestion");
const { validationResult } = require("express-validator");

exports.createGestion = async (req, res, next) => {
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
      return res.status(400).json({ message: "No gestion data provided" });
    }
    if (
      !req.body.veliz ||
      !req.body.adeudo ||
      !req.body.estatus ||
      !req.body.codigo ||
      !req.body.descripcion ||
      !req.body.estado
    ) {
      return res.status(400).json({ message: "Missing gestion data" });
    }

    if (req.body.veliz.length === 0) {
      return res.status(400).json({ message: "Veliz cannot be empty" });
    }

    let gestion;
    if (req.body.fecha) {
      gestion = new Gestion({
        veliz: req.body.veliz,
        adeudo: req.body.adeudo,
        fecha: req.body.fecha,
        estatus: req.body.estatus,
        codigo: req.body.codigo,
        descripcion: req.body.descripcion,
        estado: req.body.estado,
      });
    } else {
      gestion = new Gestion({
        veliz: req.body.veliz,
        adeudo: req.body.adeudo,
        estatus: req.body.estatus,
        codigo: req.body.codigo,
        descripcion: req.body.descripcion,
        estado: req.body.estado,
      });
      await gestion.save();
      res.status(201).json({
        message: "Gestion created successfully",
        gestion: gestion,
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    res.status(error.statusCode).json({ error: error.data });
  }
};

exports.getGestions = async (req, res, next) => {
  try {
    const gestions = await Gestion.find();

    if (!gestions) {
      const error = new Error("No gestions found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ gestions: gestions });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    res.status(error.statusCode).json({ error: error.data });
  }
};

exports.getGestion = async (req, res, next) => {
  try {
    const gestion = await Gestion.findById(req.params.id);

    if (!gestion) {
      const error = new Error("Gestion not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ gestion: gestion });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    res.status(error.statusCode).json({ error: error.data });
  }
};

exports.updateGestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed");
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }

    const gestion = await Gestion.findById(req.params.id);

    if (!gestion) {
      const error = new Error("Gestion not found");
      error.statusCode = 404;
      throw error;
    }

    gestion.veliz = req.body.veliz;
    gestion.adeudo = req.body.adeudo;
    if (req.body.fecha) {
      gestion.fecha = req.body.fecha;
    }
    gestion.estatus = req.body.estatus;
    gestion.codigo = req.body.codigo;
    gestion.descripcion = req.body.descripcion;
    gestion.estado = req.body.estado;

    await gestion.save();

    res.status(200).json({ message: "Gestion updated", gestion: gestion });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    res.status(error.statusCode).json({ error: error.data });
  }
};

exports.deleteGestion = async (req, res, next) => {
  try {
    const gestion = await Gestion.findByIdAndDelete(req.params.id);

    if (!gestion) {
      const error = new Error("Gestion not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: "Gestion deleted" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    res.status(error.statusCode).json({ error: error.data });
  }
};
