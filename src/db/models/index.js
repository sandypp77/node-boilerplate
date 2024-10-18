const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const config = require(`../../config/config`);

const basename = path.basename(module.filename);

const db = {};

const sequelize = new Sequelize(
  config.sqlDB.database,
  config.sqlDB.user,
  config.sqlDB.password,
  {
    host: config.sqlDB.host,
    dialect: config.sqlDB.dialect,
  }
);

fs.readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-9) === ".model.js"
  )
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

console.log("Models loaded: ", Object.keys(db));

module.exports = db;
