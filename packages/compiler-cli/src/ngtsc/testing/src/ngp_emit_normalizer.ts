/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const STRING_LIKE_TOKEN =
  /\/\/[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\[\s\S]|[^\\`])*`|"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'/g;

/**
 * Replacements for `normalizeNgpEmitForComparison`, which compares Prettier-formatted NGP and
 * `ngtsc` compliance outputs.
 */
// TODO(ngp-parity): Eliminate each entry below by aligning NGP's emit with `ngtsc`:
// - `/* @ts-ignore */`: Teach NGP's `ExpressionPrinter` to print statement leading comments on
//   `$localize` and `goog.getMsg` AST nodes.
// - `/*@__PURE__*/`: Wrap pure static initializers in parens or emit them in a form where `tsc`
//   does not strip the `/*@__PURE__*/` comment when erasing static field type annotations or
//   downleveling static fields to ES5.
// - `{ ...{ ... }, isSignal: true }`: Slice the raw options argument span into an object spread in
//   `processor.ts` (`buildPropDecoratorsExpr`) for signal queries, or emit a flat literal in `ngtsc`.
// - `args: [null]`: Record `argsSpan` on decorator metadata in `ng-analyze` even when the argument
//   is not an object literal (e.g. `@Pipe(null!)`).
// - `MSG_...$$_FILE_TS`: Pass a rootDir-relative file path (without a leading `/`) when computing
//   Closure `goog.getMsg` variable names in NGP so `/foo.ts` does not produce a leading `_FOO_TS`.
const COMPARISON_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\/\*\s*@ts-ignore\s*\*\/\s*/g, ''],
  [
    /(\.(?:ɵcmp|ɵdir|ɵpipe|ɵmod|ɵinj|ɵprov)\s*=\s*)(?!\/\*\s*@__PURE__\s*\*\/)([A-Za-z0-9_$ɵ]+\.ɵɵdefine)/g,
    '$1/*@__PURE__*/ $2',
  ],
  [
    /static\s+(ɵ(?:cmp|dir|pipe|mod|inj|prov|fac))\s*=\s*(?!\/\*\s*@__PURE__\s*\*\/)(i0\.ɵɵdefine|\(\(\)\s*=>)/g,
    'static $1 = /*@__PURE__*/ $2',
  ],
  [/\{\s*\.\.\.\{\s*([^{}]*?)\s*\},\s*isSignal:\s*true\s*\}/g, '{ isSignal: true, $1 }'],
  [/\{\s*type:\s*([A-Za-z0-9_$.]+),\s*args:\s*\[null\]\s*\}/g, '{ type: $1 }'],
  [/\b(MSG_(?:EXTERNAL_[A-Za-z0-9_$.]+?\$\$)?)(?:_([A-Za-z0-9_$]+))\b/g, '$1$2'],
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
  [
    /(\.(?:ɵcmp|ɵdir|ɵpipe|ɵmod|ɵinj|ɵprov)\s*=\s*)(?!\/\*\s*@__PURE__\s*\*\/)([A-Za-z0-9_$ɵ]+\.ɵɵdefine)/g,
    '$1/*@__PURE__*/ $2',
  ],
  // Under `annotateForClosureCompiler` NGP puts `/** @pureOrBreakMyCode */` on the line after `=`.
  [/=\s*\n\s*(\/\*\* @pureOrBreakMyCode \*\/)/g, '= $1'],
  [
    /\(\(\(typeof\s+(ngDevMode|ngJitMode)\s*===\s*(['"])undefined\2\)\s*\|\|\s*\1\)/g,
    '((typeof $1 === $2undefined$2 || $1)',
  ],
  [
    /(\.ɵfac\s*=\s*function\s+[A-Za-z0-9_$]+\(__ngFactoryType__\)\s*\{)\s*\n\s*(return\s+new\s+\(__ngFactoryType__\s*\|\|\s*[A-Za-z0-9_$]+\)\([^;\n]*\);)\s*\n\s*\};/g,
    '$1 $2 };',
  ],
  [
    /\(\(typeof\s+(ngDevMode|ngJitMode)\s*===\s*(['"])undefined\2\s*\|\|\s*\1\)\s*&&\s*([^;\n]+)\);/g,
    '(typeof $1 === $2undefined$2 || $1) && $3;',
  ],
  [/\((m\.default && [A-Za-z0-9_$]+\.ɵɵreplaceMetadata\([^;\n]*\))\)/g, '$1'],
  [/'([^'\\\n]*)'/g, '"$1"'],
];

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

/** Rewrites single-quoted string literals in `code` to double quotes, as TypeScript emits them. */
export function canonicalizeStringQuotes(code: string, ellipsisToken = '\u2026'): string {
  return code.split(ellipsisToken).map(canonicalizeSegmentQuotes).join(ellipsisToken);
}

/**
 * Normalizes a fragment of NGP-emitted code for comparison against the corresponding fragment of
 * ngtsc-emitted code, e.g. the generated side of a source-map segment.
 *
 * NGP's printer quotes strings, parenthesizes and breaks lines differently from ngtsc's
 * TypeScript emit, which also escapes non-ASCII characters. `normalizeNgpEmitForComparison`
 * handles whole files with Prettier, which can't run on a fragment, so this is a text-only
 * approximation: quotes are canonicalized, `\uXXXX` escapes decoded, and parentheses and
 * whitespace runs dropped.
 */
export function normalizeNgpSourceMapSegment(code: string): string {
  return canonicalizeStringQuotes(code)
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/[()]/g, '')
    .replace(/\s+/g, ' ');
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
export function normalizeNgpEmitForComparison(code: string): string {
  let normalized = code;

  // TODO(ngp-parity): `ngtsc` runs as a TS transformer during emit, after TypeScript's
  // `emitDecoratorMetadata` pass has already marked types referenced by Angular decorators (e.g.
  // `QueryList`, `ElementRef`, `TemplateRef`) as value-used. NGP strips Angular decorators before
  // `tsc` runs, so `tsc` elides those imports. Either disable `emitDecoratorMetadata` in compliance
  // tests that do not test decorator metadata, or preserve decorator-metadata imports in NGP.
  const bodyWithoutImports = normalized.replace(
    /^[ \t]*import\s+(?:type\s+)?(?:\*\s+as\s+\w+|\{[\s\S]*?\}|\w+)\s+from\s+['"][^'"]+['"];?[ \t]*\r?\n?/gm,
    '',
  );
  normalized = normalized.replace(
    /^[ \t]*import\s*\{([\s\S]*?)\}\s*from\s*(['"][^'"]+['"]);?[ \t]*\r?\n?/gm,
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

  // TODO(ngp-parity): Escape non-ASCII characters (such as `\uFFFD` i18n placeholder markers) as
  // `\uXXXX` in NGP's `ExpressionPrinter` string literal emitter to match `ngtsc` / TS emit.
  return applyReplacements(normalized, COMPARISON_REPLACEMENTS).replace(
    /\\u([0-9a-fA-F]{4})/g,
    (_, hex) => String.fromCharCode(parseInt(hex, 16)),
  );
}

/**
 * Normalizes cosmetic differences in emitted `.js` and `.d.ts` files inspected by
 * `NgtscTestEnvironment.getContents()`.
 */
export function normalizeNgpOutputFile(content: string): string {
  const normalized = applyReplacements(content, OUTPUT_FILE_REPLACEMENTS);
  let out = '';
  let last = 0;
  for (const match of normalized.matchAll(STRING_LIKE_TOKEN)) {
    out += normalized.slice(last, match.index).replace(/,(?=[^\s,])/g, ', ') + match[0];
    last = match.index + match[0].length;
  }
  return out + normalized.slice(last).replace(/,(?=[^\s,])/g, ', ');
}
