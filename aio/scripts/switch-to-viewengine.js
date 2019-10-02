#!/usr/bin/env node

// Imports
const {extend, parse} = require('cjson');
const {readFileSync, writeFileSync} = require('fs');
const {join, resolve} = require('path');

// Constants
const ROOT_DIR = resolve(__dirname, '..');
const TS_CONFIG_PATH = join(ROOT_DIR, 'tsconfig.json');
const NG_COMPILER_OPTS = {
  angularCompilerOptions: {
    enableIvy: false,
  },
};

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main() {
  // Enable ViewIngine/Disable Ivy in TS config.
  console.log(`\nModifying \`${TS_CONFIG_PATH}\`...`);
  const oldTsConfigStr = readFileSync(TS_CONFIG_PATH, 'utf8');
  const oldTsConfigObj = parse(oldTsConfigStr);
  const newTsConfigObj = extend(true, oldTsConfigObj, NG_COMPILER_OPTS);
  const newTsConfigStr = `${JSON.stringify(newTsConfigObj, null, 2)}\n`;
  console.log(`\nNew config: ${newTsConfigStr}`);
  writeFileSync(TS_CONFIG_PATH, newTsConfigStr);

  // Done.
  console.log('\nReady to build with ViewEngine!');
  console.log('(To switch back to Ivy (with packages from npm), undo the changes in ' +
              `\`${TS_CONFIG_PATH}\` and run \`yarn aio-use-npm && yarn example-use-npm\`.)`);
}
