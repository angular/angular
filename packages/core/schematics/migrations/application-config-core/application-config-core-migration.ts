/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ImportManager} from '@angular/compiler-cli/private/migrations';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';
import {
  confirmAsSerializable,
  ProgramInfo,
  Replacement,
  Serializable,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {getImportSpecifier} from '../../utils/typescript/imports';

export interface CompilationUnitData {
  replacements: Replacement[];
}

/** Migration that moves the import of `ApplicationConfig` from `platform-browser` to `core`. */
export class ApplicationConfigCoreMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const replacements: Replacement[] = [];
    let importManager: ImportManager | null = null;

    for (const sourceFile of info.sourceFiles) {
      const specifier = getImportSpecifier(
        sourceFile,
        '@angular/platform-browser',
        'ApplicationConfig',
      );
      if (!specifier) {
        continue;
      }

      importManager ??= new ImportManager({
        // Prevent the manager from trying to generate a non-conflicting import.
        generateUniqueIdentifier: () => null,
        shouldUseSingleQuotes: () => true,
      });

      importManager.removeImport(sourceFile, 'ApplicationConfig', '@angular/platform-browser');
      importManager.addImport({
        exportSymbolName: 'ApplicationConfig',
        exportModuleSpecifier: '@angular/core',
        requestedFile: sourceFile,
        unsafeAliasOverride: specifier.propertyName ? specifier.name.text : undefined,
      });
    }

    if (importManager !== null) {
      applyImportManagerChanges(importManager, replacements, info.sourceFiles, info);
    }

    return confirmAsSerializable({replacements});
  }

  override async migrate(globalData: CompilationUnitData) {
    return confirmAsSerializable(globalData);
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const seen = new Set<string>();
    const combined: Replacement[] = [];

    [unitA.replacements, unitB.replacements].forEach((replacements) => {
      replacements.forEach((current) => {
        const {position, end, toInsert} = current.update.data;
        const key = current.projectFile.id + '/' + position + '/' + end + '/' + toInsert;

        if (!seen.has(key)) {
          seen.add(key);
          combined.push(current);
        }
      });
    });

    return confirmAsSerializable({replacements: combined});
  }

  override async globalMeta(
    combinedData: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable(combinedData);
  }

  override async stats() {
    return confirmAsSerializable({});
  }
}
