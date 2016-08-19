'use strict';
/**
 * Load the TypeScript compiler, then load the TypeScript gulpfile which simply loads all
 * the tasks. The tasks are really inside tools/gulp/tasks.
 */

const path = require('path');

// Register TS compilation.
require('ts-node').register({
  project: path.join(__dirname, 'tools/gulp')
});

require('./tools/gulp/gulpfile');
