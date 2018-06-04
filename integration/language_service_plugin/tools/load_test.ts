const ts = require('typescript');
const Module = require('module');

const existingRequire = Module.prototype.require;

const recordedRequires: string[] = [];

function recordingRequire(path: string) {
  recordedRequires.push(path);
  return existingRequire.call(this, path);
}

Module.prototype.require = recordingRequire;

try {
  const lsf = require('@angular/language-service');
  const ls = lsf({typescript: ts});

  // Assert that the only module that should have been required are '@angular/language-service', 'fs', and 'path'

  const allowedLoads = new Set(["@angular/language-service", "fs", "path"]);

  const invalidModules = recordedRequires.filter(m => !allowedLoads.has(m));

  if (invalidModules.length > 0) {
    console.error(`FAILED: Loading the language service required: ${invalidModules.join(', ')}`);
    process.exit(1);
  }
} catch (e) {
  console.error(`FAILED: Loading the language service caused the following exception: ${e.stack || e}`);
  process.exit(1);
}

console.log('SUCCESS: Loading passed')
process.exit(0);