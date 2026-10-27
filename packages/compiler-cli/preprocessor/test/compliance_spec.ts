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

async function compileTsToJs(tsContent: string, target?: string): Promise<string> {
  // Honor the test case's `target` so ES5 fixtures get downleveled (tagged templates ->
  // `__makeTemplateObject`, classes -> functions), matching ngtsc's compliance goldens.
  const scriptTarget =
    (target
      ? (ts.ScriptTarget as unknown as Record<string, ts.ScriptTarget>)[target.toUpperCase()]
      : undefined) ?? ts.ScriptTarget.ES2022;

  const result = ts.transpileModule(tsContent, {
    compilerOptions: {
      target: scriptTarget,
      module: ts.ModuleKind.ES2015,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      removeComments: false,
    },
  });

  const outputText = result.outputText.replace(/\r\n/g, '\n').replace(/\/virtual_project\//g, '/');

  try {
    return await prettier.format(outputText, {
      parser: 'babel',
      printWidth: 100,
      singleQuote: false,
      trailingComma: 'none',
      arrowParens: 'avoid',
      quoteProps: 'preserve',
    });
  } catch {
    return outputText;
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
          files: inputFiles.map((f) => `/virtual_project/${f}`),
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
                  const rawExpectedContent = await fs.readFile(expectedPath, 'utf-8');
                  const allowPartial = /\/\/\s*SOURCE:/.test(rawExpectedContent);
                  let expectedContent = replaceMacros(rawExpectedContent);
                  expectedContent = stripAndCheckMappings(
                    ngFs,
                    outJs,
                    ngFs.resolve('/out/' + generatedName),
                    expectedContent,
                    ngFs.resolve(expectedPath),
                    true, // skipMappingCheck
                  );
                  expectEmit(
                    outJs,
                    expectedContent,
                    `Checking ${generatedName} in ${testCase.description}`,
                    undefined,
                    {isNgpCompilation: true, allowPartial},
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
