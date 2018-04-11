import {green, red} from 'chalk';
import {relative} from 'path';
import {ProgramAwareRuleWalker, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';
import {classNames} from '../material/component-data';
import {
  isMaterialExportDeclaration,
  isMaterialImportDeclaration,
} from '../material/typescript-specifiers';
import {getOriginalSymbolFromNode} from '../typescript/identifiers';
import {
  isExportSpecifierNode,
  isImportSpecifierNode,
  isNamespaceImportNode
} from '../typescript/imports';

/**
 * Rule that walks through every identifier that is part of Angular Material and replaces the
 * outdated name with the new one.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithWalker(
        new SwitchIdentifiersWalker(sourceFile, this.getOptions(), program));
  }
}

export class SwitchIdentifiersWalker extends ProgramAwareRuleWalker {
  constructor(sf, opt, prog) {
    super(sf, opt, prog);
  }

  /** List of Angular Material declarations inside of the current source file. */
  materialDeclarations: ts.Declaration[] = [];

  /** List of Angular Material namespace declarations in the current source file. */
  materialNamespaceDeclarations: ts.Declaration[] = [];

  /** Method that is called for every identifier inside of the specified project. */
  visitIdentifier(identifier: ts.Identifier) {
    // Store Angular Material namespace identifers in a list of declarations.
    // Namespace identifiers can be: `import * as md from '@angular/material';`
    this._storeNamespaceImports(identifier);

    // For identifiers that aren't listed in the className data, the whole check can be
    // skipped safely.
    if (!classNames.some(data => data.replace === identifier.text)) {
      return;
    }

    const symbol = getOriginalSymbolFromNode(identifier, this.getTypeChecker());

    // If the symbol is not defined or could not be resolved, just skip the following identifier
    // checks.
    if (!symbol || !symbol.name || symbol.name === 'unknown') {
      console.error(`Could not resolve symbol for identifier "${identifier.text}" ` +
          `in file ${this._getRelativeFileName()}`);
      return;
    }

    // For export declarations that are referring to Angular Material, the identifier should be
    // switched to the new name.
    if (isExportSpecifierNode(identifier) && isMaterialExportDeclaration(identifier)) {
      return this.createIdentifierFailure(identifier, symbol);
    }

    // For import declarations that are referring to Angular Material, the value declarations
    // should be stored so that other identifiers in the file can be compared.
    if (isImportSpecifierNode(identifier) && isMaterialImportDeclaration(identifier)) {
      this.materialDeclarations.push(symbol.valueDeclaration);
    }

    // For identifiers that are not part of an import or export, the list of Material declarations
    // should be checked to ensure that only identifiers of Angular Material are updated.
    // Identifiers that are imported through an Angular Material namespace will be updated.
    else if (this.materialDeclarations.indexOf(symbol.valueDeclaration) === -1 &&
              !this._isIdentifierFromNamespace(identifier)) {
      return;
    }

    return this.createIdentifierFailure(identifier, symbol);
  }

  /** Creates a failure and replacement for the specified identifier. */
  private createIdentifierFailure(identifier: ts.Identifier, symbol: ts.Symbol) {
    let classData = classNames.find(
        data => data.replace === symbol.name || data.replace === identifier.text);

    if (!classData) {
      console.error(`Could not find updated name for identifier "${identifier.getText()}" in ` +
          ` in file ${this._getRelativeFileName()}.`);
      return;
    }

    const replacement = this.createReplacement(
        identifier.getStart(), identifier.getWidth(), classData.replaceWith);

    this.addFailureAtNode(
        identifier,
        `Found deprecated identifier "${red(classData.replace)}" which has been renamed to` +
        ` "${green(classData.replaceWith)}"`,
        replacement);
  }

  /** Checks namespace imports from Angular Material and stores them in a list. */
  private _storeNamespaceImports(identifier: ts.Identifier) {
    // In some situations, developers will import Angular Material completely using a namespace
    // import. This is not recommended, but should be still handled in the migration tool.
    if (isNamespaceImportNode(identifier) && isMaterialImportDeclaration(identifier)) {
      const symbol = getOriginalSymbolFromNode(identifier, this.getTypeChecker());

      if (symbol) {
        return this.materialNamespaceDeclarations.push(symbol.valueDeclaration);
      }
    }
  }

  /** Checks whether the given identifier is part of the Material namespace. */
  private _isIdentifierFromNamespace(identifier: ts.Identifier) {
    if (identifier.parent && identifier.parent.kind !== ts.SyntaxKind.PropertyAccessExpression) {
      return;
    }

    const propertyExpression = identifier.parent as ts.PropertyAccessExpression;
    const expressionSymbol = getOriginalSymbolFromNode(propertyExpression.expression,
        this.getTypeChecker());

    return this.materialNamespaceDeclarations.indexOf(expressionSymbol.valueDeclaration) !== -1;
  }

  /** Returns the current source file path relative to the root directory of the project. */
  private _getRelativeFileName(): string {
    return relative(this.getProgram().getCurrentDirectory(), this.getSourceFile().fileName);
  }
}
