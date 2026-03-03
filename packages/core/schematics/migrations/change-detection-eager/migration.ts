/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ImportManager} from '@angular/compiler-cli/private/migrations';
import ts from 'typescript';
import {getAngularDecorators} from '../../utils/ng_decorators';
import {
  confirmAsSerializable,
  ProgramInfo,
  projectFile,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';

export interface ChangeDetectionEagerMigrationPhase1Data {
  replacements: Replacement[];
}

export class ChangeDetectionEagerMigration extends TsurgeFunnelMigration<
  ChangeDetectionEagerMigrationPhase1Data,
  ChangeDetectionEagerMigrationPhase1Data
> {
  constructor(
    private readonly config: {shouldMigrate?: (file: {rootRelativePath: string}) => boolean} = {},
  ) {
    super();
  }

  override async analyze(
    info: ProgramInfo,
  ): Promise<Serializable<ChangeDetectionEagerMigrationPhase1Data>> {
    const {sourceFiles, program} = info;
    const typeChecker = program.getTypeChecker();
    const replacements: Replacement[] = [];
    const importManager = new ImportManager();

    const printer = ts.createPrinter();

    for (const sf of sourceFiles) {
      const file = projectFile(sf, info);

      if (this.config.shouldMigrate && !this.config.shouldMigrate(file)) {
        continue;
      }

      ts.forEachChild(sf, (node) => {
        if (!ts.isClassDeclaration(node)) {
          return;
        }

        const decorators = getAngularDecorators(typeChecker, ts.getDecorators(node) || []);
        const componentDecorator = decorators.find(
          (d) => d.name === 'Component' && d.moduleName === '@angular/core',
        );

        if (!componentDecorator) {
          return;
        }

        // The helper `getAngularDecorators` guarantees that `node` is `CallExpressionDecorator`.
        // So `componentDecorator.node.expression` is `ts.CallExpression`.
        const callExpression = componentDecorator.node.expression;
        if (
          callExpression.arguments.length !== 1 ||
          !ts.isObjectLiteralExpression(callExpression.arguments[0])
        ) {
          return;
        }

        const metadata = callExpression.arguments[0] as ts.ObjectLiteralExpression;
        const changeDetectionProp = metadata.properties.find(
          (p) =>
            ts.isPropertyAssignment(p) &&
            (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) &&
            p.name.text === 'changeDetection',
        ) as ts.PropertyAssignment | undefined;

        if (!changeDetectionProp) {
          // Property missing. Add it.

          const changeDetectionStrategyExpr = importManager.addImport({
            exportModuleSpecifier: '@angular/core',
            exportSymbolName: 'ChangeDetectionStrategy',
            requestedFile: sf,
          });

          // Print the identifier
          const exprText = printer.printNode(
            ts.EmitHint.Unspecified,
            changeDetectionStrategyExpr,
            sf,
          );

          const properties = metadata.properties;
          let insertPos: number;
          let toInsert: string;

          if (properties.length > 0) {
            const lastProp = properties[properties.length - 1];
            insertPos = lastProp.getEnd();

            // Simpler approach: check comma after last property.
            const textAfter = sf.text.substring(lastProp.getEnd());
            const hasComma = /^\s*,/.test(textAfter);
            const prefix = hasComma ? '' : ',';

            toInsert = `${prefix}\n  changeDetection: ${exprText}.Eager`;
          } else {
            insertPos = metadata.getStart() + 1;
            toInsert = `\n  changeDetection: ${exprText}.Eager\n`;
          }

          replacements.push(
            new Replacement(
              projectFile(sf, info),
              new TextUpdate({
                position: insertPos,
                end: insertPos,
                toInsert: toInsert,
              }),
            ),
          );
          return;
        }

        // Check if explicitly set to Default.
        if (!ts.isPropertyAccessExpression(changeDetectionProp.initializer)) {
          return;
        }

        const initializer = changeDetectionProp.initializer;
        // Best effort check for ChangeDetectionStrategy.Default
        if (!ts.isIdentifier(initializer.expression) || initializer.name.text !== 'Default') {
          return;
        }

        // Verify it is indeed ChangeDetectionStrategy.
        // We can check if the symbol of the expression is imported from @angular/core and named ChangeDetectionStrategy.
        const symbol = typeChecker.getSymbolAtLocation(initializer.expression);

        if (!symbol || !symbol.declarations || symbol.declarations.length === 0) {
          return;
        }

        const declaration = symbol.declarations[0];
        if (!ts.isImportSpecifier(declaration)) {
          return;
        }

        const propertyName = declaration.propertyName?.text ?? declaration.name.text;
        const importDecl = declaration.parent.parent.parent;

        if (
          !ts.isImportDeclaration(importDecl) ||
          !ts.isStringLiteral(importDecl.moduleSpecifier) ||
          importDecl.moduleSpecifier.text !== '@angular/core' ||
          propertyName !== 'ChangeDetectionStrategy'
        ) {
          return;
        }

        replacements.push(
          new Replacement(
            projectFile(sf, info),
            new TextUpdate({
              position: initializer.name.getStart(),
              end: initializer.name.getEnd(),
              toInsert: 'Eager',
            }),
          ),
        );
      });
    }

    applyImportManagerChanges(importManager, replacements, sourceFiles, info);

    return confirmAsSerializable({
      replacements,
    });
  }

  override async combine(
    unitA: ChangeDetectionEagerMigrationPhase1Data,
    unitB: ChangeDetectionEagerMigrationPhase1Data,
  ): Promise<Serializable<ChangeDetectionEagerMigrationPhase1Data>> {
    return confirmAsSerializable({
      replacements: [...unitA.replacements, ...unitB.replacements],
    });
  }

  override async globalMeta(
    combinedData: ChangeDetectionEagerMigrationPhase1Data,
  ): Promise<Serializable<ChangeDetectionEagerMigrationPhase1Data>> {
    return confirmAsSerializable(combinedData);
  }

  override async stats(
    globalMetadata: ChangeDetectionEagerMigrationPhase1Data,
  ): Promise<Serializable<unknown>> {
    return confirmAsSerializable({});
  }

  override async migrate(
    globalData: ChangeDetectionEagerMigrationPhase1Data,
  ): Promise<{replacements: Replacement[]}> {
    return {replacements: globalData.replacements};
  }
}
