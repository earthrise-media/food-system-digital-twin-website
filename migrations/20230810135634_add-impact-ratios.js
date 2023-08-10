/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // alter table kcal_flows add column impact_ratios jsonb;
  return knex.schema.alterTable("kcal_flows", function (t) {
    t.jsonb("impact_ratios");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("kcal_flows", function (t) {
    t.dropColumn("impact_ratios");
  });
};
