/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import * as postcss from 'postcss';
import * as scss from 'postcss-scss';

import {
  CUSTOM_TS_SYMBOL_RENAMINGS,
  MAT_IMPORT_CHANGES,
  MDC_IMPORT_CHANGES,
  MIXINS,
} from './constants';

import {Migration, ResolvedResource, TargetVersion, WorkspacePath} from '@angular/cdk/schematics';

export class LegacyComponentsMigration extends Migration<null> {
  enabled = this.targetVersion === TargetVersion.V15;

  override visitStylesheet(stylesheet: ResolvedResource): void {
    let namespace: string | undefined = undefined;
    const processor = new postcss.Processor([
      {
        postcssPlugin: 'legacy-components-v15-plugin',
        AtRule: {
          use: node => {
            namespace = namespace ?? this._parseSassNamespace(node);
          },
          include: node => this._handleAtInclude(node, stylesheet.filePath, namespace),
        },
      },
    ]);
    processor.process(stylesheet.content, {syntax: scss}).sync();
  }

  /** Returns the namespace of the given at-rule if it is importing from @angular/material. */
  private _parseSassNamespace(node: postcss.AtRule): string | undefined {
    if (node.params.startsWith('@angular/material', 1)) {
      return node.params.split(/\s+/).pop();
    }
    return;
  }

  /** Handles updating the at-include rules of legacy component mixins. */
  private _handleAtInclude(
    node: postcss.AtRule,
    filePath: WorkspacePath,
    namespace?: string,
  ): void {
    if (!namespace || !node.source?.start) {
      return;
    }
    if (this._isLegacyMixin(node, namespace)) {
      this._replaceAt(filePath, node.source.start.offset, {
        old: `${namespace}.`,
        new: `${namespace}.legacy-`,
      });
    }
  }

  /** Returns true if the given at-include rule is a use of a legacy component mixin. */
  private _isLegacyMixin(node: postcss.AtRule, namespace: string): boolean {
    for (let i = 0; i < MIXINS.length; i++) {
      if (node.params.startsWith(`${namespace}.${MIXINS[i]}`)) {
        return true;
      }
    }
    return false;
  }

  override visitNode(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) {
      this._handleImportDeclaration(node);
      return;
    }
    if (this._isDestructuredAsyncLegacyImport(node)) {
      this._handleDestructuredAsyncImport(node);
      return;
    }
    if (this._isImportCallExpression(node)) {
      this._handleImportExpression(node);
      return;
    }
  }

  /**
   * Handles updating the module specifier of
   * @angular/material and @angular/material-experimental imports.
   *
   * Also updates the named import bindings of @angular/material imports.
   */
  private _handleImportDeclaration(node: ts.ImportDeclaration): void {
    const moduleSpecifier = node.moduleSpecifier as ts.StringLiteral;

    const matImportChange = this._findMatImportChange(moduleSpecifier);
    if (matImportChange) {
      this._tsReplaceAt(node, matImportChange);

      if (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
        this._handleNamedImportBindings(node.importClause.namedBindings);
      }
    }

    const mdcImportChange = this._findMdcImportChange(moduleSpecifier);
    if (mdcImportChange) {
      this._tsReplaceAt(node, mdcImportChange);
    }
  }

  /**
   * Handles updating the module specifier of
   * @angular/material and @angular/material-experimental import expressions.
   */
  private _handleImportExpression(node: ts.CallExpression): void {
    const moduleSpecifier = node.arguments[0] as ts.StringLiteral;

    const matImportChange = this._findMatImportChange(moduleSpecifier);
    if (matImportChange) {
      this._tsReplaceAt(node, matImportChange);
      return;
    }

    const mdcImportChange = this._findMdcImportChange(moduleSpecifier);
    if (mdcImportChange) {
      this._tsReplaceAt(node, mdcImportChange);
    }
  }

  /** Handles updating the named bindings of awaited @angular/material import expressions. */
  private _handleDestructuredAsyncImport(
    node: ts.VariableDeclaration & {name: ts.ObjectBindingPattern},
  ): void {
    for (let i = 0; i < node.name.elements.length; i++) {
      this._handleNamedBindings(node.name.elements[i]);
    }
  }

  /** Handles updating the named bindings of @angular/material imports. */
  private _handleNamedImportBindings(node: ts.NamedImports): void {
    for (let i = 0; i < node.elements.length; i++) {
      this._handleNamedBindings(node.elements[i]);
    }
  }

  /** Handles updating the named bindings of @angular/material imports and import expressions. */
  private _handleNamedBindings(node: ts.ImportSpecifier | ts.BindingElement): void {
    const name = node.propertyName ? node.propertyName : node.name;
    if (!ts.isIdentifier(name)) {
      return;
    }

    const separator = ts.isImportSpecifier(node) ? ' as ' : ': ';
    const oldExport = name.escapedText.toString();

    // Handle TS Symbols that have non-standard renamings.
    const customMapping = CUSTOM_TS_SYMBOL_RENAMINGS.find(v => v.old === oldExport);
    if (customMapping) {
      const replacement = node.propertyName
        ? customMapping.new
        : `${customMapping.new}${separator}${customMapping.old}`;
      this._tsReplaceAt(name, {old: oldExport, new: replacement});
      return;
    }

    // Handle TS Symbols that have standard renamings.
    const newExport = this._parseMatSymbol(oldExport);
    if (newExport) {
      const replacement = node.propertyName ? newExport : `${newExport}${separator}${oldExport}`;
      this._tsReplaceAt(name, {old: oldExport, new: replacement});
      return;
    }
  }

  /** Returns the new symbol to be used for a given standard mat symbol.   */
  private _parseMatSymbol(symbol: string): string | undefined {
    if (symbol.startsWith('Mat')) {
      return `MatLegacy${symbol.slice('Mat'.length)}`;
    }
    if (symbol.startsWith('mat')) {
      return `matLegacy${symbol.slice('mat'.length)}`;
    }
    if (symbol.startsWith('_Mat')) {
      return `_MatLegacy${symbol.slice('_Mat'.length)}`;
    }
    if (symbol.startsWith('MAT_')) {
      return `MAT_LEGACY_${symbol.slice('MAT_'.length)}`;
    }
    if (symbol.startsWith('_MAT_')) {
      return `_MAT_LEGACY_${symbol.slice('_MAT_'.length)}`;
    }
    return;
  }

  /**
   * Returns true if the given node is a variable declaration
   * assigns the awaited result of an @angular/material import
   * expression using an object binding.
   */
  private _isDestructuredAsyncLegacyImport(node: ts.Node): node is ts.VariableDeclaration & {
    name: ts.ObjectBindingPattern;
    initializer: ts.AwaitExpression & {expression: ts.CallExpression} & {
      arguments: [ts.StringLiteralLike];
    };
  } {
    return (
      ts.isVariableDeclaration(node) &&
      !!node.initializer &&
      ts.isAwaitExpression(node.initializer) &&
      this._isImportCallExpression(node.initializer.expression) &&
      ts.isStringLiteral(node.initializer.expression.arguments[0]) &&
      !!this._findMatImportChange(node.initializer.expression.arguments[0]) &&
      ts.isObjectBindingPattern(node.name)
    );
  }

  /** Gets whether the specified node is an import expression. */
  private _isImportCallExpression(
    node: ts.Node,
  ): node is ts.CallExpression & {arguments: [ts.StringLiteralLike]} {
    return (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    );
  }

  private _findMatImportChange(
    moduleSpecifier: ts.StringLiteral,
  ): {old: string; new: string} | undefined {
    return MAT_IMPORT_CHANGES.find(change => change.old === moduleSpecifier.text);
  }

  private _findMdcImportChange(
    moduleSpecifier: ts.StringLiteral,
  ): {old: string; new: string} | undefined {
    return MDC_IMPORT_CHANGES.find(change => change.old === moduleSpecifier.text);
  }

  /** Updates the source file of the given ts node with the given replacements. */
  private _tsReplaceAt(node: ts.Node, str: {old: string; new: string}): void {
    const filePath = this.fileSystem.resolve(node.getSourceFile().fileName);
    this._replaceAt(filePath, node.pos, str);
  }

  /** Updates the source file with the given replacements. */
  private _replaceAt(
    filePath: WorkspacePath,
    offset: number,
    str: {old: string; new: string},
  ): void {
    const index = this.fileSystem.read(filePath)!.indexOf(str.old, offset);
    this.fileSystem.edit(filePath).remove(index, str.old.length).insertRight(index, str.new);
  }
}
