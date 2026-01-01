module.exports = (sequelize, DataTypes) => {
  const TestChecklist = sequelize.define('TestChecklist', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    inspectionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'inspection_id',
      references: {
        model: 'inspections',
        key: 'id'
      }
    },
    checklistName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'checklist_name'
    },
    result: {
      type: DataTypes.STRING(50)
    },
    fcaForm: {
      type: DataTypes.STRING(100),
      field: 'fca_form'
    },
    form25Result: {
      type: DataTypes.STRING(50),
      field: 'form25_result'
    },
    form25Conductor: {
      type: DataTypes.STRING(100),
      field: 'form25_conductor'
    },
    mcoIssuedDate: {
      type: DataTypes.DATEONLY,
      field: 'mco_issued_date'
    },
    form25CompletedDate: {
      type: DataTypes.DATEONLY,
      field: 'form25_completed_date'
    },
    hasClosedMeeting: {
      type: DataTypes.BOOLEAN,
      field: 'has_closed_meeting'
    },
    findingsShared: {
      type: DataTypes.BOOLEAN,
      field: 'findings_shared'
    }
  }, {
    tableName: 'test_checklists',
    timestamps: true,
    underscored: true
  });

  TestChecklist.associate = (models) => {
    TestChecklist.belongsTo(models.Inspection, { 
      foreignKey: 'inspectionId',
      as: 'inspection'
    });
  };

  return TestChecklist;
};

// ✅ GAP-FCA test checklists