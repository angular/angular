/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runPipeline, TestFile} from './utils.js';

/**
 * Codegen for `@Component.deferredImports` under local compilation (`optimize: false`).
 *
 * Local compilation resolves nothing across files, so the processor cannot consult
 * `resolvedDeclarations` or bind the template against a real directive scope. It has only the
 * raw `deferredImports` projection the analyzer emits, and has to turn that into the same
 * dynamic `import()`s the optimized pipeline produces from full type information. These tests
 * pin that output, and assert the optimized pipeline still agrees where it should.
 */

/** A trivial standalone component, used as a deferrable dependency. */
function dep(path: string, selector: string, className: string): TestFile {
  return {
    path,
    content: `
      import { Component } from '@angular/core';
      @Component({ selector: '${selector}', template: '${className}' })
      export class ${className} {}
    `,
  };
}

/** A trivial standalone component, exported as its module's default. */
function defaultDep(path: string, selector: string, className: string): TestFile {
  return {
    path,
    content: `
      import { Component } from '@angular/core';
      @Component({ selector: '${selector}', template: '${className}' })
      export default class ${className} {}
    `,
  };
}

function tsconfig(files: string[]): TestFile {
  return {
    path: '/tsconfig.json',
    content: JSON.stringify({compilerOptions: {strict: true}, files}),
  };
}

async function compile(files: TestFile[], optimize: boolean): Promise<string> {
  const outputs = await runPipeline(files, {optimize});
  const app = outputs.find((o) => o.path === '/out/app.component.ts');
  if (!app) {
    throw new Error(`no emitted app.component.ts; got ${outputs.map((o) => o.path).join(', ')}`);
  }
  return app.content;
}

/** Each diagnostic the pipeline reported, as its code plus the source text it underlines. */
async function diagnose(
  files: TestFile[],
  optimize: boolean,
): Promise<{code: number; text: string}[]> {
  const outputs = await runPipeline(files, {optimize});
  const report = outputs.find((o) => o.path.endsWith('.ngdiag.json'));
  if (!report) {
    return [];
  }
  const app = files.find((f) => f.path === '/app.component.ts')!;
  type Reported = {code: number; span: {start: number; end: number}};
  return JSON.parse(report.content).diagnostics.map((d: Reported) => ({
    code: d.code,
    text: app.content.slice(d.span.start, d.span.end),
  }));
}

/** The file's top-level `import` declarations. Dynamic `import(...)` calls are not included. */
function staticImports(src: string): string[] {
  return src
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^import[\s{*]/.test(line));
}

/**
 * The `specifier#exportedName` each dynamic import in the named deps function pulls in, in
 * order — i.e. exactly what the `@defer` block will load at runtime.
 */
function depsFn(src: string, name: string): string[] {
  const match = new RegExp(`const ${name} = (?:\\(\\)|\\(\\): any) => \\[([\\s\\S]*?)\\n\\];`).exec(
    src,
  );
  if (!match) {
    throw new Error(`no deps function '${name}' in emitted output:\n${src}`);
  }
  return dynamicImports(match[1]);
}

/** Every `const <Name> = () => [...]` deps function in the file, by name. */
function depsFnNames(src: string): string[] {
  return [...src.matchAll(/const (\w+) = (?:\(\)|\(\): any) => \[/g)].map((m) => m[1]);
}

/** The `ɵɵdefer(...)` instruction arguments, one entry per instruction. */
function deferInstructions(src: string): string[] {
  return [...src.matchAll(/ɵɵdefer\(([^)]*)\)/g)].map((m) => m[1].trim());
}

/**
 * The loader list and callback parameters of `ɵsetClassMetadataAsync`. The parameters bind the
 * resolved modules for the decorator metadata below them, so a name appearing twice is a
 * duplicate-parameter syntax error and a name missing is an unbound reference.
 */
function asyncMetadata(src: string): {loads: string[]; params: string[]} {
  const match =
    /ɵsetClassMetadataAsync\(\s*\w+,\s*(?:\(\)|\(\): any) => \[([\s\S]*?)\],\s*\(([^)]*)\)(?:: any)? =>/.exec(
      src,
    );
  if (!match) {
    throw new Error(`no ɵsetClassMetadataAsync in emitted output:\n${src}`);
  }
  return {
    loads: dynamicImports(match[1]),
    params: match[2]
      .split(',')
      .map((p) => p.trim().replace(/:\s*any$/, ''))
      .filter(Boolean),
  };
}

function dynamicImports(src: string): string[] {
  return [...src.matchAll(/import\('([^']+)'\)\.then\(\(m: any\)(?:: any)? => m\.(\w+)\)/g)].map(
    (m) => `${m[1]}#${m[2]}`,
  );
}

describe('deferredImports codegen in local compilation mode', () => {
  describe('a single named block', () => {
    const files: TestFile[] = [
      tsconfig(['app.component.ts', 'deferred.ts']),
      dep('/deferred.ts', 'deferred-comp', 'DeferredComp'),
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { DeferredComp } from './deferred';

          @Component({
            selector: 'app-comp',
            deferredImports: {
              block: [DeferredComp],
            },
            template: '@defer (name block) { <deferred-comp /> }',
          })
          export class AppComponent {}
        `,
      },
    ];

    it('drops the static import in favour of a dynamic one', async () => {
      const out = await compile(files, false);

      // The whole point of `deferredImports`: the dependency must not be in the eager graph.
      expect(staticImports(out)).toEqual([
        `import { Component } from '@angular/core';`,
        `import * as i0 from '@angular/core';`,
      ]);
      expect(depsFn(out, 'AppComponent_Defer_1_DepsFn')).toEqual(['./deferred#DeferredComp']);
    });

    it('wires the deps function into the ɵɵdefer instruction', async () => {
      const out = await compile(files, false);

      // A `null` or absent third argument here would leave the block with nothing to load,
      // which is how this silently degrades: the template still compiles, the dependency
      // never arrives.
      expect(depsFnNames(out)).toEqual(['AppComponent_Defer_1_DepsFn']);
      expect(deferInstructions(out)).toEqual(['1, 0, AppComponent_Defer_1_DepsFn']);
    });

    it('defers the class metadata behind the same dynamic import', async () => {
      const out = await compile(files, false);

      // The sync `ɵsetClassMetadata` still exists, but only inside the resolver callback —
      // what must not happen is the dev-mode guard calling it directly, which would reference
      // the dependency before it is loaded.
      expect(out).toMatch(/ngDevMode\)\s*&&\s*i0\.ɵsetClassMetadataAsync\(/);
      expect(asyncMetadata(out)).toEqual({
        loads: ['./deferred#DeferredComp'],
        params: ['DeferredComp'],
      });
    });
  });

  describe('multiple named blocks', () => {
    const files: TestFile[] = [
      tsconfig(['app.component.ts', 'deferred-a.ts', 'deferred-b.ts']),
      dep('/deferred-a.ts', 'deferred-a', 'DeferredA'),
      dep('/deferred-b.ts', 'deferred-b', 'DeferredB'),
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { DeferredA } from './deferred-a';
          import { DeferredB } from './deferred-b';

          @Component({
            selector: 'app-comp',
            deferredImports: {
              blockA: [DeferredA],
              blockB: [DeferredA, DeferredB],
            },
            template: \`
              @defer (name blockA) { <deferred-a /> }
              @defer (name blockB) { <deferred-a /><deferred-b /> }
            \`,
          })
          export class AppComponent {}
        `,
      },
    ];

    it('gives each block only the dependencies its own entry lists', async () => {
      const out = await compile(files, false);

      const [first, second] = depsFnNames(out);
      // `blockA` names only `DeferredA`; pulling `DeferredB` in here would defeat the
      // per-block split entirely.
      expect(depsFn(out, first)).toEqual(['./deferred-a#DeferredA']);
      expect(depsFn(out, second)).toEqual(['./deferred-a#DeferredA', './deferred-b#DeferredB']);

      // Each block's instruction references its own function.
      expect(deferInstructions(out)).toEqual([`1, 0, ${first}`, `4, 3, ${second}`]);
    });

    it('deduplicates a symbol shared by two blocks in the metadata resolver', async () => {
      const out = await compile(files, false);

      // `DeferredA` is listed under both blocks. The resolver is component-wide, so it must
      // load it once — a repeated callback parameter is a syntax error, not a slow path.
      expect(asyncMetadata(out)).toEqual({
        loads: ['./deferred-a#DeferredA', './deferred-b#DeferredB'],
        params: ['DeferredA', 'DeferredB'],
      });
    });

    it('elides both static imports even though one is shared across blocks', async () => {
      // Regression guard for the analyzer-side dedup: the flattened deferred-imports list
      // holds one entry per symbol, so the second occurrence of `DeferredA` was left counted
      // as an eager reference, which pinned its static import in place.
      expect(staticImports(await compile(files, false))).toEqual([
        `import { Component } from '@angular/core';`,
        `import * as i0 from '@angular/core';`,
      ]);
    });

    it('matches the optimized pipeline exactly', async () => {
      // `deferredImports` names each block's dependencies explicitly, so local mode has
      // everything the optimized pipeline derives from the directive scope, and the two must
      // agree.
      expect(await compile(files, false)).toEqual(await compile(files, true));
    });
  });

  describe('aliased imports', () => {
    const files: TestFile[] = [
      tsconfig(['app.component.ts', 'deferred.ts']),
      dep('/deferred.ts', 'deferred-comp', 'DeferredComp'),
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { DeferredComp as MyAlias } from './deferred';

          @Component({
            selector: 'app-comp',
            deferredImports: {
              block: [MyAlias],
            },
            template: '@defer (name block) { <deferred-comp /> }',
          })
          export class AppComponent {}
        `,
      },
    ];

    it('reads the exported name off the module, not the local alias', async () => {
      const out = await compile(files, false);

      // `./deferred` exports `DeferredComp`; `MyAlias` is only this file's name for it, so
      // `m.MyAlias` would be `undefined` at runtime.
      expect(depsFn(out, 'AppComponent_Defer_1_DepsFn')).toEqual(['./deferred#DeferredComp']);
      expect(asyncMetadata(out).loads).toEqual(['./deferred#DeferredComp']);
      expect(out).not.toContain('m.MyAlias');
    });

    xit('binds the local alias the decorator metadata refers to', async () => {
      const out = await compile(files, false);

      // KNOWN FAILURE. The static import is elided and the metadata argument is reproduced
      // verbatim from source, so it still reads `deferredImports: {block: [MyAlias]}` — but
      // the resolver binds the *exported* name, leaving `MyAlias` unbound. `tsc` rejects the
      // emitted file with "TS2304: Cannot find name 'MyAlias'".
      //
      // The parameter has to bind whatever name the metadata body uses. Reproduces under
      // `optimize: true` as well, so it is not specific to local compilation.
      expect(asyncMetadata(out).params).toEqual(['MyAlias']);
    });
  });

  describe('two modules exporting the same name', () => {
    // The array form rather than the object form used elsewhere in this file: the component-wide
    // `_DeferFn` only exists under per-component emit, which the per-block form opts out of.
    //
    // A file cannot name two `Widget` exports without aliasing at least one, but the alias is
    // local — both dependencies are emitted under the name their own module exports them as.
    const files: TestFile[] = [
      tsconfig(['app.component.ts', 'module-a.ts', 'module-b.ts']),
      dep('/module-a.ts', 'widget-a', 'Widget'),
      dep('/module-b.ts', 'widget-b', 'Widget'),
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { Widget as WidgetA } from './module-a';
          import { Widget as WidgetB } from './module-b';

          @Component({
            selector: 'app-comp',
            deferredImports: [WidgetA, WidgetB],
            template: '@defer { <widget-a /><widget-b /> }',
          })
          export class AppComponent {}
        `,
      },
    ];

    it('loads both modules rather than collapsing them onto the shared name', async () => {
      const out = await compile(files, false);

      // Keyed on `Widget` alone the second module never gets a loader, and since its static
      // import is elided too, `<widget-b />` has nothing to resolve to when the block triggers.
      expect(depsFn(out, 'AppComponent_DeferFn')).toEqual([
        './module-a#Widget',
        './module-b#Widget',
      ]);
    });

    it('elides both static imports', async () => {
      const out = await compile(files, false);

      expect(staticImports(out)).toEqual([
        `import { Component } from '@angular/core';`,
        `import * as i0 from '@angular/core';`,
      ]);
    });

    it('still collapses the metadata resolver onto one entry, as the reference does', async () => {
      const out = await compile(files, false);

      // Not an oversight: `compileComponentClassMetadata` runs the list through a
      // `Map<symbolName, dep>` on the way into `ɵsetClassMetadataAsync`, so the later entry wins
      // and only one parameter is bound. That map is downstream of the list the deps function is
      // built from, which is why the loader above keeps both.
      // https://github.com/angular/angular/blob/5b525f9/packages/compiler/src/render3/r3_class_metadata_compiler.ts#L177-L181
      expect(asyncMetadata(out)).toEqual({loads: ['./module-b#Widget'], params: ['Widget']});
    });

    xit('binds both aliases the decorator metadata refers to', async () => {
      const out = await compile(files, false);

      // KNOWN FAILURE, and the same root cause as `aliased imports` above: the metadata body is
      // reproduced verbatim, so it still reads `deferredImports: [WidgetA, WidgetB]` while the
      // resolver binds the exported name. `tsc` rejects the emitted file with "TS2304: Cannot
      // find name 'WidgetA'". The reference has the identical flaw, so this is not a parity gap.
      expect(asyncMetadata(out).params).toEqual(['WidgetA', 'WidgetB']);
    });
  });

  describe('default imports', () => {
    const files: TestFile[] = [
      tsconfig(['app.component.ts', 'deferred-a.ts', 'deferred-b.ts']),
      defaultDep('/deferred-a.ts', 'deferred-a', 'DefCompA'),
      defaultDep('/deferred-b.ts', 'deferred-b', 'DefCompB'),
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import DefCompA from './deferred-a';
          import DefCompB from './deferred-b';

          @Component({
            selector: 'app-comp',
            deferredImports: {
              block: [DefCompA, DefCompB],
            },
            template: '@defer (name block) { <deferred-a /><deferred-b /> }',
          })
          export class AppComponent {}
        `,
      },
    ];

    it("reads each dependency off its module's `default` export", async () => {
      const out = await compile(files, false);

      expect(staticImports(out)).toEqual([
        `import { Component } from '@angular/core';`,
        `import * as i0 from '@angular/core';`,
      ]);

      // A default export has no name to read off the module, so both are `m.default` and the
      // specifier is the only thing telling them apart.
      expect(depsFn(out, 'AppComponent_Defer_1_DepsFn')).toEqual([
        './deferred-a#default',
        './deferred-b#default',
      ]);
    });

    it('keeps both default imports instead of collapsing them into one', async () => {
      const out = await compile(files, false);

      // Regression guard. The component-wide resolver de-duplicates by symbol name, and a
      // default import used to report its name as the literal `default` — so every default
      // import in the file shared a single key and all but the first were dropped, leaving
      // their dependencies unloaded.
      expect(asyncMetadata(out).loads).toEqual(['./deferred-a#default', './deferred-b#default']);
    });

    it('binds the metadata callback to the local identifiers', async () => {
      const out = await compile(files, false);

      // Regression guard. That same `default` was emitted as the callback parameter, where it
      // is a reserved word — the emitted file could not be parsed at all — and the metadata
      // body refers to the local names regardless, so those are what the parameters must bind.
      expect(asyncMetadata(out).params).toEqual(['DefCompA', 'DefCompB']);
      expect(out).toContain('block: [DefCompA, DefCompB]');
    });

    it('matches the optimized pipeline exactly', async () => {
      // The optimized pipeline names these dependencies after their class declarations, which
      // here are the identifiers the import statements bind.
      expect(await compile(files, false)).toEqual(await compile(files, true));
    });
  });

  describe('eager imports alongside deferred ones', () => {
    const files: TestFile[] = [
      tsconfig(['app.component.ts', 'eager.ts', 'deferred.ts']),
      dep('/eager.ts', 'eager-comp', 'EagerComp'),
      dep('/deferred.ts', 'deferred-comp', 'DeferredComp'),
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { EagerComp } from './eager';
          import { DeferredComp } from './deferred';

          @Component({
            selector: 'app-comp',
            imports: [EagerComp],
            deferredImports: {
              block: [DeferredComp],
            },
            template: '<eager-comp /> @defer (name block) { <deferred-comp /> }',
          })
          export class AppComponent {}
        `,
      },
    ];

    it('keeps the eager import static and defers only the deferred one', async () => {
      const out = await compile(files, false);

      expect(staticImports(out)).toEqual([
        `import { Component } from '@angular/core';`,
        `import { EagerComp } from './eager';`,
        `import * as i0 from '@angular/core';`,
      ]);
      expect(depsFn(out, 'AppComponent_Defer_2_DepsFn')).toEqual(['./deferred#DeferredComp']);
    });

    it('resolves the eager dependency at runtime and loads only the deferred one', async () => {
      const out = await compile(files, false);

      // Local mode cannot know what `imports: [EagerComp]` resolves to, so the eager list is
      // handed to the runtime factory rather than emitted as a resolved `dependencies` array.
      expect(out).toContain(
        'dependencies: i0.ɵɵgetComponentDepsFactory(AppComponent, [EagerComp])',
      );

      // `EagerComp` is in scope statically, so only the deferred dependency is loaded, and
      // the metadata body still refers to `EagerComp` directly.
      expect(asyncMetadata(out)).toEqual({
        loads: ['./deferred#DeferredComp'],
        params: ['DeferredComp'],
      });
      expect(out).toContain('imports: [EagerComp]');
    });

    it('resolves the eager dependency statically under optimize', async () => {
      const out = await compile(files, true);

      // With a real directive scope the eager dependency is emitted directly, and the
      // deferred one stays out of the list — it belongs to the block's loader.
      expect(out).toContain('dependencies: [EagerComp]');
      expect(out).not.toContain('dependencies: [EagerComp, DeferredComp]');
      expect(asyncMetadata(out).loads).toEqual(['./deferred#DeferredComp']);
    });
  });

  describe('a dependency a sibling component imports eagerly', () => {
    /**
     * `ParentCmp` reaches `SharedDep` only from inside a `@defer` block, but `HelperCmp` — in
     * the same file — lists it in `imports: [...]`, so `HelperCmp`'s emitted definition still
     * names the local binding. ngtsc's `DeferredSymbolTracker` forgives only the identifier it
     * rewrote, never every occurrence of the symbol in the file, so the static import has to
     * stay — and once it does, the defer import buys nothing, which is what NG8014 says.
     */
    const parentCmp = `
          @Component({
            selector: 'parent-cmp',
            deferredImports: {block: [SharedDep]},
            template: '@defer (name block) { <shared-dep /> }',
          })
          export class ParentCmp {}`;
    const helperCmp = `
          @Component({
            selector: 'helper-cmp',
            imports: [SharedDep],
            template: '<shared-dep />',
          })
          export class HelperCmp {}`;

    /** Declaration order must not matter: the conflict is a property of the file, not of a class. */
    function files(deferFirst: boolean): TestFile[] {
      return [
        tsconfig(['app.component.ts', 'shared.ts']),
        dep('/shared.ts', 'shared-dep', 'SharedDep'),
        {
          path: '/app.component.ts',
          content: `
          import { Component } from '@angular/core';
          import { SharedDep } from './shared';
${deferFirst ? `${parentCmp}\n${helperCmp}` : `${helperCmp}\n${parentCmp}`}
        `,
        },
      ];
    }

    for (const deferFirst of [true, false]) {
      it(`keeps the static import (defer block first: ${deferFirst})`, async () => {
        const out = await compile(files(deferFirst), false);

        // Dropping it would leave `HelperCmp`'s dependency list naming an undeclared identifier,
        // which is a `ReferenceError` the moment `HelperCmp` is initialized.
        expect(staticImports(out)).toContain(`import { SharedDep } from './shared';`);
        expect(out).toContain('dependencies: i0.ɵɵgetComponentDepsFactory(HelperCmp, [SharedDep])');
      });

      it(`reports NG8014 against the import declaration (defer block first: ${deferFirst})`, async () => {
        expect(await diagnose(files(deferFirst), false)).toEqual([
          {code: 8014, text: `import { SharedDep } from './shared';`},
        ]);
      });
    }

    it('reports NG8014 under optimize as well', async () => {
      // ngtsc raises this one at the top of `resolve()`, before it branches on compilation
      // mode, so the optimized pipeline must not quietly accept what local compilation rejects.
      expect(await diagnose(files(true), true)).toEqual([
        {code: 8014, text: `import { SharedDep } from './shared';`},
      ]);
    });
  });

  describe('without a deferredImports field', () => {
    // The dependency lives in this same file, so it is the one case local mode *could* have
    // resolved syntactically — which is exactly why it is worth pinning that it does not.
    const files: TestFile[] = [
      tsconfig(['app.component.ts']),
      {
        path: '/app.component.ts',
        content: `
          import { Component, Pipe, PipeTransform } from '@angular/core';

          @Pipe({ name: 'myPipe' })
          export class MyPipe implements PipeTransform {
            transform(value: string): string { return value; }
          }

          @Component({
            selector: 'app-comp',
            imports: [MyPipe],
            template: '@defer { {{ "hello" | myPipe }} }',
          })
          export class AppComponent {}
        `,
      },
    ];

    it('gives the block no deps function in local mode', async () => {
      const out = await compile(files, false);

      // `deferredImports` is the only thing local mode learns deferred dependencies from, so
      // with no such field the block gets nothing to load. ngtsc does the same: local mode
      // uses `PerComponent` with `deferPerComponentDependencies = explicitlyDeferredTypes ?? []`,
      // `explicitlyDeferredTypes` is only populated when `rawDeferredImports !== null`, and an
      // empty list compiles to `dependenciesFn: null`.
      // https://github.com/angular/angular/blob/5b525f9/packages/compiler-cli/src/ngtsc/annotations/component/src/handler.ts#L1344-L1418
      //
      // Emitting `() => [MyPipe]` here — as this used to — is harmless at runtime but claims
      // knowledge local mode is defined not to have, and diverges from ngtsc's output.
      expect(depsFnNames(out)).toEqual([]);
      expect(deferInstructions(out)).toEqual(['1, 0']);

      // Nothing is deferred, so the metadata stays synchronous.
      expect(out).not.toContain('ɵsetClassMetadataAsync');
    });

    it('still resolves the block dependency under optimize', async () => {
      const out = await compile(files, true);

      // The optimized pipeline binds the template against a real scope, so it knows the block
      // uses `MyPipe`. The symbol is declared in this file and so cannot be code-split — it is
      // referenced directly rather than through a dynamic `import()`.
      expect(out).toMatch(/const AppComponent_Defer_1_DepsFn = (?:\(\)|\(\): any) => \[MyPipe\];/);
      expect(deferInstructions(out)).toEqual(['1, 0, AppComponent_Defer_1_DepsFn']);
      expect(out).not.toContain('ɵsetClassMetadataAsync');
    });
  });

  describe('optimized mode regression', () => {
    it('emits one deps function per block and no duplicate dependencies', async () => {
      const files: TestFile[] = [
        tsconfig(['app.component.ts', 'eager.ts', 'deferred-a.ts', 'deferred-b.ts']),
        dep('/eager.ts', 'eager-comp', 'EagerComp'),
        dep('/deferred-a.ts', 'deferred-a', 'DeferredA'),
        dep('/deferred-b.ts', 'deferred-b', 'DeferredB'),
        {
          path: '/app.component.ts',
          content: `
            import { Component } from '@angular/core';
            import { EagerComp } from './eager';
            import { DeferredA } from './deferred-a';
            import { DeferredB } from './deferred-b';

            @Component({
              selector: 'app-comp',
              imports: [EagerComp],
              deferredImports: {
                blockA: [DeferredA],
                blockB: [DeferredA, DeferredB],
              },
              template: \`
                <eager-comp />
                @defer (name blockA) { <deferred-a /> }
                @defer (name blockB) { <deferred-a /><deferred-b /> }
              \`,
            })
            export class AppComponent {}
          `,
        },
      ];

      const out = await compile(files, true);

      // One function per block, each declared once.
      const names = depsFnNames(out);
      expect(names.length).toBe(2);
      expect(new Set(names).size).toBe(2);
      expect(depsFn(out, names[0])).toEqual(['./deferred-a#DeferredA']);
      expect(depsFn(out, names[1])).toEqual(['./deferred-a#DeferredA', './deferred-b#DeferredB']);

      // The eager dependency appears once, and the deferred ones do not leak into it.
      expect(out).toContain('dependencies: [EagerComp]');

      // The shared symbol is still resolved once component-wide.
      expect(asyncMetadata(out)).toEqual({
        loads: ['./deferred-a#DeferredA', './deferred-b#DeferredB'],
        params: ['DeferredA', 'DeferredB'],
      });
    });
  });
});
