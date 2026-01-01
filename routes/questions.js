const express = require('express');
const router = express.Router();
const { Question, InspectionImage } = require('../models');

router.get('/inspection/:inspectionId', async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: { inspectionId: req.params.inspectionId },
      include: [{ model: InspectionImage, as: 'images' }],
      order: [['questionNumber', 'ASC']]
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// API endpoints for questions