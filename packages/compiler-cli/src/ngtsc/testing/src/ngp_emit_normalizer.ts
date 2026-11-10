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
  // NGP puts `/*@__PURE__*/` and `/** @pureOrBreakMyCode */` on the line after `=` (the only
  // placement `tsc` preserves when stripping static field types or downleveling static fields);
  // ngtsc emits them on the same line.
  [/=\s*\n\s*(\/\*(?:\* @pureOrBreakMyCode |@__PURE__)\*\/)/g, '= $1'],
  [
    /(\.ɵfac\s*=\s*function\s+[A-Za-z0-9_$]+\(__ngFactoryType__\)\s*\{)\s*\n\s*(?:(\/\*\s*@ts-ignore\s*\*\/\r?\n)\s*)?(return\s+new\s+\(__ngFactoryType__\s*\|\|\s*[A-Za-z0-9_$]+\)\([^;\n]*\);|[A-Za-z0-9_$]+\.ɵɵinvalidFactory\(\);)\s*\n\s*\};/g,
    '$1 $2$3 };',
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
    const rewrittenNamespaces = new Set<string>();
    normalized = normalizeCtorDiNamespaceImports(normalized, rewrittenNamespaces);

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
    if (rewrittenNamespaces.size > 0) {
      normalized = normalized.replace(
        /^[ \t]*import\s*\*\s*as\s*(i\d+)\s+from\s+['"][^'"]+['"];?[ \t]*\r?\n?/gm,
        (fullMatch, ns: string) => {
          if (!rewrittenNamespaces.has(ns)) {
            return fullMatch;
          }
          return new RegExp(`(?<![.\\w$])${ns}(?![\\w$])`).test(bodyWithoutImports)
            ? fullMatch
            : '';
        },
      );
    }
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
  const normalized = applyReplacements(content, OUTPUT_FILE_REPLACEMENTS);
  let out = '';
  let last = 0;
  for (const match of normalized.matchAll(STRING_LIKE_TOKEN)) {
    out += normalized.slice(last, match.index).replace(/,(?=[^\s,])/g, ', ') + match[0];
    last = match.index + match[0].length;
  }
  return out + normalized.slice(last).replace(/,(?=[^\s,])/g, ', ');
}

/**
 * In JS output, `ngp` references non-aliased named imports directly (`ElementRef`, `SomeService`)
 * for constructor DI tokens in `ɵfac` and `ɵsetClassMetadata`, whereas `ngtsc` synthesizes a
 * namespace import (`import * as iN from "..."`) and emits `iN.ElementRef` / `iN.SomeService`.
 * Rewrites those constructor DI positions in `ngtsc` compliance goldens so comparisons match.
 */
function normalizeCtorDiNamespaceImports(code: string, rewrittenNamespaces: Set<string>): string {
  const modToNs = new Map<string, string>();
  for (const [, ns, mod] of code.matchAll(
    /^[ \t]*import\s*\*\s*as\s*(i\d+)\s+from\s*['"]([^'"]+)['"]/gm,
  )) {
    modToNs.set(mod, ns);
  }
  if (modToNs.size === 0) return code;

  const qualifiedNamed = new Set<string>();
  for (const [, specs, mod] of code.matchAll(
    /^[ \t]*import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/gm,
  )) {
    const ns = modToNs.get(mod);
    if (!ns) continue;
    for (const raw of specs.split(',')) {
      const spec = raw.trim();
      if (spec && !spec.startsWith('type ') && !/\s+as\s+/.test(spec)) {
        qualifiedNamed.add(`${ns}.${spec}`);
      }
    }
  }
  if (qualifiedNamed.size === 0) return code;

  return code.replace(
    /(\.ɵɵ(?:directiveInject|inject)\(\s*|\btype:\s*)(i\d+)\.([A-Za-z_$][\w$]*)(?!\s*,\s*args\b)/g,
    (match, prefix: string, ns: string, sym: string) => {
      if (!qualifiedNamed.has(`${ns}.${sym}`)) return match;
      rewrittenNamespaces.add(ns);
      return prefix + sym;
    },
  );
}
