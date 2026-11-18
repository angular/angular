/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';

import {getModuleScopeSymbols} from '../../util/src/module_scope';
import {TemplateDiagnostic} from '../api';
import {makeTemplateDiagnostic} from '../diagnostics';

import {getSourceMapping, TypeCheckSourceResolver} from './tcb_util';

/**
 * This function will the check the source text of the TCB instead of doing a more expensive AST traversal (via getTokenAtPosition)
 */
function isAccessOnThis(text: string, start: number): boolean {
  return (
    text.substring(start - 5, start) === 'this.' || text.substring(start - 7, start) === '(this).'
  );
}

/**
 * Determines if the diagnostic should be reported. Some diagnostics are produced because of the
 * way TCBs are generated; those diagnostics should not be reported as type check errors of the
 * template.
 */
export function shouldReportDiagnostic(diagnostic: ts.Diagnostic): boolean {
  const {code} = diagnostic;
  if (code === 6133 /* $var is declared but its value is never read. */) {
    return false;
  } else if (code === 6199 /* All variables are unused. */) {
    return false;
  } else if (code === 2695 /* Left side of comma operator is unused and has no side effects. */) {
    return false;
  } else if (code === 7006 /* Parameter '$event' implicitly has an 'any' type. */) {
    return false;
  } else if (code === 2341 /* Property 'X' is private and only accessible within class */) {
    if (diagnostic.file !== undefined && diagnostic.start !== undefined) {
      // Here we're discarding private property reads error to allow them to be used in template expressions
      if (isAccessOnThis(diagnostic.file.text, diagnostic.start)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Attempts to translate a TypeScript diagnostic produced during template type-checking to their
 * location of origin, based on the comments that are emitted in the TCB code.
 *
 * If the diagnostic could not be translated, `null` is returned to indicate that the diagnostic
 * should not be reported at all. This prevents diagnostics from non-TCB code in a user's source
 * file from being reported as type-check errors.
 */
export function translateDiagnostic(
  diagnostic: ts.Diagnostic,
  resolver: TypeCheckSourceResolver,
): TemplateDiagnostic | null {
  if (diagnostic.file === undefined || diagnostic.start === undefined) {
    return null;
  }
  const fullMapping = getSourceMapping(
    diagnostic.file,
    diagnostic.start,
    resolver,
    /*isDiagnosticsRequest*/ true,
  );
  if (fullMapping === null) {
    return null;
  }

  const {sourceLocation, sourceMapping: templateSourceMapping, span} = fullMapping;
  return makeTemplateDiagnostic(
    sourceLocation.id,
    templateSourceMapping,
    span,
    diagnostic.category,
    diagnostic.code,
    diagnostic.messageText,
    undefined,
    diagnostic.reportsDeprecated !== undefined
      ? {
          reportsDeprecated: diagnostic.reportsDeprecated,
          relatedMessages: diagnostic.relatedInformation,
        }
      : undefined,
  );
}

/** TS diagnostic codes for a read of a property that doesn't exist. */
const PROPERTY_DOES_NOT_EXIST_CODES = new Set([
  2339 /* Property 'X' does not exist on type 'Y'. */,
  2551 /* Property 'X' does not exist on type 'Y'. Did you mean 'Z'? */,
]);

/**
 * Default library files whose globals are too generic to suggest: names like `name`, `status`,
 * `open` or `close` are DOM globals, but a template that uses them almost always means a missing
 * property of the component.
 */
const IGNORED_GLOBAL_LIBS = /(^|[\\/])lib\.(dom|webworker|scripthost)[^\\/]*\.d\.ts$/;

/**
 * Template and host binding expressions read bare names from the component instance (`foo` is
 * `this.foo`), so a symbol that is imported or declared in the component's file, or a global, can't
 * be used directly. When TS reports that such a property doesn't exist, checks whether the name
 * refers to a value in the file or a global. If so, returns a sentence suggesting to expose it as a
 * member of the class, e.g. `protected readonly foo = foo;`. Otherwise returns `null`.
 *
 * @param tsDiagnostic Diagnostic reported by TS in a type-check block.
 * @param componentFile Source file declaring the component or directive.
 * @param typeChecker Type checker of the program containing the type-check block.
 */
export function getExposeSymbolSuggestion(
  tsDiagnostic: ts.Diagnostic,
  componentFile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
): string | null {
  const {file, start, length} = tsDiagnostic;
  if (
    !PROPERTY_DOES_NOT_EXIST_CODES.has(tsDiagnostic.code) ||
    file === undefined ||
    start === undefined ||
    length === undefined ||
    !isAccessOnThis(file.text, start)
  ) {
    return null;
  }

  const name = file.text.substring(start, start + length);
  const origin = findSymbolOrigin(name, componentFile, typeChecker);
  if (origin === null) {
    return null;
  }

  return (
    `'${name}' is ${origin}, but template expressions can only read members of the class. ` +
    `To use it in the template, add it to the class, e.g. ` +
    `'protected readonly ${name} = ${name};'.`
  );
}

/**
 * Appends the suggestion from `getExposeSymbolSuggestion` (if any) to the message of a translated
 * template diagnostic.
 */
export function addExposeSymbolSuggestion<T extends ts.Diagnostic>(
  templateDiagnostic: T,
  tsDiagnostic: ts.Diagnostic,
  componentFile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
): T {
  const suggestion = getExposeSymbolSuggestion(tsDiagnostic, componentFile, typeChecker);
  if (suggestion === null) {
    return templateDiagnostic;
  }
  const messageText = templateDiagnostic.messageText;
  templateDiagnostic.messageText =
    typeof messageText === 'string'
      ? `${messageText} ${suggestion}`
      : {...messageText, messageText: `${messageText.messageText} ${suggestion}`};
  return templateDiagnostic;
}

/**
 * Describes where `name` comes from if it's a value imported or declared in the component's file,
 * or a global; otherwise returns `null`.
 */
function findSymbolOrigin(
  name: string,
  componentFile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
): string | null {
  const moduleSymbol = getModuleScopeSymbols(componentFile).get(name);
  if (moduleSymbol !== undefined) {
    if (moduleSymbol.kind === 'import') {
      return moduleSymbol.isTypeOnly || !isValueImport(moduleSymbol.node, typeChecker)
        ? null
        : 'imported in this file';
    }
    return 'declared in this file';
  }

  const globalSymbol = typeChecker.resolveName(
    name,
    /* location */ undefined,
    ts.SymbolFlags.Value,
    /* excludeGlobals */ false,
  );
  const declarations = globalSymbol?.declarations;
  if (
    declarations === undefined ||
    declarations.length === 0 ||
    declarations.every((decl) => IGNORED_GLOBAL_LIBS.test(decl.getSourceFile().fileName))
  ) {
    return null;
  }
  return 'a global';
}

/**
 * Whether the binding introduced by an import refers to a value (as opposed to only a type, like
 * an interface). Assumes it does if the checker can't tell.
 */
function isValueImport(name: ts.Identifier, typeChecker: ts.TypeChecker): boolean {
  let symbol: ts.Symbol | undefined;
  try {
    symbol = typeChecker.getSymbolAtLocation(name);
  } catch {
    // The node isn't part of the checker's program.
    return true;
  }
  if (symbol === undefined) {
    return true;
  }
  if (symbol.flags & ts.SymbolFlags.Alias) {
    symbol = typeChecker.getAliasedSymbol(symbol);
  }
  // Unresolvable imports resolve to the `unknown` symbol, which has no declarations.
  return symbol.declarations === undefined || (symbol.flags & ts.SymbolFlags.Value) !== 0;
}
