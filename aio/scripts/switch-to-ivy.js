#!/usr/bin/env node

// Imports
const {extend, parse} = require('cjson');
const {readFileSync, writeFileSync} = require('fs');
const {join, resolve} = require('path');
const {exec, set} = require('shelljs');

set('-e');

// Constants
const ROOT_DIR = resolve(__dirname, '..');
const NG_JSON = join(ROOT_DIR, 'angular.json');
const NG_COMPILER_OPTS = {
  angularCompilerOptions: {
    enableIvy: true,
  },
};

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main() {
  // Detect path to `tsconfig.app.json`.
  const ngConfig = parse(readFileSync(NG_JSON, 'utf8'));
  const tsConfigPath = join(ROOT_DIR, ngConfig.projects.site.architect.build.options.tsConfig);

  // Enable Ivy in TS config.
  console.log(`\nModifying \`${tsConfigPath}\`...`);
  const oldTsConfigStr = readFileSync(tsConfigPath, 'utf8');
  const oldTsConfigObj = parse(oldTsConfigStr);
  const newTsConfigObj = extend(true, oldTsConfigObj, NG_COMPILER_OPTS);
  const newTsConfigStr = `${JSON.stringify(newTsConfigObj, null, 2)}\n`;
  console.log(`\nNew config: ${newTsConfigStr}`);
  writeFileSync(tsConfigPath, newTsConfigStr);

  // Run ngcc.
  const ngccArgs = '--loglevel debug --properties es2015 module';
  console.log(`\nRunning ngcc (with args: ${ngccArgs})...`);
  exec(`yarn ivy-ngcc ${ngccArgs}`);

  // Done.
  console.log('\nReady to build with Ivy!');
  console.log('(To switch back to ViewEngine (with packages from npm), undo the changes in ' +
              `\`${tsConfigPath}\` and run \`yarn aio-use-npm && yarn example-use-npm\`.)`);
}
