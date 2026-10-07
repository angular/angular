/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runPipeline, TestFile} from './utils.js';

describe('generateExtraImportsInLocalMode', () => {
  it('should emit global and local extra imports for a component whose NgModule is somewhere else', async () => {
    const out = await compile(true);
    const main = out.get('/out/app/components/main.component.ts')!;

    expect(sideEffectImports(main)).toEqual(['../../ext/external', './sibling.component']);
  });

  it('should mark each extra import with @ts-ignore', async () => {
    const out = await compile(true);
    const main = out.get('/out/app/components/main.component.ts')!;

    expect(main).toContain("// @ts-ignore\nimport '../../ext/external';");
    expect(main).toContain("// @ts-ignore\nimport './sibling.component';");
  });

  it('should not mark a component declared in the same file as its module', async () => {
    const out = await compile(true);

    expect(sideEffectImports(out.get('/out/app/self_contained.ts')!)).toEqual([]);
  });

  it('should not mark a standalone component', async () => {
    const out = await compile(true);

    expect(sideEffectImports(out.get('/out/app/standalone.component.ts')!)).toEqual([]);
  });

  it('should not emit anything if the option is off', async () => {
    const out = await compile(false);

    for (const source of out.values()) {
      expect(sideEffectImports(source)).toEqual([]);
    }
  });

  it('should not change the rest of the local-mode-only output', async () => {
    const on = await compile(true);
    const off = await compile(false);

    expect([...on.keys()].sort()).toEqual([...off.keys()].sort());
    for (const [path, source] of on) {
      expect(stripSideEffectImports(source)).withContext(path).toEqual(off.get(path)!);
    }
  });

  it('should do nothing in optimized mode', async () => {
    const on = await compile(true, /* optimize */ true);
    const off = await compile(false, /* optimize */ true);

    for (const [path, source] of on) {
      expect(source).withContext(path).toEqual(off.get(path)!);
    }
  });
});

const EXTERNAL: TestFile = {
  path: '/ext/external.ts',
  content: `
    import {Component, NgModule} from '@angular/core';

    @Component({selector: 'ext-comp', template: '', standalone: false})
    export class ExtComp {}

    @NgModule({declarations: [ExtComp], exports: [ExtComp]})
    export class ExtModule {}
  `,
};

const MODULE: TestFile = {
  path: '/app/module.ts',
  content: `
    import {NgModule} from '@angular/core';
    import {ExtModule} from '../ext/external';
    import {MainComp} from './components/main.component';
    import {SiblingComp} from './components/sibling.component';

    @NgModule({
      declarations: [MainComp, SiblingComp],
      imports: [ExtModule],
    })
    export class AppModule {}
  `,
};

const MAIN: TestFile = {
  path: '/app/components/main.component.ts',
  content: `
    import {Component} from '@angular/core';

    @Component({
      selector: 'main-comp',
      template: '<sibling></sibling><ext-comp></ext-comp>',
      standalone: false,
    })
    export class MainComp {}
  `,
};

const SIBLING: TestFile = {
  path: '/app/components/sibling.component.ts',
  content: `
    import {Component} from '@angular/core';

    @Component({selector: 'sibling', template: '', standalone: false})
    export class SiblingComp {}
  `,
};

/** A component and its declaring `@NgModule` in one file — never marked by ngtsc. */
const SELF_CONTAINED: TestFile = {
  path: '/app/self_contained.ts',
  content: `
    import {Component, NgModule} from '@angular/core';

    @Component({selector: 'self-contained', template: '', standalone: false})
    export class SelfContainedComp {}

    @NgModule({declarations: [SelfContainedComp]})
    export class SelfContainedModule {}
  `,
};

const STANDALONE: TestFile = {
  path: '/app/standalone.component.ts',
  content: `
    import {Component} from '@angular/core';
    import {SiblingComp} from './components/sibling.component';

    @Component({
      selector: 'standalone-comp',
      template: '<sibling></sibling>',
      imports: [SiblingComp],
    })
    export class StandaloneComp {}
  `,
};

const UNIT = [MODULE, MAIN, SIBLING, SELF_CONTAINED, STANDALONE];

function tsconfig(generateExtraImportsInLocalMode: boolean): TestFile {
  return {
    path: '/tsconfig.json',
    content: JSON.stringify({
      compilerOptions: {strict: true},
      angularCompilerOptions: {generateExtraImportsInLocalMode},
      files: UNIT.map((f) => f.path),
    }),
  };
}

async function compile(
  generateExtraImportsInLocalMode: boolean,
  optimize = false,
): Promise<Map<string, string>> {
  const outputs = await runPipeline(
    [tsconfig(generateExtraImportsInLocalMode), ...UNIT, EXTERNAL],
    {
      optimize,
      format: false,
    },
  );
  return new Map(outputs.map((o) => [o.path, o.content]));
}

function sideEffectImports(source: string): string[] {
  return [...source.matchAll(/^\s*import\s+'([^']+)';\s*$/gm)].map((m) => m[1]);
}

function stripSideEffectImports(source: string): string {
  return source.replace(/\n*^\s*\/\/ @ts-ignore\n\s*import\s+'[^']+';$/gm, '');
}
