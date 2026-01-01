const express = require('express');
const router = express.Router();
const { 
  Inspection, 
  Product, 
  TestChecklist, 
  Question, 
  InspectionImage, 
  Site 
} = require('../models');

// Get all inspections
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, fromDate, toDate } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.inspectionReference = { [Op.like]: `%${search}%` };
    }
    if (fromDate && toDate) {
      where.inspectionDate = { 
        [Op.between]: [fromDate, toDate] 
      };
    }

    const { count, rows } = await Inspection.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: Product, as: 'products' },
        { model: Site, as: 'site' },
        { model: TestChecklist, as: 'testChecklists' }
      ],
      order: [['inspectionDate', 'DESC']]
    });

    res.json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single inspection with all details
router.get('/:id', async (req, res) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'products' },
        { model: Site, as: 'site' },
        { model: TestChecklist, as: 'testChecklists' },
        { 
          model: Question, 
          as: 'questions',
          include: [{ model: InspectionImage, as: 'images' }]
        }
      ]
    });

    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    res.json(inspection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create inspection with all related data
router.post('/', async (req, res) => {
  const t = await Inspection.sequelize.transaction();
  
  try {
    const { 
      inspection, 
      products, 
      testChecklists, 
      questions, 
      images,
      site 
    } = req.body;

    // Create or find site
    let siteRecord = null;
    if (site) {
      [siteRecord] = await Site.findOrCreate({
        where: { name: site.name },
        defaults: site,
        transaction: t
      });
    }

    // Create inspection
    const newInspection = await Inspection.create({
      ...inspection,
      siteId: siteRecord ? siteRecord.id : null
    }, { transaction: t });

    // Create products
    if (products && products.length > 0) {
      await Product.bulkCreate(
        products.map(p => ({ ...p, inspectionId: newInspection.id })),
        { transaction: t }
      );
    }

    // Create test checklists
    if (testChecklists && testChecklists.length > 0) {
      await TestChecklist.bulkCreate(
        testChecklists.map(tc => ({ ...tc, inspectionId: newInspection.id })),
        { transaction: t }
      );
    }

    // Create questions
    if (questions && questions.length > 0) {
      const createdQuestions = await Question.bulkCreate(
        questions.map(q => ({ ...q, inspectionId: newInspection.id })),
        { transaction: t, returning: true }
      );

      // Create images if provided
      if (images && images.length > 0) {
        const imageRecords = images.map(img => ({
          ...img,
          inspectionId: newInspection.id,
          questionId: createdQuestions.find(q => 
            q.questionNumber === img.questionNumber
          )?.id
        }));
        
        await InspectionImage.bulkCreate(imageRecords, { transaction: t });
      }
    }

    await t.commit();

    // Fetch complete inspection
    const completeInspection = await Inspection.findByPk(newInspection.id, {
      include: [
        { model: Product, as: 'products' },
        { model: Site, as: 'site' },
        { model: TestChecklist, as: 'testChecklists' },
        { 
          model: Question, 
          as: 'questions',
          include: [{ model: InspectionImage, as: 'images' }]
        }
      ]
    });

    res.status(201).json(completeInspection);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
});

// Update inspection
router.put('/:id', async (req, res) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id);
    
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    await inspection.update(req.body);
    res.json(inspection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete inspection
router.delete('/:id', async (req, res) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id);
    
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    await inspection.destroy();
    res.json({ message: 'Inspection deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get inspection statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalInspections = await Inspection.count();
    const passedInspections = await Inspection.count({
      where: { overallResult: 'Pass' }
    });
    const failedInspections = await Inspection.count({
      where: { overallResult: 'Fail' }
    });

    res.json({
      total: totalInspections,
      passed: passedInspections,
      failed: failedInspections,
      passRate: totalInspections > 0 
        ? ((passedInspections / totalInspections) * 100).toFixed(2) 
        : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// API endpoints for inspections