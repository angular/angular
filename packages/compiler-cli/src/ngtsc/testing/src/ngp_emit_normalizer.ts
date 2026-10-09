/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

const STRING_LIKE_TOKEN =
  /\/\/[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\[\s\S]|[^\\`])*`|"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'/g;

function canonicalizeSegmentQuotes(segment: string): string {
  return segment.replace(STRING_LIKE_TOKEN, (match) => {
    const quote = match[0];
    if (quote !== '"' && quote !== "'") {
      return match;
    }
    const body = match.slice(1, -1);
    let raw = '';
    for (let i = 0; i < body.length; i++) {
      if (body[i] === '\\') {
        const next = body[i + 1];
        raw += next === "'" || next === '"' ? next : '\\' + next;
        i++;
      } else {
        raw += body[i];
      }
    }
    return '"' + raw.replace(/"/g, '\\"') + '"';
  });
}

function canonicalizeStringQuotes(code: string, ellipsisToken = '\u2026'): string {
  return code.split(ellipsisToken).map(canonicalizeSegmentQuotes).join(ellipsisToken);
}

/**
 * Strips redundant clarifying parentheses that NGP's `ExpressionPrinter` emits around binary,
 * conditional, or assignment expressions where TypeScript's AST printer omits them based on
 * operator precedence.
 */
export function stripRedundantClarifyingParens(code: string): string {
  const sf = ts.createSourceFile(
    '__cmp__.ts',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const isAssignmentOp = (kind: ts.SyntaxKind): boolean =>
    kind >= ts.SyntaxKind.FirstAssignment && kind <= ts.SyntaxKind.LastAssignment;

  const isAssignmentPositionRedundant = (e: ts.Expression): boolean =>
    (ts.isBinaryExpression(e) && e.operatorToken.kind !== ts.SyntaxKind.CommaToken) ||
    ts.isConditionalExpression(e) ||
    ts.isCallExpression(e) ||
    ts.isPropertyAccessExpression(e) ||
    ts.isElementAccessExpression(e) ||
    ts.isIdentifier(e) ||
    ts.isPrefixUnaryExpression(e) ||
    ts.isPostfixUnaryExpression(e) ||
    ts.isTaggedTemplateExpression(e) ||
    ts.isTemplateExpression(e) ||
    ts.isNoSubstitutionTemplateLiteral(e);

  const probeId = ts.factory.createIdentifier('__probe__');
  const isBinaryOperandRedundant = (p: ts.ParenthesizedExpression): boolean => {
    const parent = p.parent;
    if (!ts.isBinaryExpression(parent)) {
      return false;
    }
    const op = parent.operatorToken;
    if (isAssignmentOp(op.kind) && parent.right === p) {
      return isAssignmentPositionRedundant(p.expression);
    }
    if (parent.left === p) {
      if (op.kind === ts.SyntaxKind.AsteriskAsteriskToken) {
        return false;
      }
      return !ts.isParenthesizedExpression(
        ts.factory.createBinaryExpression(p.expression, op, probeId).left,
      );
    }
    if (parent.right === p) {
      return !ts.isParenthesizedExpression(
        ts.factory.createBinaryExpression(probeId, op, p.expression).right,
      );
    }
    return false;
  };

  const targetSet = new Set<ts.ParenthesizedExpression>();
  const consider = (e: ts.Expression | undefined): void => {
    let curr = e;
    while (curr && ts.isParenthesizedExpression(curr)) {
      if (isAssignmentPositionRedundant(curr.expression)) {
        targetSet.add(curr);
        curr = curr.expression;
      } else {
        break;
      }
    }
  };

  const visit = (node: ts.Node): void => {
    if (ts.isReturnStatement(node)) {
      consider(node.expression);
    } else if (ts.isExpressionStatement(node)) {
      consider(node.expression);
    } else if (ts.isVariableDeclaration(node)) {
      consider(node.initializer);
    } else if (ts.isPropertyAssignment(node)) {
      consider(node.initializer);
    } else if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) {
      consider(node.body);
    } else if (ts.isCallExpression(node)) {
      node.arguments.forEach(consider);
    } else if (ts.isNewExpression(node) && node.arguments) {
      node.arguments.forEach(consider);
    } else if (ts.isArrayLiteralExpression(node)) {
      node.elements.forEach(consider);
    } else if (ts.isElementAccessExpression(node)) {
      consider(node.argumentExpression);
    } else if (ts.isConditionalExpression(node)) {
      if (
        ts.isParenthesizedExpression(node.condition) &&
        ts.isBinaryExpression(node.condition.expression) &&
        !isAssignmentOp(node.condition.expression.operatorToken.kind) &&
        node.condition.expression.operatorToken.kind !== ts.SyntaxKind.CommaToken
      ) {
        targetSet.add(node.condition);
      }
      consider(node.whenTrue);
      consider(node.whenFalse);
    } else if (ts.isParenthesizedExpression(node) && isBinaryOperandRedundant(node)) {
      targetSet.add(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  if (targetSet.size === 0) {
    return code;
  }

  const cuts: number[] = [];
  for (const p of targetSet) {
    cuts.push(p.getStart(sf), p.getEnd() - 1);
  }
  cuts.sort((a, b) => b - a);
  let out = code;
  for (const pos of cuts) {
    out = out.slice(0, pos) + out.slice(pos + 1);
  }
  return out;
}

/**
 * Normalizes cosmetic differences between NGP's `ExpressionPrinter` + `tsc` emit and `ngtsc`'s
 * direct TypeScript AST transform emit for compliance golden comparisons.
 */
export function normalizeNgpEmitForComparison(code: string, ellipsisToken = '\u2026'): string {
  const classAliases: string[] = [];
  let normalized = code.replace(/static\s*\{\s*(\w+)_1\s*=\s*this;\s*\}\s*/g, (_, className) => {
    classAliases.push(className);
    return '';
  });
  for (const className of classAliases) {
    const re1 = new RegExp(`${className}\\s=\\s${className}_1\\s=\\s__decorate`, 'g');
    normalized = normalized.replace(re1, `${className} = __decorate`);
    const re2 = new RegExp(`${className}_1\\b`, 'g');
    normalized = normalized.replace(re2, className);
  }
  return (
    canonicalizeStringQuotes(normalized, ellipsisToken)
      .replace(/^[ \t]*\/\/\s*@ts-ignore[^\n]*\r?\n/gm, '')
      .replace(/\/\*\s*@ts-ignore\s*\*\/\s*/g, '')
      // NGP emits `/*@__PURE__*/` on `.ng.ts` static definitions (`static ɵcmp: Type = /*@__PURE__*/ ...`),
      // but TypeScript's emitter drops leading comments between `=` and the initializer expression when
      // downleveling typed static class fields or when `removeComments: true` is active (whereas ngtsc
      // attaches synthetic comments in an AST transformer during emit).
      .replace(
        /static\s+(ɵ(?:cmp|dir|pipe|mod|inj|prov|fac))\s*=\s*(?!\/\*\s*@__PURE__\s*\*\/)(i0\.ɵɵdefine|\(\(\)\s*=>)/g,
        'static $1 = /*@__PURE__*/ $2',
      )
      .replace(
        /\(\(\(typeof\s+(ngDevMode|ngJitMode)\s*===\s*(['"])undefined\2\)\s*\|\|\s*\1\)/g,
        '((typeof $1 === $2undefined$2 || $1)',
      )
      .replace(/\(([A-Za-z_$][A-Za-z0-9_$]*)\)\s*=>/g, '$1 =>')
      .replace(/\\\\n/g, '\\n')
      .replace(/\\\\r/g, '\\r')
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      })
      .replace(/ɵɵqueryRefresh\(\(([^)]+)\)\)/g, 'ɵɵqueryRefresh($1)')
      .replace(/,(\s*[\]})])/g, '$1')
      .replace(/^(\s*)\(("(?:[^"\\]|\\.)*")\);$/gm, '$1$2;')
  );
}

/**
 * Normalizes cosmetic differences in emitted `.js` and `.d.ts` files inspected by
 * `NgtscTestEnvironment.getContents()`.
 */
export function normalizeNgpOutputFile(content: string): string {
  return content
    .replace(/^[ \t]*\/\/[ \t]*@ts-ignore[^\n]*\r?\n/gm, '')
    .replace(/\/\*\s*@ts-ignore\s*\*\/\s*/g, '')
    .replace(
      /(\.(?:ɵcmp|ɵdir|ɵpipe|ɵmod|ɵinj|ɵprov)\s*=\s*)(?!\/\*\s*@__PURE__\s*\*\/)(i0\.ɵɵdefine)/g,
      '$1/*@__PURE__*/ $2',
    )
    .replace(
      /(\.ɵfac\s*=\s*function\s+[A-Za-z0-9_$]+\(__ngFactoryType__\)\s*\{)\s*\n\s*(return\s+new\s+\(__ngFactoryType__\s*\|\|\s*[A-Za-z0-9_$]+\)\([^;\n]*\);)\s*\n\s*\};/g,
      '$1 $2 };',
    )
    .replace(
      /\(\(\(typeof\s+(ngDevMode|ngJitMode)\s*===\s*(['"])undefined\2\)\s*\|\|\s*\1\)/g,
      '((typeof $1 === $2undefined$2 || $1)',
    )
    .replace(
      /\(\(typeof\s+(ngDevMode|ngJitMode)\s*===\s*(['"])undefined\2\s*\|\|\s*\1\)\s*&&\s*([^;\n]+)\);/g,
      '(typeof $1 === $2undefined$2 || $1) && $3;',
    )
    .replace(/'([^'\\\n]*)'/g, '"$1"');
}
