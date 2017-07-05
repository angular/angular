'use strict';
/**
 * Load the TypeScript compiler, then load the TypeScript gulpfile which simply loads all
 * the tasks. The tasks are really inside tools/gulp/tasks.
 */

const path = require('path');

const tsconfigPath = path.join(__dirname, 'tools/gulp/tsconfig.json');

// Register TS compilation.
require('ts-node').register({
  project: tsconfigPath
});

require('./tools/gulp/gulpfile');
