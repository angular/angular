/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, getPropertyNameText} from '@angular/cdk/schematics';
import {SchematicContext} from '@angular-devkit/schematics';
import {ComponentMigrator, LEGACY_MODULES} from '../index';
import * as ts from 'typescript';
import {ThemingStylesMigration} from '../theming-styles';
import {TemplateMigration} from '../template-migration';

type Replacement = [node: ts.Node, newText: string];

export class RuntimeCodeMigration extends Migration<ComponentMigrator[], SchematicContext> {
  enabled = true;

  private _printer = ts.createPrinter({newLine: ts.NewLineKind.LineFeed});
  private _stylesMigration: ThemingStylesMigration;
  private _templateMigration: TemplateMigration;
  private _hasPossibleTemplateMigrations = true;

  override visitNode(node: ts.Node): void {
    if (ts.isSourceFile(node)) {
      this._migrateSourceFileReferences(node);
    } else if (this._isComponentDecorator(node)) {
      this._migrateComponentDecorator(node as ts.Decorator);
    } else if (this._isImportExpression(node)) {
      this._migrateModuleSpecifier(node.arguments[0]);
    } else if (this._isTypeImportExpression(node)) {
      this._migrateModuleSpecifier(node.argument.literal);
    }
  }

  /** Runs the SourceFile-level migrations, including renaming imports and references. */
  private _migrateSourceFileReferences(sourceFile: ts.SourceFile) {
    const {importSpecifiersToNewNames, identifiersToImportSpecifiers, moduleSpecifiers} =
      this._findImportsToMigrate(sourceFile);

    [
      ...this._renameModuleSpecifiers(moduleSpecifiers),
      ...this._renameReferences(
        sourceFile,
        identifiersToImportSpecifiers,
        importSpecifiersToNewNames,
      ),
    ]
      .sort(([a], [b]) => b.getStart() - a.getStart())
      .forEach(([currentNode, newName]) => {
        this._printAndUpdateNode(sourceFile, currentNode, newName);
      });
  }

  /** Finds the imported symbols in a file that need to be migrated. */
  private _findImportsToMigrate(sourceFile: ts.SourceFile) {
    const importSpecifiersToNewNames = new Map<ts.ImportSpecifier, string>();
    const moduleSpecifiers = new Map<ts.StringLiteral, string>();
    const identifiersToImportSpecifiers = new Map<string, ts.ImportSpecifier>();

    for (const statement of sourceFile.statements) {
      if (
        ts.isImportDeclaration(statement) &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.importClause?.namedBindings &&
        ts.isNamedImports(statement.importClause.namedBindings) &&
        LEGACY_MODULES.has(statement.moduleSpecifier.text)
      ) {
        statement.importClause.namedBindings.elements.forEach(element => {
          const oldName = (element.propertyName || element.name).text;
          const newName = this._removeLegacy(oldName);

          if (newName) {
            importSpecifiersToNewNames.set(element, newName);

            // Skip aliased imports since they only need to be renamed in the import declaration.
            if (!element.propertyName) {
              identifiersToImportSpecifiers.set(oldName, element);
            }
          }
        });

        const newModuleSpecifier = this._removeLegacy(statement.moduleSpecifier.text);

        if (newModuleSpecifier) {
          moduleSpecifiers.set(statement.moduleSpecifier, newModuleSpecifier);
        }
      }
    }

    return {importSpecifiersToNewNames, identifiersToImportSpecifiers, moduleSpecifiers};
  }

  /** Renames all of the references to imported legacy symbols. */
  private _renameReferences(
    sourceFile: ts.SourceFile,
    identifiersToImportSpecifiers: Map<string, ts.ImportSpecifier>,
    importSpecifiersToNewNames: Map<ts.ImportSpecifier, string>,
  ): Replacement[] {
    if (importSpecifiersToNewNames.size === 0) {
      return [];
    }

    const replacements: Replacement[] = [];
    const walk = (node: ts.Node) => {
      // Imports are handled separately.
      if (ts.isImportDeclaration(node)) {
        return;
      }

      if (ts.isIdentifier(node)) {
        const specifier = identifiersToImportSpecifiers.get(node.text);

        if (specifier && this._isReferenceToImport(node, specifier)) {
          replacements.push([node, importSpecifiersToNewNames.get(specifier)!]);
        }
      }

      node.forEachChild(walk);
    };

    sourceFile.forEachChild(walk);

    importSpecifiersToNewNames.forEach((newName, specifier) => {
      if (specifier.propertyName) {
        replacements.push([
          // If the import looks like `import {OldName as NewName} from ...;`,
          // we drop the alias and simplify the import to `import {NewName} from ...`.
          specifier.name.text === newName ? specifier : specifier.propertyName,
          newName,
        ]);
      } else {
        replacements.push([specifier.name, newName]);
      }
    });

    return replacements;
  }

  /** Renames all of the legacy module import specifiers. */
  private _renameModuleSpecifiers(moduleSpecifiers: Map<ts.StringLiteral, string>): Replacement[] {
    const replacements: Replacement[] = [];

    for (const [specifier, newName] of moduleSpecifiers.entries()) {
      const quoteStyle = specifier.getText()[0];
      replacements.push([specifier, quoteStyle + newName + quoteStyle]);
    }

    return replacements;
  }

  /** Migrates the `@Component` metadata. */
  private _migrateComponentDecorator(node: ts.Decorator) {
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

  private _migrateModuleSpecifier(specifier: ts.StringLiteralLike) {
    const newName = this._removeLegacy(specifier.text);

    if (newName) {
      const quoteStyle = specifier.getText()[0];
      this._printAndUpdateNode(
        specifier.getSourceFile(),
        specifier,
        quoteStyle + newName + quoteStyle,
      );
    }
  }

  /** Gets whether the specified decorator node is for a Component declaration */
  private _isComponentDecorator(node: ts.Node): node is ts.Decorator {
    if (!ts.isDecorator(node)) {
      return false;
    }

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

  private _printAndUpdateNode(
    sourceFile: ts.SourceFile,
    oldNode: ts.Node,
    newNode: ts.Node | string,
  ) {
    const filePath = this.fileSystem.resolve(sourceFile.fileName);
    const newNodeText =
      typeof newNode === 'string'
        ? newNode
        : this._printer.printNode(ts.EmitHint.Unspecified, newNode, sourceFile);
    const start = oldNode.getStart();
    const width = oldNode.getWidth();

    this.fileSystem.edit(filePath).remove(start, width).insertRight(start, newNodeText);
  }

  /** Checks whether a specifier identifier is referring to an imported symbol. */
  private _isReferenceToImport(node: ts.Identifier, importSpecifier: ts.ImportSpecifier): boolean {
    if ((importSpecifier.propertyName || importSpecifier.name).text !== node.text) {
      return false;
    }

    const nodeSymbol = this.typeChecker.getTypeAtLocation(node).getSymbol();
    const importSymbol = this.typeChecker.getTypeAtLocation(importSpecifier).getSymbol();

    // This can happen for type references.
    if (!nodeSymbol && !importSymbol) {
      return this.typeChecker.getSymbolAtLocation(node)?.declarations?.[0] === importSpecifier;
    }

    return (
      !!(nodeSymbol?.declarations?.[0] && importSymbol?.declarations?.[0]) &&
      nodeSymbol.declarations[0] === importSymbol.declarations[0]
    );
  }

  /**
   * Strips "legacy" from the name of a symbol or an import.
   * Returns null if it doesn't have a legacy name.
   */
  private _removeLegacy(name: string): string | null {
    const legacyRegex = /legacy[_-]?/i;
    return legacyRegex.test(name) ? name.replace(legacyRegex, '') : null;
  }
}
