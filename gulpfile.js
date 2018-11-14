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

// The gulp tsconfig file maps specific imports to relative paths. In combination with ts-node
// this doesn't work because the JavaScript output will still refer to the imports instead of
// to the relative path. Tsconfig-paths can be used to support path mapping inside of Node.
require('tsconfig-paths').register({
  baseUrl: path.dirname(tsconfigPath),
  paths: tsconfig.compilerOptions.paths
});

require('./tools/gulp/gulpfile');
