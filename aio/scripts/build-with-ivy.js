#!/usr/bin/env node

// Imports
const {extend, parse} = require('cjson');
const {readFileSync, writeFileSync} = require('fs');
const {join, resolve} = require('path');
const {exec, set} = require('shelljs');

set('-e');

// Constants
const ROOT_DIR = resolve(__dirname, '..');
const TS_CONFIG_PATH = join(ROOT_DIR, 'tsconfig.json');
const NG_COMPILER_OPTS = {
  angularCompilerOptions: {
    // Related Jira issue: FW-737
    allowEmptyCodegenFiles: true,
    enableIvy: 'ngtsc',
  },
};

// Run
_main(process.argv.slice(2));

// Functions - Definitions
function _main(buildArgs) {
  console.log('\nModifying `tsconfig.json`...');
  const oldTsConfigStr = readFileSync(TS_CONFIG_PATH, 'utf8');
  const oldTsConfigObj = parse(oldTsConfigStr);
  const newTsConfigObj = extend(true, oldTsConfigObj, NG_COMPILER_OPTS);
  const newTsConfigStr = JSON.stringify(newTsConfigObj, null, 2);
  writeFileSync(TS_CONFIG_PATH, newTsConfigStr);
  console.log(newTsConfigStr);

  try {
    const buildArgsStr = buildArgs.join(' ');

    console.log(`\nBuilding${buildArgsStr && ` with args \`${buildArgsStr}\``}...`);
    exec(`yarn ~~build ${buildArgsStr}`, {cwd: ROOT_DIR});
  } finally {
    console.log('\nRestoring `tsconfig.json`...');
    writeFileSync(TS_CONFIG_PATH, oldTsConfigStr);
  }

  console.log('\nDone!');
}
