/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
//tslint:disable:no-console
import {execSync} from 'node:child_process';
import {join} from 'node:path';
import {updateAssets} from './update-assets.mjs';

async function main() {
  await updateAssets({
    repo: 'angular/aria-builds',
    assetsPath: '_adev_assets',
    destPath: join(import.meta.dirname, '../../src/content/aria'),
  });

  await updateAssets({
    repo: 'angular/cdk-builds',
    assetsPath: '_adev_assets',
    destPath: join(import.meta.dirname, '../../src/content/cdk'),
  });

  await updateAssets({
    repo: 'angular/cli-builds',
    assetsPath: 'help',
    destPath: join(import.meta.dirname, '../../src/content/cli'),
  });

  console.log('\n-----------------------------------------------');
  console.log('Change list');
  console.log('-----------------------------------------------\n');
  execSync(`git status --porcelain`, {stdio: 'inherit'});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
