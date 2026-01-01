module.exports = (sequelize, DataTypes) => {
  const InspectionImage = sequelize.define('InspectionImage', {
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
    questionId: {
      type: DataTypes.INTEGER,
      field: 'question_id',
      references: {
        model: 'questions',
        key: 'id'
      }
    },
    imagePath: {
      type: DataTypes.STRING(500),
      field: 'image_path'
    },
    imageUrl: {
      type: DataTypes.STRING(1000),
      field: 'image_url'
    },
    caption: {
      type: DataTypes.TEXT
    },
    imageType: {
      type: DataTypes.STRING(50),
      field: 'image_type',
      comment: 'e.g., evidence, defect, compliance'
    }
  }, {
    tableName: 'inspection_images',
    timestamps: true,
    underscored: true
  });

  InspectionImage.associate = (models) => {
    InspectionImage.belongsTo(models.Inspection, { 
      foreignKey: 'inspectionId',
      as: 'inspection'
    });
    InspectionImage.belongsTo(models.Question, { 
      foreignKey: 'questionId',
      as: 'question'
    });
  };

  return InspectionImage;
};


// 📸 Photos/evidence