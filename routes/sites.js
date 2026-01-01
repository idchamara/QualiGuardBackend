const express = require('express');
const router = express.Router();
const { Site, Inspection } = require('../models');

router.get('/', async (req, res) => {
  try {
    const sites = await Site.findAll({
      include: [{ 
        model: Inspection, 
        as: 'inspections',
        attributes: ['id', 'inspectionReference', 'inspectionDate']
      }]
    });
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const site = await Site.findByPk(req.params.id, {
      include: [{ model: Inspection, as: 'inspections' }]
    });
    
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }
    
    res.json(site);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const site = await Site.create(req.body);
    res.status(201).json(site);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// API endpoints for sites