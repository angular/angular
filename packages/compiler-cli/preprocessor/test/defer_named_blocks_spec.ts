/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runPipeline, TestFile} from './utils.js';

describe('Named Defer Blocks and Object deferredImports Diagnostics', () => {
  it('should emit NG11100 when @defer block lacks name parameter but deferredImports is an object', async () => {
    const files: TestFile[] = [
      {
        path: '/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {strict: true},
          files: ['app.component.ts', 'comp-a.ts'],
        }),
      },
      {
        path: '/comp-a.ts',
        content: `
          import { Component } from '@angular/core';
          @Component({ selector: 'comp-a', template: 'A', standalone: true })
          export class CompA {}
        `,
      },
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { CompA } from './comp-a';

          @Component({
            selector: 'app-comp',
            standalone: true,
            imports: [CompA],
            deferredImports: {
              blockA: [CompA],
            },
            template: \`
              @defer {
                <comp-a />
              }
            \`,
          })
          export class AppComponent {}
        `,
      },
    ];

    const outputs = await runPipeline(files, {optimize: false});
    const diagFile = outputs.find((o) => o.path.endsWith('.ngdiag.json'));
    expect(diagFile).toBeDefined();
    expect(diagFile!.content).toContain(
      "@defer block must specify a 'name' parameter (e.g. '@defer (name blockName)') when 'deferredImports' is defined.",
    );
  });

  it('should emit NG11101 when @defer (name blockName) references unknown block', async () => {
    const files: TestFile[] = [
      {
        path: '/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {strict: true},
          files: ['app.component.ts', 'comp-a.ts'],
        }),
      },
      {
        path: '/comp-a.ts',
        content: `
          import { Component } from '@angular/core';
          @Component({ selector: 'comp-a', template: 'A', standalone: true })
          export class CompA {}
        `,
      },
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { CompA } from './comp-a';

          @Component({
            selector: 'app-comp',
            standalone: true,
            imports: [CompA],
            deferredImports: {
              blockA: [CompA],
            },
            template: \`
              @defer (name unknownBlock) {
                <comp-a />
              }
            \`,
          })
          export class AppComponent {}
        `,
      },
    ];

    const outputs = await runPipeline(files, {optimize: false});
    const diagFile = outputs.find((o) => o.path.endsWith('.ngdiag.json'));
    expect(diagFile).toBeDefined();
    expect(diagFile!.content).toContain(
      "The 'name' parameter references block 'unknownBlock' which is missing from '@Component.deferredImports'.",
    );
  });

  it('should emit NG11102 when @defer (name blockName) is used but component has no deferredImports', async () => {
    const files: TestFile[] = [
      {
        path: '/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {strict: true},
          files: ['app.component.ts', 'comp-a.ts'],
        }),
      },
      {
        path: '/comp-a.ts',
        content: `
          import { Component } from '@angular/core';
          @Component({ selector: 'comp-a', template: 'A', standalone: true })
          export class CompA {}
        `,
      },
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { CompA } from './comp-a';

          @Component({
            selector: 'app-comp',
            standalone: true,
            imports: [CompA],
            template: \`
              @defer (name blockA) {
                <comp-a />
              }
            \`,
          })
          export class AppComponent {}
        `,
      },
    ];

    const outputs = await runPipeline(files, {optimize: false});
    const diagFile = outputs.find((o) => o.path.endsWith('.ngdiag.json'));
    expect(diagFile).toBeDefined();
    expect(diagFile!.content).toContain(
      "The 'name' parameter can only be used when '@Component.deferredImports' is defined.",
    );
  });

  it('should emit NG2010 when deferredImports is used on a non-standalone component', async () => {
    const files: TestFile[] = [
      {
        path: '/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {strict: true},
          files: ['app.component.ts', 'comp-a.ts'],
        }),
      },
      {
        path: '/comp-a.ts',
        content: `
          import { Component } from '@angular/core';
          @Component({ selector: 'comp-a', template: 'A', standalone: true })
          export class CompA {}
        `,
      },
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { CompA } from './comp-a';

          @Component({
            selector: 'app-comp',
            standalone: false,
            deferredImports: {
              blockA: [CompA],
            },
            template: \`
              <div>App</div>
            \`,
          })
          export class AppComponent {}
        `,
      },
    ];

    const outputs = await runPipeline(files, {optimize: false});
    const diagFile = outputs.find((o) => o.path.endsWith('.ngdiag.json'));
    expect(diagFile).toBeDefined();
    expect(diagFile!.content).toContain(
      "'deferredImports' is only valid on a component that is standalone.",
    );
  });

  it('should emit NG8012 when pipe declared in blockB is used in blockA in optimize mode', async () => {
    const files: TestFile[] = [
      {
        path: '/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {strict: true},
          files: ['app.component.ts', 'comp-a.ts', 'pipe-b.ts'],
        }),
      },
      {
        path: '/comp-a.ts',
        content: `
          import { Component } from '@angular/core';
          @Component({ selector: 'comp-a', template: 'A', standalone: true })
          export class CompA {}
        `,
      },
      {
        path: '/pipe-b.ts',
        content: `
          import { Pipe, PipeTransform } from '@angular/core';
          @Pipe({ name: 'pipeb', standalone: true })
          export class PipeB implements PipeTransform {
            transform(val: string) { return val; }
          }
        `,
      },
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { CompA } from './comp-a';
          import { PipeB } from './pipe-b';

          @Component({
            selector: 'app-comp',
            standalone: true,
            deferredImports: {
              blockA: [CompA],
              blockB: [PipeB],
            },
            template: \`
              @defer (name blockA) {
                <comp-a />
                {{ 'hello' | pipeb }}
              }
            \`,
          })
          export class AppComponent {}
        `,
      },
    ];

    const outputs = await runPipeline(files, {optimize: true});
    const tcbOutput = outputs.find((o) => o.path.endsWith('app.component.ngtypecheck.ts'));
    expect(tcbOutput).toBeDefined();
    expect(tcbOutput!.content).toContain(
      "Pipe 'pipeb' was imported via `@Component.deferredImports` under block 'blockB', but is used in a `@defer` block configured for 'blockA'",
    );
  });

  it('should emit NG8013 when directive declared in blockB is used in blockA in optimize mode', async () => {
    const files: TestFile[] = [
      {
        path: '/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {strict: true},
          files: ['app.component.ts', 'dir-a.ts', 'dir-b.ts'],
        }),
      },
      {
        path: '/dir-a.ts',
        content: `
          import { Directive } from '@angular/core';
          @Directive({ selector: '[dirA]', standalone: true })
          export class DirA {}
        `,
      },
      {
        path: '/dir-b.ts',
        content: `
          import { Directive } from '@angular/core';
          @Directive({ selector: '[dirB]', standalone: true })
          export class DirB {}
        `,
      },
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { DirA } from './dir-a';
          import { DirB } from './dir-b';

          @Component({
            selector: 'app-comp',
            standalone: true,
            deferredImports: {
              blockA: [DirA],
              blockB: [DirB],
            },
            template: \`
              @defer (name blockA) {
                <div dirB></div>
              }
            \`,
          })
          export class AppComponent {}
        `,
      },
    ];

    const outputs = await runPipeline(files, {optimize: true});
    const tcbOutput = outputs.find((o) => o.path.endsWith('app.component.ngtypecheck.ts'));
    expect(tcbOutput).toBeDefined();
    expect(tcbOutput!.content).toContain(
      "Directive 'DirB' (used on element 'div') was imported via `@Component.deferredImports` under block 'blockB', but is used in a `@defer` block configured for 'blockA'",
    );
  });

  it('should emit NG8012 when pipe from deferredImports is used outside @defer block', async () => {
    const files: TestFile[] = [
      {
        path: '/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {strict: true},
          files: ['app.component.ts', 'pipe-a.ts'],
        }),
      },
      {
        path: '/pipe-a.ts',
        content: `
          import { Pipe, PipeTransform } from '@angular/core';
          @Pipe({ name: 'pipea', standalone: true })
          export class PipeA implements PipeTransform {
            transform(val: string) { return val; }
          }
        `,
      },
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { PipeA } from './pipe-a';

          @Component({
            selector: 'app-comp',
            standalone: true,
            deferredImports: {
              blockA: [PipeA],
            },
            template: \`
              <div>{{ 'hello' | pipea }}</div>
            \`,
          })
          export class AppComponent {}
        `,
      },
    ];

    const outputs = await runPipeline(files, {optimize: true});
    const tcbOutput = outputs.find((o) => o.path.endsWith('app.component.ngtypecheck.ts'));
    expect(tcbOutput).toBeDefined();
    expect(tcbOutput!.content).toContain(
      "Pipe 'pipea' was imported via `@Component.deferredImports`, but was used outside of a `@defer` block in a template.",
    );
  });

  it('should emit NG8013 when component from deferredImports is used outside @defer block', async () => {
    const files: TestFile[] = [
      {
        path: '/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {strict: true},
          files: ['app.component.ts', 'cmp-a.ts'],
        }),
      },
      {
        path: '/cmp-a.ts',
        content: `
          import { Component } from '@angular/core';
          @Component({ selector: 'cmp-a', template: 'A', standalone: true })
          export class CmpA {}
        `,
      },
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { CmpA } from './cmp-a';

          @Component({
            selector: 'app-comp',
            standalone: true,
            deferredImports: {
              blockA: [CmpA],
            },
            template: \`
              <cmp-a />
            \`,
          })
          export class AppComponent {}
        `,
      },
    ];

    const outputs = await runPipeline(files, {optimize: true});
    const tcbOutput = outputs.find((o) => o.path.endsWith('app.component.ngtypecheck.ts'));
    expect(tcbOutput).toBeDefined();
    expect(tcbOutput!.content).toContain(
      "Component 'CmpA' (used as element 'cmp-a') was imported via `@Component.deferredImports`, but was used outside of a `@defer` block in a template.",
    );
  });

  it('should pass type-checking when multiple defer blocks use distinct pipes and directives', async () => {
    const files: TestFile[] = [
      {
        path: '/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {strict: true},
          files: ['app.component.ts', 'comp-a.ts', 'pipe-b.ts'],
        }),
      },
      {
        path: '/comp-a.ts',
        content: `
          import { Component } from '@angular/core';
          @Component({ selector: 'comp-a', template: 'A', standalone: true })
          export class CompA {}
        `,
      },
      {
        path: '/pipe-b.ts',
        content: `
          import { Pipe, PipeTransform } from '@angular/core';
          @Pipe({ name: 'pipeb', standalone: true })
          export class PipeB implements PipeTransform {
            transform(val: string) { return val; }
          }
        `,
      },
      {
        path: '/app.component.ts',
        content: `
          import { Component } from '@angular/core';
          import { CompA } from './comp-a';
          import { PipeB } from './pipe-b';

          @Component({
            selector: 'app-comp',
            standalone: true,
            deferredImports: {
              blockA: [CompA],
              blockB: [PipeB],
            },
            template: \`
              @defer (name blockA) {
                <comp-a />
              }
              @defer (name blockB) {
                {{ 'hello' | pipeb }}
              }
            \`,
          })
          export class AppComponent {}
        `,
      },
    ];

    const outputs = await runPipeline(files, {optimize: true});
    const tcbOutput = outputs.find((o) => o.path.endsWith('app.component.ngtypecheck.ts'));
    expect(tcbOutput).toBeDefined();
    expect(tcbOutput!.content).not.toContain('/* Diagnostics:');
  });
});
