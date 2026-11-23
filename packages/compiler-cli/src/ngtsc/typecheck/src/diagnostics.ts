/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';

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
