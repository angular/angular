/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// tslint:disable:no-console

import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as path from 'path';
import * as prettier from 'prettier';
import ts from 'typescript';
import {verifyUniqueFactory} from '../../test/compliance/test_helpers/di_checks.js';
import {expectEmit} from '../../test/compliance/test_helpers/expect_emit.js';
import {replaceMacros} from '../../test/compliance/test_helpers/expected_file_macros.js';
import {verifyUniqueFunctions} from '../../test/compliance/test_helpers/function_checks.js';
import {fs as ngFs} from '../../test/compliance/test_helpers/get_compliance_tests.js';
import {
  verifyPlaceholdersIntegrity,
  verifyUniqueConsts,
} from '../../test/compliance/test_helpers/i18n_checks.js';
import {stripAndCheckMappings} from '../../test/compliance/test_helpers/sourcemap_helpers.js';
import {runPipeline, pathExists, TestFile} from './utils.js';

function resolveComplianceDir(): string {
  const runfilesDir = process.env['JS_BINARY__RUNFILES'] || process.env['RUNFILES_DIR'];
  if (runfilesDir) {
    const candidates = [
      path.join(runfilesDir, '_main/packages/compiler-cli/test/compliance/test_cases'),
      path.join(runfilesDir, 'angular/packages/compiler-cli/test/compliance/test_cases'),
      path.join(runfilesDir, 'packages/compiler-cli/test/compliance/test_cases'),
    ];
    for (const c of candidates) {
      if (fsSync.existsSync(c)) {
        return c;
      }
    }
  }
  const relativeCandidates = [
    path.resolve(process.cwd(), 'packages/compiler-cli/test/compliance/test_cases'),
    path.resolve(import.meta.dirname, '../../test/compliance/test_cases'),
  ];
  for (const c of relativeCandidates) {
    if (fsSync.existsSync(c)) {
      return c;
    }
  }
  throw new Error('Compliance directory not found');
}

const COMPLIANCE_DIR = resolveComplianceDir();

interface TestCase {
  description: string;
  inputFiles: string[];
  compilationModeFilter?: string[];
  angularCompilerOptions?: Record<string, any>;
  compilerOptions?: Record<string, any>;
  expectations: Array<{
    files?: Array<{expected: string; generated: string} | string>;
    failureMessage?: string;
    extraChecks?: Array<string | [string, ...any[]]>;
    expectedErrors?: Array<{message: string; location?: string}>;
  }>;
}

interface TestCasesJson {
  cases: TestCase[];
}

function monkeyPatchContent(content: string): string {
  return (
    content
      // First convert actual `\r\n` sequences to `\n`
      .replace(/\r\n/g, '\n')
      // unescape `\r\n` at the end of a line
      .replace(/\\r\\n\n/g, '\r\n')
      // unescape `\\r\\n`, at the end of a line, to `\r\n`
      .replace(/\\\\r\\\\n(\r?\n)/g, '\\r\\n$1')
  );
}

// Matches, in priority order: line comment, block comment, template literal, then
// double- or single-quoted string. The first three are consumed as opaque units so a
// quote inside them (e.g. `${"x"}` or a URL) is never mistaken for a string delimiter.
const STRING_LIKE_TOKEN =
  /\/\/[^\n]*|\/\*[\s\S]*?\*\/|`(?:\\[\s\S]|[^\\`])*`|"(?:\\[\s\S]|[^\\"])*"|'(?:\\[\s\S]|[^\\'])*'/g;

// expectEmit's SKIP marker: `…` hides arbitrary output, so a golden is not always valid
// TS (a class may be left unclosed, or a string's closing quote may sit on the far side
// of a `…`). See ELLIPSIS in expect_emit.ts.
const ELLIPSIS = '…';

function canonicalizeSegmentQuotes(segment: string): string {
  return segment.replace(STRING_LIKE_TOKEN, (match) => {
    const quote = match[0];
    if (quote !== '"' && quote !== "'") {
      return match; // comment or template literal: opaque
    }
    const body = match.slice(1, -1);
    // Decode only the quote escapes (\' and \"), preserving every other backslash
    // sequence (\\, \n, \uXXXX, ...) verbatim, then re-escape bare double quotes.
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

/**
 * Canonicalize every plain string literal to a double-quoted form, leaving template
 * literals and comments untouched.
 *
 * Our pipeline transpiles the preprocessor output and runs it through prettier, which
 * picks a single quote style (and minimizes escaping). The reference goldens, by
 * contrast, mix quote styles: compiler-generated code is double-quoted (printed via the
 * TS printer), user source is preserved verbatim (single-quoted in these fixtures), and
 * i18n `original_code` maps are expanded by `replaceMacros` to double-quoted-and-escaped.
 * No single prettier setting can match all three, so we normalize quote style on *both*
 * sides before token comparison. Quote style carries no semantic meaning in the emitted
 * JS, so this only removes a formatting artifact of our transpile+prettier step.
 *
 * Each `…`-delimited segment is normalized independently so a quote is never paired
 * across a SKIP boundary: if a closing quote is hidden behind a `…`, the dangling open
 * quote stays unmatched in its own segment instead of swallowing the code that follows.
 * This mirrors expectEmit's own assumption that `…` falls on a token boundary. Our
 * compiled output contains no `…`, so the split is a no-op on that side.
 */
function canonicalizeStringQuotes(code: string): string {
  return code.split(ELLIPSIS).map(canonicalizeSegmentQuotes).join(ELLIPSIS);
}

/**
 * Strip the redundant "clarifying" parentheses that prettier adds (and that the TypeScript
 * printer used by ngtsc does not) around assignment / compound-assignment / conditional
 * (ternary) expressions in positions where the grammar already permits an
 * `AssignmentExpression`: a `return` value, an arrow-function concise body, and call/new
 * arguments. In those positions such parens are redundant by operator precedence, so removing
 * them never changes semantics.
 */
function stripRedundantClarifyingParens(code: string): string {
  const sf = ts.createSourceFile(
    '__cmp__.ts',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const isAssignmentOp = (kind: ts.SyntaxKind): boolean =>
    kind >= ts.SyntaxKind.FirstAssignment && kind <= ts.SyntaxKind.LastAssignment;

  // Only assignment / compound-assignment and conditional expressions need no wrapping parens
  // in an AssignmentExpression position; everything else is left alone.
  const isAssignmentPositionRedundant = (e: ts.Expression): boolean =>
    (ts.isBinaryExpression(e) && isAssignmentOp(e.operatorToken.kind)) ||
    ts.isConditionalExpression(e) ||
    (ts.isBinaryExpression(e) && e.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken);

  // Probe TypeScript's factory parenthesizer: rebuild the parent binary with the unwrapped
  // operand and see whether the factory re-inserts a `ParenthesizedExpression`. If not, the
  // original parens were redundant.
  const probeId = ts.factory.createIdentifier('__probe__');
  const isBinaryOperandRedundant = (p: ts.ParenthesizedExpression): boolean => {
    const parent = p.parent;
    if (!ts.isBinaryExpression(parent)) {
      return false;
    }
    const op = parent.operatorToken;
    if (parent.left === p) {
      // The left operand of `**` essentially always needs its parens (e.g. `(-1) ** 3`,
      // `(a * b) ** c`), and TS's parenthesizer under-parenthesizes that spot, so never strip it.
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

  const targets: ts.ParenthesizedExpression[] = [];
  const consider = (e: ts.Expression | undefined): void => {
    if (e && ts.isParenthesizedExpression(e) && isAssignmentPositionRedundant(e.expression)) {
      targets.push(e);
    }
  };

  const visit = (node: ts.Node): void => {
    if (ts.isReturnStatement(node)) {
      consider(node.expression);
    } else if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) {
      consider(node.body);
    } else if (ts.isCallExpression(node)) {
      node.arguments.forEach(consider);
    } else if (ts.isNewExpression(node) && node.arguments) {
      node.arguments.forEach(consider);
    } else if (ts.isParenthesizedExpression(node) && isBinaryOperandRedundant(node)) {
      targets.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  if (targets.length === 0) {
    return code;
  }

  // Remove each node's outer `(` (at its start) and `)` (at end - 1). Apply right-to-left so
  // earlier offsets stay valid.
  const cuts: number[] = [];
  for (const p of targets) {
    cuts.push(p.getStart(sf), p.getEnd() - 1);
  }
  cuts.sort((a, b) => b - a);
  let out = code;
  for (const pos of cuts) {
    out = out.slice(0, pos) + out.slice(pos + 1);
  }
  return out;
}

function normalizeJsForComparison(code: string): string {
  // The reference compliance harness roots its mock file-system at `/`, whereas this harness
  // mounts every test file under `/virtual_project`. Absolute resource paths that ngtsc emits
  // verbatim (e.g. `ɵɵExternalStylesFeature(["/style-A.css"])`) therefore differ only by this
  // mount prefix; strip it so the comparison is root-agnostic.
  return (
    canonicalizeStringQuotes(code)
      .replace(/\/virtual_project\//g, '/')
      .replace(/^[ \t]*\/\/ @ts-ignore\r?\n/gm, '')
      .replace(/\\\\n/g, '\\n')
      .replace(/\\\\r/g, '\\r')
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      })
      .replace(/ɵɵqueryRefresh\(\(([^)]+)\)\)/g, 'ɵɵqueryRefresh($1)')
      // Prettier formats without trailing commas while ngtsc preserves them in metadata; drop both for comparison.
      .replace(/,(\s*[\]})])/g, '$1')
      // Prettier wraps bare string literals in parentheses (to avoid directive prologues); TS printer does not.
      .replace(/^(\s*)\(("(?:[^"\\]|\\.)*")\);$/gm, '$1$2;')
  );
}

function getAdjacentAssetsSync(baseDir: string, currentDir: string = baseDir): TestFile[] {
  const entries = fsSync.readdirSync(currentDir, {withFileTypes: true});
  const results: TestFile[] = [];
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAdjacentAssetsSync(baseDir, fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.html') || entry.name.endsWith('.css'))) {
      const relativePath = path.relative(baseDir, fullPath);
      results.push({
        path: `/virtual_project/${relativePath.replace(/\\/g, '/')}`,
        content: monkeyPatchContent(fsSync.readFileSync(fullPath, 'utf-8')),
      });
    }
  }
  return results;
}

/**
 * Ensures embedded `=` characters in selector strings (like `["span[title=toFirst]"]`) don't
 * prematurely terminate the type match.
 */
const STATIC_MEMBER_TYPE_ANNOTATION_REGEX =
  /(static\s+ɵ\w+)\s*:\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|[^"'`=])*=\s*/g;

async function compileTsToJs(tsContent: string, target?: string): Promise<string> {
  // Strip type annotations from preprocessed static fields to prevent the TypeScript transpiler
  // from dropping /*@__PURE__*/ comments during type stripping.
  const cleanTsContent = tsContent.replace(STATIC_MEMBER_TYPE_ANNOTATION_REGEX, '$1 = ');

  // Honor the test case's `target` so ES5 fixtures get downleveled (tagged templates ->
  // `__makeTemplateObject`, classes -> functions), matching ngtsc's compliance goldens.
  const scriptTarget =
    (target
      ? (ts.ScriptTarget as unknown as Record<string, ts.ScriptTarget>)[target.toUpperCase()]
      : undefined) ?? ts.ScriptTarget.ES2022;

  const result = ts.transpileModule(cleanTsContent, {
    compilerOptions: {
      target: scriptTarget,
      module: ts.ModuleKind.ES2015,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      removeComments: false,
    },
  });

  let outputText = result.outputText;

  // TS 5.0+ generates `static { ClassName_1 = this; }` for decorated classes with static fields.
  // The Angular compliance goldens do not include this because ngtsc downlevels decorators differently.
  // We strip it out to match the expected goldens.
  const classAliases: string[] = [];
  outputText = outputText.replace(/static\s*\{\s*(\w+)_1\s*=\s*this;\s*\}\s*/g, (_, className) => {
    classAliases.push(className);
    return '';
  });
  for (const className of classAliases) {
    const re1 = new RegExp(`${className}\\s=\\s${className}_1\\s=\\s__decorate`, 'g');
    outputText = outputText.replace(re1, `${className} = __decorate`);
    const re2 = new RegExp(`${className}_1\\b`, 'g');
    outputText = outputText.replace(re2, className);
  }

  try {
    return await prettier.format(outputText, {
      parser: 'babel',
      singleQuote: false,
      trailingComma: 'none',
      arrowParens: 'avoid',
      quoteProps: 'preserve',
    });
  } catch (e) {
    return result.outputText;
  }
}

const LOCAL_EXTRA_CHECK_FUNCTIONS: Record<string, (generated: string, ...args: any[]) => boolean> =
  {
    verifyUniqueFactory,
    verifyUniqueFunctions,
    verifyPlaceholdersIntegrity,
    verifyUniqueConsts,
  };

function runLocalExtraChecks(extraChecks: Array<string | [string, ...any[]]>, generated: string) {
  for (const check of extraChecks) {
    let fnName: string;
    let args: any[];
    if (Array.isArray(check)) {
      [fnName, ...args] = check;
    } else {
      fnName = check;
      args = [];
    }
    const fn = LOCAL_EXTRA_CHECK_FUNCTIONS[fnName];
    if (fn) {
      if (!fn(generated, ...args)) {
        throw new Error(`Extra check '${fnName}' failed for generated code.`);
      }
    } else {
      console.warn(`Unknown extra check: ${fnName}`);
    }
  }
}

function findTestCasesSync(dir: string): string[] {
  try {
    const files = fsSync.readdirSync(dir, {withFileTypes: true});
    const results: string[] = [];
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        results.push(...findTestCasesSync(fullPath));
      } else if (file.name === 'TEST_CASES.json') {
        results.push(fullPath);
      }
    }
    return results;
  } catch (err) {
    return [];
  }
}

const filterDir = process.env['COMPLIANCE_FILTER'];
const searchDir = filterDir ? path.join(COMPLIANCE_DIR, filterDir) : COMPLIANCE_DIR;
const configFiles = findTestCasesSync(searchDir);

describe('Angular Compliance Tests', () => {
  for (const configPath of configFiles) {
    const testDir = path.dirname(configPath);
    const relativeTestDir = path.relative(COMPLIANCE_DIR, testDir);

    describe(relativeTestDir, () => {
      const config: TestCasesJson = JSON.parse(fsSync.readFileSync(configPath, 'utf-8'));
      const adjacentAssets = getAdjacentAssetsSync(testDir);
      const seenDescriptions = new Map<string, number>();

      for (const testCase of config.cases) {
        const inputFiles = testCase.inputFiles || ['test.ts'];
        const count = (seenDescriptions.get(testCase.description) ?? 0) + 1;
        seenDescriptions.set(testCase.description, count);
        const baseDescription =
          count > 1 ? `${testCase.description} (${inputFiles.join(', ')})` : testCase.description;

        const inputSourceFiles = inputFiles.map((inputFile) => {
          const inputPath = path.join(testDir, inputFile);
          if (!fsSync.existsSync(inputPath)) {
            throw new Error(`Input file not found: ${inputFile}`);
          }
          return {
            path: `/virtual_project/${inputFile}`,
            content: monkeyPatchContent(fsSync.readFileSync(inputPath, 'utf-8')),
          };
        });
        const sourceFiles: TestFile[] = [...inputSourceFiles];

        for (const asset of adjacentAssets) {
          if (!sourceFiles.find((f) => f.path === asset.path)) {
            sourceFiles.push(asset);
          }
        }

        // Add a mock tsconfig.json as runPipeline requires it
        const tsconfig = {
          compilerOptions: {
            target: 'es2022',
            module: 'esnext',
            experimentalDecorators: true,
            emitDecoratorMetadata: false,
            moduleResolution: 'node',
            ...(testCase.compilerOptions || {}),
          },
          angularCompilerOptions: testCase.angularCompilerOptions || {},
        };
        sourceFiles.push({
          path: '/virtual_project/tsconfig.json',
          content: JSON.stringify(tsconfig),
        });

        const modes = testCase.compilationModeFilter || ['full compile'];
        for (const mode of modes) {
          if (mode !== 'full compile' && mode !== 'local compile') continue;

          const isLocal = mode === 'local compile';
          const modeSuffix = isLocal ? ' (local compile)' : ' (full compile)';

          it(`${baseDescription}${modeSuffix}`, async () => {
            try {
              const capturedErrors: string[] = [];
              const actualOutputs = await runPipeline(sourceFiles, {
                optimize: !isLocal,
                templateParseOptions: testCase.angularCompilerOptions,
                errors: capturedErrors,
                complianceMode: true,
                format: false,
              });

              // Find expectations or compute defaults
              const expectationsList =
                testCase.expectations && testCase.expectations.length > 0
                  ? testCase.expectations
                  : [{files: undefined, extraChecks: undefined, expectedErrors: undefined}];

              for (const expectation of expectationsList) {
                if (expectation.expectedErrors && expectation.expectedErrors.length > 0) {
                  for (const expectedErr of expectation.expectedErrors) {
                    const msgRegex = new RegExp(expectedErr.message || '');
                    const locRegex = new RegExp(expectedErr.location || '');
                    const matched = capturedErrors.some(
                      (errStr) => msgRegex.test(errStr) && locRegex.test(errStr),
                    );
                    if (!matched) {
                      throw new Error(
                        `Expected compilation error not found.\n` +
                          `Expected: message=${expectedErr.message}, location=${expectedErr.location}\n` +
                          `Actual errors:\n${capturedErrors.join('\n')}`,
                      );
                    }
                  }
                  continue;
                }

                if (capturedErrors.length > 0) {
                  throw new Error(`Unexpected compilation errors:\n${capturedErrors.join('\n')}`);
                }

                const expectedFiles =
                  expectation.files ||
                  inputFiles.map((f) => {
                    const ext = isLocal ? '.local.js' : '.js';
                    return f.replace(/\.ts$/, ext);
                  });

                for (const filePair of expectedFiles) {
                  const expectedName = typeof filePair === 'string' ? filePair : filePair.expected;
                  const generatedName =
                    typeof filePair === 'string' ? filePair : filePair.generated;

                  let resolvedExpectedName = expectedName;
                  if (isLocal) {
                    const localName = expectedName.replace(/\.js$/, '.local.js');
                    if (await pathExists(path.join(testDir, localName))) {
                      resolvedExpectedName = localName;
                    }
                  }

                  const tsPath = `/out/virtual_project/${generatedName.replace(/\.js$/, '.ts')}`;
                  let outTs = actualOutputs.find((o) => o.path === tsPath);

                  if (!outTs) {
                    const originalName = `/virtual_project/${generatedName.replace(/\.js$/, '.ts')}`;
                    const originalFile = sourceFiles.find((f) => f.path === originalName);
                    if (originalFile) {
                      outTs = {path: tsPath, content: originalFile.content};
                    }
                  }

                  if (!outTs) {
                    throw new Error(
                      `Missing generated output for ${generatedName} (looked for ${tsPath} and original file)`,
                    );
                  }

                  const outJs = await compileTsToJs(
                    outTs.content,
                    testCase.compilerOptions?.['target'],
                  );

                  const expectedPath = path.join(testDir, resolvedExpectedName);
                  if (!(await pathExists(expectedPath))) {
                    throw new Error(`Expected file not found: ${expectedName}`);
                  }
                  let expectedContent = await fs.readFile(expectedPath, 'utf-8');

                  expectedContent = replaceMacros(expectedContent);
                  expectedContent = stripAndCheckMappings(
                    ngFs,
                    outJs,
                    ngFs.resolve('/out/virtual_project/' + generatedName),
                    expectedContent,
                    ngFs.resolve(expectedPath),
                    true, // skipMappingCheck
                  );
                  expectedContent = expectedContent.replace(/\\uFFFD/g, '\uFFFD');

                  // When ngp preserves an existing named import (e.g. `import { SomeService } from "./external"`)
                  // instead of emitting a synthetic `import * as i1` namespace import in local mode,
                  // strip the `i1.` prefix in the expected snippet for those preserved named imports.
                  let normalizedExpected = normalizeJsForComparison(expectedContent);
                  for (const match of outJs.matchAll(
                    /import\s*\{([^}]+)\}\s*from\s*["'][^"']+["']/g,
                  )) {
                    for (const spec of match[1].split(',')) {
                      const ident = spec
                        .trim()
                        .split(/\s+as\s+/)
                        .pop()
                        ?.trim();
                      if (ident && !new RegExp(`import\\s*\\*\\s*as\\s+i[1-9]\\d*`).test(outJs)) {
                        normalizedExpected = normalizedExpected.replace(
                          new RegExp(`\\bi[1-9]\\d*\\.${ident}\\b`, 'g'),
                          ident,
                        );
                      }
                    }
                  }

                  expectEmit(
                    normalizeJsForComparison(stripRedundantClarifyingParens(outJs)),
                    normalizedExpected,
                    `Checking ${generatedName} in ${testCase.description}`,
                  );

                  if (expectation.extraChecks) {
                    runLocalExtraChecks(expectation.extraChecks, outJs);
                  }
                }
              }
            } catch (err: any) {
              const context =
                `❌ Test Failed: ${testCase.description}\n` +
                `   Directory: ${relativeTestDir}\n` +
                `   Error: ${err.message || err}`;
              throw new Error(context, {cause: err});
            }
          }, 30_000);
        }
      }
    });
  }
});
