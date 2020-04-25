/**
 * Path to the schematic collection for non-migration schematics. Needs to use
 * the workspace path as otherwise the resolution won't work on Windows.
 */
export const COLLECTION_PATH = require
    .resolve('angular_material/src/cdk/schematics/collection.json');

/**
 * Path to the schematic collection that includes the migrations. Needs to use
 * the workspace path as otherwise the resolution won't work on Windows.
 */
export const MIGRATION_PATH = require
  .resolve('angular_material/src/cdk/schematics/migration.json');
