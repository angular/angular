/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Type-checks the TypeScript this compiler emits across all golden test cases.
 *
 * For each golden case this runs the pipeline over `source.md` and reconstructs the compilation
 * unit the emitted files belong to: the inputs, overlaid with the output. The unit is then checked
 * against the *inputs* compiled on their own, and only diagnostics that the emit introduced are
 * reported.
 */

import * as fsSync from 'node:fs';
import * as fs from 'node:fs/promises';
import * as os from 'os';
import * as path from 'path';
import ts from 'typescript';

import {
  collectGoldenCasesSync,
  pipelineOptionsFor,
  resolveGoldenRoot,
  type GoldenMode,
} from './golden_cases.js';
import {parseMarkdownTestCase, type TestFile} from './golden_markdown.js';
import {getOrCreateSyntheticNodeModules, pathExists, runPipeline} from './utils.js';

/** Suffix identifying Template type-checking block files. */
const TCB_SUFFIX = '.ngtypecheck.ts';

/**
 * Shared by the standard and optimize variants of `multiline_param_decorator_arg`, which emit the
 * same factory.
 */
const MULTILINE_PARAM_DECORATOR_ARG_REASON =
  "the fixture's multi-line `@Inject({...})` argument is spliced into `ɵfac` verbatim, pushing " +
  '`i0.ɵɵinject(angular.ITimeoutService)` onto a continuation line past the reach of the ' +
  "factory's single `/* @ts-ignore */`. That guard is attached to the whole return statement by " +
  '`@angular/compiler` itself, so closing this needs a fix upstream in `r3_factory.ts`; the ' +
  '`ɵsetClassMetadata` half, which this fixture exists to pin, is clean because its guard sits ' +
  'on each parameter `type` property assignment.';

/**
 * Cases that report diagnostics the differencing below cannot clear, each with the reason. A case
 * is named as reported (`<golden>` or `<golden> (optimized)`). An entry whose case starts passing
 * is itself reported as a failure, so the list cannot quietly go stale.
 */
const KNOWN_FAILURES = new Map<string, string>([
  [
    'ngmodule_imports_elision',
    "the fixture's `imports: [AModule, , BModule]` holds a deliberate array hole, which TypeScript " +
      'types as `(T | undefined)[]`. The inputs are rejected for it too, so the emit introduces ' +
      'nothing — but the source is checked against `NgModule.imports` and the output against the ' +
      'generated `ɵɵsetNgModuleScope` argument, so the two messages name different target types ' +
      'and cannot be paired. Preserving the hole is the point of the fixture, and matches ngtsc.',
  ],
  [
    'queries',
    'the fixture queries `SomeComponent` and `SomeModule`, which it never declares — the inputs ' +
      'are rejected for it too. The emit repeats those references inside the multi-line ' +
      '`viewQuery`/`contentQueries` functions, past the reach of the `ɵcmp` guard, so the ' +
      "input's own error is reported again rather than paired against it.",
  ],
  [
    'same_class_name_two_modules (optimized)',
    'the deferred dependency is imported as `Widget as WidgetB`, so the generated ' +
      '`ɵsetClassMetadataAsync` callback binds `Widget` while the decorator body it reproduces ' +
      'still reads `WidgetB`. Aliasing is unavoidable in this fixture: all three declarations ' +
      'export the name `Widget`, which is the collision it exists to pin.',
  ],
  [
    'defer_deferred_imports_same_name',
    'the deferred dependency is imported as `Widget as WidgetB`, so the generated ' +
      '`ɵsetClassMetadataAsync` callback binds `Widget` while the decorator body it reproduces ' +
      'still reads `WidgetB`. Aliasing is unavoidable in this fixture: all three declarations ' +
      'export the name `Widget`, which is the collision it exists to pin.',
  ],
  [
    'defer_deferred_imports_same_name (optimized)',
    'the deferred dependency is imported as `Widget as WidgetB`, so the generated ' +
      '`ɵsetClassMetadataAsync` callback binds `Widget` while the decorator body it reproduces ' +
      'still reads `WidgetB`. Aliasing is unavoidable in this fixture: all three declarations ' +
      'export the name `Widget`, which is the collision it exists to pin.',
  ],
  ['multiline_param_decorator_arg', MULTILINE_PARAM_DECORATOR_ARG_REASON],
  ['multiline_param_decorator_arg (optimized)', MULTILINE_PARAM_DECORATOR_ARG_REASON],
]);

/**
 * Known failures in .ngtypecheck.ts (TCB) files that cannot yet be cleared.
 */
const KNOWN_FAILURES_TCB = new Map<string, string>([]);

/**
 * Minimal ambient declaration for `@angular/animations`.
 */
const ANGULAR_ANIMATIONS_STUB = `
declare module '@angular/animations' {
  export interface AnimationEvent {
    fromState: string;
    toState: string;
    totalTime: number;
    phaseName: string;
    element: any;
    triggerName: string;
    disabled: boolean;
  }
}
`;

interface GoldenCase {
  readonly name: string;
  readonly testCase: string;
  readonly dir: string;
  readonly mode: GoldenMode;
}

function collectCasesSync(): GoldenCase[] {
  const goldenRoot = resolveGoldenRoot();
  const testCases = collectGoldenCasesSync(goldenRoot).sort((a, b) => a.localeCompare(b));
  const cases: GoldenCase[] = [];

  for (const testCase of testCases) {
    const dir = path.join(goldenRoot, testCase);
    for (const [golden, mode, suffix] of [
      ['golden.md', 'standard', ''],
      ['golden.opt.md', 'optimize', ' (optimized)'],
    ] as const) {
      if (fsSync.existsSync(path.join(dir, golden))) {
        cases.push({name: testCase + suffix, testCase, dir, mode});
      }
    }
  }

  return cases;
}

function toSourcePath(emittedPath: string): string {
  return emittedPath.startsWith('/out/') ? emittedPath.slice('/out'.length) : emittedPath;
}

function isStubbedAngularPackage(filePath: string): boolean {
  return filePath.startsWith('/node_modules/@angular/');
}

interface CompilationUnits {
  readonly baseline: TestFile[];
  readonly emitted: TestFile[];
}

async function buildCompilationUnits(
  testCase: GoldenCase,
): Promise<CompilationUnits | {skip: string}> {
  const source = await parseMarkdownTestCase(path.join(testCase.dir, 'source.md'));

  const errors: string[] = [];
  const produced = await runPipeline(source, {
    ...pipelineOptionsFor(testCase.testCase, testCase.mode),
    format: false,
    errors,
  });

  const emitted = produced.filter((file) => file.path.endsWith('.ts'));
  if (emitted.length === 0) {
    return {skip: errors.length > 0 ? 'pipeline reported errors' : 'pipeline emits no TypeScript'};
  }

  const baseline = source.filter((file) => !isStubbedAngularPackage(file.path));

  const overlaid = new Map(baseline.map((file) => [file.path, file.content]));
  for (const file of emitted) {
    overlaid.set(toSourcePath(file.path), file.content);
  }

  return {
    baseline,
    emitted: [...overlaid].map(([filePath, content]) => ({path: filePath, content})),
  };
}

async function materialize(
  files: TestFile[],
  variantRoot: string,
): Promise<{projectRoot: string; roots: string[]}> {
  const projectRoot = path.join(variantRoot, 'project');
  await fs.mkdir(projectRoot, {recursive: true});

  const animStubPath = path.join(projectRoot, '__angular_animations_stub__.d.ts');
  const nodeModulesDir = getOrCreateSyntheticNodeModules();

  const [_, __, roots] = await Promise.all([
    nodeModulesDir
      ? fs.symlink(nodeModulesDir, path.join(variantRoot, 'node_modules'), 'dir')
      : Promise.resolve(),
    fs.writeFile(animStubPath, ANGULAR_ANIMATIONS_STUB),
    Promise.all(
      files.map(async (file) => {
        const absolute = path.join(projectRoot, file.path);
        await fs.mkdir(path.dirname(absolute), {recursive: true});
        await fs.writeFile(absolute, file.content);
        return file.path.endsWith('.ts') ? absolute : null;
      }),
    ).then((results) => results.filter((r): r is string => r !== null)),
  ]);

  roots.push(animStubPath);

  return {projectRoot, roots};
}

const COMPILER_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
  strict: true,
  experimentalDecorators: true,
  skipLibCheck: true,
  noEmit: true,
  types: [],
};

const sharedSourceFiles = new Map<string, ts.SourceFile | undefined>();

function createHost(
  variantRoot: string,
  options: ts.CompilerOptions = COMPILER_OPTIONS,
): ts.CompilerHost {
  const host = ts.createCompilerHost(options, true);
  const delegate = host.getSourceFile.bind(host);

  host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
    if (fileName.startsWith(variantRoot)) {
      return delegate(fileName, languageVersion, onError, shouldCreate);
    }
    if (!sharedSourceFiles.has(fileName)) {
      sharedSourceFiles.set(fileName, delegate(fileName, languageVersion, onError, false));
    }
    return sharedSourceFiles.get(fileName);
  };

  return host;
}

function diagnosticKey(diagnostic: ts.Diagnostic, projectRoot: string): string {
  const file = diagnostic.file ? path.relative(projectRoot, diagnostic.file.fileName) : '<global>';
  const message = ts
    .flattenDiagnosticMessageText(diagnostic.messageText, ' ')
    .split(projectRoot)
    .join('');
  return `${file}: error TS${diagnostic.code}: ${message}`;
}

const tcbBodyRanges = new WeakMap<ts.SourceFile, Array<{start: number; end: number}>>();

function getTcbBodyRanges(sourceFile: ts.SourceFile): Array<{start: number; end: number}> {
  let ranges = tcbBodyRanges.get(sourceFile);
  if (ranges !== undefined) return ranges;

  ranges = [];
  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text.startsWith('_tcb') && node.body) {
      ranges!.push({
        start: node.body.getStart(sourceFile),
        end: node.body.getEnd(),
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  tcbBodyRanges.set(sourceFile, ranges);
  return ranges;
}

function isInsideTcbBody(sourceFile: ts.SourceFile, pos: number): boolean {
  const ranges = getTcbBodyRanges(sourceFile);
  return ranges.some((r) => pos >= r.start && pos <= r.end);
}

async function diagnose(files: TestFile[], variantRoot: string): Promise<string[]> {
  const {projectRoot, roots} = await materialize(files, variantRoot);
  let options = COMPILER_OPTIONS;
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  if (await pathExists(tsconfigPath)) {
    const parsedJson = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    if (parsedJson.config) {
      const parsedConfig = ts.parseJsonConfigFileContent(
        parsedJson.config,
        ts.sys,
        projectRoot,
        COMPILER_OPTIONS,
        tsconfigPath,
      );
      options = {
        ...COMPILER_OPTIONS,
        ...(parsedConfig.options.paths
          ? {
              paths: parsedConfig.options.paths,
              baseUrl: parsedConfig.options.baseUrl ?? projectRoot,
            }
          : {}),
        ...(parsedConfig.options.rootDirs ? {rootDirs: parsedConfig.options.rootDirs} : {}),
      };
    }
  }

  const host = createHost(variantRoot, options);
  const program = ts.createProgram({
    rootNames: roots,
    options,
    host,
  });

  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => {
      if (
        diagnostic.file &&
        diagnostic.file.fileName.endsWith(TCB_SUFFIX) &&
        diagnostic.start !== undefined
      ) {
        if (isInsideTcbBody(diagnostic.file, diagnostic.start)) {
          return false;
        }
      }
      return true;
    })
    .map((diagnostic) => diagnosticKey(diagnostic, projectRoot));
}

function introducedDiagnostics(baseline: string[], emitted: string[]): string[] {
  const remaining = new Map<string, number>();
  for (const key of baseline) {
    remaining.set(key, (remaining.get(key) ?? 0) + 1);
  }

  const introduced: string[] = [];
  for (const key of emitted) {
    const count = remaining.get(key) ?? 0;
    if (count > 0) {
      remaining.set(key, count - 1);
    } else {
      introduced.push(key);
    }
  }

  return introduced;
}

describe('typecheck goldens', () => {
  const cases = collectCasesSync();

  for (const testCase of cases) {
    it(`typechecks emitted output for ${testCase.name}`, async () => {
      const units = await buildCompilationUnits(testCase);
      if ('skip' in units) {
        return;
      }

      const caseRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'ng-golden-tsc-'));
      let introduced: string[];
      try {
        introduced = introducedDiagnostics(
          await diagnose(units.baseline, path.join(caseRoot, 'baseline')),
          await diagnose(units.emitted, path.join(caseRoot, 'emitted')),
        );
      } finally {
        await fs.rm(caseRoot, {recursive: true, force: true});
      }

      const known = KNOWN_FAILURES.get(testCase.name) ?? KNOWN_FAILURES_TCB.get(testCase.name);
      if (known !== undefined) {
        expect(introduced.length)
          .withContext(
            `Emitted output for ${testCase.name} now type-checks; drop its KNOWN_FAILURES entry (${known})`,
          )
          .toBeGreaterThan(0);
      } else {
        expect(introduced)
          .withContext(`Emitted TypeScript introduced type errors:\n  ${introduced.join('\n  ')}`)
          .toEqual([]);
      }
    });
  }
});
