#!/usr/bin/env node

// Imports
const {extend, parse} = require('cjson');
const {readFileSync, writeFileSync} = require('fs');
const {join, resolve} = require('path');
const {exec, set} = require('shelljs');

set('-e');

// Constants
const ROOT_DIR = resolve(__dirname, '..');
const TS_CONFIG_PATH = join(ROOT_DIR, 'src/tsconfig.app.json');
const NG_COMPILER_OPTS = {
  angularCompilerOptions: {
    // Related Jira issue: FW-737
    allowEmptyCodegenFiles: true,
    enableIvy: true,
  },
};

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main() {
  // Enable Ivy in TS config.
  console.log(`\nModifying \`${TS_CONFIG_PATH}\`...`);
  const oldTsConfigStr = readFileSync(TS_CONFIG_PATH, 'utf8');
  const oldTsConfigObj = parse(oldTsConfigStr);
  const newTsConfigObj = extend(true, oldTsConfigObj, NG_COMPILER_OPTS);
  const newTsConfigStr = JSON.stringify(newTsConfigObj, null, 2);
  console.log(`\nNew config: ${newTsConfigStr}`);
  writeFileSync(TS_CONFIG_PATH, newTsConfigStr);

  // Run ngcc.
  const ngccArgs = '--loglevel debug --properties es2015 module';
  console.log(`\nRunning ngcc (with args: ${ngccArgs})...`);
  exec(`yarn ivy-ngcc ${ngccArgs}`);

  // Done.
  console.log('\nReady to build with Ivy!');
  console.log('(To switch back to ViewEngine (with packages from npm), undo the changes in ' +
              `\`${TS_CONFIG_PATH}\` and run \`yarn aio-use-npm && yarn example-use-npm\`.)`);
}
