/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration} from '@angular/cdk/schematics';
import {SchematicContext} from '@angular-devkit/schematics';
import {ComponentMigrator} from '../index';
import * as ts from 'typescript';
import {ThemingStylesMigration} from '../theming-styles';

export class RuntimeCodeMigration extends Migration<ComponentMigrator[], SchematicContext> {
  enabled = true;

  private _printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});
  private _stylesMigration: ThemingStylesMigration;

  override visitNode(node: ts.Node): void {
    if (this._isImportExpression(node)) {
      this._migrateModuleSpecifier(node.arguments[0]);
    } else if (this._isTypeImportExpression(node)) {
      this._migrateModuleSpecifier(node.argument.literal);
    } else if (ts.isImportDeclaration(node)) {
      // Note: TypeScript enforces the `moduleSpecifier` to be a string literal in its syntax.
      this._migrateModuleSpecifier(node.moduleSpecifier as ts.StringLiteral);
    } else if (this._isComponentDecorator(node)) {
      this._migrateTemplatesAndStyles(node);
    }
  }

  private _migrateTemplatesAndStyles(node: ts.Node): void {
    if (node.getChildCount() > 0) {
      if (node.kind === ts.SyntaxKind.PropertyAssignment) {
        // The first child node will always be the identifier for a property
        // assignment node
        const identifier = node.getChildAt(0);
        if (identifier.getText() === 'styles') {
          this._migrateStyles(node);
        }
      } else {
        node.forEachChild(child => this._migrateTemplatesAndStyles(child));
      }
    }
  }

  private _migrateStyles(node: ts.Node) {
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

    node.forEachChild(childNode => {
      if (childNode.kind === ts.SyntaxKind.ArrayLiteralExpression) {
        childNode.forEachChild(stringLiteralNode => {
          if (stringLiteralNode.kind === ts.SyntaxKind.StringLiteral) {
            let nodeText = stringLiteralNode.getText();
            const trimmedNodeText = nodeText.trimStart().trimEnd();
            // Remove quotation marks from string since not valid CSS to migrate
            const nodeTextWithoutQuotes = trimmedNodeText.substring(1, trimmedNodeText.length - 1);
            let migratedStyles = this._stylesMigration.migrateStyles(nodeTextWithoutQuotes);
            const migratedStylesLines = migratedStyles.split('\n');
            const isMultiline = migratedStylesLines.length > 1;

            // If migrated text is now multiline, update quotes to avoid
            // compilation errors
            if (isMultiline) {
              nodeText = nodeText.replace(trimmedNodeText, '`' + nodeTextWithoutQuotes + '`');
            }

            this._printAndUpdateNode(
              stringLiteralNode.getSourceFile(),
              stringLiteralNode,
              ts.factory.createRegularExpressionLiteral(
                nodeText.replace(
                  nodeTextWithoutQuotes,
                  migratedStylesLines
                    .map((line, index) => {
                      // Only need to worry about indentation when adding new lines
                      if (isMultiline && index !== 0 && line != '\n') {
                        const leadingWidth = stringLiteralNode.getLeadingTriviaWidth();
                        if (leadingWidth > 0) {
                          line = ' '.repeat(leadingWidth - 1) + line;
                        }
                      }
                      return line;
                    })
                    .join('\n'),
                ),
              ),
            );
          }
        });
      }
    });
  }

  private _migrateModuleSpecifier(specifierLiteral: ts.StringLiteralLike) {
    const sourceFile = specifierLiteral.getSourceFile();

    // Iterate through all activated migrators and check if the import can be migrated.
    for (const migrator of this.upgradeData) {
      const newModuleSpecifier = migrator.runtime?.updateModuleSpecifier(specifierLiteral) ?? null;

      if (newModuleSpecifier !== null) {
        this._printAndUpdateNode(sourceFile, specifierLiteral, newModuleSpecifier);

        // If the import has been replaced, break the loop as no others can match.
        break;
      }
    }
  }

  /** Gets whether the specified node is a component decorator for a class */
  private _isComponentDecorator(node: ts.Node): boolean {
    return node.kind === ts.SyntaxKind.Decorator && node.getText().startsWith('@Component');
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
