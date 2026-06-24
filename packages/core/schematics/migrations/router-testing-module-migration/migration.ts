/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  confirmAsSerializable,
  ProgramInfo,
  projectFile,
  Replacement,
  Serializable,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {ImportManager} from '@angular/compiler-cli/private/migrations';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';

import {MigrationConfig} from './types';
import {
  findRouterTestingModuleUsages,
  processRouterTestingModuleUsage,
  RouterTestingModuleUsage,
} from './utils';

export interface CompilationUnitData {
  replacements: Replacement[];
  migratedUsages: RouterTestingModuleUsage[];
  filesWithLocationMocks: Map<string, boolean>;
}

/**
 * Migration that converts RouterTestingModule usages to the recommended API:
 * - Replace RouterTestingModule with RouterModule for all tests (respecting existing imports)
 * - Adds provideLocationMocks only when needed and not conflicting
 */
export class RouterTestingModuleMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  constructor(private readonly config: MigrationConfig = {}) {
    super();
  }

  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const replacements: Replacement[] = [];
    const migratedUsages: RouterTestingModuleUsage[] = [];
    const filesWithLocationMocks = new Map<string, boolean>();
    const importManager = new ImportManager({
      shouldUseSingleQuotes: () => true,
    });

    for (const sourceFile of info.sourceFiles) {
      const file = projectFile(sourceFile, info);

      if (this.config.shouldMigrate && !this.config.shouldMigrate(file)) {
        continue;
      }

      const usages = findRouterTestingModuleUsages(sourceFile);

      for (const usage of usages) {
        processRouterTestingModuleUsage(usage, sourceFile, info, importManager, replacements);
        migratedUsages.push(usage);

        if (usage.usesSpyLocationUrlChanges) {
          filesWithLocationMocks.set(sourceFile.fileName, true);
        }
      }
    }

    applyImportManagerChanges(importManager, replacements, info.sourceFiles, info);

    return confirmAsSerializable({
      replacements,
      migratedUsages,
      filesWithLocationMocks,
    });
  }

  override async migrate(globalData: CompilationUnitData) {
    return {
      replacements: globalData.replacements,
    };
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const combinedFilesWithLocationMocks = new Map(unitA.filesWithLocationMocks);

    for (const [fileName, hasLocationMocks] of unitB.filesWithLocationMocks) {
      combinedFilesWithLocationMocks.set(
        fileName,
        hasLocationMocks || combinedFilesWithLocationMocks.get(fileName) || false,
      );
    }

    return confirmAsSerializable({
      replacements: [...unitA.replacements, ...unitB.replacements],
      migratedUsages: [...unitA.migratedUsages, ...unitB.migratedUsages],
      filesWithLocationMocks: combinedFilesWithLocationMocks,
    });
  }

  override async globalMeta(
    combinedData: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable(combinedData);
  }

  override async stats(globalMetadata: CompilationUnitData) {
    const stats = {
      counters: {
        replacements: globalMetadata.replacements.length,
        migratedUsages: globalMetadata.migratedUsages.length,
        filesWithLocationMocks: globalMetadata.filesWithLocationMocks.size,
        totalFiles: new Set(globalMetadata.migratedUsages.map((usage) => usage.sourceFile.fileName))
          .size,
      },
    };
    return stats as Serializable<typeof stats>;
  }
}
