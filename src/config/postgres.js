const { Client } = require("pg");
const config = require("./config");

let client;

(async function name() {
  client = new Client(config.sqlDB);
  try {
    await client.connect();
    console.log("Connect to postgress sucessfully");
    return client;
  } catch (error) {
    console.error("Connect to postgress error");
    process.exit(1);
  }
})();

module.exports = {
  postgres: client,
};
