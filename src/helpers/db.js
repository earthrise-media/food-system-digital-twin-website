const knex = require("knex");
const config = require("../../knexfile");

// Get db instance
const db = knex(config);

module.exports = db;
