/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview Executes the given migration phase in batch mode.
 *
 * I.e. The tsconfig of the project is updated to only consider a single
 * file. Then the migration is invoked.
 */

import * as childProcess from 'child_process';
import {globSync} from 'tinyglobby';
import path from 'path';
import fs from 'fs';
import os from 'os';

const maxParallel = os.cpus().length;

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

async function main() {
  const [mode, sourceDir] = process.argv.slice(2);
  const files = globSync('**/*', {cwd: sourceDir}).filter((f) => f.endsWith('.ts'));

  if (mode === 'analyze') {
    const tsconfig = path.join(sourceDir, 'tsconfig.json');
    const baseConfig = JSON.parse(fs.readFileSync(tsconfig, 'utf8')) as any;

    schedule(files, maxParallel, async (fileName) => {
      const tmpTsconfigName = path.join(sourceDir, `${fileName}.tsconfig.json`);
      const extractResultFile = path.join(sourceDir, `${fileName}.extract.json`);

      // update tsconfig.
      await fs.promises.writeFile(
        tmpTsconfigName,
        JSON.stringify({...baseConfig, include: [fileName]}),
      );

      // execute command.
      const extractResult = await promiseExec(
        `migration extract ${path.resolve(tmpTsconfigName)}`,
        {env: {...process.env, 'LIMIT_TO_ROOT_NAMES_ONLY': '1'}},
      );

      // write individual result.
      await fs.promises.writeFile(extractResultFile, extractResult);
    });
  } else if (mode === 'combine-all') {
    const metadataFiles = files.map((f) => path.resolve(path.join(sourceDir, `${f}.extract.json`)));
    const mergeResult = await promiseExec(`migration combine-all ${metadataFiles.join(' ')}`);

    // write merge result.
    await fs.promises.writeFile(path.join(sourceDir, 'combined.json'), mergeResult);
  } else if (mode === 'global-meta') {
    const combinedUnitFile = path.join(sourceDir, 'combined.json');
    const globalMeta = await promiseExec(`migration global-meta ${combinedUnitFile}`);

    // write global meta result.
    await fs.promises.writeFile(path.join(sourceDir, 'global_meta.json'), globalMeta);
  } else if (mode === 'migrate') {
    schedule(files, maxParallel, async (fileName) => {
      const filePath = path.join(sourceDir, fileName);
      // tsconfig should exist from analyze phase.
      const tmpTsconfigName = path.join(sourceDir, `${fileName}.tsconfig.json`);
      const mergeMetadataFile = path.join(sourceDir, 'global_meta.json');

      // migrate in parallel.
      await promiseExec(
        `migration migrate ${path.resolve(tmpTsconfigName)} ${mergeMetadataFile} ${path.resolve(
          filePath,
        )}`,
        {env: {...process.env, 'LIMIT_TO_ROOT_NAMES_ONLY': '1'}},
      );
    });
  }
}

function promiseExec(command: string, opts?: childProcess.ExecOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = childProcess.exec(command, opts);
    let stdout = '';
    proc.stdout?.on('data', (d) => (stdout += d.toString('utf8')));
    proc.stderr?.on('data', (d) => process.stderr.write(d.toString('utf8')));

    proc.on('close', (code, signal) => {
      if (code === 0 && signal === null) {
        resolve(stdout);
      } else {
        reject();
      }
    });
  });
}

async function schedule<T>(
  items: T[],
  maxParallel: number,
  doFn: (v: T) => Promise<void>,
): Promise<void> {
  let idx = 0;
  let tasks: Promise<void>[] = [];

  while (idx < items.length) {
    tasks = [];
    while (idx < items.length && tasks.length < maxParallel) {
      tasks.push(doFn(items[idx]));
      idx++;
    }

    await Promise.all(tasks);
  }
}
