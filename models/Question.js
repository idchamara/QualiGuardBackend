module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
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
    questionNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'question_number'
    },
    section: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    sectionType: {
      type: DataTypes.STRING(100),
      field: 'section_type'
    },
    maxScore: {
      type: DataTypes.INTEGER,
      field: 'max_score'
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'question_text'
    },
    answer: {
      type: DataTypes.STRING(50)
    },
    status: {
      type: DataTypes.STRING(100)
    },
    remarks: {
      type: DataTypes.TEXT
    },
    issues: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'questions',
    timestamps: true,
    underscored: true
  });

  Question.associate = (models) => {
    Question.belongsTo(models.Inspection, { 
      foreignKey: 'inspectionId',
      as: 'inspection'
    });
    Question.hasMany(models.InspectionImage, { 
      foreignKey: 'questionId',
      as: 'images'
    });
  };

  return Question;
};

// ❓ Audit questions (Q1-Q25)