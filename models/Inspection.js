module.exports = (sequelize, DataTypes) => {
  const Inspection = sequelize.define('Inspection', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    inspectionReference: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'inspection_reference'
    },
    inspectionType: {
      type: DataTypes.STRING(100),
      field: 'inspection_type'
    },
    inspectionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'inspection_date'
    },
    plannedDate: {
      type: DataTypes.DATEONLY,
      field: 'planned_date'
    },
    overallResult: {
      type: DataTypes.STRING(50),
      field: 'overall_result'
    },
    inspectorRemark: {
      type: DataTypes.TEXT,
      field: 'inspector_remark'
    },
    inspectorName: {
      type: DataTypes.STRING(200),
      field: 'inspector_name'
    },
    inspectorOrganization: {
      type: DataTypes.STRING(200),
      field: 'inspector_organization'
    },
    fcaTotalScore: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'fca_total_score'
    },
    fcaScoreExcluded: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'fca_score_excluded'
    },
    timeline: {
      type: DataTypes.STRING(200),
      field: 'timeline'
    },
    timeCost: {
      type: DataTypes.STRING(50),
      field: 'time_cost'
    },
    yesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'yes_count'
    },
    naCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'na_count'
    },
    isSafetyFailed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_safety_failed'
    },
    productSafetyFailCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'product_safety_fail_count'
    },
    isReaudit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_reaudit'
    },
    lastFcaRcloudNumber: {
      type: DataTypes.STRING(100),
      field: 'last_fca_rcloud_number'
    },
    lastFcaTotalScore: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'last_fca_total_score'
    },
    generatedBy: {
      type: DataTypes.STRING(100),
      field: 'generated_by'
    },
    generatedDate: {
      type: DataTypes.DATE,
      field: 'generated_date'
    }
  }, {
    tableName: 'inspections',
    timestamps: true,
    underscored: true
  });

  Inspection.associate = (models) => {
    Inspection.hasMany(models.Product, { 
      foreignKey: 'inspectionId',
      as: 'products'
    });
    Inspection.hasMany(models.TestChecklist, { 
      foreignKey: 'inspectionId',
      as: 'testChecklists'
    });
    Inspection.hasMany(models.Question, { 
      foreignKey: 'inspectionId',
      as: 'questions'
    });
    Inspection.belongsTo(models.Site, { 
      foreignKey: 'siteId',
      as: 'site'
    });
  };

  return Inspection;
};

// 📋 Main inspection/audit record