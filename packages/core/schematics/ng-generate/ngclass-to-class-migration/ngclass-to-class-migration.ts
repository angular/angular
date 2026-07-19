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

/** Result of migrating a single class declaration. */
interface ClassMigrationResult {
  replacements: Replacement[];
  replacementCount: number;
  /** Whether every `[ngClass]` binding in this class's template(s) was migrated. */
  canRemoveNgClass: boolean;
  /** Whether this class's template(s) no longer need any `CommonModule` directive. */
  canRemoveCommonModule: boolean;
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
    canRemoveNgClass: boolean;
    canRemoveCommonModule: boolean;
  } | null {
    const {migrated, changed, replacementCount, canRemoveNgClass, canRemoveCommonModule} =
      migrateNgClassBindings(template.content, this.config, node, typeChecker);

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
      canRemoveNgClass,
      canRemoveCommonModule,
    };
  }

  /** Migrates a single class declaration, if it has a component template using `[ngClass]`. */
  private processClass(
    node: ts.ClassDeclaration,
    file: ProjectFile,
    info: ProgramInfo,
    typeChecker: ts.TypeChecker,
  ): ClassMigrationResult | null {
    const templateVisitor = new NgComponentTemplateVisitor(typeChecker);
    templateVisitor.visitNode(node);

    const replacements: Replacement[] = [];
    let replacementCount = 0;
    let canRemoveNgClass = true;
    let canRemoveCommonModule = true;

    for (const template of templateVisitor.resolvedTemplates) {
      const result = this.processTemplate(template, node, file, info, typeChecker);
      if (result === null) {
        continue;
      }
      replacements.push(...result.replacements);
      replacementCount += result.replacementCount;
      canRemoveNgClass = canRemoveNgClass && result.canRemoveNgClass;
      canRemoveCommonModule = canRemoveCommonModule && result.canRemoveCommonModule;
    }

    if (replacements.length === 0) {
      return null;
    }

    // Handle the `@Component({ imports: [...] })` array.
    // Only remove NgClass from this class's own imports array if all of its [ngClass]
    // bindings were migrated.
    if (canRemoveNgClass) {
      const importsRemoval = createNgClassImportsArrayRemoval(
        node,
        file,
        typeChecker,
        canRemoveCommonModule,
      );
      if (importsRemoval) {
        replacements.push(importsRemoval);
      }
    }

    return {replacements, replacementCount, canRemoveNgClass, canRemoveCommonModule};
  }

  override async analyze(info: ProgramInfo): Promise<Serializable<NgClassCompilationUnitData>> {
    const {sourceFiles, program} = info;
    const typeChecker = program.getTypeChecker();
    const ngClassReplacements: Array<NgClassMigrationData> = [];
    const filesWithNgClassDeclarations = new Set<ts.SourceFile>();
    const filesToRemoveCommonModule = new Set<ProjectFileID>();

    for (const sf of sourceFiles) {
      const file = projectFile(sf, info);
      const classResults: ClassMigrationResult[] = [];

      ts.forEachChild(sf, (node: ts.Node) => {
        if (!ts.isClassDeclaration(node)) {
          return;
        }
        if (this.config.shouldMigrate && !this.config.shouldMigrate(file)) {
          return;
        }

        const result = this.processClass(node, file, info, typeChecker);
        if (result !== null) {
          classResults.push(result);
        }
      });

      if (classResults.length === 0) {
        continue;
      }

      for (const {replacements, replacementCount} of classResults) {
        ngClassReplacements.push({file, replacementCount, replacements});
      }

      // A single source file may declare multiple classes/components. The top-level
      // `NgClass`/`CommonModule` import statements are shared across all of them, so they can
      // only be removed once every class in the file no longer needs them.
      if (classResults.every((result) => result.canRemoveNgClass)) {
        filesWithNgClassDeclarations.add(sf);
      }
      if (classResults.every((result) => result.canRemoveCommonModule)) {
        filesToRemoveCommonModule.add(file.id);
      }
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
