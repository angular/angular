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
  calculateImportReplacements,
  createNgClassImportsArrayRemoval,
  migrateNgClassBindings,
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

  private processTemplate(
    template: {content: string; inline: boolean; filePath: string | null; start: number},
    node: ts.ClassDeclaration,
    file: ProjectFile,
    info: ProgramInfo,
    typeChecker: ts.TypeChecker,
  ): {
    replacements: Replacement[];
    replacementCount: number;
    canRemoveCommonModule: boolean;
  } | null {
    const {migrated, changed, replacementCount, canRemoveCommonModule} = migrateNgClassBindings(
      template.content,
      this.config,
      node,
      typeChecker,
    );

    if (!changed) {
      return null;
    }

    const fileToMigrate = template.inline
      ? file
      : projectFile(template.filePath as AbsoluteFsPath, info);
    const end = template.start + template.content.length;

    return {
      replacements: [prepareTextReplacement(fileToMigrate, migrated, template.start, end)],
      replacementCount,
      canRemoveCommonModule,
    };
  }

  override async analyze(info: ProgramInfo): Promise<Serializable<NgClassCompilationUnitData>> {
    const {sourceFiles, program} = info;
    const typeChecker = program.getTypeChecker();
    const ngClassReplacements: Array<NgClassMigrationData> = [];
    const filesWithNgClassDeclarations = new Set<ts.SourceFile>();
    const filesToRemoveCommonModule = new Set<ProjectFileID>();

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
        let canRemoveCommonModuleForFile = true;

        for (const template of templateVisitor.resolvedTemplates) {
          const result = this.processTemplate(template, node, file, info, typeChecker);
          if (result) {
            replacementsForClass.push(...result.replacements);
            replacementCountForClass += result.replacementCount;
            if (!result.canRemoveCommonModule) {
              canRemoveCommonModuleForFile = false;
            }
          }
        }

        if (replacementsForClass.length > 0) {
          if (canRemoveCommonModuleForFile) {
            filesToRemoveCommonModule.add(file.id);
          }

          // Handle the `@Component({ imports: [...] })` array.
          const importsRemoval = createNgClassImportsArrayRemoval(
            node,
            file,
            typeChecker,
            canRemoveCommonModuleForFile,
          );
          if (importsRemoval) {
            replacementsForClass.push(importsRemoval);
          }

          ngClassReplacements.push({
            file,
            replacementCount: replacementCountForClass,
            replacements: replacementsForClass,
          });
          filesWithNgClassDeclarations.add(sf);
        }
      });
    }

    const importReplacements = calculateImportReplacements(
      info,
      filesWithNgClassDeclarations,
      filesToRemoveCommonModule,
    );

    return confirmAsSerializable({
      ngClassReplacements,
      importReplacements,
    });
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
