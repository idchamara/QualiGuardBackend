const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    pool: dbConfig.pool,
    logging: env === 'development' ? console.log : false
  }
);

const db = {
  sequelize,
  Sequelize,
  Inspection: require('./Inspection')(sequelize, Sequelize.DataTypes),
  Product: require('./Product')(sequelize, Sequelize.DataTypes),
  TestChecklist: require('./TestChecklist')(sequelize, Sequelize.DataTypes),
  Question: require('./Question')(sequelize, Sequelize.DataTypes),
  InspectionImage: require('./InspectionImage')(sequelize, Sequelize.DataTypes),
  Site: require('./Site')(sequelize, Sequelize.DataTypes),
};

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;

// 🔗 Sequelize setup & model associations