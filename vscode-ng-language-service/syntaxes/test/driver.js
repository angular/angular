#!/usr/bin/env node
'use strict';
// Usage:
//   pnpm test:syntaxes [options]
//
// Options:
//   -u    update snapshot files (always passes)
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', {enumerable: true, value: v});
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', {value: true});
require('jasmine');
const cp = __importStar(require('child_process'));
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
const cases_1 = require('./cases');
const dummyGrammarDir = 'syntaxes/test/dummy';
const DUMMY_GRAMMARS = fs
  .readdirSync(dummyGrammarDir)
  .map((file) => path.join(dummyGrammarDir, file));
/** Wraps node's spawn in a Promise. */
function spawn(...args) {
  const child = cp.spawn(...args);
  return new Promise((resolve, reject) => {
    child.on('exit', (code) => {
      if (code === 0) resolve(0);
      else reject(code);
    });
  });
}
async function snapshotTest({scopeName, grammarFiles, testFile}) {
  grammarFiles.push(...DUMMY_GRAMMARS);
  const grammarOptions = grammarFiles.reduce((acc, file) => [...acc, '-g', file], []);
  const options = [
    'node_modules/vscode-tmgrammar-test/dist/snapshot.js',
    '-s',
    scopeName,
    ...grammarOptions,
    testFile,
  ];
  return spawn('node', options, {stdio: 'inherit' /* use parent process IO */}).catch(
    (code) => code,
  );
}
describe('snapshot tests', () => {
  for (let tc of cases_1.cases) {
    it(`should work for ${tc.name}`, async () => {
      const ec = await snapshotTest(tc);
      expect(ec).toBe(0);
    });
  }
});
//# sourceMappingURL=driver.js.map
