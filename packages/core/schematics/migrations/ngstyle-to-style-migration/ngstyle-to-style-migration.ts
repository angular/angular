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
  migrateNgStyleBindings,
  calculateImportReplacements,
  createNgStyleImportsArrayRemoval,
} from './util';
import {AbsoluteFsPath} from '@angular/compiler-cli';
import {NgComponentTemplateVisitor} from '../../utils/ng_component_template';
import {MigrationConfig} from './types';

export interface NgStyleMigrationData {
  file: ProjectFile;
  replacementCount: number;
  replacements: Replacement[];
}

export interface NgStyleCompilationUnitData {
  ngStyleReplacements: Array<NgStyleMigrationData>;
  importReplacements: Record<ProjectFileID, {add: Replacement[]; addAndRemove: Replacement[]}>;
}

export class NgStyleMigration extends TsurgeFunnelMigration<
  NgStyleCompilationUnitData,
  NgStyleCompilationUnitData
> {
  constructor(private readonly config: MigrationConfig = {}) {
    super();
  }

  override async analyze(info: ProgramInfo): Promise<Serializable<NgStyleCompilationUnitData>> {
    const {sourceFiles, program} = info;
    const typeChecker = program.getTypeChecker();
    const ngStyleReplacements: Array<NgStyleMigrationData> = [];
    const filesWithNgStyleDeclarations = new Set<ts.SourceFile>();

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

        const replacementsForStyle: Replacement[] = [];
        let replacementCountForStyle = 0;

        templateVisitor.resolvedTemplates.forEach((template) => {
          const {migrated, changed, replacementCount} = migrateNgStyleBindings(
            template.content,
            this.config,
            node,
            typeChecker,
          );

          if (!changed) {
            return;
          }

          replacementCountForStyle += replacementCount;

          const fileToMigrate = template.inline
            ? file
            : projectFile(template.filePath as AbsoluteFsPath, info);
          const end = template.start + template.content.length;

          replacementsForStyle.push(
            prepareTextReplacement(fileToMigrate, migrated, template.start, end),
          );
        });

        if (replacementCountForStyle === 0) {
          return;
        }

        filesWithNgStyleDeclarations.add(sf);

        const importArrayRemoval = createNgStyleImportsArrayRemoval(node, file, typeChecker);
        if (importArrayRemoval) {
          replacementsForStyle.push(importArrayRemoval);
        }

        const existing = ngStyleReplacements.find((entry) => entry.file === file);
        if (existing) {
          existing.replacements.push(...replacementsForStyle);
          existing.replacementCount += replacementCountForStyle;
        } else {
          ngStyleReplacements.push({
            file,
            replacements: replacementsForStyle,
            replacementCount: replacementCountForStyle,
          });
        }
      });
    }

    const importReplacements = calculateImportReplacements(info, filesWithNgStyleDeclarations);
    return confirmAsSerializable({ngStyleReplacements, importReplacements});
  }

  override async combine(
    unitA: NgStyleCompilationUnitData,
    unitB: NgStyleCompilationUnitData,
  ): Promise<Serializable<NgStyleCompilationUnitData>> {
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
      ngStyleReplacements: [...unitA.ngStyleReplacements, ...unitB.ngStyleReplacements],
      importReplacements,
    });
  }

  override async globalMeta(
    combinedData: NgStyleCompilationUnitData,
  ): Promise<Serializable<NgStyleCompilationUnitData>> {
    return confirmAsSerializable({
      ngStyleReplacements: combinedData.ngStyleReplacements,
      importReplacements: combinedData.importReplacements,
    });
  }

  override async stats(globalMetadata: NgStyleCompilationUnitData) {
    const touchedFilesCount = globalMetadata.ngStyleReplacements.length;
    const replacementCount = globalMetadata.ngStyleReplacements.reduce(
      (acc, cur) => acc + cur.replacementCount,
      0,
    );

    return confirmAsSerializable({
      touchedFilesCount,
      replacementCount,
    });
  }

  override async migrate(globalData: NgStyleCompilationUnitData) {
    const replacements: Replacement[] = [];

    replacements.push(...globalData.ngStyleReplacements.flatMap(({replacements}) => replacements));

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
