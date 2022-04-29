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

export class RuntimeCodeMigration extends Migration<ComponentMigrator[], SchematicContext> {
  enabled = true;

  private _printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});

  override visitNode(node: ts.Node): void {
    if (this._isImportExpression(node)) {
      this._migrateModuleSpecifier(node.arguments[0]);
    } else if (this._isTypeImportExpression(node)) {
      this._migrateModuleSpecifier(node.argument.literal);
    } else if (ts.isImportDeclaration(node)) {
      // Note: TypeScript enforces the `moduleSpecifier` to be a string literal in its syntax.
      this._migrateModuleSpecifier(node.moduleSpecifier as ts.StringLiteral);
    }
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
