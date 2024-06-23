const mongoose = require("mongoose");
const { Schema } = mongoose;

const gestionSchema = new Schema({
  veliz: {
    type: String,
    required: true,
  },
  adeudo: {
    type: String,
    required: true,
  },
  fecha: {
    type: Date,
  },
  estatus: {
    type: String,
    required: true,
  },
  codigo: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  estado: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("Gestion", gestionSchema);
