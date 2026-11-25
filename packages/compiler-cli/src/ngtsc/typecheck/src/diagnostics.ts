/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {CommentTriviaType} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {getTokenAtPosition} from '../../util/src/typescript';
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
export function checkAssertCustomElementDiagnostic(
  diagnostic: ts.Diagnostic,
): {tagName: string; isStandalone: boolean} | null {
  if (diagnostic.code !== 2345 || diagnostic.file === undefined || diagnostic.start === undefined) {
    return null;
  }
  const token = getTokenAtPosition(diagnostic.file, diagnostic.start);
  let node: ts.Node | undefined = token;
  while (node !== undefined && !ts.isCallExpression(node)) {
    if (ts.isStatement(node)) {
      break;
    }
    node = node.parent;
  }
  if (node !== undefined && ts.isCallExpression(node)) {
    const expr = node.expression;
    const name = ts.isPropertyAccessExpression(expr)
      ? expr.name.text
      : ts.isIdentifier(expr)
        ? expr.text
        : '';
    if (name === 'ɵassertCustomElement') {
      const firstArg = node.arguments[0];
      if (firstArg && ts.isStringLiteral(firstArg)) {
        const secondArg = node.arguments[1];
        const isStandalone = secondArg?.kind !== ts.SyntaxKind.FalseKeyword;
        return {tagName: firstArg.text, isStandalone};
      }
    }
  }
  return null;
}

const REMAPPED_PROPERTY_MARKER_PREFIX = `${CommentTriviaType.DIAGNOSTIC}:remap:`;

/**
 * Checks whether a `TS2339` / `TS2551` diagnostic occurred on a custom element property access
 * whose name was remapped by `DomElementSchemaRegistry.getMappedPropName` (e.g. `readonly` ->
 * `readOnly`), and returns a hint explaining the runtime remapping if so.
 */
export function getRemappedPropertyHint(diagnostic: ts.Diagnostic): string | null {
  if (
    (diagnostic.code !== 2339 && diagnostic.code !== 2551) ||
    diagnostic.file === undefined ||
    diagnostic.start === undefined
  ) {
    return null;
  }
  return getRemappedPropertyHintAtPosition(diagnostic.file, diagnostic.start);
}

/**
 * Looks up a `D:remap:<original>:<mapped>` marker on the property/element access node at `position`.
 */
export function getRemappedPropertyHintAtPosition(
  sourceFile: ts.SourceFile,
  position: number,
): string | null {
  let node: ts.Node | undefined = getTokenAtPosition(sourceFile, position);
  while (node !== undefined && !ts.isStatement(node)) {
    const match = ts.forEachTrailingCommentRange(
      sourceFile.text,
      node.getEnd(),
      (pos, end, kind) => {
        if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
          return undefined;
        }
        const commentText = sourceFile.text.substring(pos + 2, end - 2);
        if (!commentText.startsWith(REMAPPED_PROPERTY_MARKER_PREFIX)) {
          return undefined;
        }
        const rest = commentText.slice(REMAPPED_PROPERTY_MARKER_PREFIX.length);
        const colonIdx = rest.indexOf(':');
        if (colonIdx === -1) {
          return undefined;
        }
        return {original: rest.slice(0, colonIdx), mapped: rest.slice(colonIdx + 1)};
      },
    );
    if (match !== undefined) {
      return `Angular remaps '[${match.original}]' to '${match.mapped}' at runtime. If this custom element expects an attribute or a lowercase property, use '[attr.${match.original}]' instead.`;
    }
    node = node.parent;
  }
  return null;
}

export function appendHintToDiagnosticMessage(
  messageText: string | ts.DiagnosticMessageChain,
  hint: string,
): string | ts.DiagnosticMessageChain {
  if (typeof messageText === 'string') {
    return `${messageText}\n${hint}`;
  }
  return {
    ...messageText,
    next: [
      ...(messageText.next ?? []),
      {messageText: hint, category: messageText.category, code: 0},
    ],
  };
}

export function formatUnknownElementMessage(tagName: string, isStandalone: boolean): string {
  const schemas = `'${isStandalone ? '@Component' : '@NgModule'}.schemas'`;
  let errorMsg = `'${tagName}' is not a known element:\n`;
  errorMsg += `1. If '${tagName}' is an Angular component, then verify that it is ${
    isStandalone ? "included in the '@Component.imports' of this component" : 'part of this module'
  }.\n`;
  errorMsg += `2. If '${tagName}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the ${schemas} of this component to suppress this message.`;
  return errorMsg;
}

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

  const customElementInfo = checkAssertCustomElementDiagnostic(diagnostic);
  if (customElementInfo !== null) {
    return makeTemplateDiagnostic(
      sourceLocation.id,
      templateSourceMapping,
      span,
      ts.DiagnosticCategory.Error,
      ngErrorCode(ErrorCode.SCHEMA_INVALID_ELEMENT),
      formatUnknownElementMessage(customElementInfo.tagName, customElementInfo.isStandalone),
    );
  }

  const remapHint = getRemappedPropertyHint(diagnostic);
  const messageText =
    remapHint !== null
      ? appendHintToDiagnosticMessage(diagnostic.messageText, remapHint)
      : diagnostic.messageText;

  return makeTemplateDiagnostic(
    sourceLocation.id,
    templateSourceMapping,
    span,
    diagnostic.category,
    diagnostic.code,
    messageText,
    undefined,
    diagnostic.reportsDeprecated !== undefined
      ? {
          reportsDeprecated: diagnostic.reportsDeprecated,
          relatedMessages: diagnostic.relatedInformation,
        }
      : undefined,
  );
}
