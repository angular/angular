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
  MigrationStats,
  ProgramInfo,
  projectFile,
  ProjectFile,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {NgComponentTemplateVisitor} from '../../utils/ng_component_template';
import {migrateTemplateToSelfClosingTags} from './to-self-closing-tags';
import {AbsoluteFsPath} from '../../../../compiler-cli';

export interface MigrationConfig {
  /**
   * Whether to migrate this component template to self-closing tags.
   */
  shouldMigrate?: (containingFile: ProjectFile) => boolean;
}

export interface SelfClosingTagsMigrationData {
  file: ProjectFile;
  replacementCount: number;
  replacements: Replacement[];
}

export interface SelfClosingTagsCompilationUnitData {
  tagReplacements: Array<SelfClosingTagsMigrationData>;
}

export class SelfClosingTagsMigration extends TsurgeFunnelMigration<
  SelfClosingTagsCompilationUnitData,
  SelfClosingTagsCompilationUnitData
> {
  constructor(private readonly config: MigrationConfig = {}) {
    super();
  }

  override async analyze(
    info: ProgramInfo,
  ): Promise<Serializable<SelfClosingTagsCompilationUnitData>> {
    const {sourceFiles, program} = info;
    const typeChecker = program.getTypeChecker();
    const tagReplacements: Array<SelfClosingTagsMigrationData> = [];

    for (const sf of sourceFiles) {
      ts.forEachChild(sf, (node: ts.Node) => {
        // Skipping any non component declarations
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
          const {migrated, changed, replacementCount} = migrateTemplateToSelfClosingTags(
            template.content,
          );

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

          const fileReplacements = tagReplacements.find(
            (tagReplacement) => tagReplacement.file === file,
          );

          if (fileReplacements) {
            fileReplacements.replacements.push(...replacements);
            fileReplacements.replacementCount += replacementCount;
          } else {
            tagReplacements.push({file, replacements, replacementCount});
          }
        });
      });
    }

    return confirmAsSerializable({tagReplacements});
  }

  override async combine(
    unitA: SelfClosingTagsCompilationUnitData,
    unitB: SelfClosingTagsCompilationUnitData,
  ): Promise<Serializable<SelfClosingTagsCompilationUnitData>> {
    return confirmAsSerializable({
      tagReplacements: [...unitA.tagReplacements, ...unitB.tagReplacements],
    });
  }

  override async globalMeta(
    combinedData: SelfClosingTagsCompilationUnitData,
  ): Promise<Serializable<SelfClosingTagsCompilationUnitData>> {
    const globalMeta: SelfClosingTagsCompilationUnitData = {
      tagReplacements: combinedData.tagReplacements,
    };

    return confirmAsSerializable(globalMeta);
  }

  override async stats(
    globalMetadata: SelfClosingTagsCompilationUnitData,
  ): Promise<MigrationStats> {
    const touchedFilesCount = globalMetadata.tagReplacements.length;
    const replacementCount = globalMetadata.tagReplacements.reduce(
      (acc, cur) => acc + cur.replacementCount,
      0,
    );

    return {
      counters: {
        touchedFilesCount,
        replacementCount,
      },
    };
  }

  override async migrate(globalData: SelfClosingTagsCompilationUnitData) {
    return {replacements: globalData.tagReplacements.flatMap(({replacements}) => replacements)};
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
