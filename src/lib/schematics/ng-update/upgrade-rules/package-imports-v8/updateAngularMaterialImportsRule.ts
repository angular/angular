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
 * Regex for testing file paths against to determinte if the file is from the
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
 * @angular/material module.
 */
function walk(ctx: Lint.WalkContext<boolean>, checker: ts.TypeChecker): void {
  // The source file to walk.
  const sf = ctx.sourceFile;
  const cb = (declaration: ts.Node) => {
    // Only look at import declarations.
    if (!ts.isImportDeclaration(declaration)) {
      return;
    }
    const importLocation = declaration.moduleSpecifier.getText(sf);
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

    // Map of submodule locations to arrays of imported symbols.
    const importMap = new Map<string, Set<string>>();

    // Determine the subpackage each symbol in the namedBinding comes from.
    for (const element of declaration.importClause.namedBindings.elements) {
      // Confirm the named import is a symbol that can be looked up.
      if (!ts.isIdentifier(element.name)) {
        return ctx.addFailureAtNode(
            element, element.getFullText(sf) + Rule.SYMBOL_NOT_FOUND_FAILURE_STR);
      }
      // Get the type for the named binding element.
      const type = checker.getTypeAtLocation(element.name);
      // Get the original symbol where it is declared upstream.
      const symbol = type.getSymbol();

      // If the symbol can't be found, add failure saying the symbol
      // can't be found.
      if (!symbol || !symbol.valueDeclaration) {
        return ctx.addFailureAtNode(
            element, element.getFullText(sf) + Rule.SYMBOL_NOT_FOUND_FAILURE_STR);
      }

      // If the symbol has no declarations, add failure saying the symbol can't
      // be found.
      if (!symbol.declarations || !symbol.declarations.length) {
        return ctx.addFailureAtNode(
            element, element.getFullText(sf) + Rule.SYMBOL_NOT_FOUND_FAILURE_STR);
      }

      // The filename for the source file of the node that contains the
      // first declaration of the symbol.  All symbol declarations must be
      // part of a defining node, so parent can be asserted to be defined.
      const sourceFile = symbol.valueDeclaration.getSourceFile().fileName;
      // File the module the symbol belongs to from a regex match of the
      // filename. This will always match since only @angular/material symbols
      // are being looked at.
      const [, moduleName] = sourceFile.match(ANGULAR_MATERIAL_FILEPATH_REGEX) || [] as undefined[];
      if (!moduleName) {
        return ctx.addFailureAtNode(
            element, element.getFullText(sf) + Rule.SYMBOL_FILE_NOT_FOUND_FAILURE_STR);
      }
      // The module name where the symbol is defined e.g. card, dialog.  The
      // first capture group is contains the module name.
      if (importMap.has(moduleName)) {
        importMap.get(moduleName)!.add(symbol.getName());
      } else {
        importMap.set(moduleName, new Set([symbol.getName()]));
      }
    }
    const fix = buildSecondaryImportStatements(importMap);

    // Without a fix to provide, show error message only.
    if (!fix) {
      return ctx.addFailureAtNode(declaration.moduleSpecifier, Rule.ONLY_SUBPACKAGE_FAILURE_STR);
    }
    // Mark the lint failure at the module specifier, providing a
    // recommended fix.
    ctx.addFailureAtNode(
        declaration.moduleSpecifier, Rule.ONLY_SUBPACKAGE_FAILURE_STR,
        new Lint.Replacement(declaration.getStart(sf), declaration.getWidth(), fix));
  };
  sf.statements.forEach(cb);
}

/**
 * Builds the recommended fix from a map of the imported symbols found in the
 * import declaration.  Imports declarations are sorted by module, then by
 * symbol within each import declaration.
 *
 * Example of the format:
 *
 * import {MatCardModule, MatCardTitle} from '@angular/material/card';
 * import {MatRadioModule} from '@angular/material/radio';
 */
function buildSecondaryImportStatements(importMap: Map<string, Set<string>>): string {
  return Array.from(importMap.entries())
      .sort((a, b) => a[0] > b[0] ? 1 : -1)
      .map(entry => {
        const imports = Array.from(entry[1]).sort((a, b) => a > b ? 1 : -1).join(', ');
        return `import {${imports}} from '@angular/material/${entry[0]}';\n`;
      })
      .join('');
}
