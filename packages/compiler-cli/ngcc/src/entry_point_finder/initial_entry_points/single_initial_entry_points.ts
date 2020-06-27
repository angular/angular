/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../../../src/ngtsc/file_system';
import {InitialEntryPoints} from './interface';

export class SingleInitialEntryPoints implements InitialEntryPoints {
  constructor(private targetPath: AbsoluteFsPath) {}

  getInitialEntryPointPaths(): AbsoluteFsPath[] {
    return [this.targetPath];
  }
}
