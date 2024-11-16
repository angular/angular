/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgCompilerOptions} from '@angular/compiler-cli/src/ngtsc/core/api';
import ts from 'typescript';
import {ProgramInfo} from '../../../utils/tsurge';
import {MigrationConfig} from './migration_config';

/**
 * A migration host is in practice a container object that
 * exposes commonly accessed contextual helpers throughout
 * the whole migration.
 */
export class MigrationHost {
  private _sourceFiles: WeakSet<ts.SourceFile>;

  compilerOptions: NgCompilerOptions;

  constructor(
    public isMigratingCore: boolean,
    public programInfo: ProgramInfo,
    public config: MigrationConfig,
    sourceFiles: readonly ts.SourceFile[],
  ) {
    this._sourceFiles = new WeakSet(sourceFiles);
    this.compilerOptions = programInfo.userOptions;
  }

  /** Whether the given file is a source file to be migrated. */
  isSourceFileForCurrentMigration(file: ts.SourceFile): boolean {
    return this._sourceFiles.has(file);
  }
}
