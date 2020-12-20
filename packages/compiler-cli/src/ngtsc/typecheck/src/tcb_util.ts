/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan, ParseSourceSpan} from '@angular/compiler';
import {ClassDeclaration} from '@angular/compiler-cli/src/ngtsc/reflection';
import * as ts from 'typescript';

import {Reference} from '../../imports';
import {getTokenAtPosition} from '../../util/src/typescript';
import {FullTemplateMapping, SourceLocation, TemplateId, TemplateSourceMapping} from '../api';

import {hasIgnoreForDiagnosticsMarker, readSpanComment} from './comments';
import {checkIfClassIsExported, checkIfGenericTypesAreUnbound} from './ts_util';

/**
 * Adapter interface which allows the template type-checking diagnostics code to interpret offsets
 * in a TCB and map them back to original locations in the template.
 */
export interface TemplateSourceResolver {
  getTemplateId(node: ts.ClassDeclaration): TemplateId;

  /**
   * For the given template id, retrieve the original source mapping which describes how the offsets
   * in the template should be interpreted.
   */
  getSourceMapping(id: TemplateId): TemplateSourceMapping;

  /**
   * Convert an absolute source span associated with the given template id into a full
   * `ParseSourceSpan`. The returned parse span has line and column numbers in addition to only
   * absolute offsets and gives access to the original template source.
   */
  toParseSourceSpan(id: TemplateId, span: AbsoluteSourceSpan): ParseSourceSpan|null;
}

export function requiresInlineTypeCheckBlock(
    node: ClassDeclaration<ts.ClassDeclaration>,
    usedPipes: Map<string, Reference<ClassDeclaration<ts.ClassDeclaration>>>): boolean {
  // In order to qualify for a declared TCB (not inline) two conditions must be met:
  // 1) the class must be exported
  // 2) it must not have constrained generic types
  if (!checkIfClassIsExported(node)) {
    // Condition 1 is false, the class is not exported.
    return true;
  } else if (!checkIfGenericTypesAreUnbound(node)) {
    // Condition 2 is false, the class has constrained generic types
    return true;
  } else if (Array.from(usedPipes.values())
                 .some(pipeRef => !checkIfClassIsExported(pipeRef.node))) {
    // If one of the pipes used by the component is not exported, a non-inline TCB will not be able
    // to import it, so this requires an inline TCB.
    return true;
  } else {
    return false;
  }
}

/** Maps a shim position back to a template location. */
export function getTemplateMapping(
    shimSf: ts.SourceFile, position: number, resolver: TemplateSourceResolver,
    isDiagnosticRequest: boolean): FullTemplateMapping|null {
  const node = getTokenAtPosition(shimSf, position);
  const sourceLocation = findSourceLocation(node, shimSf, isDiagnosticRequest);
  if (sourceLocation === null) {
    return null;
  }

  const mapping = resolver.getSourceMapping(sourceLocation.id);
  const span = resolver.toParseSourceSpan(sourceLocation.id, sourceLocation.span);
  if (span === null) {
    return null;
  }
  // TODO(atscott): Consider adding a context span by walking up from `node` until we get a
  // different span.
  return {sourceLocation, templateSourceMapping: mapping, span};
}

export function findTypeCheckBlock(
    file: ts.SourceFile, id: TemplateId, isDiagnosticRequest: boolean): ts.Node|null {
  for (const stmt of file.statements) {
    if (ts.isFunctionDeclaration(stmt) && getTemplateId(stmt, file, isDiagnosticRequest) === id) {
      return stmt;
    }
  }
  return null;
}

/**
 * Traverses up the AST starting from the given node to extract the source location from comments
 * that have been emitted into the TCB. If the node does not exist within a TCB, or if an ignore
 * marker comment is found up the tree (and this is part of a diagnostic request), this function
 * returns null.
 */
export function findSourceLocation(
    node: ts.Node, sourceFile: ts.SourceFile, isDiagnosticsRequest: boolean): SourceLocation|null {
  // Search for comments until the TCB's function declaration is encountered.
  while (node !== undefined && !ts.isFunctionDeclaration(node)) {
    if (hasIgnoreForDiagnosticsMarker(node, sourceFile) && isDiagnosticsRequest) {
      // There's an ignore marker on this node, so the diagnostic should not be reported.
      return null;
    }

    const span = readSpanComment(node, sourceFile);
    if (span !== null) {
      // Once the positional information has been extracted, search further up the TCB to extract
      // the unique id that is attached with the TCB's function declaration.
      const id = getTemplateId(node, sourceFile, isDiagnosticsRequest);
      if (id === null) {
        return null;
      }
      return {id, span};
    }

    node = node.parent;
  }

  return null;
}

function getTemplateId(
    node: ts.Node, sourceFile: ts.SourceFile, isDiagnosticRequest: boolean): TemplateId|null {
  // Walk up to the function declaration of the TCB, the file information is attached there.
  while (!ts.isFunctionDeclaration(node)) {
    if (hasIgnoreForDiagnosticsMarker(node, sourceFile) && isDiagnosticRequest) {
      // There's an ignore marker on this node, so the diagnostic should not be reported.
      return null;
    }
    node = node.parent;

    // Bail once we have reached the root.
    if (node === undefined) {
      return null;
    }
  }

  const start = node.getFullStart();
  return ts.forEachLeadingCommentRange(sourceFile.text, start, (pos, end, kind) => {
    if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
      return null;
    }
    const commentText = sourceFile.text.substring(pos + 2, end - 2);
    return commentText;
  }) as TemplateId || null;
}
