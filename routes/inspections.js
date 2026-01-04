const express = require('express');
const router = express.Router();
const { 
  Inspection, 
  Product, 
  TestChecklist, 
  Question, 
  InspectionImage, 
  Site,
  Sequelize 
} = require('../models');

const { Op } = Sequelize;

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
    console.error('Error fetching inspections:', error);
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
    console.error('Error fetching inspection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create inspection with all related data - FIXED
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

    console.log('Received inspection data:', JSON.stringify(inspection, null, 2));

    // Create or find site
    let siteRecord = null;
    if (site && site.name) {
      [siteRecord] = await Site.findOrCreate({
        where: { name: site.name },
        defaults: {
          name: site.name,
          address: site.address || null,
          city: site.city || null,
          country: site.country || null,
          siteRepresentative: site.siteRepresentative || null
        },
        transaction: t
      });
    }

    // Clean inspection data - remove undefined and empty strings
    const cleanInspection = {
      inspectionReference: inspection.inspectionReference,
      inspectionType: inspection.inspectionType || 'PSI',
      inspectionDate: inspection.inspectionDate,
      plannedDate: inspection.plannedDate || null,
      overallResult: inspection.overallResult || 'N/A',
      inspectorRemark: inspection.inspectorRemark || null,
      inspectorName: inspection.inspectorName || null,
      inspectorOrganization: inspection.inspectorOrganization || null,
      fcaTotalScore: inspection.fcaTotalScore ? parseFloat(inspection.fcaTotalScore) : null,
      fcaScoreExcluded: inspection.fcaScoreExcluded ? parseFloat(inspection.fcaScoreExcluded) : null,
      timeline: inspection.timeline || null,
      timeCost: inspection.timeCost || null,
      yesCount: inspection.yesCount ? parseInt(inspection.yesCount) : 0,
      naCount: inspection.naCount ? parseInt(inspection.naCount) : 0,
      isSafetyFailed: inspection.isSafetyFailed || false,
      productSafetyFailCount: inspection.productSafetyFailCount || 0,
      isReaudit: inspection.isReaudit || false,
      lastFcaRcloudNumber: inspection.lastFcaRcloudNumber || null,
      lastFcaTotalScore: inspection.lastFcaTotalScore ? parseFloat(inspection.lastFcaTotalScore) : null,
      generatedBy: inspection.generatedBy || 'QualiGuard',
      generatedDate: inspection.generatedDate || new Date(),
      siteId: siteRecord ? siteRecord.id : null
    };

    console.log('Clean inspection data:', JSON.stringify(cleanInspection, null, 2));

    // Create inspection
    const newInspection = await Inspection.create(cleanInspection, { transaction: t });

    console.log('Inspection created with ID:', newInspection.id);

    // Create products
    if (products && products.length > 0) {
      const cleanProducts = products.map(p => ({
        inspectionId: newInspection.id,
        poRef: p.poRef || null,
        name: p.name,
        sku: p.sku || null,
        description: p.description || null,
        shipmentDate: p.shipmentDate || null,
        orderedQuantity: p.orderedQuantity || 0,
        orderedUnit: p.orderedUnit || 'Pcs',
        producedQuantity: p.producedQuantity || 0,
        producedPercentage: p.producedPercentage || null,
        packedQuantity: p.packedQuantity || 0,
        packedPercentage: p.packedPercentage || null,
        entityResponsible: p.entityResponsible || null,
        productionSite: p.productionSite || null
      }));

      await Product.bulkCreate(cleanProducts, { transaction: t });
      console.log('Products created:', cleanProducts.length);
    }

    // Create test checklists
    if (testChecklists && testChecklists.length > 0) {
      const cleanChecklists = testChecklists.map(tc => ({
        inspectionId: newInspection.id,
        checklistName: tc.checklistName,
        result: tc.result || null,
        fcaForm: tc.fcaForm || null,
        form25Result: tc.form25Result || null,
        form25Conductor: tc.form25Conductor || null,
        mcoIssuedDate: tc.mcoIssuedDate || null,
        form25CompletedDate: tc.form25CompletedDate || null,
        hasClosedMeeting: tc.hasClosedMeeting || false,
        findingsShared: tc.findingsShared || false
      }));

      await TestChecklist.bulkCreate(cleanChecklists, { transaction: t });
      console.log('Test checklists created:', cleanChecklists.length);
    }

    // Create questions
    if (questions && questions.length > 0) {
      const cleanQuestions = questions.map(q => ({
        inspectionId: newInspection.id,
        questionNumber: q.questionNumber,
        section: q.section,
        sectionType: q.sectionType || null,
        maxScore: q.maxScore || 0,
        questionText: q.questionText,
        answer: q.answer || null,
        status: q.status || null,
        remarks: q.remarks || null,
        issues: q.issues || null
      }));

      const createdQuestions = await Question.bulkCreate(cleanQuestions, { 
        transaction: t, 
        returning: true 
      });
      console.log('Questions created:', createdQuestions.length);

      // Create images if provided
      if (images && images.length > 0) {
        const imageRecords = [];
        
        for (const img of images) {
          const question = createdQuestions.find(q => 
            q.questionNumber === img.questionNumber
          );
          
          if (question) {
            imageRecords.push({
              inspectionId: newInspection.id,
              questionId: question.id,
              imagePath: img.imagePath || null,
              imageUrl: img.imageUrl || null,
              caption: img.caption || null,
              imageType: img.imageType || 'evidence'
            });
          }
        }
        
        if (imageRecords.length > 0) {
          await InspectionImage.bulkCreate(imageRecords, { transaction: t });
          console.log('Images created:', imageRecords.length);
        }
      }
    }

    await t.commit();
    console.log('Transaction committed successfully');

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
    console.error('Error creating inspection:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: error.errors ? error.errors.map(e => e.message) : []
    });
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
    console.error('Error updating inspection:', error);
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
    console.error('Error deleting inspection:', error);
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
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;