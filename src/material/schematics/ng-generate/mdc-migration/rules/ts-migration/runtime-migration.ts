/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, getPropertyNameText} from '@angular/cdk/schematics';
import {SchematicContext} from '@angular-devkit/schematics';
import {ComponentMigrator} from '../index';
import * as ts from 'typescript';
import {ThemingStylesMigration} from '../theming-styles';
import {TemplateMigration} from '../template-migration';

export class RuntimeCodeMigration extends Migration<ComponentMigrator[], SchematicContext> {
  enabled = true;

  private _printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});
  private _stylesMigration: ThemingStylesMigration;
  private _templateMigration: TemplateMigration;
  private _hasPossibleTemplateMigrations = true;

  override visitNode(node: ts.Node): void {
    if (this._isImportExpression(node)) {
      this._migrateModuleSpecifier(node.arguments[0]);
    } else if (this._isTypeImportExpression(node)) {
      this._migrateModuleSpecifier(node.argument.literal);
    } else if (ts.isImportDeclaration(node)) {
      // Note: TypeScript enforces the `moduleSpecifier` to be a string literal in its syntax.
      this._migrateModuleSpecifier(node.moduleSpecifier as ts.StringLiteral, node.importClause);
    } else if (
      ts.isDecorator(node) &&
      (this._isNgModuleDecorator(node) || this._isComponentDecorator(node))
    ) {
      this._migrateDecoratorProperties(node as ts.Decorator);
    }
  }

  private _migrateDecoratorProperties(node: ts.Decorator) {
    if (!ts.isCallExpression(node.expression)) {
      return;
    }
    const metadata = node.expression.arguments[0];

    if (!ts.isObjectLiteralExpression(metadata)) {
      return;
    }

    for (const prop of metadata.properties) {
      if (prop.name) {
        switch (getPropertyNameText(prop.name)) {
          case 'imports':
            this._migrateImportsAndExports(prop as ts.PropertyAssignment);
            break;
          case 'exports':
            this._migrateImportsAndExports(prop as ts.PropertyAssignment);
            break;
          case 'styles':
            this._migrateStyles(prop as ts.PropertyAssignment);
            break;
          case 'template':
            if (this._hasPossibleTemplateMigrations) {
              this._migrateTemplate(prop as ts.PropertyAssignment);
            }
            break;
        }
      }
    }
  }

  private _migrateImportsAndExports(node: ts.PropertyAssignment) {
    node.initializer.forEachChild(specifier => {
      // Iterate through all activated migrators and check if the import can be migrated.
      for (const migrator of this.upgradeData) {
        const newSpecifier = migrator.runtime?.updateImportOrExportSpecifier(
          specifier as ts.Identifier,
        );
        if (newSpecifier) {
          this._printAndUpdateNode(specifier.getSourceFile(), specifier, newSpecifier);
          break;
        }
      }
    });
  }

  private _migrateStyles(node: ts.PropertyAssignment) {
    // Create styles migration if no styles have been migrated yet. Needs to be
    // additionally created because the migrations run in isolation.
    if (!this._stylesMigration) {
      this._stylesMigration = new ThemingStylesMigration(
        this.program,
        this.typeChecker,
        this.targetVersion,
        this.context,
        this.upgradeData,
        this.fileSystem,
        this.logger,
      );
    }

    node.initializer.forEachChild(stringLiteralNode => {
      this._migratePropertyAssignment(stringLiteralNode as ts.StringLiteral, this._stylesMigration);
    });
  }

  private _migrateTemplate(node: ts.PropertyAssignment) {
    // Create template migration if no template has been migrated yet. Needs to
    // be additionally created because the migrations run in isolation.
    if (!this._templateMigration) {
      const templateUpgradeData = this.upgradeData.filter(component => component.template);
      // If no component in the upgrade data has a a template migrator, stop
      // trying to migrate any templates from now on
      if (templateUpgradeData.length === 0) {
        this._hasPossibleTemplateMigrations = false;
        return;
      } else {
        this._templateMigration = new TemplateMigration(
          this.program,
          this.typeChecker,
          this.targetVersion,
          this.context,
          templateUpgradeData,
          this.fileSystem,
          this.logger,
        );
      }
    }

    this._migratePropertyAssignment(node.initializer as ts.StringLiteral, this._templateMigration);
  }

  private _migratePropertyAssignment(
    node: ts.StringLiteralLike | ts.Identifier,
    migration: TemplateMigration | ThemingStylesMigration,
  ) {
    let migratedText = migration.migrate(node.text, node.getSourceFile().fileName);
    let migratedTextLines = migratedText.split('\n');

    // Update quotes based on if its multiline or not to avoid compilation errors
    if (migratedTextLines.length > 1) {
      // Add correct identation for new lines before replacing
      migratedText = migratedTextLines
        .map((line: string, index: number) => {
          if (index !== 0 && line != '\n') {
            const leadingWidth = node.getLeadingTriviaWidth();
            if (leadingWidth > 0) {
              line = ' '.repeat(leadingWidth - 1) + line;
            }
          }
          return line;
        })
        .join('\n');

      migratedText = '`' + migratedText + '`';
    } else {
      // Need to grab quotation because it is not included in node.text
      const quotation = node.getText().trimStart()[0];
      migratedText = quotation + migratedText + quotation;
    }

    this._printAndUpdateNode(
      node.getSourceFile(),
      node,
      ts.factory.createRegularExpressionLiteral(migratedText),
    );
  }

  private _migrateModuleSpecifier(
    specifierLiteral: ts.StringLiteralLike,
    importClause?: ts.ImportClause,
  ) {
    const sourceFile = specifierLiteral.getSourceFile();

    // Iterate through all activated migrators and check if the import can be migrated.
    for (const migrator of this.upgradeData) {
      if (importClause && importClause.namedBindings) {
        const importSpecifiers = (importClause.namedBindings as ts.NamedImports).elements;
        importSpecifiers.forEach(importSpecifer => {
          const newImportSpecifier =
            migrator.runtime?.updateImportSpecifierWithPossibleAlias(importSpecifer);

          if (newImportSpecifier) {
            this._printAndUpdateNode(sourceFile, importSpecifer, newImportSpecifier);
          }
        });
      }

      const newModuleSpecifier = migrator.runtime?.updateModuleSpecifier(specifierLiteral) ?? null;

      if (newModuleSpecifier !== null) {
        this._printAndUpdateNode(sourceFile, specifierLiteral, newModuleSpecifier);

        // If the import has been replaced, break the loop as no others can match.
        break;
      }
    }
  }

  /** Gets whether the specified decorator node is for a NgModule declaration  */
  private _isNgModuleDecorator(node: ts.Decorator): boolean {
    const call = node.expression;
    if (!ts.isCallExpression(call) || !ts.isIdentifier(call.expression)) {
      return false;
    }

    return call.expression.text === 'NgModule';
  }

  /** Gets whether the specified decorator node is for a Component declaration */
  private _isComponentDecorator(node: ts.Decorator): boolean {
    const call = node.expression;
    if (!ts.isCallExpression(call) || !ts.isIdentifier(call.expression)) {
      return false;
    }

    return call.expression.text === 'Component';
  }

  /** Gets whether the specified node is an import expression. */
  private _isImportExpression(
    node: ts.Node,
  ): node is ts.CallExpression & {arguments: [ts.StringLiteralLike]} {
    return (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    );
  }

  /** Gets whether the specified node is a type import expression. */
  private _isTypeImportExpression(
    node: ts.Node,
  ): node is ts.ImportTypeNode & {argument: {literal: ts.StringLiteralLike}} {
    return (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal)
    );
  }

  private _printAndUpdateNode(sourceFile: ts.SourceFile, oldNode: ts.Node, newNode: ts.Node) {
    const filePath = this.fileSystem.resolve(sourceFile.fileName);
    const newNodeText = this._printer.printNode(ts.EmitHint.Unspecified, newNode, sourceFile);
    const start = oldNode.getStart();
    const width = oldNode.getWidth();

    this.fileSystem.edit(filePath).remove(start, width).insertRight(start, newNodeText);
  }
}
