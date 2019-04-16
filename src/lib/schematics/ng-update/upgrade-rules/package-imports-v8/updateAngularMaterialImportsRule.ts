/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as Lint from 'tslint';
import * as ts from 'typescript';
import {materialModuleSpecifier} from '../../../ng-update/typescript/module-specifiers';

/**
 * Regex for testing file paths against to determine if the file is from the
 * Angular Material library.
 */
const ANGULAR_MATERIAL_FILEPATH_REGEX = new RegExp(`${materialModuleSpecifier}/(.*?)/`);

/**
 * A TSLint rule correcting symbols imports to using Angular Material
 * subpackages (e.g. @angular/material/button) rather than the top level
 * package (e.g. @angular/material).
 */
export class Rule extends Lint.Rules.TypedRule {
  static metadata: Lint.IRuleMetadata = {
    ruleName: 'update-angular-material-imports',
    description: Lint.Utils.dedent`
        Require all imports for Angular Material to be done via
        @angular/material subpackages`,
    options: null,
    optionsDescription: '',
    type: 'functionality',
    typescriptOnly: true,
  };

  static ONLY_SUBPACKAGE_FAILURE_STR = Lint.Utils.dedent`
      Importing from @angular/material is deprecated. Instead import from
      subpackage the symbol belongs to. e.g. import {MatButtonModule} from
      '@angular/material/button'`;
  static NO_IMPORT_NAMED_SYMBOLS_FAILURE_STR = Lint.Utils.dedent`
      Imports from Angular Material should import specific symbols rather than
      importing the entire Angular Material library.`;
  static SYMBOL_NOT_FOUND_FAILURE_STR = ` was not found in the Material library.`;
  static SYMBOL_FILE_NOT_FOUND_FAILURE_STR =
      ` was found to be imported from a file outside the Material library.`;

  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk, true, program.getTypeChecker());
  }
}

/**
 * A walker to walk a given source file to check for imports from the
 * "@angular/material" module.
 */
function walk(ctx: Lint.WalkContext<boolean>, checker: ts.TypeChecker): void {
  // The source file to walk.
  const sf = ctx.sourceFile;
  const printer = ts.createPrinter();
  const cb = (declaration: ts.Node) => {
    // Only look at import declarations.
    if (!ts.isImportDeclaration(declaration) ||
        !ts.isStringLiteralLike(declaration.moduleSpecifier)) {
      return;
    }

    const importLocation = declaration.moduleSpecifier.text;
    // If the import module is not @angular/material, skip check.
    if (importLocation !== materialModuleSpecifier) {
      return;
    }

    // If no import clause is found, or nothing is named as a binding in the
    // import, add failure saying to import symbols in clause.
    if (!declaration.importClause || !declaration.importClause.namedBindings) {
      return ctx.addFailureAtNode(declaration, Rule.NO_IMPORT_NAMED_SYMBOLS_FAILURE_STR);
    }

    // All named bindings in import clauses must be named symbols, otherwise add
    // failure saying to import symbols in clause.
    if (!ts.isNamedImports(declaration.importClause.namedBindings)) {
      return ctx.addFailureAtNode(declaration, Rule.NO_IMPORT_NAMED_SYMBOLS_FAILURE_STR);
    }

    // If no symbols are in the named bindings then add failure saying to
    // import symbols in clause.
    if (!declaration.importClause.namedBindings.elements.length) {
      return ctx.addFailureAtNode(declaration, Rule.NO_IMPORT_NAMED_SYMBOLS_FAILURE_STR);
    }

    // Map which consists of secondary entry-points and import specifiers which are used
    // within the current import declaration.
    const importMap = new Map<string, ts.ImportSpecifier[]>();

    // Determine the subpackage each symbol in the namedBinding comes from.
    for (const element of declaration.importClause.namedBindings.elements) {
      const elementName = element.propertyName ? element.propertyName : element.name;

      // Get the symbol for the named binding element. Note that we cannot determine the
      // value declaration based on the type of the element as types are not necessarily
      // specific to a given secondary entry-point (e.g. exports with the type of "string")
      // would resolve to the module types provided by TypeScript itself.
      const symbol = getDeclarationSymbolOfNode(elementName, checker);

      // If the symbol can't be found, add failure saying the symbol
      // can't be found.
      if (!symbol || !symbol.valueDeclaration) {
        return ctx.addFailureAtNode(element, element.getText() + Rule.SYMBOL_NOT_FOUND_FAILURE_STR);
      }

      // The filename for the source file of the node that contains the
      // first declaration of the symbol. All symbol declarations must be
      // part of a defining node, so parent can be asserted to be defined.
      const sourceFile: string = symbol.valueDeclaration.getSourceFile().fileName;

      // File the module the symbol belongs to from a regex match of the
      // filename. This will always match since only "@angular/material"
      // elements are analyzed.
      const matches = sourceFile.match(ANGULAR_MATERIAL_FILEPATH_REGEX);
      if (!matches) {
        return ctx.addFailureAtNode(
            element, element.getText() + Rule.SYMBOL_FILE_NOT_FOUND_FAILURE_STR);
      }
      const [, moduleName] = matches;

      // The module name where the symbol is defined e.g. card, dialog. The
      // first capture group is contains the module name.
      if (importMap.has(moduleName)) {
        importMap.get(moduleName)!.push(element);
      } else {
        importMap.set(moduleName, [element]);
      }
    }

    // Transforms the import declaration into multiple import declarations that import
    // the given symbols from the individual secondary entry-points. For example:
    // import {MatCardModule, MatCardTitle} from '@angular/material/card';
    // import {MatRadioModule} from '@angular/material/radio';
    const newImportStatements =
        Array.from(importMap.entries())
            .sort()
            .map(([name, elements]) => {
              const newImport = ts.createImportDeclaration(
                  undefined, undefined,
                  ts.createImportClause(undefined, ts.createNamedImports(elements)),
                  ts.createStringLiteral(`${materialModuleSpecifier}/${name}`));
              return printer.printNode(ts.EmitHint.Unspecified, newImport, sf);
            })
            .join('\n');

    // Without any import statements that were generated, we can assume that this was an empty
    // import declaration. We still want to add a failure in order to make developers aware that
    // importing from "@angular/material" is deprecated.
    if (!newImportStatements) {
      return ctx.addFailureAtNode(declaration.moduleSpecifier, Rule.ONLY_SUBPACKAGE_FAILURE_STR);
    }

    // Mark the lint failure at the module specifier, providing the replacement that switches
    // the import to individual secondary entry-point imports.
    ctx.addFailureAtNode(
        declaration.moduleSpecifier, Rule.ONLY_SUBPACKAGE_FAILURE_STR,
        new Lint.Replacement(declaration.getStart(), declaration.getWidth(), newImportStatements));
  };

  sf.statements.forEach(cb);
}

/** Gets the symbol that contains the value declaration of the given node. */
function getDeclarationSymbolOfNode(node: ts.Node, checker: ts.TypeChecker) {
  const symbol = checker.getSymbolAtLocation(node);

  // Symbols can be aliases of the declaration symbol. e.g. in named import specifiers.
  // We need to resolve the aliased symbol back to the declaration symbol.
  // tslint:disable-next-line:no-bitwise
  if (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
    return checker.getAliasedSymbol(symbol);
  }
  return symbol;
}
