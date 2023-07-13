/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("routes", (table) => {
    table.string("origin_id");
    table.string("destination_id");
    table.text("polyline");
    table.primary(["origin_id", "destination_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("routes");
};
