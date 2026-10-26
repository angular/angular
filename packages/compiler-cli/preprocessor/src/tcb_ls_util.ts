/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OutOfBandDiagnosticCategory, type TypeCheckId} from '@angular/compiler';
import MagicString from 'magic-string';
import ts from 'typescript';
import {hasIgnoreForDiagnosticsMarker} from './comments.js';
import type {TcbExtendedCheckCandidate, TcbExtendedCheckKind} from './extended_diagnostics/api.js';
export {getLineStarts, positionToOffset, lineNumberAtOffset, offsetToPosition} from './tcb_util.js';

const SPAN_COMMENT_REGEX = /\/\*(\d+),(\d+)\*\//g;

export function getTemplateLocationFromTcbLocation(
  tcbCode: string,
  targetPos: number,
): {start: number; end: number} | null {
  // Find the closest span comment to targetPos using matchAll (stateless)
  let closestMatch = null;
  let minDistance = Infinity;

  for (const match of tcbCode.matchAll(SPAN_COMMENT_REGEX)) {
    const commentPos = match.index!;
    const distance = Math.abs(commentPos - targetPos);

    if (distance < minDistance) {
      minDistance = distance;
      closestMatch = match;
    } else {
      // Matches are yielded in strictly increasing index order.
      // Once the distance stops decreasing, we have reached the absolute minimum.
      break;
    }
  }

  if (!closestMatch) {
    return null;
  }

  return {
    start: parseInt(closestMatch[1], 10),
    end: parseInt(closestMatch[2], 10),
  };
}

export function getTcbPath(tsFilePath: string): string {
  return `${tsFilePath.replace(/\.ts$/, '')}.ngtypecheck.ts`;
}

export function isTcbFunction(
  node: ts.Node,
  expectedId?: string,
): node is ts.FunctionDeclaration & {name: ts.Identifier} {
  if (!ts.isFunctionDeclaration(node) || !node.name) {
    return false;
  }
  const isMatch = expectedId
    ? node.name.text === `_${expectedId}`
    : node.name.text.startsWith('_tcb');
  return isMatch && node.parameters.length === 1 && node.parameters[0].name.getText() === 'this';
}

/**
 * Prefix of the block comment appended to `.ngtypecheck.ts` before `ngp-tcb-template-sources:`,
 * storing metadata for type-level extended diagnostic probe calls (`iN.ɵassertNot*(<id>, expr)`).
 */
export const TCB_EXTENDED_CHECKS_COMMENT_PREFIX = 'ngp-tcb-extended-checks:';

const PROBE_FN_BY_KIND: Record<TcbExtendedCheckKind, string> = {
  notSignal: 'ɵassertNotSignal',
  notCallable: 'ɵassertNotCallable',
  notTrackCallable: 'ɵassertNotTrackCallable',
};

const PROBE_FN_NAMES: ReadonlySet<string> = new Set(Object.values(PROBE_FN_BY_KIND));

export interface TcbExtendedCheckEntry {
  typeCheckId: TypeCheckId;
  code: number;
  category: 'warning' | 'error';
  message: string;
  start: number;
  end: number;
  skipIfTriggered?: number;
}

export type TcbExtendedCheckDiagnosticClassification =
  {kind: 'normal'} | {kind: 'suppress'} | {kind: 'probe'; probeId: number};

function hasTrailingSpanComment(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  targetStart: number,
  targetEnd: number,
): boolean {
  const expected = `${targetStart},${targetEnd}`;
  return (
    ts.forEachTrailingCommentRange(
      sourceFile.text,
      node.getEnd(),
      (pos: number, end: number, kind: ts.CommentKind) => {
        if (kind !== ts.SyntaxKind.MultiLineCommentTrivia) {
          return undefined;
        }
        const commentText = sourceFile.text.substring(pos + 2, end - 2);
        return commentText === expected ? true : undefined;
      },
    ) === true
  );
}

function findExpressionBySpan<T extends ts.Expression = ts.Expression>(
  root: ts.Node,
  sourceFile: ts.SourceFile,
  targetStart: number,
  targetEnd: number,
  filter: (node: ts.Node) => node is T = ts.isExpression as (node: ts.Node) => node is T,
): T | null {
  function visit(node: ts.Node): T | null {
    if (hasIgnoreForDiagnosticsMarker(node, sourceFile)) {
      return null;
    }
    if (filter(node) && hasTrailingSpanComment(node, sourceFile, targetStart, targetEnd)) {
      return node;
    }
    let found: T | null = null;
    ts.forEachChild(node, (child) => {
      if (found === null) {
        found = visit(child);
      }
    });
    return found;
  }
  return visit(root);
}

function isNonCommaExpression(node: ts.Node): node is ts.Expression {
  return (
    ts.isExpression(node) &&
    !(ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.CommaToken)
  );
}

function resolveCandidateExpressionInTcb(
  tcbBody: ts.Block,
  sf: ts.SourceFile,
  expr: TcbExtendedCheckCandidate['expr'],
): ts.Expression | null {
  const primarySpan = expr.nameSpan;
  const fullSpan = expr.sourceSpan;

  // Mirrors `TemplateSymbolBuilder.getSymbolOfTemplateExpression`: try matching a
  // `PropertyAccessExpression` first so enclosing comma/conditional expressions that share the
  // trailing comment offset are never selected.
  const propAccess =
    findExpressionBySpan(
      tcbBody,
      sf,
      primarySpan.start,
      primarySpan.end,
      ts.isPropertyAccessExpression,
    ) ??
    findExpressionBySpan(tcbBody, sf, fullSpan.start, fullSpan.end, ts.isPropertyAccessExpression);
  if (propAccess !== null) {
    return propAccess;
  }

  // Fall back to any non-comma expression (e.g. local `@let` / `@for` / `$event` identifiers).
  const fallback =
    findExpressionBySpan(tcbBody, sf, fullSpan.start, fullSpan.end, isNonCommaExpression) ??
    findExpressionBySpan(tcbBody, sf, primarySpan.start, primarySpan.end, isNonCommaExpression);
  if (fallback === null) {
    return null;
  }

  let resolved: ts.Expression = fallback;
  while (
    resolved.parent !== undefined &&
    ts.isPropertyAccessExpression(resolved.parent) &&
    resolved.parent.name === resolved
  ) {
    resolved = resolved.parent;
  }
  while (ts.isParenthesizedExpression(resolved)) {
    resolved = resolved.expression;
  }
  return resolved;
}

function stripCommentsFromNodeText(node: ts.Node, sourceFile: ts.SourceFile): string {
  const baseStart = node.getStart(sourceFile);
  const baseEnd = node.getEnd();
  const raw = sourceFile.text.substring(baseStart, baseEnd);
  const ranges: Array<{start: number; end: number}> = [];

  function collect(n: ts.Node): void {
    if (n.end <= baseStart || n.pos >= baseEnd) {
      return;
    }
    for (const c of ts.getLeadingCommentRanges(sourceFile.text, n.pos) ?? []) {
      const start = Math.max(baseStart, c.pos) - baseStart;
      const end = Math.min(baseEnd, c.end) - baseStart;
      if (end > start) {
        ranges.push({start, end});
      }
    }
    for (const c of ts.getTrailingCommentRanges(sourceFile.text, n.end) ?? []) {
      const start = Math.max(baseStart, c.pos) - baseStart;
      const end = Math.min(baseEnd, c.end) - baseStart;
      if (end > start) {
        ranges.push({start, end});
      }
    }
    for (const child of n.getChildren(sourceFile)) {
      collect(child);
    }
  }

  collect(node);
  if (ranges.length === 0) {
    return raw;
  }

  ranges.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Array<{start: number; end: number}> = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = ranges[i];
    if (curr.start <= prev.end) {
      prev.end = Math.max(prev.end, curr.end);
    } else {
      merged.push(curr);
    }
  }

  const s = new MagicString(raw);
  for (const r of merged) {
    s.overwrite(r.start, r.end, ' ');
  }
  return s.toString();
}

function findEnclosingStatementAndConditionals(
  exprNode: ts.Expression,
  tcbBody: ts.Block,
): {
  stmt: ts.Statement;
  conditionals: Array<{cond: ts.ConditionalExpression; branch: 'true' | 'false'}>;
} | null {
  const conditionals: Array<{cond: ts.ConditionalExpression; branch: 'true' | 'false'}> = [];
  let curr: ts.Node | undefined = exprNode;
  while (curr !== undefined && curr !== tcbBody) {
    const parent: ts.Node | undefined = curr.parent;
    if (parent !== undefined && ts.isConditionalExpression(parent)) {
      if (curr === parent.whenTrue) {
        conditionals.push({cond: parent, branch: 'true'});
      } else if (curr === parent.whenFalse) {
        conditionals.push({cond: parent, branch: 'false'});
      }
    }
    if (ts.isStatement(curr) && !ts.isBlock(curr)) {
      return {stmt: curr, conditionals};
    }
    curr = parent;
  }
  return null;
}

function isNodeWithin(target: ts.Node, container: ts.Node): boolean {
  return target.pos >= container.pos && target.end <= container.end;
}

function getStatementEndPastTrailingComments(stmt: ts.Statement, sf: ts.SourceFile): number {
  let end = stmt.getEnd();
  const trailing = ts.getTrailingCommentRanges(sf.text, end);
  if (trailing !== undefined && trailing.length > 0) {
    end = trailing[trailing.length - 1].end;
  }
  return end;
}

/**
 * Injects type-level assertion probe statements (`iN.ɵassertNotSignal`, `iN.ɵassertNotCallable`,
 * `iN.ɵassertNotTrackCallable` from `@angular/core`) into a component's generated `_tcbN` function
 * for each extended diagnostic candidate.
 */
export function injectExtendedCheckProbes(
  tcbFunctionCode: string,
  typeCheckId: TypeCheckId,
  candidates: readonly TcbExtendedCheckCandidate[],
  startingProbeId: number,
  getCoreNamespaceAlias: () => string,
): {
  code: string;
  entries: TcbExtendedCheckEntry[];
} {
  if (candidates.length === 0) {
    return {code: tcbFunctionCode, entries: []};
  }

  const sf = ts.createSourceFile('tcb_fragment.ts', tcbFunctionCode, ts.ScriptTarget.Latest, true);
  const tcbFn = sf.statements.find((s) => isTcbFunction(s, typeCheckId));
  if (!tcbFn?.body) {
    return {code: tcbFunctionCode, entries: []};
  }

  const entries: TcbExtendedCheckEntry[] = [];
  const candidateToProbeId = new Map<TcbExtendedCheckCandidate, number>();
  const probesByStatement = new Map<
    ts.Statement,
    {placement: 'beforeCondition' | 'after'; probes: string[]}
  >();
  let coreAlias: string | undefined;

  for (const candidate of candidates) {
    const exprNode = resolveCandidateExpressionInTcb(tcbFn.body, sf, candidate.expr);
    if (exprNode === null) {
      continue;
    }

    // Poisoned expressions (e.g. `@let` read before declaration cast directly to `as any`) should
    // not emit extended check diagnostics.
    if (
      exprNode.parent !== undefined &&
      ts.isAsExpression(exprNode.parent) &&
      exprNode.parent.type.kind === ts.SyntaxKind.AnyKeyword
    ) {
      continue;
    }

    const enclosing = findEnclosingStatementAndConditionals(exprNode, tcbFn.body);
    if (enclosing === null) {
      continue;
    }

    const probeId = startingProbeId + entries.length;
    candidateToProbeId.set(candidate, probeId);

    const skipId =
      candidate.skipIfTriggered !== undefined
        ? candidateToProbeId.get(candidate.skipIfTriggered)
        : undefined;
    entries.push({
      typeCheckId,
      code: candidate.code,
      category: candidate.category === OutOfBandDiagnosticCategory.Warning ? 'warning' : 'error',
      message: candidate.message,
      start: candidate.start,
      end: candidate.end,
      ...(skipId !== undefined ? {skipIfTriggered: skipId} : {}),
    });

    coreAlias ??= getCoreNamespaceAlias();
    const cleanExpr = stripCommentsFromNodeText(exprNode, sf);
    const fnName = PROBE_FN_BY_KIND[candidate.kind];
    let probeExpr = `${coreAlias}.${fnName}(${probeId}, ${cleanExpr})`;
    for (const {cond, branch} of enclosing.conditionals) {
      const cleanCond = stripCommentsFromNodeText(cond.condition, sf);
      probeExpr =
        branch === 'true'
          ? `(${cleanCond}) ? ${probeExpr} : undefined`
          : `(${cleanCond}) ? undefined : ${probeExpr}`;
    }
    const probeStmt = `${probeExpr};`;

    const {stmt} = enclosing;
    const isConditionProbe =
      (ts.isIfStatement(stmt) && isNodeWithin(exprNode, stmt.expression)) ||
      (ts.isSwitchStatement(stmt) && isNodeWithin(exprNode, stmt.expression));
    const placement: 'beforeCondition' | 'after' = isConditionProbe ? 'beforeCondition' : 'after';

    let group = probesByStatement.get(stmt);
    if (group === undefined) {
      group = {placement, probes: []};
      probesByStatement.set(stmt, group);
    }
    group.probes.push(probeStmt);
  }

  if (probesByStatement.size === 0) {
    return {code: tcbFunctionCode, entries};
  }

  const s = new MagicString(tcbFunctionCode);
  for (const [stmt, {placement, probes}] of probesByStatement) {
    const joined = probes.join(' ');
    const inStatementList =
      stmt.parent !== undefined &&
      (ts.isBlock(stmt.parent) || ts.isCaseOrDefaultClause(stmt.parent));
    const stmtEnd = getStatementEndPastTrailingComments(stmt, sf);

    if (placement === 'beforeCondition') {
      if (
        ts.isIfStatement(stmt) &&
        ts.isIfStatement(stmt.parent) &&
        stmt.parent.elseStatement === stmt
      ) {
        s.appendLeft(stmt.getStart(sf), `{ ${joined} `);
        s.appendRight(stmtEnd, ' }');
      } else if (inStatementList) {
        s.prependLeft(stmt.getStart(sf), `${joined}\n`);
      } else {
        s.appendLeft(stmt.getStart(sf), `{ ${joined} `);
        s.appendRight(stmtEnd, ' }');
      }
    } else if (inStatementList) {
      s.appendRight(stmtEnd, `\n${joined}`);
    } else {
      s.appendLeft(stmt.getStart(sf), '{ ');
      s.appendRight(stmtEnd, `\n${joined} }`);
    }
  }

  return {code: s.toString(), entries};
}

export function serializeTcbExtendedChecks(entries: readonly TcbExtendedCheckEntry[]): string {
  if (entries.length === 0) {
    return '';
  }
  const json = JSON.stringify(entries).split('*/').join('*\\/');
  return `\n/*${TCB_EXTENDED_CHECKS_COMMENT_PREFIX}${json}*/\n`;
}

export function parseTcbExtendedChecks(tcbCode: string): TcbExtendedCheckEntry[] {
  const marker = `/*${TCB_EXTENDED_CHECKS_COMMENT_PREFIX}`;
  const startIdx = tcbCode.lastIndexOf(marker);
  if (startIdx === -1) {
    return [];
  }
  const jsonStart = startIdx + marker.length;
  const endIdx = tcbCode.indexOf('*/', jsonStart);
  if (endIdx === -1) {
    return [];
  }
  try {
    const parsed = JSON.parse(tcbCode.substring(jsonStart, endIdx));
    return Array.isArray(parsed) ? (parsed as TcbExtendedCheckEntry[]) : [];
  } catch {
    return [];
  }
}

function findInnermostNodeAt(sourceFile: ts.SourceFile, offset: number): ts.Node | undefined {
  function find(node: ts.Node): ts.Node | undefined {
    if (offset >= node.getStart(sourceFile) && offset <= node.getEnd()) {
      let bestChild: ts.Node | undefined;
      ts.forEachChild(node, (child) => {
        if (bestChild === undefined) {
          const found = find(child);
          if (
            found !== undefined &&
            (offset < child.getEnd() || child.getStart(sourceFile) === child.getEnd())
          ) {
            bestChild = found;
          }
        }
      });
      if (bestChild !== undefined) {
        return bestChild;
      }
      return ts.forEachChild(node, find) ?? node;
    }
    return undefined;
  }
  return find(sourceFile);
}

function findEnclosingExtendedCheckProbeCall(
  tcbSf: ts.SourceFile,
  offset: number,
): {callExpr: ts.CallExpression; probeId: number | null} | null {
  let curr: ts.Node | undefined = findInnermostNodeAt(tcbSf, offset);
  while (curr !== undefined && !isTcbFunction(curr) && !ts.isSourceFile(curr)) {
    if (
      ts.isCallExpression(curr) &&
      ts.isPropertyAccessExpression(curr.expression) &&
      ts.isIdentifier(curr.expression.name) &&
      PROBE_FN_NAMES.has(curr.expression.name.text)
    ) {
      const idArg = curr.arguments.length >= 1 ? curr.arguments[0] : undefined;
      const probeId = idArg !== undefined && ts.isNumericLiteral(idArg) ? Number(idArg.text) : null;
      return {callExpr: curr, probeId: probeId !== null && !Number.isNaN(probeId) ? probeId : null};
    }
    curr = curr.parent;
  }
  return null;
}

/**
 * Returns `true` if `offset` in `tcbSf` lies inside an `iN.ɵassertNot*` extended-check probe call.
 * Used by Language Service reference/rename builders to ignore synthetic probe expressions.
 */
export function isInTcbExtendedCheckProbe(tcbSf: ts.SourceFile, offset: number): boolean {
  return findEnclosingExtendedCheckProbeCall(tcbSf, offset) !== null;
}

/**
 * Classifies a TypeScript diagnostic in a `.ngtypecheck.ts` file relative to injected extended
 * diagnostic probes:
 * - `{kind: 'normal'}`: outside any probe call; handle via normal TCB diagnostic translation.
 * - `{kind: 'probe', probeId}`: `TS2345` triggered directly by probe `probeId`; remap to the
 *   corresponding Angular extended template diagnostic.
 * - `{kind: 'suppress'}`: secondary TS diagnostic inside a probe call's copied argument; drop it
 *   so diagnostics already reported on the real TCB expression are never duplicated.
 */
export function classifyTcbExtendedCheckDiagnostic(
  tcbSf: ts.SourceFile,
  diagCode: number | string | undefined,
  diagStart: number,
  diagLength: number,
): TcbExtendedCheckDiagnosticClassification {
  const probe = findEnclosingExtendedCheckProbeCall(tcbSf, diagStart);
  if (probe === null) {
    return {kind: 'normal'};
  }
  if (diagCode === 2345 && probe.probeId !== null && probe.callExpr.arguments.length === 2) {
    const rawArg = probe.callExpr.arguments[1];
    const rawStart = rawArg.getStart(tcbSf);
    const rawLength = rawArg.getEnd() - rawStart;
    let unwrappedArg: ts.Expression = rawArg;
    while (ts.isParenthesizedExpression(unwrappedArg)) {
      unwrappedArg = unwrappedArg.expression;
    }
    const unwrappedStart = unwrappedArg.getStart(tcbSf);
    const unwrappedLength = unwrappedArg.getEnd() - unwrappedStart;
    if (
      (diagStart === rawStart && diagLength === rawLength) ||
      (diagStart === unwrappedStart && diagLength === unwrappedLength)
    ) {
      return {kind: 'probe', probeId: probe.probeId};
    }
  }
  return {kind: 'suppress'};
}
