/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// tslint:disable:no-console
import {writeFile} from 'node:fs/promises';
import {exec as nodeExec} from 'node:child_process';
import {promisify} from 'node:util';
import {join} from 'node:path';

const exec = promisify(nodeExec);
const rootPath = join(import.meta.dirname, '../');

async function main(outPath) {
  // `vsce ls` needs to run with a CWD of what will be packaged.
  // There is no way to provide this via args.
  const {stdout, stderr} = await exec(
    `node ${join(rootPath, `node_modules/@vscode/vsce/vsce`)} ls`,
    {
      cwd: join(rootPath, 'vsix_sandbox'),
    },
  );

  if (stderr) {
    console.error(stderr);
    throw new Error('Failed with error. See above.');
  }

  const paths = stdout.trim().split('\n').filter(Boolean);
  const resultSet = new Set();

  for (const filePath of paths) {
    if (filePath.startsWith('node_modules/') && !filePath.includes('@angular')) {
      // Regex to capture 'node_modules/' followed by either:
      // - A scoped package (e.g., @vscode/vsce)
      // - A standard package (e.g., typescript)
      // It stops matching before the next slash after the package name.
      const match = filePath.match(/^(node_modules\/(?:@[^\/]+\/[^\/]+|[^\/]+))/);
      if (match) {
        resultSet.add(match[1]);
      }
    } else {
      // Add non-node_modules or @angular/ paths directly
      resultSet.add(filePath);
    }
  }

  await writeFile(outPath, Array.from(resultSet).sort().join('\n'));
}

const argv = process.argv.slice(2);
if (argv.length !== 1) {
  console.error('Must include 1 argument that specifies the output path.');
  process.exit(1);
}

const [outPath] = argv;

main(outPath).catch((err) => {
  console.error(err);
  process.exit(1);
});
