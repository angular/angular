/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {CommentTriviaType} from '@angular/compiler';
import {HybridCompiler} from '../../src/hybrid_compiler.js';
import {Diagnostic, DiagnosticSeverity, Position} from 'vscode-languageserver';
import * as path from 'node:path';
import {URI} from 'vscode-uri';

import {
  positionToOffset,
  offsetToPosition,
  getTemplateLocationFromTcbLocation,
  getTcbPath,
  isTcbFunction,
} from './tcb_ls_util.js';
import {hasIgnoreForDiagnosticsMarker} from './comments.js';
import {makeClassKey} from '../../src/compiler-utils.js';
import {ErrorCode} from '../../src/error_code.js';

/**
 * Fallback check for ignore markers when the AST is broken due to syntax errors
 * (e.g. `this.;`). In such cases, `findNodeAt` might return a parent node that
 * does not contain the ignore comment as a trailing comment, so we fall back to
 * checking the raw line text.
 */
function findClosestPrecedingNode(
  node: ts.Node,
  position: number,
  sourceFile: ts.SourceFile,
): ts.Node | undefined {
  let bestNode: ts.Node | undefined;
  function visit(n: ts.Node) {
    if (n.getEnd() <= position) {
      if (!bestNode || n.getEnd() > bestNode.getEnd()) {
        bestNode = n;
      }
    }
    if (n.getStart(sourceFile) <= position) {
      n.getChildren(sourceFile).forEach(visit);
    }
  }
  visit(node);
  return bestNode;
}

const REMAPPED_PROPERTY_MARKER_PREFIX = `${CommentTriviaType.DIAGNOSTIC}:remap:`;

function findTokenAtOffset(sourceFile: ts.SourceFile, offset: number): ts.Node | undefined {
  function visit(node: ts.Node): ts.Node | undefined {
    if (offset < node.getStart(sourceFile) || offset >= node.getEnd()) {
      return undefined;
    }
    for (const child of node.getChildren(sourceFile)) {
      const found = visit(child);
      if (found !== undefined) {
        return found;
      }
    }
    return node;
  }
  return visit(sourceFile);
}

function checkAssertCustomElementLspDiagnostic(
  diag: Diagnostic,
  tcbSf: ts.SourceFile,
  offset: number,
): {tagName: string; isStandalone: boolean} | null {
  if (diag.code !== 2345 && diag.code !== '2345') {
    return null;
  }
  let node = findTokenAtOffset(tcbSf, offset);
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

function getRemappedPropertyLspHint(
  diag: Diagnostic,
  tcbSf: ts.SourceFile,
  offset: number,
): string | null {
  if (diag.code !== 2339 && diag.code !== '2339' && diag.code !== 2551 && diag.code !== '2551') {
    return null;
  }
  let node = findTokenAtOffset(tcbSf, offset);
  while (node !== undefined && !ts.isStatement(node)) {
    const match = ts.forEachTrailingCommentRange(tcbSf.text, node.getEnd(), (pos, end, kind) => {
      if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
        return undefined;
      }
      const commentText = tcbSf.text.substring(pos + 2, end - 2);
      if (!commentText.startsWith(REMAPPED_PROPERTY_MARKER_PREFIX)) {
        return undefined;
      }
      const rest = commentText.slice(REMAPPED_PROPERTY_MARKER_PREFIX.length);
      const colonIdx = rest.indexOf(':');
      if (colonIdx === -1) {
        return undefined;
      }
      return {original: rest.slice(0, colonIdx), mapped: rest.slice(colonIdx + 1)};
    });
    if (match !== undefined) {
      return `Angular remaps '[${match.original}]' to '${match.mapped}' at runtime. If this custom element expects an attribute or a lowercase property, use '[attr.${match.original}]' instead.`;
    }
    node = node.parent;
  }
  return null;
}

export interface MappedLocation {
  templateUrl: string;
  span: {start: number; end: number};
}

/**
 * Determines if the diagnostic should be reported. Some diagnostics are produced because of the
 * way TCBs are generated; those diagnostics should not be reported as type check errors of the
 * template.
 *
 * @see https://github.com/angular/angular/blob/2896c93/packages/compiler-cli/src/ngtsc/typecheck/src/diagnostics.ts#L20-L32
 */
const IGNORED_DIAGNOSTIC_CODES = new Set<number | string>([
  6133, // $var is declared but its value is never read.
  6199, // All variables are unused.
  2695, // Left side of comma operator is unused and has no side effects.
  7006, // Parameter '$event' implicitly has an 'any' type.
]);

export function shouldReportDiagnostic(diagnostic: Diagnostic): boolean {
  const {code} = diagnostic;
  if (code !== undefined && IGNORED_DIAGNOSTIC_CODES.has(code)) {
    return false;
  }
  return true;
}

function findNodeAt(sourceFile: ts.SourceFile, position: number): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (position >= node.getStart(sourceFile) && position <= node.getEnd()) {
      const child = ts.forEachChild(node, find);
      return child || node;
    }
    return undefined;
  }
  return find(sourceFile);
}

/**
 * Attempts to translate a position produced during template type-checking to its
 * location of origin, based on the comments that are emitted in the TCB code.
 *
 * If the position could not be translated, `null` is returned to indicate that it
 * should not be reported at all.
 *
 * @see https://github.com/angular/angular/blob/2896c93/packages/compiler-cli/src/ngtsc/typecheck/src/diagnostics.ts#L42-L75
 */
export function translatePosition(
  position: Position,
  tcbCode: string,
  tcbSf: ts.SourceFile,
  tsFilePath: string,
  typeCheckIdToTemplateMap: Map<string, string>,
): MappedLocation | null {
  const startOffset = positionToOffset(tcbCode, position);

  const node = findNodeAt(tcbSf, startOffset);

  if (node) {
    const precedingNode = findClosestPrecedingNode(node, startOffset, tcbSf);
    if (precedingNode && hasIgnoreForDiagnosticsMarker(precedingNode, tcbSf)) {
      return null;
    }
  }

  let currentNode: ts.Node | undefined = node;
  let typeCheckId: string | undefined;

  while (currentNode !== undefined) {
    if (hasIgnoreForDiagnosticsMarker(currentNode, tcbSf)) {
      return null;
    }
    if (isTcbFunction(currentNode)) {
      typeCheckId = currentNode.name.text.substring(1);
      break;
    }
    currentNode = currentNode.parent;
  }

  const templatePath = (typeCheckId && typeCheckIdToTemplateMap.get(typeCheckId)) || tsFilePath;

  const span = getTemplateLocationFromTcbLocation(tcbCode, startOffset);

  if (!span) {
    return null;
  }

  return {
    templateUrl: path.normalize(templatePath),
    span,
  };
}

export async function mapDiagnostics(
  tcbCode: string,
  diagnostics: Diagnostic[],
  tsFilePath: string,
  hybridCompiler: HybridCompiler,
): Promise<{[filePath: string]: Diagnostic[]} | null> {
  if (diagnostics.length === 0) {
    return null;
  }
  const results: {[filePath: string]: Diagnostic[]} = {};
  const tcbPath = getTcbPath(tsFilePath);
  const tcbSf = ts.createSourceFile(tcbPath, tcbCode, ts.ScriptTarget.Latest, true);
  const currentTcbFsPath = URI.file(tcbPath).fsPath;

  const metadata = await hybridCompiler.getClassMetadata(tsFilePath);

  const typeCheckIdToTemplateMap = new Map<string, string>();
  const typeCheckIdMap = await hybridCompiler.getTypeCheckIdMap(tsFilePath);
  if (metadata && typeCheckIdMap) {
    for (const cls of metadata.classes ?? []) {
      if (cls.className && cls.component?.templateUrl) {
        const classKey = makeClassKey(cls.className, cls.span.start);
        const typeCheckId = typeCheckIdMap.get(classKey);
        if (typeCheckId) {
          typeCheckIdToTemplateMap.set(typeCheckId, cls.component.templateUrl.resolvedPath);
        }
      }
    }
  }
  const fileContentCache = new Map<string, string | null>();

  for (const diag of diagnostics) {
    if (!shouldReportDiagnostic(diag)) {
      continue;
    }

    const mappedLocation = translatePosition(
      diag.range.start,
      tcbCode,
      tcbSf,
      tsFilePath,
      typeCheckIdToTemplateMap,
    );

    if (!mappedLocation) {
      continue;
    }

    const templateFilePath = mappedLocation.templateUrl;
    let content = fileContentCache.get(templateFilePath) ?? null;
    if (content === null && !fileContentCache.has(templateFilePath)) {
      try {
        content = await hybridCompiler.getFileContent(templateFilePath);
      } catch (e) {
        content = null;
      }
      fileContentCache.set(templateFilePath, content);
    }

    if (content === null) {
      continue;
    }

    const startPos = offsetToPosition(content, mappedLocation.span.start);
    const endPos = offsetToPosition(content, mappedLocation.span.end);

    if (!results[templateFilePath]) {
      results[templateFilePath] = [];
    }

    const diagOffset = positionToOffset(tcbCode, diag.range.start);
    const customElementInfo = checkAssertCustomElementLspDiagnostic(diag, tcbSf, diagOffset);
    let mappedDiag: Diagnostic;
    if (customElementInfo !== null) {
      const schemas = `'${customElementInfo.isStandalone ? '@Component' : '@NgModule'}.schemas'`;
      let errorMsg = `'${customElementInfo.tagName}' is not a known element:\n`;
      errorMsg += `1. If '${customElementInfo.tagName}' is an Angular component, then verify that it is ${
        customElementInfo.isStandalone
          ? "included in the '@Component.imports' of this component"
          : 'part of this module'
      }.\n`;
      errorMsg += `2. If '${customElementInfo.tagName}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the ${schemas} of this component to suppress this message.`;
      mappedDiag = {
        range: {
          start: startPos,
          end: endPos,
        },
        code: Math.abs(ErrorCode.SCHEMA_INVALID_ELEMENT),
        severity: DiagnosticSeverity.Error,
        message: errorMsg,
        source: 'angular',
      };
    } else {
      const remapHint = getRemappedPropertyLspHint(diag, tcbSf, diagOffset);
      mappedDiag = {
        ...diag,
        range: {
          start: startPos,
          end: endPos,
        },
        message: remapHint !== null ? `${diag.message}\n${remapHint}` : diag.message,
        source: 'angular',
      };
    }

    if (customElementInfo === null && diag.relatedInformation) {
      const mappedInfo = [];
      for (const relInfo of diag.relatedInformation) {
        if (URI.parse(relInfo.location.uri).fsPath === currentTcbFsPath) {
          const mappedLoc = translatePosition(
            relInfo.location.range.start,
            tcbCode,
            tcbSf,
            tsFilePath,
            typeCheckIdToTemplateMap,
          );
          if (mappedLoc) {
            let relContent = fileContentCache.get(mappedLoc.templateUrl) ?? null;
            if (relContent === null && !fileContentCache.has(mappedLoc.templateUrl)) {
              try {
                relContent = await hybridCompiler.getFileContent(mappedLoc.templateUrl);
              } catch (e) {
                relContent = null;
              }
              fileContentCache.set(mappedLoc.templateUrl, relContent);
            }

            if (typeof relContent === 'string') {
              mappedInfo.push({
                ...relInfo,
                location: {
                  uri: URI.file(mappedLoc.templateUrl).toString(),
                  range: {
                    start: offsetToPosition(relContent, mappedLoc.span.start),
                    end: offsetToPosition(relContent, mappedLoc.span.end),
                  },
                },
              });
            }
          }
          // Drop unmappable TCB references
          continue;
        }
        mappedInfo.push(relInfo);
      }

      if (mappedInfo.length > 0) {
        mappedDiag.relatedInformation = mappedInfo;
      } else {
        mappedDiag.relatedInformation = undefined;
      }
    }

    results[templateFilePath].push(mappedDiag);
  }

  return Object.keys(results).length > 0 ? results : null;
}
