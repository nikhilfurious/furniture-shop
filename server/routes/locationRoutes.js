// routes/city.js
const express = require('express');
const router = express.Router();
const City = require('../models/City');

// GET all cities
router.get('/', async (req, res) => {
  try {
    const cities = await City.find().sort({ name: 1 });
    res.json(cities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new city
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await City.findOne({ name });
    if (existing) return res.status(400).json({ message: 'City already exists' });

    const city = new City({ name });
    await city.save();
    res.status(201).json(city);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a city
router.delete('/:id', async (req, res) => {
  try {
    await City.findByIdAndDelete(req.params.id);
    res.json({ message: 'City deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
