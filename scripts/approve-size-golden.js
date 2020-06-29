#!/usr/bin/env node

const shelljs = require('shelljs');
const path = require('path');
const yaml = require('yaml');
const fs = require('fs');

const projectDir = path.join(__dirname, '../');
const goldenPath = path.join(projectDir, './goldens/size-test.yaml');
const golden = yaml.parse(fs.readFileSync(goldenPath, 'utf8'));
const tests = Object.keys(golden);

if (tests.length === 0) {
  console.error('No tests captured in size test golden.');
  process.exit(1);
}

shelljs.set('-e');
shelljs.cd(projectDir);

for (const testId of tests) {
  const testIdParts = testId.split('/');
  const targetLabel = testIdParts.slice(0, -1).join('/');
  const targetName = testIdParts[testIdParts.length - 1];
  shelljs.exec(`bazel run //integration/size-test/${targetLabel}:${targetName}.approve`);
}
