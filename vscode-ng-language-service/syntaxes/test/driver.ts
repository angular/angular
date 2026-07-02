#!/usr/bin/env node
// Usage:
//   pnpm test:syntaxes [options]
//
// Options:
//   -u    update snapshot files (always passes)

import 'jasmine';

import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {cases} from './cases';

interface TestCase {
  name: string;
  scopeName: string;
  grammarFiles: string[];
  testFile: string;
}

const dummyGrammarDir = 'syntaxes/test/dummy';
const DUMMY_GRAMMARS = fs
  .readdirSync(dummyGrammarDir)
  .map((file: string) => path.join(dummyGrammarDir, file));

/** Wraps node's spawn in a Promise. */
function spawn(...args: Parameters<typeof cp.spawn>): Promise<number> {
  const child = cp.spawn(...args);

  return new Promise((resolve, reject) => {
    child.on('exit', (code: number) => {
      if (code === 0) resolve(0);
      else reject(code);
    });
  });
}

async function snapshotTest({scopeName, grammarFiles, testFile}: TestCase): Promise<number> {
  grammarFiles.push(...DUMMY_GRAMMARS);
  const grammarOptions = grammarFiles.reduce((acc, file) => [...acc, '-g', file], [] as string[]);

  const resolvedTestFile = process.env.BUILD_WORKSPACE_DIRECTORY
    ? path.join(process.env.BUILD_WORKSPACE_DIRECTORY, 'vscode-ng-language-service', testFile)
    : testFile;

  const options = [
    'node_modules/vscode-tmgrammar-test/dist/snapshot.js',
    '-s',
    scopeName,
    ...grammarOptions,
    resolvedTestFile,
  ];

  if (process.argv.includes('-u')) {
    options.push('-u');
  }

  return spawn('node', options, {stdio: 'inherit' /* use parent process IO */}).catch(
    (code) => code,
  );
}

describe('snapshot tests', () => {
  for (let tc of cases) {
    it(`should work for ${tc.name}`, async () => {
      const ec = await snapshotTest(tc);
      expect(ec).toBe(0);
    });
  }
});
