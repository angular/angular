/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Optimize mode resolves a component's `imports` to the declarations behind them, then decides
 * which of those the template actually reaches, which of those a `@defer` block reaches, and which
 * static imports may therefore be elided. Every one of those decisions used to be keyed on the
 * declaration's class name, which is not unique: nothing stops two modules from each exporting a
 * `Widget`, and importing both means aliasing one of them at the import site.
 *
 * These cases pin that the decisions are made per declaration instead. They are written as two
 * declaration orders apiece because a name key fails asymmetrically — a `Map` keyed on the name
 * keeps whichever declaration was registered last, so a single order can pass by luck.
 */

import {runPipeline, type TestFile} from './utils.js';

/** A standalone component named `Widget`, distinguished only by its selector. */
function widget(module: string, selector: string): TestFile {
  return {
    path: `/${module}.ts`,
    content: `
      import { Component } from '@angular/core';

      @Component({ selector: '${selector}', template: '${selector}', standalone: true })
      export class Widget {}
    `,
  };
}

/** A standalone pipe named `Fmt`, distinguished only by its pipe name. */
function fmt(module: string, pipeName: string): TestFile {
  return {
    path: `/${module}.ts`,
    content: `
      import { Pipe, PipeTransform } from '@angular/core';

      @Pipe({ name: '${pipeName}', standalone: true })
      export class Fmt implements PipeTransform {
        transform(value: string): string { return value; }
      }
    `,
  };
}

function app(imports: string, template: string, modules: string[]): TestFile[] {
  return [
    {
      path: '/tsconfig.json',
      content: JSON.stringify({
        compilerOptions: {strict: true},
        files: ['app.component.ts', ...modules.map((m) => `${m}.ts`)],
      }),
    },
    {
      path: '/app.component.ts',
      content: `
        import { Component } from '@angular/core';
        ${imports}

        @Component({
          selector: 'app-root',
          standalone: true,
          imports: [${modules.map((_, i) => `Dep${i}`).join(', ')}],
          template: \`${template}\`,
        })
        export class AppComponent {}
      `,
    },
  ];
}

async function compile(files: TestFile[]): Promise<string> {
  const outputs = await runPipeline(files, {optimize: true});
  const emitted = outputs.find((o) => o.path === '/out/app.component.ts');
  expect(emitted).toBeDefined('app.component.ts should be emitted');
  return emitted!.content;
}

describe('optimize mode keys declarations by identity, not class name', () => {
  describe('two components exporting the same name', () => {
    // `dependencies` is the eager list the component definition carries. A declaration the
    // template never matches does not belong in it; keeping it there defeats the tree-shaking
    // this mode exists to do, and drags the whole module into the eager bundle.
    for (const [label, order] of [
      ['used declaration first', ['widget-a', 'widget-b']],
      ['used declaration last', ['widget-b', 'widget-a']],
    ] as const) {
      it(`omits an unused same-named declaration (${label})`, async () => {
        const files = [
          ...app(
            order.map((m, i) => `import { Widget as Dep${i} } from './${m}';`).join('\n        '),
            '<widget-a />',
            [...order],
          ),
          widget('widget-a', 'widget-a'),
          widget('widget-b', 'widget-b'),
        ];

        const output = await compile(files);
        const used = `Dep${order.indexOf('widget-a')}`;

        // An exact match on the whole array is the assertion: `[Dep0]` would not match
        // `[Dep0, Dep1]`. A bare "does not contain Dep1" would not work here, because the
        // decorator body is reproduced verbatim and still names every original import.
        expect(output).toContain(`dependencies: [${used}]`);
      });
    }

    for (const [label, order] of [
      ['eager declaration first', ['widget-a', 'widget-b']],
      ['eager declaration last', ['widget-b', 'widget-a']],
    ] as const) {
      it(`defers only the declaration the @defer block reaches (${label})`, async () => {
        const files = [
          ...app(
            order.map((m, i) => `import { Widget as Dep${i} } from './${m}';`).join('\n        '),
            '<widget-a /> @defer { <widget-b /> }',
            [...order],
          ),
          widget('widget-a', 'widget-a'),
          widget('widget-b', 'widget-b'),
        ];

        const output = await compile(files);
        const eager = `Dep${order.indexOf('widget-a')}`;

        // The eagerly matched one stays in `dependencies`; the deferred one is loaded from its
        // own module. Resolving by name would have handed the block whichever `Widget` was
        // registered last, pointing the dynamic import at the wrong module.
        expect(output).toContain(`dependencies: [${eager}]`);
        expect(output).toMatch(
          /import\('\.\/widget-b'\)\.then\(\(m: any\)(?:: any)? => m\.Widget\)/,
        );
        expect(output).not.toContain(`import('./widget-a')`);

        // The deferred module's static import is the one that may go away.
        expect(output).not.toContain(`from './widget-b'`);
        expect(output).toContain(`from './widget-a'`);
      });
    }
  });

  describe('two pipes exporting the same name', () => {
    // Pipes reach their declaration through the template-visible pipe name. That hop used to run
    // through the class name, which reintroduced the collision even though the pipe names differ.
    for (const [label, order] of [
      ['eager declaration first', ['fmt-a', 'fmt-b']],
      ['eager declaration last', ['fmt-b', 'fmt-a']],
    ] as const) {
      it(`resolves a deferred pipe to its own module (${label})`, async () => {
        const files = [
          ...app(
            order.map((m, i) => `import { Fmt as Dep${i} } from './${m}';`).join('\n        '),
            `{{ 'x' | fmtA }} @defer { {{ 'y' | fmtB }} }`,
            [...order],
          ),
          fmt('fmt-a', 'fmtA'),
          fmt('fmt-b', 'fmtB'),
        ];

        const output = await compile(files);
        const eager = `Dep${order.indexOf('fmt-a')}`;
        expect(output).toContain(`dependencies: [${eager}]`);
        expect(output).toMatch(/import\('\.\/fmt-b'\)\.then\(\(m: any\)(?:: any)? => m\.Fmt\)/);
        expect(output).not.toContain(`import('./fmt-a')`);
      });
    }
  });
});
