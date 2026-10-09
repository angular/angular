/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';

import {getTokenAtPosition} from '../../util/src/typescript';
import {TemplateDiagnostic} from '../api';
import {makeTemplateDiagnostic} from '../diagnostics';

import {getSourceMapping, TypeCheckSourceResolver} from './tcb_util';

/**
 * Determines whether a TS2341 ("Property 'x' is private and only accessible within class 'Y'")
 * diagnostic occurred on a property access on the component/directive's `this` context for a
 * private member declared on that component/directive class itself (as opposed to an inherited
 * private member from a base class or a private member on a narrowed subtype).
 */
function isPrivatePropertyOnHostThis(
  sf: ts.SourceFile,
  start: number,
  typeChecker: ts.TypeChecker,
): boolean {
  const node = getTokenAtPosition(sf, start);
  if (!ts.isPropertyAccessExpression(node.parent) || node.parent.name !== node) {
    return false;
  }

  let receiver: ts.Expression = node.parent.expression;
  while (ts.isParenthesizedExpression(receiver) || ts.isNonNullExpression(receiver)) {
    receiver = receiver.expression;
  }
  if (receiver.kind !== ts.SyntaxKind.ThisKeyword) {
    return false;
  }

  const thisSymbol = typeChecker.getSymbolAtLocation(receiver);
  if (thisSymbol === undefined) {
    return false;
  }
  const hostDeclarations: readonly ts.Node[] | undefined = typeChecker
    .getTypeOfSymbol(thisSymbol)
    .getSymbol()?.declarations;
  if (hostDeclarations === undefined || hostDeclarations.length === 0) {
    return false;
  }

  const propSymbol = typeChecker.getSymbolAtLocation(node);
  if (propSymbol?.declarations === undefined || propSymbol.declarations.length === 0) {
    return false;
  }

  let hasPrivateDeclaration = false;
  for (const decl of propSymbol.declarations) {
    if ((ts.getCombinedModifierFlags(decl) & ts.ModifierFlags.Private) !== 0) {
      hasPrivateDeclaration = true;
      const declaringClass = ts.isParameter(decl) ? decl.parent?.parent : decl.parent;
      if (declaringClass === undefined || !hostDeclarations.includes(declaringClass)) {
        return false;
      }
    }
  }

  return hasPrivateDeclaration;
}

/**
 * Determines if the diagnostic should be reported. Some diagnostics are produced because of the
 * way TCBs are generated; those diagnostics should not be reported as type check errors of the
 * template.
 */
export function shouldReportDiagnostic(
  diagnostic: ts.Diagnostic,
  typeChecker: ts.TypeChecker,
): boolean {
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
      // Discard private property access errors when accessing a private member declared on the
      // component/directive class itself via `this` in a template or host binding expression.
      if (isPrivatePropertyOnHostThis(diagnostic.file, diagnostic.start, typeChecker)) {
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
