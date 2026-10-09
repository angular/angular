/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Test utilities for ngp tests
 */

import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as os from 'node:os';
import * as path from 'path';
import {createTwoFilesPatch, diffLines} from 'diff';
import {format} from 'prettier';

import type {TestFile} from './golden_markdown.js';
import {getDiagnosticPath, serializeDiagnostics, HybridCompiler} from '../src/hybrid_compiler.js';
import {createAnalyzer} from '../api.js';
import {buildTypeCheckingConfig} from '../src/tcb.js';
import type {AnalysisResult, CompilationChunk} from '../src/types.js';

export {
  parseMarkdownContent,
  parseMarkdownTestCase,
  writeMarkdownTestCase,
  type TestFile,
} from './golden_markdown.js';

export function pathExists(p: string): Promise<boolean> {
  return fs.access(p).then(
    () => true,
    () => false,
  );
}

export function resolveWasmBinding(): string {
  if (process.env['NGP_WASM_BINDING']) {
    return process.env['NGP_WASM_BINDING'];
  }
  const runfilesDir = process.env['JS_BINARY__RUNFILES'] || process.env['RUNFILES_DIR'];
  if (runfilesDir) {
    const candidates = [
      path.join(
        runfilesDir,
        '_main/packages/compiler-cli/preprocessor/ng-analyze/ng_analyze_wasm/ng_analyze_wasm.js',
      ),
      path.join(
        runfilesDir,
        'angular/packages/compiler-cli/preprocessor/ng-analyze/ng_analyze_wasm/ng_analyze_wasm.js',
      ),
      path.join(
        runfilesDir,
        'packages/compiler-cli/preprocessor/ng-analyze/ng_analyze_wasm/ng_analyze_wasm.js',
      ),
    ];
    for (const c of candidates) {
      if (fsSync.existsSync(c)) {
        return c;
      }
    }
  }
  const relativeCandidates = [
    path.resolve(
      process.cwd(),
      '../../packages/compiler-cli/preprocessor/ng-analyze/ng_analyze_wasm/ng_analyze_wasm.js',
    ),
    path.resolve(
      process.cwd(),
      'dist/bin/packages/compiler-cli/preprocessor/ng-analyze/ng_analyze_wasm/ng_analyze_wasm.js',
    ),
  ];
  for (const c of relativeCandidates) {
    if (fsSync.existsSync(c)) {
      return c;
    }
  }
  throw new Error(
    `Could not find ng_analyze_wasm.js in runfiles. Checked runfilesDir=${runfilesDir}, cwd=${process.cwd()}`,
  );
}

function resolvePackagePath(pkg: string): string | null {
  const runfilesDir = process.env['JS_BINARY__RUNFILES'] || process.env['RUNFILES_DIR'];
  if (runfilesDir) {
    const candidates = [
      path.join(runfilesDir, `_main/packages/${pkg}/npm_package`),
      path.join(runfilesDir, `angular/packages/${pkg}/npm_package`),
    ];
    for (const c of candidates) {
      if (fsSync.existsSync(c)) {
        return c;
      }
    }
  }
  const relativeCandidates = [
    path.resolve(process.cwd(), `dist/bin/packages/${pkg}/npm_package`),
    path.resolve(process.cwd(), `packages/${pkg}/npm_package`),
  ];
  for (const c of relativeCandidates) {
    if (fsSync.existsSync(c)) {
      return c;
    }
  }
  return null;
}

let syntheticNodeModules: string | null = null;
export function getOrCreateSyntheticNodeModules(): string | null {
  if (syntheticNodeModules) return syntheticNodeModules;
  const corePath = resolvePackagePath('core');
  if (!corePath) return null;
  const tmpRoot = process.env['TEST_TMPDIR'] || os.tmpdir();
  const dir = path.join(tmpRoot, 'ngp_synthetic_node_modules');
  const angularDir = path.join(dir, '@angular');
  fsSync.mkdirSync(angularDir, {recursive: true});
  for (const pkg of ['core', 'common']) {
    const pkgPath = resolvePackagePath(pkg);
    if (pkgPath) {
      const symlink = path.join(angularDir, pkg);
      if (!fsSync.existsSync(symlink)) {
        try {
          fsSync.symlinkSync(pkgPath, symlink, 'junction');
        } catch {}
      }
    }
  }
  syntheticNodeModules = dir;
  return dir;
}

/**
 * Merge actual output with expected golden file, preserving ellipses
 */
export async function mergeGolden(actual: TestFile[], expected: TestFile[]): Promise<TestFile[]> {
  const expectedMap = new Map(expected.map((f) => [f.path, f.content]));

  return Promise.all(
    actual.map(async (actualFile) => {
      const expectedContent = expectedMap.get(actualFile.path);
      if (!expectedContent) {
        return actualFile;
      }
      if (!expectedContent.includes('…')) {
        return actualFile;
      }

      // Format expected content with placeholders to match actual formatting
      const formattedExpected = await formatWithPlaceholders(actualFile.path, expectedContent);

      // Attempt to merge
      const mergedContent = applyEllipses(actualFile.content, formattedExpected);
      return {
        path: actualFile.path,
        content: mergedContent,
      };
    }),
  );
}

/**
 * Format content that might contain ellipses by using placeholders
 */
async function formatWithPlaceholders(filePath: string, content: string): Promise<string> {
  if (!content.includes('…')) {
    return formatContent(filePath, content);
  }

  // Try using a comment placeholder first (valid in most places)
  const commentPlaceholder = '/*__ELLIPSIS__*/';
  // Prettier adds spaces around comments: /* __ELLIPSIS__ */
  const commentRegex = /\/\*\s*__ELLIPSIS__\s*\*\//g;

  try {
    const withComments = content.replace(/…/g, commentPlaceholder);
    const formatted = await formatContent(filePath, withComments);
    return formatted.replace(commentRegex, '…');
  } catch (e) {
    // Return original on error
  }

  return content;
}

function applyEllipses(actual: string, expected: string): string {
  const changes = diffLines(expected, actual);
  let result = '';
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    if (change.removed) {
      if (change.value.includes('…')) {
        // Keep the ellipsis from expected
        result += change.value;
        // Skip any corresponding added block from actual
        const nextChange = changes[i + 1];
        if (nextChange && nextChange.added) {
          i++;
        }
      } else {
        // Normal removal. If followed by an addition, it's a replacement.
        const nextChange = changes[i + 1];
        if (nextChange && nextChange.added) {
          result += nextChange.value;
          i++;
        }
      }
    } else if (change.added) {
      // Pure addition
      result += change.value;
    } else {
      // Unchanged
      result += change.value;
    }
  }
  return result;
}

/**
 * Format virtual file content using Prettier
 */
async function formatContent(filePath: string, content: string): Promise<string> {
  try {
    const parser = filePath.endsWith('.ts')
      ? 'typescript'
      : filePath.endsWith('.json')
        ? 'json'
        : undefined;
    if (!parser) return content;

    return await format(content, {
      parser,
      singleQuote: true,
      trailingComma: 'all',
      printWidth: 100,
      quoteProps: 'preserve',
    });
  } catch (e) {
    console.warn(`Failed to format ${filePath}:`, e);
    return content;
  }
}

/**
 * Run the test pipeline with virtual files
 */
export async function runPipeline(
  sourceFiles: TestFile[],
  options: {
    optimize: boolean;
    wasm?: boolean;
    enableSelectorless?: boolean;
    sidecar?: boolean;
    templateParseOptions?: Record<string, any>;
    errors?: string[];
    format?: boolean;
    complianceMode?: boolean;
  },
): Promise<TestFile[]> {
  const maybeFormat = (p: string, content: string): Promise<string> =>
    options.format === false ? Promise.resolve(content) : formatContent(p, content);

  // Find real node_modules path (walk up from current dir)
  let nodeModulesPath = process.cwd();
  while (!(await pathExists(path.join(nodeModulesPath, 'node_modules', '@angular')))) {
    const parent = path.dirname(nodeModulesPath);
    if (parent === nodeModulesPath) break;
    nodeModulesPath = parent;
  }
  const candidatePath = path.join(nodeModulesPath, 'node_modules');
  if (await pathExists(path.join(candidatePath, '@angular'))) {
    nodeModulesPath = candidatePath;
  } else {
    nodeModulesPath = getOrCreateSyntheticNodeModules() || candidatePath;
  }

  const virtualFiles: Record<string, string> = {};
  for (const f of sourceFiles) {
    virtualFiles[f.path] = f.content;
  }

  const tsconfigFile = sourceFiles.find((f) => f.path.endsWith('tsconfig.json'));
  if (!tsconfigFile) {
    throw new Error('tsconfig.json must be provided in source files');
  }

  let tsconfigOptions: any = {};
  let compilerOptions: any = {};
  let bazelOptions: any = {};
  try {
    const parsed = JSON.parse(tsconfigFile.content);
    tsconfigOptions = parsed.angularCompilerOptions ?? {};
    compilerOptions = parsed.compilerOptions ?? {};
    bazelOptions = parsed.bazelOptions || parsed.bazelOpts || {};
  } catch (e) {
    // Ignore
  }

  const isClosureCompilerEnabled =
    tsconfigOptions.annotateForClosureCompiler === true ||
    bazelOptions.annotateForClosureCompiler === true ||
    bazelOptions.tsickle === true;

  const emitDeclarationOnly =
    compilerOptions.emitDeclarationOnly === true &&
    tsconfigOptions._experimentalAllowEmitDeclarationOnly === true;

  const onlyPublishPublicTypingsForNgModules =
    tsconfigOptions.onlyPublishPublicTypingsForNgModules === true;

  const forbidOrphanComponents = tsconfigOptions.forbidOrphanComponents === true;
  const supportJitMode = tsconfigOptions.supportJitMode !== false;
  const ngtscOptions = {
    preserveWhitespaces: tsconfigOptions.preserveWhitespaces,
    supportTestBed: tsconfigOptions.supportTestBed,
    enableI18nLegacyMessageIdFormat: tsconfigOptions.enableI18nLegacyMessageIdFormat ?? false,
    i18nUseExternalIds: tsconfigOptions.i18nUseExternalIds,
    i18nNormalizeLineEndingsInICUs: tsconfigOptions.i18nNormalizeLineEndingsInICUs,
  };

  const workspaceName = tsconfigOptions.workspaceName;
  const rootDirs = compilerOptions.rootDirs;

  const outputs: TestFile[] = [];

  const normalizePathKey = (p: string) => p.replace(/\\/g, '/').toLowerCase();

  const virtualFileMap = new Map<string, string>();
  for (const f of sourceFiles) {
    const key = normalizePathKey(f.path);
    virtualFileMap.set(key, f.content);
    const withoutSlash = key.replace(/^\//, '');
    virtualFileMap.set(withoutSlash, f.content);
    virtualFileMap.set('/' + withoutSlash, f.content);
  }

  const wasmBinding = resolveWasmBinding();
  const analyzer = await createAnalyzer(tsconfigFile.path, {
    backend: 'wasm',
    wasmBinding,
    virtualFiles,
    optimize: options.optimize,
    nodeModulesPathOverride: nodeModulesPath,
    workspaceName,
    rootDirs,
  });

  const compiler = new HybridCompiler(analyzer, {
    optimize: options.optimize,
    tsconfigPath: tsconfigFile.path,
    virtualFiles,
    tcbConfig: buildTypeCheckingConfig({
      strictTemplates: true,
      checkTypeOfDomBindings: false,
      ...tsconfigOptions,
      useContextGenericType:
        tsconfigOptions.strictContextGenerics ?? tsconfigOptions.useContextGenericType,
    }),
    templateParseOptions: {
      enableSelectorless: options.enableSelectorless,
      ...options.templateParseOptions,
    },
    legacyOptionalChaining: tsconfigOptions.legacyOptionalChaining,
    isClosureCompilerEnabled,
    onlyExplicitDeferDependencyImports: tsconfigOptions.onlyExplicitDeferDependencyImports,
    enableTemplateSourceLocations: tsconfigOptions.enableTemplateSourceLocations,
    emitDeclarationOnly,
    onlyPublishPublicTypingsForNgModules,
    forbidOrphanComponents,
    supportJitMode,
    ...ngtscOptions,
    externalRuntimeStyles:
      tsconfigOptions.externalRuntimeStyles ??
      options.templateParseOptions?.['externalRuntimeStyles'],
    rootDir: path.posix.dirname(tsconfigFile.path),
    complianceMode: options.complianceMode,
    workspaceName,
    rootDirs,
  });

  let processedFiles = 0;
  const iterator =
    options.optimize && !emitDeclarationOnly ? compiler.analyzeOptimized() : compiler.analyze();
  for await (const chunk of iterator) {
    const chunkContext = await compiler.prepareChunk(chunk);
    for (const result of chunk.files) {
      const {filePath, classes} = result;

      if (classes.length > 0) {
        processedFiles++;
      }

      const content = virtualFileMap.get(normalizePathKey(filePath));
      if (!content) continue;

      try {
        const processed = await compiler.processFile(
          filePath,
          content,
          (p) => virtualFileMap.get(normalizePathKey(p)),
          result,
          chunkContext,
        );
        const emitted = processed.magicString.toString();

        const outPath = '/out/' + filePath.replace(/\\/g, '/').replace(/^\//, '');

        if (emitted !== content) {
          outputs.push({
            path: outPath,
            content: await maybeFormat(outPath, emitted),
          });
        }

        // Generate TCB file if in optimize mode
        if (processed.tcb) {
          const tcbPath = outPath.replace(/\.ts$/, '.ngtypecheck.ts');
          let tcbContent = processed.tcb.code;
          if (processed.tcb.diagnostics && processed.tcb.diagnostics.length > 0) {
            tcbContent += `\n/* Diagnostics:\n`;
            for (const diag of processed.tcb.diagnostics) {
              tcbContent += ` - (${diag.start}, ${diag.end}) ${diag.message}\n`;
            }
            tcbContent += `*/\n`;
          }
          outputs.push({
            path: tcbPath,
            content: await maybeFormat(tcbPath, tcbContent),
          });
        }
      } catch (e: any) {
        if (options.errors) {
          options.errors.push(e.message || String(e));
        } else {
          throw e;
        }
      }
    }
  }

  if (outputs.length === 0 && processedFiles > 0) {
    if (!options.errors || options.errors.length === 0) {
      throw new Error(
        'Pipeline produced no outputs for files with classes. This usually indicates a compilation or processing error in the source.',
      );
    }
  }

  const hasDiagnostics = [...compiler.diagnosticsMap.values()].some((diags) => diags.length > 0);
  if (hasDiagnostics) {
    const diagPath = getDiagnosticPath(tsconfigFile.path);
    const diagContent = serializeDiagnostics(tsconfigFile.path, compiler.diagnosticsMap);
    outputs.push({
      path: diagPath,
      content: await formatContent(diagPath, diagContent),
    });
  }

  compiler.analyzer.close();

  return outputs;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function checkMatch(actual: string, expected: string): boolean {
  if (!expected.includes('…')) {
    return normalizeWhitespace(actual) === normalizeWhitespace(expected);
  }

  const normalizedActual = normalizeWhitespace(actual);
  const normalizedExpected = normalizeWhitespace(expected);

  const parts = normalizedExpected.split('…');
  const escapedParts = parts.map((part) => escapeRegExp(part).replace(/\s+/g, '\\s*'));
  const regexStr = '^\\s*' + escapedParts.join('[\\s\\S]*?') + '\\s*$';
  const regex = new RegExp(regexStr);

  return regex.test(normalizedActual);
}

/**
 * Compare actual outputs with expected outputs
 */
export function compareOutputs(actual: TestFile[], expected: TestFile[]): void {
  const actualMap = new Map(actual.map((f) => [f.path, f.content]));
  const expectedMap = new Map(expected.map((f) => [f.path, f.content]));

  for (const [filePath, expectedContent] of expectedMap) {
    const actualContent = actualMap.get(filePath);
    if (actualContent === undefined) {
      throw new Error(`Missing file: ${filePath}`);
    }
    const normalizedActual = normalizeWhitespace(actualContent);
    const normalizedExpected = normalizeWhitespace(expectedContent);

    if (!checkMatch(actualContent, expectedContent)) {
      const diff = createTwoFilesPatch(
        `${filePath} (expected)`,
        `${filePath} (actual)`,
        normalizedExpected,
        normalizedActual,
        '',
        '',
        {context: 3},
      );
      throw new Error(`Content mismatch for ${filePath}:\n\n${diff}`);
    }
  }

  for (const filePath of actualMap.keys()) {
    if (!expectedMap.has(filePath)) {
      throw new Error(`Unexpected file: ${filePath}`);
    }
  }
}

function normalizeWhitespace(s: string): string {
  let normalized = s
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();

  // Normalize Prettier 3.8 vs 3.9 semicolon placement for trailing block comments on statements
  while (true) {
    const next = normalized.replace(/;\s*(\/\*[\s\S]*?\*\/)/g, ' $1;');
    if (next === normalized) break;
    normalized = next;
  }

  // Normalize return types on functions and arrow functions (: any) so differences between
  // compiler versions or golden snapshots do not cause spurious mismatches.
  normalized = normalized.replace(/\):\s*any\s*=>/g, ') =>');
  normalized = normalized.replace(/\):\s*any\s*\{/g, ') {');

  return normalized;
}

export async function* flatten(
  iterator: AsyncIterable<CompilationChunk>,
): AsyncGenerator<AnalysisResult, void, unknown> {
  for await (const chunk of iterator) {
    for (const file of chunk.files) {
      yield file;
    }
  }
}
