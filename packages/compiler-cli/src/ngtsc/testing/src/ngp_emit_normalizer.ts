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

/**
 * Replacements for `normalizeNgpEmitForComparison`, which compares Prettier-formatted NGP and
 * `ngtsc` compliance outputs.
 *
 * TODO(ngp-parity): Teach NGP's `ExpressionPrinter` to print statement leading comments (`/* @ts-ignore *\/`)
 * on `$localize` and `goog.getMsg` AST nodes so this replacement can be removed.
 */
const COMPARISON_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\/\*\s*@ts-ignore\s*\*\/\s*/g, ''],
];

/**
 * Replacements for `normalizeNgpOutputFile`, which inspects raw (non-Prettier) `.js` and `.d.ts`
 * files via `NgtscTestEnvironment.getContents()`.
 *
 * TODO(ngp-parity): Format or AST-compare `NgtscTestEnvironment` JS assertions, or align NGP's
 * `ExpressionPrinter` paren/quote/comment placement with `ngtsc`'s TypeScript printer.
 */
const OUTPUT_FILE_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/^[ \t]*\/\/[ \t]*@ts-ignore[^\n]*\r?\n/gm, ''],
  [/\/\*\s*@ts-ignore\s*\*\/\s*/g, ''],
  // NGP puts `/*@__PURE__*/` and `/** @pureOrBreakMyCode */` on the line after `=` (the only
  // placement `tsc` preserves when stripping static field types or downleveling static fields);
  // ngtsc emits them on the same line.
  [/=\s*\n\s*(\/\*(?:\* @pureOrBreakMyCode |@__PURE__)\*\/)/g, '= $1'],
  [
    /(\.ɵfac\s*=\s*function\s+[A-Za-z0-9_$]+\(__ngFactoryType__\)\s*\{)\s*\n\s*(return\s+new\s+\(__ngFactoryType__\s*\|\|\s*[A-Za-z0-9_$]+\)\([^;\n]*\);|[A-Za-z0-9_$]+\.ɵɵinvalidFactory\(\);)\s*\n\s*\};/g,
    '$1 $2 };',
  ],
  [/(\(function\s*\(\)\s*\{)\s*\n\s*([^;\n]+;)\s*\n\s*(\}\)\(\);)/g, '$1 $2 $3'],
  [
    /\(\(\(typeof\s+(ngDevMode|ngJitMode)\s*===\s*(['"])undefined\2\)\s*\|\|\s*\1\)/g,
    '((typeof $1 === $2undefined$2 || $1)',
  ],
  [
    /\(\(typeof\s+(ngDevMode|ngJitMode)\s*===\s*(['"])undefined\2\s*\|\|\s*\1\)\s*&&\s*([^;\n]+)\);/g,
    '(typeof $1 === $2undefined$2 || $1) && $3;',
  ],
  [
    /\(\(\)\s*=>\s*\{\s*\n\s*\(\(typeof\s+(ngDevMode|ngJitMode)\s*===\s*(['"])undefined\2\s*\|\|\s*\1\)\s*&&\s*([\s\S]*?)\);\s*\n\s*\}\)\(\);/g,
    '(() => { (typeof $1 === $2undefined$2 || $1) && $3; })();',
  ],
  [/\((m\.default && [A-Za-z0-9_$]+\.ɵɵreplaceMetadata\([^;\n]*\))\)/g, '$1'],
  [/'([^'\\\n]*)'/g, '"$1"'],
];

function canonicalizeSegmentQuotes(segment: string): string {
  return segment.replace(STRING_LIKE_TOKEN, (match) => {
    const quote = match[0];
    if (quote === '`') {
      return match.replace(
        /\$\{([^}]*)\}/g,
        (_, expr: string) => `\${${canonicalizeSegmentQuotes(expr)}}`,
      );
    }
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

/** Rewrites single-quoted string literals in `code` to double quotes, as TypeScript emits them. */
export function canonicalizeStringQuotes(code: string, ellipsisToken = '\u2026'): string {
  return code.split(ellipsisToken).map(canonicalizeSegmentQuotes).join(ellipsisToken);
}

/**
 * Normalizes a fragment of NGP-emitted code for comparison against the corresponding fragment of
 * ngtsc-emitted code, e.g. the generated side of a source-map segment.
 *
 * NGP's printer quotes strings, parenthesizes and breaks lines differently from ngtsc's
 * TypeScript emit. `normalizeNgpEmitForComparison` handles whole files with Prettier, which can't
 * run on a fragment, so this is a text-only approximation: quotes are canonicalized, and
 * parentheses and whitespace runs dropped.
 */
export function normalizeNgpSourceMapSegment(code: string): string {
  return canonicalizeStringQuotes(code).replace(/[()]/g, '').replace(/\s+/g, ' ');
}

function applyReplacements(
  code: string,
  replacements: ReadonlyArray<readonly [RegExp, string]>,
): string {
  let out = code;
  for (const [pattern, replacement] of replacements) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

/**
 * Normalizes cosmetic differences between NGP's `ExpressionPrinter` + `tsc` emit and `ngtsc`'s
 * direct TypeScript AST transform emit for compliance golden comparisons.
 */
export function normalizeNgpEmitForComparison(
  code: string,
  options?: {pruneUnusedImports?: boolean},
): string {
  let normalized = code;

  // TODO(ngp-parity): `ngtsc` runs as a TS transformer during emit, after TypeScript's
  // `emitDecoratorMetadata` pass has already marked types referenced by Angular decorators (e.g.
  // `QueryList`, `ElementRef`, `TemplateRef`) as value-used. NGP strips Angular decorators before
  // `tsc` runs, so `tsc` elides those imports. Either disable `emitDecoratorMetadata` in compliance
  // tests that do not test decorator metadata, or preserve decorator-metadata imports in NGP.
  if (options?.pruneUnusedImports) {
    const bodyWithoutImports = normalized.replace(
      /^[ \t]*import\s+(?:type\s+)?(?:\*\s+as\s+\w+|\{[^}]*\}|\w+)\s+from\s+['"][^'"]+['"];?[ \t]*\r?\n?/gm,
      '',
    );
    normalized = normalized.replace(
      /^[ \t]*import\s*\{([^}]*)\}\s*from\s*(['"][^'"]+['"]);?[ \t]*\r?\n?/gm,
      (_, specifiersStr: string, moduleQuote: string) => {
        const kept = specifiersStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .filter((spec) => {
            const parts = spec.split(/\s+as\s+/);
            const localName = parts[parts.length - 1].trim().replace(/^type\s+/, '');
            const escaped = localName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`(?<![.\\w$])${escaped}(?![\\w$])`).test(bodyWithoutImports);
          });
        return kept.length === 0 ? '' : `import { ${kept.join(', ')} } from ${moduleQuote};\n`;
      },
    );
  }

  // TODO(ngp-parity): When a class has both non-Angular decorators (e.g. `@CustomClassDecorator()`)
  // and static fields (`static ɵfac`, `static ɵcmp`), TS 5.0+ emits a `static { Class_1 = this; }`
  // alias. `ngtsc` avoids this because it adds static fields in an AST transformer after decorator
  // downleveling. Emit static definitions outside the class body in NGP when non-Angular class
  // decorators are present, or update those compliance goldens to standard TS 5.0+ decorator emit.
  const classAliases: string[] = [];
  normalized = normalized
    .replace(/static\s*\{\s*(\w+)_1\s*=\s*this;\s*\}\s*/g, (_, className) => {
      classAliases.push(className);
      return '';
    })
    .replace(/(\w+)_1\s*=\s*\1;\s*var\s+\1_1;\s*/g, (_, className) => {
      classAliases.push(className);
      return '';
    });
  for (const className of classAliases) {
    normalized = normalized
      .replace(
        new RegExp(`${className}\\s=\\s${className}_1\\s=\\s__decorate`, 'g'),
        `${className} = __decorate`,
      )
      .replace(new RegExp(`\\b${className}_1\\b`, 'g'), className);
  }
  if (classAliases.length > 0) {
    const aliasPattern = classAliases.join('|');
    normalized = normalized.replace(
      new RegExp(
        `^[ \\t]*var\\s+(?:${aliasPattern})(?:,\\s*(?:${aliasPattern}))*;[ \\t]*\\r?\\n`,
        'gm',
      ),
      '',
    );
  }

  return applyReplacements(normalized, COMPARISON_REPLACEMENTS);
}

/**
 * Normalizes cosmetic differences in emitted `.js` and `.d.ts` files inspected by
 * `NgtscTestEnvironment.getContents()`.
 */
export function normalizeNgpOutputFile(content: string): string {
  const normalized = normalizeDtsNamedImportsInStaticDeclarations(
    applyReplacements(content, OUTPUT_FILE_REPLACEMENTS),
  );
  let out = '';
  let last = 0;
  for (const match of normalized.matchAll(STRING_LIKE_TOKEN)) {
    out += normalized.slice(last, match.index).replace(/,(?=[^\s,])/g, ', ') + match[0];
    last = match.index + match[0].length;
  }
  return out + normalized.slice(last).replace(/,(?=[^\s,])/g, ', ');
}

/**
 * In `.d.ts` files, `ngp` preserves named imports (`import { Foo } from "./foo"`) for types and
 * values referenced inside `static ɵ...` declarations, whereas `ngtsc` synthesizes
 * `import * as iN from "./foo"` and qualifies references as `iN.Foo`.
 *
 * TODO(ngp-parity): Either synthesize namespace imports (`import * as iN`) for external symbols
 * referenced in `static ɵ...` and `ngAcceptInputType_*` `.d.ts` declarations in NGP, or update
 * `.d.ts` test assertions not to depend on `ngtsc`'s namespace import aliasing.
 */
function normalizeDtsNamedImportsInStaticDeclarations(content: string): string {
  if (!content.includes('static ɵ')) {
    return content;
  }

  const sf = ts.createSourceFile('__cmp__.d.ts', content, ts.ScriptTarget.Latest, true);
  const namespaceByModule = new Map<string, {ns: string; mod: string; pos: number}>([
    ['@angular/core', {ns: 'i0', mod: '@angular/core', pos: -1}],
  ]);
  const symbolToQualified = new Map<string, {qualified: string; ns: string}>();

  for (const stmt of sf.statements) {
    if (
      ts.isImportDeclaration(stmt) &&
      ts.isStringLiteral(stmt.moduleSpecifier) &&
      stmt.importClause?.namedBindings &&
      ts.isNamedImports(stmt.importClause.namedBindings)
    ) {
      const mod = stmt.moduleSpecifier.text;
      let entry = namespaceByModule.get(mod);
      if (!entry) {
        entry = {ns: `i${namespaceByModule.size}`, mod, pos: stmt.getStart(sf)};
        namespaceByModule.set(mod, entry);
      }
      for (const spec of stmt.importClause.namedBindings.elements) {
        symbolToQualified.set(spec.name.text, {
          qualified: `${entry.ns}.${(spec.propertyName ?? spec.name).text}`,
          ns: entry.ns,
        });
      }
    }
  }

  if (symbolToQualified.size === 0) {
    return content;
  }

  const edits: Array<{start: number; end: number; text: string}> = [];
  const usedNamespaces = new Set<string>();
  const visitTypeNode = (node: ts.Node): void => {
    if (ts.isIdentifier(node)) {
      const isRightOfAccess =
        (ts.isQualifiedName(node.parent) && node.parent.right === node) ||
        (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node);
      const match = !isRightOfAccess ? symbolToQualified.get(node.text) : undefined;
      if (match !== undefined) {
        usedNamespaces.add(match.ns);
        edits.push({start: node.getStart(sf), end: node.getEnd(), text: match.qualified});
      }
    }
    ts.forEachChild(node, visitTypeNode);
  };

  for (const stmt of sf.statements) {
    if (!ts.isClassDeclaration(stmt)) continue;
    for (const member of stmt.members) {
      if (
        ts.isPropertyDeclaration(member) &&
        member.type &&
        (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)) &&
        (member.name.text.startsWith('ɵ') || member.name.text.startsWith('ngAcceptInputType_'))
      ) {
        visitTypeNode(member.type);
      }
    }
  }

  for (const {ns, mod, pos} of namespaceByModule.values()) {
    if (pos >= 0 && usedNamespaces.has(ns)) {
      edits.push({start: pos, end: pos, text: `import * as ${ns} from "${mod}";\n`});
    }
  }

  let out = content;
  for (const {start, end, text} of edits.sort((a, b) => b.start - a.start)) {
    out = out.slice(0, start) + text + out.slice(end);
  }
  return out;
}
