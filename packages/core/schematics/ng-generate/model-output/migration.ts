/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ProgramInfo,
  Replacement,
  TextUpdate,
  TsurgeMigration,
  projectFile,
} from '../../utils/tsurge';
import {MigrationConfig} from './types';
import ts from 'typescript';
import {ImportManager} from '@angular/compiler-cli/private/migrations';
import {getImportOfIdentifier} from '../../utils/typescript/imports';

export class ModelOutputMigrationData {}
export class ModelOutputCompilationUnitData {
  replacements: Replacement[] = [];
}

export class ModelOutputMigration extends TsurgeMigration<
  ModelOutputMigrationData,
  ModelOutputCompilationUnitData
> {
  constructor(private config: MigrationConfig) {
    super();
  }

  override async analyze(info: ProgramInfo): Promise<ModelOutputCompilationUnitData> {
    const data = new ModelOutputCompilationUnitData();

    for (const sourceFile of info.sourceFiles) {
      if (this.config.shouldMigrate && !this.config.shouldMigrate(projectFile(sourceFile, info))) {
        continue;
      }

      const importManager = new ImportManager();
      let fileChanged = false;

      const visit = (node: ts.Node) => {
        if (ts.isClassDeclaration(node)) {
          this.analyzeClass(
            node,
            info.program.getTypeChecker(),
            importManager,
            data,
            sourceFile,
            info,
          );
        }
        ts.forEachChild(node, visit);
      };
      visit(sourceFile);

      const changes = importManager.finalize();
      for (const [path, fileChanges] of changes.entries()) {
        if (path === sourceFile.fileName) {
          for (const change of fileChanges) {
            data.replacements.push(
              new Replacement(
                projectFile(sourceFile, info),
                new TextUpdate({
                  position: change.start,
                  end: change.end,
                  toInsert: change.replacement,
                }),
              ),
            );
          }
        }
      }
    }

    return data;
  }

  private analyzeClass(
    classNode: ts.ClassDeclaration,
    typeChecker: ts.TypeChecker,
    importManager: ImportManager,
    data: ModelOutputCompilationUnitData,
    sourceFile: ts.SourceFile,
    info: ProgramInfo,
  ) {
    const modelProperties: ts.PropertyDeclaration[] = [];
    const outputProperties = new Map<string, ts.PropertyDeclaration>();

    for (const member of classNode.members) {
      if (
        !ts.isPropertyDeclaration(member) ||
        !member.initializer ||
        !ts.isCallExpression(member.initializer)
      ) {
        continue;
      }

      const call = member.initializer;
      const identifier = ts.isIdentifier(call.expression)
        ? call.expression
        : ts.isPropertyAccessExpression(call.expression)
          ? call.expression.name
          : null;

      if (!identifier) continue;

      const imp = getImportOfIdentifier(typeChecker, identifier);
      if (!imp || imp.from !== '@angular/core') continue;

      if (imp.name === 'model') {
        modelProperties.push(member);
      } else if (imp.name === 'output') {
        const name = (member.name as ts.Identifier).text;
        outputProperties.set(name, member);
      }
    }

    // Check for @Output() decorators as well
    for (const member of classNode.members) {
      if (!ts.isPropertyDeclaration(member)) continue;
      const decorators = ts.getDecorators(member);
      if (decorators) {
        for (const decorator of decorators) {
          if (
            ts.isCallExpression(decorator.expression) &&
            ts.isIdentifier(decorator.expression.expression) &&
            decorator.expression.expression.text === 'Output'
          ) {
            const name = (member.name as ts.Identifier).text;
            outputProperties.set(name, member);
          }
        }
      }
    }

    for (const modelProp of modelProperties) {
      const modelName = (modelProp.name as ts.Identifier).text;
      const expectedOutputName = `${modelName}Change`;

      if (outputProperties.has(expectedOutputName)) {
        this.migrateModelProperty(modelProp, importManager, data, sourceFile, info, typeChecker);
      }
    }
  }

  private migrateModelProperty(
    modelProp: ts.PropertyDeclaration,
    importManager: ImportManager,
    data: ModelOutputCompilationUnitData,
    sourceFile: ts.SourceFile,
    info: ProgramInfo,
    typeChecker: ts.TypeChecker,
  ) {
    const modelName = (modelProp.name as ts.Identifier).text;
    const call = modelProp.initializer as ts.CallExpression;

    const typeArgs = call.typeArguments
      ? `<${call.typeArguments.map((t) => t.getText()).join(', ')}>`
      : '';

    // Use input and linkedSignal
    importManager.addImportToSourceFile(sourceFile, 'input', '@angular/core');
    importManager.addImportToSourceFile(sourceFile, 'linkedSignal', '@angular/core');

    const inputName = `${modelName}Input`;

    // Prepare input options
    // If we have arguments, the first one is likely the initial value
    // If there's a second one, it might be options (alias, etc.)
    let inputOptions = `{alias: '${modelName}'}`;
    if (call.arguments.length > 0) {
      const initialValue = call.arguments[0].getText();
      inputOptions = `{alias: '${modelName}', initialValue: ${initialValue}}`;

      // If there are options in the model() call, we should probably try to merge them
      // but the issue description shows a simple case.
      if (call.arguments.length > 1) {
        const options = call.arguments[1].getText();
        // Simple merge if options is an object literal
        if (options.startsWith('{') && options.endsWith('}')) {
          const innerOptions = options.slice(1, -1).trim();
          inputOptions = `{alias: '${modelName}', initialValue: ${initialValue}${innerOptions ? `, ${innerOptions}` : ''}}`;
        }
      }
    }

    const newContent = `${inputName} = input${typeArgs}(${inputOptions});\n  ${modelName} = linkedSignal(this.${inputName});`;

    data.replacements.push(
      new Replacement(
        projectFile(sourceFile, info),
        new TextUpdate({
          position: modelProp.getStart(),
          end: modelProp.getEnd(),
          toInsert: newContent,
        }),
      ),
    );
  }

  override async combine(
    unitA: ModelOutputCompilationUnitData,
    unitB: ModelOutputCompilationUnitData,
  ): Promise<ModelOutputCompilationUnitData> {
    return {
      replacements: [...unitA.replacements, ...unitB.replacements],
    };
  }

  override async globalMeta(
    combinedData: ModelOutputCompilationUnitData,
  ): Promise<ModelOutputMigrationData> {
    return new ModelOutputMigrationData();
  }

  override async migrate(globalData: ModelOutputMigrationData): Promise<Replacement[]> {
    return [];
  }

  override async stats(globalMetadata: ModelOutputMigrationData): Promise<any> {
    return {};
  }
}
