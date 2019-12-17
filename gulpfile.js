'use strict';
/**
 * Load the TypeScript compiler, then load the TypeScript gulpfile which simply loads all
 * the tasks. The tasks are really inside tools/gulp/tasks.
 */

const path = require('path');

const projectDir = __dirname;
const tsconfigPath = path.join(projectDir, 'tools/gulp/tsconfig.json');
const tsconfig = require(tsconfigPath);

if (projectDir.includes(' ')) {
  console.error('Error: Cannot run the Angular Material build tasks if the project is ' +
    'located in a directory with spaces in between. Please rename your project directory.');
  process.exit(1);
}

// Register TS compilation.
require('ts-node').register({
  project: tsconfigPath
});

require('./tools/gulp/gulpfile');
