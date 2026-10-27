/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runPipeline, TestFile} from './utils.js';

describe('@angular/core import rewriting', () => {
  it('should import runtime symbols from r3_symbols.ts instead of @angular/core', async () => {
    const out = await compileCore([R3_SYMBOLS, INJECTABLE_DECORATOR, APPLICATION_REF]);
    const emitted = out.get('/out/core/src/application/application_ref.ts')!;

    expect(emitted).toContain("import * as i0 from '../r3_symbols';");
    expect(emitted).not.toContain("from '@angular/core'");
    expect(emitted).toContain('i0.ɵɵdefineInjectable(');
    expect(emitted).toContain('static ɵprov: i0.ɵɵInjectableDeclaration<');
    expect(emitted).toContain('static ɵfac: i0.ɵɵFactoryDeclaration<ApplicationRef, never>');
  });

  it('should rename symbols to their r3_symbols.ts export names', async () => {
    const out = await compileCore([R3_SYMBOLS, INJECTABLE_DECORATOR, APPLICATION_REF]);
    const emitted = out.get('/out/core/src/application/application_ref.ts')!;

    // `ɵsetClassMetadata` is exported from `r3_symbols.ts` under its internal name.
    expect(emitted).toContain('i0.setClassMetadata(');
    expect(emitted).not.toContain('ɵsetClassMetadata');
  });

  it('should compute the specifier relative to each importing file', async () => {
    const out = await compileCore([R3_SYMBOLS, INJECTABLE_DECORATOR, APPLICATION_REF, CONSOLE]);

    expect(out.get('/out/core/src/application/application_ref.ts')!).toContain(
      "import * as i0 from '../r3_symbols';",
    );
    expect(out.get('/out/core/src/console.ts')!).toContain("import * as i0 from './r3_symbols';");
  });

  it('should keep importing @angular/core when r3_symbols.ts is not part of the compilation', async () => {
    // A secondary entry point such as `@angular/core/testing` shares core's `package.json` but
    // is a separate compilation that does not include `r3_symbols.ts`; ngtsc uses the
    // `NoopImportRewriter` there.
    const testBed: TestFile = {
      path: '/core/testing/src/test_bed.ts',
      content: `import {Injectable} from '../../src/di/injectable';

@Injectable()
export class TestBedImpl {}
`,
    };
    const tsconfig: TestFile = {
      path: '/core/testing/tsconfig.json',
      content: JSON.stringify({compilerOptions: {strict: true}, files: [testBed.path]}),
    };
    const outputs = await runPipeline(
      [tsconfig, CORE_PACKAGE_JSON, INJECTABLE_DECORATOR, testBed],
      {optimize: false, format: false},
    );
    const emitted = new Map(outputs.map((o) => [o.path, o.content])).get(
      '/out/core/testing/src/test_bed.ts',
    )!;

    expect(emitted).toContain("import * as i0 from '@angular/core';");
    expect(emitted).not.toContain('r3_symbols');
  });

  it('should reject symbols that core is not allowed to import', async () => {
    // Core may not declare components or pipes: ngtsc fails the compilation when the generated
    // code would need to import e.g. `ɵɵdefineComponent` from `r3_symbols.ts`.
    const component: TestFile = {
      path: '/core/src/component.ts',
      content: `import {Component} from './di/injectable';

@Component({selector: 'ng-core-cmp', template: ''})
export class CoreComponent {}
`,
    };
    const errors: string[] = [];
    await compileCore([R3_SYMBOLS, INJECTABLE_DECORATOR, component], errors);

    expect(errors).toContain(
      'Importing unexpected symbol ɵɵdefineComponent while compiling @angular/core',
    );
  });
});

/** Mirrors `packages/core/package.json`, which is how the analyzer recognizes core. */
const CORE_PACKAGE_JSON: TestFile = {
  path: '/core/package.json',
  content: JSON.stringify({name: '@angular/core'}),
};

/** Mirrors `packages/core/src/r3_symbols.ts`. */
const R3_SYMBOLS: TestFile = {
  path: '/core/src/r3_symbols.ts',
  content: `export const ITS_JUST_ANGULAR = true;
`,
};

/** Core imports its own decorators through relative paths, never from `@angular/core`. */
const INJECTABLE_DECORATOR: TestFile = {
  path: '/core/src/di/injectable.ts',
  content: `export function Injectable(opts?: unknown): any {}
export function Component(opts?: unknown): any {}
`,
};

const APPLICATION_REF: TestFile = {
  path: '/core/src/application/application_ref.ts',
  content: `import {Injectable} from '../di/injectable';

@Injectable({providedIn: 'root'})
export class ApplicationRef {}
`,
};

const CONSOLE: TestFile = {
  path: '/core/src/console.ts',
  content: `import {Injectable} from './di/injectable';

@Injectable()
export class Console {}
`,
};

async function compileCore(files: TestFile[], errors?: string[]): Promise<Map<string, string>> {
  const tsconfig: TestFile = {
    path: '/core/tsconfig.json',
    content: JSON.stringify({
      compilerOptions: {strict: true},
      files: files.map((f) => f.path),
    }),
  };
  const outputs = await runPipeline([tsconfig, CORE_PACKAGE_JSON, ...files], {
    optimize: false,
    format: false,
    errors,
  });
  return new Map(outputs.map((o) => [o.path, o.content]));
}
