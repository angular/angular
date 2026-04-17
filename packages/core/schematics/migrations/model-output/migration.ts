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
  projectFile,
  TsurgeFunnelMigration,
  confirmAsSerializable,
  Serializable,
} from '../../utils/tsurge';
import ts from 'typescript';
import {ImportManager} from '@angular/compiler-cli/private/migrations';
import {getImportOfIdentifier} from '../../utils/typescript/imports';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';

export class ModelOutputMigrationData {
  replacements: Replacement[] = [];
}

export class ModelOutputCompilationUnitData {
  replacements: Replacement[] = [];
}

export class ModelOutputMigration extends TsurgeFunnelMigration<
  ModelOutputCompilationUnitData,
  ModelOutputMigrationData
> {
  constructor(
    private readonly config: {shouldMigrate?: (file: {rootRelativePath: string}) => boolean} = {},
  ) {
    super();
  }

  override async analyze(info: ProgramInfo): Promise<Serializable<ModelOutputCompilationUnitData>> {
    const replacements: Replacement[] = [];

    for (const sourceFile of info.sourceFiles) {
      if (this.config.shouldMigrate && !this.config.shouldMigrate(projectFile(sourceFile, info))) {
        continue;
      }

      const importManager = new ImportManager();

      const visit = (node: ts.Node) => {
        if (ts.isClassDeclaration(node)) {
          this.analyzeClass(
            node,
            info.program.getTypeChecker(),
            importManager,
            replacements,
            sourceFile,
            info,
          );
        }
        ts.forEachChild(node, visit);
      };
      visit(sourceFile);

      applyImportManagerChanges(importManager, replacements, [sourceFile], info);
    }

    return confirmAsSerializable({
      replacements,
    });
  }

  private analyzeClass(
    classNode: ts.ClassDeclaration,
    typeChecker: ts.TypeChecker,
    importManager: ImportManager,
    replacements: Replacement[],
    sourceFile: ts.SourceFile,
    info: ProgramInfo,
  ) {
    const modelProperties: ts.PropertyDeclaration[] = [];
    const outputProperties = new Map<string, ts.PropertyDeclaration>();

    for (const member of classNode.members) {
      if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name)) {
        continue;
      }

      // Check for @Output() decorators
      const decorators = ts.getDecorators(member);
      if (decorators) {
        for (const decorator of decorators) {
          if (
            ts.isCallExpression(decorator.expression) &&
            ts.isIdentifier(decorator.expression.expression) &&
            decorator.expression.expression.text === 'Output'
          ) {
            const name = member.name.text;
            outputProperties.set(name, member);
          }
        }
      }

      if (!member.initializer || !ts.isCallExpression(member.initializer)) {
        continue;
      }

      const call = member.initializer;
      let identifier: ts.Identifier | null = null;
      if (ts.isIdentifier(call.expression)) {
        identifier = call.expression;
      } else if (ts.isPropertyAccessExpression(call.expression)) {
        let current: ts.Expression = call.expression;
        while (ts.isPropertyAccessExpression(current)) {
          if (ts.isIdentifier(current.name) && current.name.text === 'model') {
            identifier = current.name;
            break;
          }
          current = current.expression;
        }
        if (!identifier && ts.isIdentifier(current) && current.text === 'model') {
          identifier = current;
        }
      }

      if (!identifier) continue;

      const imp = getImportOfIdentifier(typeChecker, identifier);
      if (!imp || imp.importModule !== '@angular/core') continue;

      if (imp.name === 'model') {
        modelProperties.push(member);
      } else if (imp.name === 'output') {
        const name = member.name.text;
        outputProperties.set(name, member);
      }
    }

    for (const modelProp of modelProperties) {
      const modelName = (modelProp.name as ts.Identifier).text;
      const expectedOutputName = `${modelName}Change`;

      if (outputProperties.has(expectedOutputName)) {
        const update = this.migrateModelProperty(modelProp, importManager, sourceFile);
        replacements.push(new Replacement(projectFile(sourceFile, info), update));
      }
    }
  }

  private migrateModelProperty(
    modelProp: ts.PropertyDeclaration,
    importManager: ImportManager,
    sourceFile: ts.SourceFile,
  ): TextUpdate {
    const modelName = (modelProp.name as ts.Identifier).text;
    const call = modelProp.initializer as ts.CallExpression;
    const isRequired =
      ts.isPropertyAccessExpression(call.expression) && call.expression.name.text === 'required';

    const typeArgs = call.typeArguments
      ? `<${call.typeArguments.map((t) => t.getText()).join(', ')}>`
      : '';

    // Use input and linkedSignal
    importManager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'input',
      requestedFile: sourceFile,
    });
    importManager.addImport({
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'linkedSignal',
      requestedFile: sourceFile,
    });

    const inputName = `${modelName}Input`;

    const initialValue = isRequired ? undefined : (call.arguments[0]?.getText() ?? 'undefined');
    const optionsNode = isRequired ? call.arguments[0] : call.arguments[1];
    const aliasProperty = `alias: '${modelName}'`;
    let inputArgs: string;

    if (!optionsNode) {
      inputArgs = `{${aliasProperty}}`;
    } else if (ts.isObjectLiteralExpression(optionsNode)) {
      const hasAlias = optionsNode.properties.some((p) => {
        if (!ts.isPropertyAssignment(p) && !ts.isShorthandPropertyAssignment(p)) {
          return false;
        }
        return (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === 'alias';
      });

      if (hasAlias) {
        inputArgs = optionsNode.getText();
      } else {
        const optionsText = optionsNode.getText();
        const inner = optionsText.slice(1, -1).trim();
        inputArgs = `{${aliasProperty}${inner ? `, ${inner}` : ''}}`;
      }
    } else {
      inputArgs = `{${aliasProperty}, ...${optionsNode.getText()}}`;
    }

    if (initialValue !== undefined) {
      inputArgs = `${initialValue}, ${inputArgs}`;
    }

    const modifiers = modelProp.modifiers
      ? modelProp.modifiers.map((m) => m.getText()).join(' ') + ' '
      : '';

    // Detect indentation
    const {character} = sourceFile.getLineAndCharacterOfPosition(modelProp.getStart());
    const indent = sourceFile.text.substring(
      modelProp.getStart() - character,
      modelProp.getStart(),
    );

    const inputCall = isRequired ? 'input.required' : 'input';
    const newContent = `${modifiers}${inputName} = ${inputCall}${typeArgs}(${inputArgs});\n${indent}${modifiers}${modelName} = linkedSignal(this.${inputName});`;

    return new TextUpdate({
      position: modelProp.getStart(),
      end: modelProp.getEnd(),
      toInsert: newContent,
    });
  }

  override async combine(
    unitA: ModelOutputCompilationUnitData,
    unitB: ModelOutputCompilationUnitData,
  ): Promise<Serializable<ModelOutputCompilationUnitData>> {
    return confirmAsSerializable({
      replacements: [...unitA.replacements, ...unitB.replacements],
    });
  }

  override async globalMeta(
    combinedData: ModelOutputCompilationUnitData,
  ): Promise<Serializable<ModelOutputMigrationData>> {
    return confirmAsSerializable({
      replacements: combinedData.replacements,
    });
  }

  override async migrate(
    globalData: ModelOutputMigrationData,
  ): Promise<Serializable<{replacements: Replacement[]}>> {
    return confirmAsSerializable({
      replacements: globalData.replacements,
    });
  }

  override async stats(globalMetadata: ModelOutputMigrationData): Promise<Serializable<any>> {
    return confirmAsSerializable({});
  }
}
