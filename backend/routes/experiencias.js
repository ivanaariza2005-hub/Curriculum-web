const express = require('express');
const router = express.Router();
const Experiencia = require('../models/Experiencia');
const { verificarToken } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Experiencia:
 *       type: object
 *       required:
 *         - persona
 *         - empresa
 *         - cargo
 *         - fechaInicio
 *         - descripcion
 *       properties:
 *         _id:
 *           type: string
 *           description: ID generado automáticamente por MongoDB
 *         persona:
 *           type: string
 *           enum: [Daniela, Ivan, Keila, Yeison]
 *           description: Nombre del integrante del grupo
 *         empresa:
 *           type: string
 *           description: Nombre de la empresa
 *         cargo:
 *           type: string
 *           description: Cargo desempeñado
 *         fechaInicio:
 *           type: string
 *           format: date
 *           description: Fecha de inicio (YYYY-MM-DD)
 *         fechaFin:
 *           type: string
 *           format: date
 *           description: Fecha de fin (null si trabaja actualmente)
 *         trabajoActual:
 *           type: boolean
 *           description: true si es el trabajo actual
 *         descripcion:
 *           type: string
 *           description: Descripción de las funciones
 *         ciudad:
 *           type: string
 *           description: Ciudad donde trabajó
 *       example:
 *         persona: Daniela
 *         empresa: SENA
 *         cargo: Aprendiz de Software
 *         fechaInicio: "2023-01-15"
 *         fechaFin: "2023-06-15"
 *         trabajoActual: false
 *         descripcion: Desarrollo de aplicaciones web con HTML, CSS y JavaScript
 *         ciudad: Barranquilla
 */

/**
 * @swagger
 * tags:
 *   name: Experiencias
 *   description: CRUD de experiencias profesionales
 */

// ─────────────────────────────────────────────
// GET /api/experiencias — Obtener todas
// ─────────────────────────────────────────────
/**
 * @swagger
 * /api/experiencias:
 *   get:
 *     summary: Obtiene todas las experiencias profesionales
 *     tags: [Experiencias]
 *     parameters:
 *       - in: query
 *         name: persona
 *         schema:
 *           type: string
 *           enum: [Daniela, Ivan, Keila, Yeison]
 *         description: Filtrar por nombre de la persona
 *     responses:
 *       200:
 *         description: Lista de experiencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Experiencia'
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
  try {
    const filtro = {};
    if (req.query.persona) filtro.persona = req.query.persona;

    const experiencias = await Experiencia.find(filtro).sort({ fechaInicio: -1 });
    res.json({
      total: experiencias.length,
      experiencias,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener experiencias', error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/experiencias/:id — Obtener una por ID
// ─────────────────────────────────────────────
/**
 * @swagger
 * /api/experiencias/{id}:
 *   get:
 *     summary: Obtiene una experiencia por su ID
 *     tags: [Experiencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la experiencia
 *     responses:
 *       200:
 *         description: Experiencia encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Experiencia'
 *       404:
 *         description: Experiencia no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', async (req, res) => {
  try {
    const experiencia = await Experiencia.findById(req.params.id);
    if (!experiencia) {
      return res.status(404).json({ mensaje: 'Experiencia no encontrada' });
    }
    res.json(experiencia);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la experiencia', error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/experiencias — Crear nueva
// ─────────────────────────────────────────────
/**
 * @swagger
 * /api/experiencias:
 *   post:
 *     summary: Crea una nueva experiencia profesional
 *     tags: [Experiencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Experiencia'
 *     responses:
 *       201:
 *         description: Experiencia creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', verificarToken, async (req, res) => {
  try {
    req.body.persona = req.user.persona;
    const nuevaExperiencia = new Experiencia(req.body);
    const guardada = await nuevaExperiencia.save();
    res.status(201).json({
      mensaje: '✅ Experiencia creada exitosamente',
      experiencia: guardada,
    });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear la experiencia', error: error.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/experiencias/:id — Actualizar
// ─────────────────────────────────────────────
/**
 * @swagger
 * /api/experiencias/{id}:
 *   put:
 *     summary: Actualiza una experiencia existente
 *     tags: [Experiencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la experiencia a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Experiencia'
 *     responses:
 *       200:
 *         description: Experiencia actualizada
 *       404:
 *         description: Experiencia no encontrada
 *       400:
 *         description: Datos inválidos
 */
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const existente = await Experiencia.findById(req.params.id);
    if (!existente) {
      return res.status(404).json({ mensaje: 'Experiencia no encontrada' });
    }
    if (existente.persona !== req.user.persona) {
      return res.status(403).json({ mensaje: 'No tienes permiso para editar esta experiencia' });
    }
    req.body.persona = req.user.persona;
    const actualizada = await Experiencia.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({
      mensaje: '✅ Experiencia actualizada exitosamente',
      experiencia: actualizada,
    });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar', error: error.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/experiencias/:id — Eliminar
// ─────────────────────────────────────────────
/**
 * @swagger
 * /api/experiencias/{id}:
 *   delete:
 *     summary: Elimina una experiencia profesional
 *     tags: [Experiencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la experiencia a eliminar
 *     responses:
 *       200:
 *         description: Experiencia eliminada
 *       404:
 *         description: Experiencia no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const existente = await Experiencia.findById(req.params.id);
    if (!existente) {
      return res.status(404).json({ mensaje: 'Experiencia no encontrada' });
    }
    if (existente.persona !== req.user.persona) {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar esta experiencia' });
    }
    const eliminada = await Experiencia.findByIdAndDelete(req.params.id);
    res.json({ mensaje: '✅ Experiencia eliminada exitosamente', experiencia: eliminada });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar', error: error.message });
  }
});

module.exports = router;
