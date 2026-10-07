/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Emitted `// @ts-ignore` guards must actually suppress what they were emitted for.
 *
 * Unlike ngtsc, this compiler emits TypeScript, so its output is handed to `tsc` downstream and
 * the guards it writes are load-bearing. `// @ts-ignore` is line-scoped: TypeScript starts at the
 * line before the diagnostic and walks back only over blank lines and full-line `//` comments
 * (`markPrecedingCommentDirectiveLine`, `src/compiler/program.ts`). Blank lines between the guard
 * and the code are therefore harmless; a line of code is not, and ends the walk immediately.
 *
 * The golden suites cannot pin this: they reflow output with Prettier, which re-joins and
 * re-splits assignments by print width and so erases the distinction. These tests therefore assert
 * on the unformatted text, which is what `ngp.ts` writes to disk verbatim.
 */

import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as os from 'node:os';
import * as path from 'path';
import ts from 'typescript';
import {runPipeline, TestFile} from './utils.js';

const TSCONFIG = JSON.stringify({
  compilerOptions: {
    target: 'es2022',
    module: 'esnext',
    moduleResolution: 'bundler',
    experimentalDecorators: true,
  },
  files: ['untypable_transform.ts'],
  angularCompilerOptions: {},
});

/**
 * A `transform` that declares a second parameter is not assignable to Angular's
 * `InputTransformFunction`. The compiler relocates the function verbatim into the generated
 * definition, so the emitted file only compiles if the definition's guard covers it.
 * Modelled on ngtsc's `r3_view_compiler_input_outputs/input_transform` compliance fixture.
 */
const UNTYPABLE_INPUT = `@Input({transform: (value: string | number, _: any) => (value ? 1 : 0)})
  inlineFunctionInput: any;`;

const DIRECTIVE = `
import {Directive, Input} from '@angular/core';

@Directive({selector: '[my-directive]', standalone: false})
export class MyDirective {
  ${UNTYPABLE_INPUT}
}
`;

/**
 * The same untypable input, on a component that also has a host binding. `hostBindings` is emitted
 * as an inline multi-line function inside the definition object literal, so every property after
 * it — `inputs` among them — lands on a continuation line. See the known-limitation test below.
 */
const COMPONENT_WITH_HOST_BINDINGS = `
import {Component, Input} from '@angular/core';

@Component({
  selector: 'my-cmp',
  template: '<div></div>',
  standalone: false,
  host: {'[class.foo]': 'flag'},
})
export class MyCmp {
  flag = true;
  ${UNTYPABLE_INPUT}
}
`;

async function emitUnformatted(source: string): Promise<string> {
  const files: TestFile[] = [
    {path: '/tsconfig.json', content: TSCONFIG},
    {path: '/untypable_transform.ts', content: source},
  ];
  const outputs = await runPipeline(files, {optimize: true, format: false});
  const emitted = outputs.find((f) => f.path.endsWith('untypable_transform.ts'));
  if (!emitted) {
    throw new Error('pipeline produced no output for untypable_transform.ts');
  }
  return emitted.content;
}

function resolveCorePackagePath(): string {
  const runfilesDir = process.env['JS_BINARY__RUNFILES'] || process.env['RUNFILES_DIR'];
  if (runfilesDir) {
    const candidates = [
      path.join(runfilesDir, '_main/packages/core/npm_package'),
      path.join(runfilesDir, 'angular/packages/core/npm_package'),
    ];
    for (const c of candidates) {
      if (fsSync.existsSync(c)) {
        return c;
      }
    }
  }
  const relativeCandidates = [
    path.resolve(process.cwd(), 'dist/bin/packages/core/npm_package'),
    path.resolve(process.cwd(), 'packages/core'),
  ];
  for (const c of relativeCandidates) {
    if (fsSync.existsSync(c)) {
      return c;
    }
  }
  return path.resolve(process.cwd(), 'packages/core');
}

/** Type-checks `content` as a standalone program resolving against the repo's `@angular/core`. */
async function typeCheck(content: string): Promise<string[]> {
  const tmpRoot = process.env['TEST_TMPDIR'] || os.tmpdir();
  const dir = await fs.mkdtemp(path.join(tmpRoot, 'emit-suppressions-'));
  try {
    const file = path.join(dir, 'untypable_transform.ts');
    await fs.writeFile(file, content);

    const corePkgPath = resolveCorePackagePath();
    const program = ts.createProgram([file], {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      experimentalDecorators: true,
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      ignoreDeprecations: '6.0',
      paths: {
        '@angular/core': [corePkgPath, path.join(corePkgPath, 'index.d.ts')],
      },
    });

    return ts.getPreEmitDiagnostics(program).map((d) => {
      const where =
        d.file && d.start !== undefined
          ? `line ${d.file.getLineAndCharacterOfPosition(d.start).line + 1}: `
          : '';
      return `${where}TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`;
    });
  } finally {
    await fs.rm(dir, {recursive: true, force: true});
  }
}

describe('emitted @ts-ignore suppressions', () => {
  let emitted: string;

  beforeAll(async () => {
    emitted = await emitUnformatted(DIRECTIVE);
  });

  it('emits guarded definition members at all', () => {
    // Positive control: without this, the two negative assertions below would pass vacuously if
    // the analyzer ever stopped recognizing the decorator.
    expect(emitted).toContain('// @ts-ignore');
    expect(emitted).toContain('static ɵdir');
    expect(emitted).toContain('static ɵfac');
  });

  it('starts every generated definition initializer on the guarded line', () => {
    const lines = emitted.split('\n');

    // A break after `=` puts the declaration between `// @ts-ignore` and the initializer, which
    // ends TypeScript's backward walk and strands the guard. ngtsc starts the initializer on the
    // assignment line too: `static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({…});`
    expect(lines.filter((line) => /^\s*static\s+\S+.*=\s*$/.test(line))).toEqual([]);

    // Both emitted guard forms are matched: a full-line `// @ts-ignore`, and the trailing form
    // (`export class Foo {  // @ts-ignore`) produced when the insertion point is the class brace.
    // The trailing form is fine — directives are keyed by the line the comment *ends* on.
    for (let i = 0; i < lines.length - 1; i++) {
      if (!/\/\/\s*@ts-ignore\s*$/.test(lines[i])) {
        continue;
      }
      // A blank line here would be harmless (the walk skips blanks), but a line ending in `=`
      // would not be: the initializer would sit a further line down, out of reach.
      expect(lines[i + 1]).not.toMatch(/=\s*$/);
    }
  });

  it('suppresses the diagnostic the guard was emitted for', async () => {
    // The relocated transform is not assignable to `InputTransformFunction` (TS2322). It is
    // reported inside the `ɵɵdefineDirective` argument, so it is only suppressed when the
    // definition's `// @ts-ignore` sits on the line directly above the initializer.
    expect(await typeCheck(emitted)).toEqual([]);
  });

  // TODO: the guard reaches only the line the initializer starts on. `hostBindings` and `template`
  // are emitted as inline multi-line function expressions inside the definition object literal, so
  // any property printed after one of them lands on a continuation line the guard cannot cover.
  // Closing this needs a suppression mechanism that spans lines, which TypeScript does not offer;
  // `@ts-nocheck` is file-scoped, and collapsing the initializer onto one physical line would both
  // swallow the `//` comments Angular emits inside it and strand Angular's own `/* @ts-ignore */`
  // guards, which depend on sitting on their own line. Characterized here so the hole cannot widen
  // silently.
  it('does not yet reach initializer continuation lines (known limitation)', async () => {
    const withHostBindings = await emitUnformatted(COMPONENT_WITH_HOST_BINDINGS);
    const diagnostics = await typeCheck(withHostBindings);

    expect(diagnostics.length).toBe(1);
    expect(diagnostics[0]).toContain('TS2322');
    expect(diagnostics[0]).toContain('InputTransformFunction');
  });
});

describe('complianceMode option', () => {
  const TEST_CMP = `
import {Component} from '@angular/core';

@Component({selector: 'my-comp', template: '<h1>Hello</h1>', standalone: false})
export class MyComp {}
`;

  it('emits setClassMetadata in a static block by default', async () => {
    const files: TestFile[] = [
      {path: '/untypable_transform.ts', content: TEST_CMP},
      {path: '/tsconfig.json', content: TSCONFIG},
    ];
    const outputs = await runPipeline(files, {optimize: false, format: false});
    const output = outputs.find((f) => f.path.endsWith('/untypable_transform.ts'))!.content;

    expect(output).toContain('static {\n    (((typeof ngDevMode');
    expect(output).toContain('i0.ɵsetClassMetadata(MyComp');
  });

  it('emits setClassMetadata trailing after the class when complianceMode is true', async () => {
    const files: TestFile[] = [
      {path: '/untypable_transform.ts', content: TEST_CMP},
      {path: '/tsconfig.json', content: TSCONFIG},
    ];
    const outputs = await runPipeline(files, {
      optimize: false,
      format: false,
      complianceMode: true,
    });
    const output = outputs.find((f) => f.path.endsWith('/untypable_transform.ts'))!.content;

    expect(output).not.toContain('static {\n    (((typeof ngDevMode');
    expect(output).toMatch(/\(\(\)(?:: any)? => \{\s*\(\(\(typeof ngDevMode/);
    expect(output).toContain('i0.ɵsetClassMetadata(MyComp');
  });
});
