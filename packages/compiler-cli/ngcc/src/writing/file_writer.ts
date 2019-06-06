
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {EntryPoint} from '../packages/entry_point';
import {EntryPointBundle} from '../packages/entry_point_bundle';
import {FileToWrite} from '../rendering/utils';

/**
 * Responsible for writing out the transformed files to disk.
 */
export interface FileWriter {
  writeBundle(entryPoint: EntryPoint, bundle: EntryPointBundle, transformedFiles: FileToWrite[]):
      void;
}
