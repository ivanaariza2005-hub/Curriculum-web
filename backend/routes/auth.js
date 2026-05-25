const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verificarToken } = require('../middleware/auth');

const USERS_INICIALES = [
  { username: 'daniela', password: 'daniela123', nombre: 'Daniela Paez', persona: 'Daniela' },
  { username: 'ivan',    password: 'ivan123',    nombre: 'Ivan Ariza',   persona: 'Ivan' },
  { username: 'keila',   password: 'keila123',   nombre: 'Keila Buelvas', persona: 'Keila' },
  { username: 'yeison',  password: 'yeison123',  nombre: 'Yeison Chacon', persona: 'Yeison' },
];

async function seedUsers() {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      console.log('👤 Usuarios ya existen, omitiendo seed.');
      return;
    }
    await User.insertMany(USERS_INICIALES);
    console.log('✅ Usuarios iniciales creados (daniela, ivan, keila, yeison)');
  } catch (error) {
    console.error('❌ Error al crear usuarios iniciales:', error.message);
  }
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ mensaje: 'Usuario y contraseña son requeridos' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }

    const esValida = await user.compararPassword(password);
    if (!esValida) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }

    const payload = {
      id: user._id,
      username: user.username,
      nombre: user.nombre,
      persona: user.persona,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || '7d',
    });

    res.json({ token, user: payload });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
});

router.get('/me', verificarToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json({
      id: user._id,
      username: user.username,
      nombre: user.nombre,
      persona: user.persona,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuario', error: error.message });
  }
});

module.exports = router;
module.exports.seedUsers = seedUsers;
