/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {extract} from './extract';
import path from 'path';
import fs from 'fs';
import {mergeMetadataFilesViaPath} from './merge_metadata';
import {migrateTarget} from './migrate_target';
import {MetadataFile} from './metadata_file';

const [mode, ...args] = process.argv.slice(2);

if (mode === 'extract') {
  process.stdout.write(JSON.stringify(extract(path.resolve(args[0]))));
} else if (mode === 'merge') {
  mergeMetadataFilesViaPath(args.map((p) => path.resolve(p))).catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else if (mode === 'migrate') {
  migrateTarget(
    path.resolve(args[0]),
    JSON.parse(fs.readFileSync(path.resolve(args[1]), 'utf8')) as MetadataFile,
  ).apply();
}
