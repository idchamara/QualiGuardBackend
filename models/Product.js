module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
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
    poRef: {
      type: DataTypes.STRING(100),
      field: 'po_ref'
    },
    name: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    sku: {
      type: DataTypes.STRING(100),
      field: 'sku'
    },
    description: {
      type: DataTypes.TEXT
    },
    shipmentDate: {
      type: DataTypes.DATEONLY,
      field: 'shipment_date'
    },
    orderedQuantity: {
      type: DataTypes.INTEGER,
      field: 'ordered_quantity'
    },
    orderedUnit: {
      type: DataTypes.STRING(20),
      field: 'ordered_unit',
      defaultValue: 'Pcs'
    },
    producedQuantity: {
      type: DataTypes.INTEGER,
      field: 'produced_quantity'
    },
    producedPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'produced_percentage'
    },
    packedQuantity: {
      type: DataTypes.INTEGER,
      field: 'packed_quantity'
    },
    packedPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'packed_percentage'
    },
    entityResponsible: {
      type: DataTypes.STRING(300),
      field: 'entity_responsible'
    },
    productionSite: {
      type: DataTypes.STRING(300),
      field: 'production_site'
    }
  }, {
    tableName: 'products',
    timestamps: true,
    underscored: true
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Inspection, { 
      foreignKey: 'inspectionId',
      as: 'inspection'
    });
  };

  return Product;
};

// 📦 Products being inspected