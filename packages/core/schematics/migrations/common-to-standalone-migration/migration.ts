/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ProgramInfo, projectFile, Replacement, confirmAsSerializable} from '../../utils/tsurge';
import {TsurgeFunnelMigration} from '../../utils/tsurge/migration';
import {Serializable} from '../../utils/tsurge/helpers/serializable';
import {NgComponentTemplateVisitor} from '../../utils/ng_component_template';
import {getAngularDecorators} from '../../utils/ng_decorators';

import {processResolvedTemplate, hasCommonModuleInImports} from './util';
import {MigrationConfig} from './types';

export interface CommonModuleReference {
  node: ts.ClassDeclaration;
}

export interface CommonModuleCompilationUnitData {
  replacements: Replacement[];
  references: CommonModuleReference[];
  filesWithNeededImports: Map<string, string[]>;
}

/**
 * Angular Common to Standalone migration.
 *
 * This migration converts standalone components and Angular modules from using
 * CommonModule to importing individual directives and pipes.
 */
export class CommonToStandaloneMigration extends TsurgeFunnelMigration<
  CommonModuleCompilationUnitData,
  CommonModuleCompilationUnitData
> {
  constructor(private readonly config: MigrationConfig = {}) {
    super();
  }

  override async analyze(
    info: ProgramInfo,
  ): Promise<Serializable<CommonModuleCompilationUnitData>> {
    const fileReplacements: Replacement[] = [];
    const references: CommonModuleReference[] = [];
    const filesWithNeededImports = new Map<string, string[]>();

    for (const sf of info.sourceFiles) {
      const file = projectFile(sf, info);

      if (this.config.shouldMigrate && !this.config.shouldMigrate(file)) {
        continue;
      }

      this.visitSourceFile(sf, info, fileReplacements, references, filesWithNeededImports);
    }

    return confirmAsSerializable({
      replacements: fileReplacements,
      references,
      filesWithNeededImports,
    });
  }

  private visitSourceFile(
    sourceFile: ts.SourceFile,
    info: ProgramInfo,
    replacements: Replacement[],
    references: CommonModuleReference[],
    filesWithNeededImports: Map<string, string[]>,
  ): void {
    const typeChecker = info.program.getTypeChecker();

    const visit = (node: ts.Node): void => {
      const hasNode = ts.isClassDeclaration(node) && node.name;

      if (!hasNode) {
        ts.forEachChild(node, visit);
        return;
      }

      const nodeDecorators = ts.getDecorators(node);

      if (!nodeDecorators) {
        ts.forEachChild(node, visit);
        return;
      }

      const decorators = getAngularDecorators(typeChecker, nodeDecorators);

      const hasComponentDecorator = decorators.some((d) => d.name === 'Component');

      if (!hasComponentDecorator) {
        return;
      }

      const ref = this.analyzeClass(node, typeChecker);

      if (!ref) {
        return;
      }

      references.push(ref);

      const templateVisitor = new NgComponentTemplateVisitor(typeChecker);

      templateVisitor.visitNode(node);

      for (const template of templateVisitor.resolvedTemplates) {
        processResolvedTemplate(
          template,
          node,
          info,
          typeChecker,
          replacements,
          filesWithNeededImports,
        );
      }

      // Component has CommonModule in imports but no template content to analyze
      // We still need to process these cases to remove unused CommonModule imports
      if (templateVisitor.resolvedTemplates.length === 0) {
        processResolvedTemplate(
          {content: '', inline: false, filePath: null, start: 0},
          node,
          info,
          typeChecker,
          replacements,
          filesWithNeededImports,
        );
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  private analyzeClass(
    node: ts.ClassDeclaration,
    typeChecker: ts.TypeChecker,
  ): CommonModuleReference | null {
    const nodeDecorators = ts.getDecorators(node);
    if (!nodeDecorators) return null;

    const decorators = getAngularDecorators(typeChecker, nodeDecorators);

    // Only process Component decorators, not Directive or other Angular decorators
    for (const decorator of decorators) {
      if (decorator.name === 'Component') {
        return this.analyzeComponentDecorator(node, decorator, typeChecker);
      }
    }

    return null;
  }

  private analyzeComponentDecorator(
    node: ts.ClassDeclaration,
    decorator: {node: ts.Decorator; name: string},
    typeChecker: ts.TypeChecker,
  ): CommonModuleReference | null {
    const decoratorNode = decorator.node;

    if (!ts.isCallExpression(decoratorNode.expression)) {
      return null;
    }

    const config = decoratorNode.expression.arguments[0];

    if (!ts.isObjectLiteralExpression(config)) {
      return null;
    }

    if (hasCommonModuleInImports(node, typeChecker)) {
      return {node};
    }

    return null;
  }

  override async combine(
    unitA: CommonModuleCompilationUnitData,
    unitB: CommonModuleCompilationUnitData,
  ): Promise<Serializable<CommonModuleCompilationUnitData>> {
    const combinedFilesWithNeededImports = new Map(unitA.filesWithNeededImports);

    for (const [fileName, imports] of unitB.filesWithNeededImports) {
      if (combinedFilesWithNeededImports.has(fileName)) {
        const existingImports = combinedFilesWithNeededImports.get(fileName) || [];
        const mergedImports = Array.from(new Set([...existingImports, ...imports]));
        combinedFilesWithNeededImports.set(fileName, mergedImports);
      } else {
        combinedFilesWithNeededImports.set(fileName, imports);
      }
    }

    return confirmAsSerializable({
      replacements: [...unitA.replacements, ...unitB.replacements],
      references: [...unitA.references, ...unitB.references],
      filesWithNeededImports: combinedFilesWithNeededImports,
    });
  }

  override async globalMeta(
    combinedData: CommonModuleCompilationUnitData,
  ): Promise<Serializable<CommonModuleCompilationUnitData>> {
    return confirmAsSerializable(combinedData);
  }

  override async stats(globalMetadata: CommonModuleCompilationUnitData) {
    const stats = {
      counters: {
        replacements: globalMetadata.replacements.length,
        references: globalMetadata.references.length,
      },
    };
    return stats as Serializable<typeof stats>;
  }

  override async migrate(globalData: CommonModuleCompilationUnitData) {
    return {
      replacements: globalData.replacements,
    };
  }
}
