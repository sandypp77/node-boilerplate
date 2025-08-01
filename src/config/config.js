module.exports = {
  mongoDb: {
    uri: process.env.MONGODB_URI,
  },
  sqlDB: {
    user: process.env.SQL_USERNAME,
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE_NAME,
    password: process.env.SQL_PASSWORD,
    dialect: process.env.SQL_DIALECT,
  },
};
