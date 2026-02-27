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
    const {migrated, changed, replacementCount, canRemoveCommonModule} = migrateNgStyleBindings(
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

  override async analyze(info: ProgramInfo): Promise<Serializable<NgStyleCompilationUnitData>> {
    const {sourceFiles, program} = info;
    const typeChecker = program.getTypeChecker();
    const ngStyleReplacements: Array<NgStyleMigrationData> = [];
    const filesWithNgStyleDeclarations = new Set<ts.SourceFile>();
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

        const replacementsForStyle: Replacement[] = [];
        let replacementCountForStyle = 0;
        let canRemoveCommonModuleForFile = true;

        for (const template of templateVisitor.resolvedTemplates) {
          const result = this.processTemplate(template, node, file, info, typeChecker);
          if (result) {
            replacementsForStyle.push(...result.replacements);
            replacementCountForStyle += result.replacementCount;
            if (!result.canRemoveCommonModule) {
              canRemoveCommonModuleForFile = false;
            }
          }
        }

        if (replacementsForStyle.length > 0) {
          if (canRemoveCommonModuleForFile) {
            filesToRemoveCommonModule.add(file.id);
          }

          // Handle the `@Component({ imports: [...] })` array.
          const importsRemoval = createNgStyleImportsArrayRemoval(
            node,
            file,
            typeChecker,
            canRemoveCommonModuleForFile,
          );
          if (importsRemoval) {
            replacementsForStyle.push(importsRemoval);
          }

          ngStyleReplacements.push({
            file,
            replacementCount: replacementCountForStyle,
            replacements: replacementsForStyle,
          });
          filesWithNgStyleDeclarations.add(sf);
        }
      });
    }

    const importReplacements = calculateImportReplacements(
      info,
      filesWithNgStyleDeclarations,
      filesToRemoveCommonModule,
    );

    return confirmAsSerializable({
      ngStyleReplacements,
      importReplacements,
    });
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
