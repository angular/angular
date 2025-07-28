#!/usr/bin/env node

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// tslint:disable:no-console
import shelljs from 'shelljs';
const {exec} = shelljs;

process.stdout.write('Gathering all partial golden update targets');
const queryCommand = `yarn -s bazel query --output label "kind(_write_source_file, //packages/compiler-cli/test/compliance/test_cases:*)"`;
const allUpdateTargets = exec(queryCommand, {silent: true})
  .trim()
  .split('\n')
  .map((target) => target.trim())
  .filter((target) => target.length > 0);

if (allUpdateTargets.length === 0) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  console.error(`Could not find any symbol test targets using: ${queryCommand}`);
  process.exit(1);
}

process.stdout.clearLine();
process.stdout.cursorTo(0);

for (const [index, target] of allUpdateTargets.entries()) {
  const progress = `${index + 1} / ${allUpdateTargets.length}`;
  process.stdout.write(`[${progress}] Running: ${target}`);
  const commandResult = exec(`yarn bazel run ${target}`, {silent: true});
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  if (commandResult.code) {
    console.error(`[${progress}] Failed run: ${target}`);
    console.group();
    console.error(commandResult.stdout || commandResult.stderr);
    console.groupEnd();
  } else {
    console.log(`[${progress}] Successful run: ${target}`);
  }
}
