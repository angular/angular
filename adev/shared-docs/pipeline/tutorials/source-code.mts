/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FileSystemTree} from '@webcontainer/api';
import {FileAndContentRecord, TutorialConfig} from '../../interfaces/index';
import {getFileSystemTree} from './webcontainers.mjs';

/** Generate the source-code.json content for a provided tutorial config. */
export async function generateSourceCode(
  config: TutorialConfig,
  files: FileAndContentRecord,
): Promise<FileSystemTree> {
  // TODO(josephperrott): figure out if filtering is needed for this.
  const allFiles = Object.keys(files);
  return getFileSystemTree(allFiles, files);
}
