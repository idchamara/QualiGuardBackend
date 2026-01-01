module.exports = (sequelize, DataTypes) => {
  const Site = sequelize.define('Site', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(300),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT
    },
    city: {
      type: DataTypes.STRING(100)
    },
    country: {
      type: DataTypes.STRING(100)
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7)
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7)
    },
    siteRepresentative: {
      type: DataTypes.STRING(200),
      field: 'site_representative'
    }
  }, {
    tableName: 'sites',
    timestamps: true,
    underscored: true
  });

  Site.associate = (models) => {
    Site.hasMany(models.Inspection, { 
      foreignKey: 'siteId',
      as: 'inspections'
    });
  };

  return Site;
};


// 🏭 Manufacturing sites