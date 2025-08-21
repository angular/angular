/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {
  confirmAsSerializable,
  ProgramInfo,
  projectFile,
  ProjectFile,
  ProjectFileID,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {
  migrateNgClassBindings,
  calculateImportReplacements,
  createNgClassImportsArrayRemoval,
} from './util';
import {AbsoluteFsPath} from '@angular/compiler-cli';
import {NgComponentTemplateVisitor} from '../../utils/ng_component_template';
import {MigrationConfig} from './types';

export interface NgClassMigrationData {
  file: ProjectFile;
  replacementCount: number;
  replacements: Replacement[];
}

export interface NgClassCompilationUnitData {
  ngClassReplacements: Array<NgClassMigrationData>;
  importReplacements: Record<ProjectFileID, {add: Replacement[]; addAndRemove: Replacement[]}>;
}

export class NgClassMigration extends TsurgeFunnelMigration<
  NgClassCompilationUnitData,
  NgClassCompilationUnitData
> {
  constructor(private readonly config: MigrationConfig = {}) {
    super();
  }

  override async analyze(info: ProgramInfo): Promise<Serializable<NgClassCompilationUnitData>> {
    const {sourceFiles, program} = info;
    const typeChecker = program.getTypeChecker();
    const ngClassReplacements: Array<NgClassMigrationData> = [];
    const filesWithNgClassDeclarations = new Set<ts.SourceFile>();

    for (const sf of sourceFiles) {
      ts.forEachChild(sf, (node: ts.Node) => {
        if (!ts.isClassDeclaration(node)) {
          return;
        }

        const file = projectFile(sf, info);

        if (this.config.shouldMigrate && !this.config.shouldMigrate(file)) {
          return;
        }

        const templateVisitor = new NgComponentTemplateVisitor(typeChecker);
        templateVisitor.visitNode(node);

        const replacementsForClass: Replacement[] = [];
        let replacementCountForClass = 0;

        templateVisitor.resolvedTemplates.forEach((template) => {
          const {migrated, changed, replacementCount} = migrateNgClassBindings(
            template.content,
            this.config,
            node,
            typeChecker,
          );

          if (!changed) {
            return;
          }

          replacementCountForClass += replacementCount;

          const fileToMigrate = template.inline
            ? file
            : projectFile(template.filePath as AbsoluteFsPath, info);
          const end = template.start + template.content.length;

          replacementsForClass.push(
            prepareTextReplacement(fileToMigrate, migrated, template.start, end),
          );
        });

        if (replacementCountForClass === 0) {
          return;
        }

        filesWithNgClassDeclarations.add(sf);

        const importArrayRemoval = createNgClassImportsArrayRemoval(node, file, typeChecker);
        if (importArrayRemoval) {
          replacementsForClass.push(importArrayRemoval);
        }

        const existing = ngClassReplacements.find((entry) => entry.file === file);
        if (existing) {
          existing.replacements.push(...replacementsForClass);
          existing.replacementCount += replacementCountForClass;
        } else {
          ngClassReplacements.push({
            file,
            replacements: replacementsForClass,
            replacementCount: replacementCountForClass,
          });
        }
      });
    }

    const importReplacements = calculateImportReplacements(info, filesWithNgClassDeclarations);
    return confirmAsSerializable({ngClassReplacements, importReplacements});
  }

  override async combine(
    unitA: NgClassCompilationUnitData,
    unitB: NgClassCompilationUnitData,
  ): Promise<Serializable<NgClassCompilationUnitData>> {
    const importReplacements: Record<
      ProjectFileID,
      {add: Replacement[]; addAndRemove: Replacement[]}
    > = {};

    for (const unit of [unitA, unitB]) {
      for (const fileIDStr of Object.keys(unit.importReplacements)) {
        const fileID = fileIDStr as ProjectFileID;
        importReplacements[fileID] = unit.importReplacements[fileID];
      }
    }

    return confirmAsSerializable({
      ngClassReplacements: [...unitA.ngClassReplacements, ...unitB.ngClassReplacements],
      importReplacements,
    });
  }

  override async globalMeta(
    combinedData: NgClassCompilationUnitData,
  ): Promise<Serializable<NgClassCompilationUnitData>> {
    return confirmAsSerializable({
      ngClassReplacements: combinedData.ngClassReplacements,
      importReplacements: combinedData.importReplacements,
    });
  }

  override async stats(globalMetadata: NgClassCompilationUnitData) {
    const touchedFilesCount = globalMetadata.ngClassReplacements.length;
    const replacementCount = globalMetadata.ngClassReplacements.reduce(
      (acc, cur) => acc + cur.replacementCount,
      0,
    );

    return confirmAsSerializable({
      touchedFilesCount,
      replacementCount,
    });
  }

  override async migrate(globalData: NgClassCompilationUnitData) {
    const replacements: Replacement[] = [];

    replacements.push(...globalData.ngClassReplacements.flatMap(({replacements}) => replacements));

    for (const fileIDStr of Object.keys(globalData.importReplacements)) {
      const fileID = fileIDStr as ProjectFileID;
      const importReplacements = globalData.importReplacements[fileID];
      replacements.push(...importReplacements.addAndRemove);
    }

    return {replacements};
  }
}

function prepareTextReplacement(
  file: ProjectFile,
  replacement: string,
  start: number,
  end: number,
): Replacement {
  return new Replacement(
    file,
    new TextUpdate({
      position: start,
      end: end,
      toInsert: replacement,
    }),
  );
}
