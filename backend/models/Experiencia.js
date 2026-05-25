const mongoose = require('mongoose');

const experienciaSchema = new mongoose.Schema(
  {
    persona: {
      type: String,
      required: [true, 'El nombre de la persona es obligatorio'],
      enum: ['Daniela', 'Ivan', 'Keila', 'Yeison'],
    },
    empresa: {
      type: String,
      required: [true, 'El nombre de la empresa es obligatorio'],
      trim: true,
    },
    cargo: {
      type: String,
      required: [true, 'El cargo es obligatorio'],
      trim: true,
    },
    fechaInicio: {
      type: Date,
      required: [true, 'La fecha de inicio es obligatoria'],
    },
    fechaFin: {
      type: Date,
      default: null, // null = trabajo actual
    },
    trabajoActual: {
      type: Boolean,
      default: false,
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
    },
    ciudad: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // crea createdAt y updatedAt automáticamente
  }
);

module.exports = mongoose.model('Experiencia', experienciaSchema);
