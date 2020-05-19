/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {hasNameIdentifier} from '../utils';

/**
 * Consider the following ES5 code that may have been generated for a class:
 *
 * ```
 * var A = (function(){
 *   function A() {}
 *   return A;
 * }());
 * A.staticProp = true;
 * ```
 *
 * Here, TypeScript marks the symbol for "A" as a so-called "expando symbol", which causes
 * "staticProp" to be added as an export of the "A" symbol.
 *
 * In the example above, symbol "A" has been assigned some flags to indicate that it represents a
 * class. Due to this flag, the symbol is considered an expando symbol and as such, "staticProp" is
 * stored in `ts.Symbol.exports`.
 *
 * A problem arises when "A" is not at the top-level, i.e. in UMD bundles. In that case, the symbol
 * does not have the flag that marks the symbol as a class. Therefore, TypeScript inspects "A"'s
 * initializer expression, which is an IIFE in the above example. Unfortunately however, only IIFEs
 * of the form `(function(){})()` qualify as initializer for an "expando symbol"; the slightly
 * different form seen in the example above, `(function(){}())`, does not. This prevents the "A"
 * symbol from being considered an expando symbol, in turn preventing "staticProp" from being stored
 * in `ts.Symbol.exports`.
 *
 * The logic for identifying symbols as "expando symbols" can be found here:
 * https://github.com/microsoft/TypeScript/blob/v3.4.5/src/compiler/binder.ts#L2656-L2685
 *
 * Notice how the `getExpandoInitializer` function is available on the "ts" namespace in the
 * compiled bundle, so we are able to override this function to accommodate for the alternative
 * IIFE notation. The original implementation can be found at:
 * https://github.com/Microsoft/TypeScript/blob/v3.4.5/src/compiler/utilities.ts#L1864-L1887
 *
 * Issue tracked in https://github.com/microsoft/TypeScript/issues/31778
 *
 * @returns the function to pass to `restoreGetExpandoInitializer` to undo the patch, or null if
 * the issue is known to have been fixed.
 */
export function patchTsGetExpandoInitializer(): unknown {
  if (isTs31778GetExpandoInitializerFixed()) {
    return null;
  }

  const originalGetExpandoInitializer = (ts as any).getExpandoInitializer;
  if (originalGetExpandoInitializer === undefined) {
    throw makeUnsupportedTypeScriptError();
  }

  // Override the function to add support for recognizing the IIFE structure used in ES5 bundles.
  (ts as any).getExpandoInitializer = (initializer: ts.Node,
                                       isPrototypeAssignment: boolean): ts.Expression|undefined => {
    // If the initializer is a call expression within parenthesis, unwrap the parenthesis
    // upfront such that unsupported IIFE syntax `(function(){}())` becomes `function(){}()`,
    // which is supported.
    if (ts.isParenthesizedExpression(initializer) && ts.isCallExpression(initializer.expression)) {
      initializer = initializer.expression;
    }
    return originalGetExpandoInitializer(initializer, isPrototypeAssignment);
  };
  return originalGetExpandoInitializer;
}

export function restoreGetExpandoInitializer(originalGetExpandoInitializer: unknown): void {
  if (originalGetExpandoInitializer !== null) {
    (ts as any).getExpandoInitializer = originalGetExpandoInitializer;
  }
}

let ts31778FixedResult: boolean|null = null;

function isTs31778GetExpandoInitializerFixed(): boolean {
  // If the result has already been computed, return early.
  if (ts31778FixedResult !== null) {
    return ts31778FixedResult;
  }

  // Determine if the issue has been fixed by checking if an expando property is present in a
  // minimum reproduction using unpatched TypeScript.
  ts31778FixedResult = checkIfExpandoPropertyIsPresent();

  // If the issue does not appear to have been fixed, verify that applying the patch has the desired
  // effect.
  if (!ts31778FixedResult) {
    const originalGetExpandoInitializer = patchTsGetExpandoInitializer();
    try {
      const patchIsSuccessful = checkIfExpandoPropertyIsPresent();
      if (!patchIsSuccessful) {
        throw makeUnsupportedTypeScriptError();
      }
    } finally {
      restoreGetExpandoInitializer(originalGetExpandoInitializer);
    }
  }

  return ts31778FixedResult;
}

/**
 * Verifies whether TS issue 31778 has been fixed by inspecting a symbol from a minimum
 * reproduction. If the symbol does in fact have the "expando" as export, the issue has been fixed.
 *
 * See https://github.com/microsoft/TypeScript/issues/31778 for details.
 */
function checkIfExpandoPropertyIsPresent(): boolean {
  const sourceText = `
    (function() {
      var A = (function() {
        function A() {}
        return A;
      }());
      A.expando = true;
    }());`;
  const sourceFile =
      ts.createSourceFile('test.js', sourceText, ts.ScriptTarget.ES5, true, ts.ScriptKind.JS);
  const host: ts.CompilerHost = {
    getSourceFile(): ts.SourceFile |
        undefined {
          return sourceFile;
        },
    fileExists(): boolean {
      return true;
    },
    readFile(): string |
        undefined {
          return '';
        },
    writeFile() {},
    getDefaultLibFileName(): string {
      return '';
    },
    getCurrentDirectory(): string {
      return '';
    },
    getDirectories(): string[] {
      return [];
    },
    getCanonicalFileName(fileName: string): string {
      return fileName;
    },
    useCaseSensitiveFileNames(): boolean {
      return true;
    },
    getNewLine(): string {
      return '\n';
    },
  };
  const options = {noResolve: true, noLib: true, noEmit: true, allowJs: true};
  const program = ts.createProgram(['test.js'], options, host);

  function visitor(node: ts.Node): ts.VariableDeclaration|undefined {
    if (ts.isVariableDeclaration(node) && hasNameIdentifier(node) && node.name.text === 'A') {
      return node;
    }
    return ts.forEachChild(node, visitor);
  }

  const declaration = ts.forEachChild(sourceFile, visitor);
  if (declaration === undefined) {
    throw new Error('Unable to find declaration of outer A');
  }

  const symbol = program.getTypeChecker().getSymbolAtLocation(declaration.name);
  if (symbol === undefined) {
    throw new Error('Unable to resolve symbol of outer A');
  }
  return symbol.exports !== undefined && symbol.exports.has('expando' as ts.__String);
}

function makeUnsupportedTypeScriptError(): Error {
  return new Error('The TypeScript version used is not supported by ngcc.');
}
