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
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {migrateNgClassBindings} from './util';
import {AbsoluteFsPath} from '../../../../compiler-cli';
import {NgComponentTemplateVisitor} from '../../utils/ng_component_template';

export interface MigrationConfig {
  /**
   * Whether to migrate this component template to self-closing tags.
   */
  shouldMigrate?: (containingFile: ProjectFile) => boolean;
}

export interface NgClassMigrationData {
  file: ProjectFile;
  replacementCount: number;
  replacements: Replacement[];
}

export interface NgClassCompilationUnitData {
  ngClassReplacements: Array<NgClassMigrationData>;
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

    for (const sf of sourceFiles) {
      ts.forEachChild(sf, (node: ts.Node) => {
        if (!ts.isClassDeclaration(node)) {
          return;
        }

        const file = projectFile(node.getSourceFile(), info);

        if (this.config.shouldMigrate && this.config.shouldMigrate(file) === false) {
          return;
        }

        const templateVisitor = new NgComponentTemplateVisitor(typeChecker);
        templateVisitor.visitNode(node);

        templateVisitor.resolvedTemplates.forEach((template) => {
          const {migrated, changed, replacementCount} = migrateNgClassBindings(template.content);

          if (!changed) {
            return;
          }

          const fileToMigrate = template.inline
            ? file
            : projectFile(template.filePath as AbsoluteFsPath, info);
          const end = template.start + template.content.length;

          const replacements = [
            prepareTextReplacement(fileToMigrate, migrated, template.start, end),
          ];

          const existing = ngClassReplacements.find((entry) => entry.file === file);

          if (existing) {
            existing.replacements.push(...replacements);
            existing.replacementCount += replacementCount;
          } else {
            ngClassReplacements.push({file, replacements, replacementCount});
          }
        });
      });
    }

    return confirmAsSerializable({ngClassReplacements});
  }

  override async combine(
    unitA: NgClassCompilationUnitData,
    unitB: NgClassCompilationUnitData,
  ): Promise<Serializable<NgClassCompilationUnitData>> {
    return confirmAsSerializable({
      ngClassReplacements: [...unitA.ngClassReplacements, ...unitB.ngClassReplacements],
    });
  }

  override async globalMeta(
    combinedData: NgClassCompilationUnitData,
  ): Promise<Serializable<NgClassCompilationUnitData>> {
    return confirmAsSerializable({
      ngClassReplacements: combinedData.ngClassReplacements,
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
    return {
      replacements: globalData.ngClassReplacements.flatMap(({replacements}) => replacements),
    };
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
