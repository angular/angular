/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';
import * as esbuild from 'esbuild';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles({
  fakeCommon: true,
});

const minifiedDevBuildOptions = {
  minifySyntax: true,
  treeShaking: true,
  keepNames: true,
  define: {ngDevMode: 'true'},
};

const minifiedProdBuildOptions = {
  minifySyntax: true,
  treeShaking: true,
  keepNames: true,
  define: {ngDevMode: 'false'},
};

function cleanNewLines(contents: string) {
  return contents.replace(/\n/g, ' ').replace(/\s+/g, ' ');
}

runInEachFileSystem(() => {
  describe('Debug Info Typescript tranformation', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({}, {target: 'es2018'});
    });

    describe('signal', () => {
      it('should not insert debug info into signal function if not imported from angular core', () => {
        env.write(
          'test.ts',
          `
            declare function signal(value: any): any;
            const testSignal = signal('Hello World');
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('debugName');
      });

      it('should insert debug info into signal function if imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {signal} from '@angular/core';
            const testSignal = signal('Hello World');
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain(
          `signal('Hello World', ...(ngDevMode ? [{ debugName: "testSignal" }] : []))`,
        );
      });

      describe('Variable Declaration Case', () => {
        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal} from '@angular/core';
              const testSignal = signal('Hello World');
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).not.toContain('debugName');
          expect(builtContent).toContain('signal("Hello World")');
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal} from '@angular/core';
              const testSignal = signal('Hello World');
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(`signal("Hello World", { debugName: "testSignal" });`);
        });

        it('should insert debug info into signal function that already has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal} from '@angular/core';
              const testSignal = signal('Hello World', { equal: () => true });
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `signal('Hello World', { ...(ngDevMode ? { debugName: "testSignal" } : {}), equal: () => true })`,
          );
        });

        it('should tree-shake away debug info if in prod mode for signal function that has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal} from '@angular/core';
              declare function equal(): boolean;
              const testSignal = signal('Hello World', { equal });
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).toContain(`signal("Hello World", { equal });`);
          expect(builtContent).not.toContain('ngDevMode');
          expect(builtContent).not.toContain('debugName');
        });
      });

      describe('Property Declaration Case', () => {
        it('should insert debug info into signal function', () => {
          env.write(
            'test.ts',
            `
              import {signal, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent
              {
                  testSignal = signal('Hello World');
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `signal('Hello World', ...(ngDevMode ? [{ debugName: "testSignal" }] : [])`,
          );
        });

        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent
              {
                  testSignal = signal('Hello World');
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).not.toContain('debugName');
          expect(builtContent).toContain('signal("Hello World")');
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent
              {
                  testSignal = signal('Hello World');
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(`signal("Hello World", { debugName: "testSignal" });`);
        });

        it('should insert debug info into signal function that already has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent
              {
                  testSignal = signal('Hello World', { equal: () => true });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `signal('Hello World', { ...(ngDevMode ? { debugName: "testSignal" } : {}), equal: () => true })`,
          );
        });

        it('should tree-shake away debug info if in prod mode for signal function that has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, Component} from '@angular/core';

              declare function equal(): boolean;

              @Component({
                  template: ''
              }) class MyComponent
              {
                  testSignal = signal('Hello World', { equal });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).toContain(`signal("Hello World", { equal });`);
          expect(builtContent).not.toContain('ngDevMode');
          expect(builtContent).not.toContain('debugName');
        });
      });

      describe('Property Assignment Case', () => {
        it('should insert debug info into signal function', () => {
          env.write(
            'test.ts',
            `
              import {signal, Component, WritableSignal} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent
              {
                  testSignal: WritableSignal<string>;
                  constructor() {
                      this.testSignal = signal('Hello World');
                  }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `signal('Hello World', ...(ngDevMode ? [{ debugName: "testSignal" }] : [])`,
          );
        });

        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, Component, WritableSignal} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent
              {
                  testSignal: WritableSignal<string>;
                  constructor() {
                      this.testSignal = signal('Hello World');
                  }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).not.toContain('debugName');
          expect(builtContent).toContain('signal("Hello World")');
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, Component, WritableSignal} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent
              {
                  testSignal: WritableSignal<string>;
                  constructor() {
                      this.testSignal = signal('Hello World');
                  }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(`signal("Hello World", { debugName: "testSignal" });`);
        });

        it('should insert debug info into signal function that already has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, Component, WritableSignal} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent
              {
                  testSignal: WritableSignal<string>;
                  constructor() {
                      this.testSignal = signal('Hello World', { equal: () => true });
                  }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `signal('Hello World', { ...(ngDevMode ? { debugName: "testSignal" } : {}), equal: () => true })`,
          );
        });

        it('should tree-shake away debug info if in prod mode for signal function that has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, Component, WritableSignal} from '@angular/core';

              declare function equal(): boolean;

              @Component({
                  template: ''
              }) class MyComponent
              {
                  testSignal: WritableSignal<string>;
                  constructor() {
                      this.testSignal = signal('Hello World', { equal });
                  }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).toContain(`signal("Hello World", { equal });`);
          expect(builtContent).not.toContain('ngDevMode');
          expect(builtContent).not.toContain('debugName');
        });
      });
    });

    describe('computed', () => {
      it('should not insert debug info into computed function if not imported from angular core', () => {
        env.write(
          'test.ts',
          `
            declare function computed(fn: () => any): any;
            const testComputed = computed(() => 123);
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('debugName');
      });

      it('should insert debug info into computed function if imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {signal, computed} from '@angular/core';
            const testSignal = signal(123);
            const testComputed = computed(() => testSignal());
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain(
          `computed(() => testSignal(), ...(ngDevMode ? [{ debugName: "testComputed" }] : []))`,
        );
      });

      describe('Variable Declaration Case', () => {
        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed} from '@angular/core';
              const testSignal = signal(123);
              const testComputed = computed(() => testSignal());
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).not.toContain('debugName');
          expect(builtContent).toContain('computed(() => testSignal())');
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed} from '@angular/core';
              const testSignal = signal(123);
              const testComputed = computed(() => testSignal());
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `computed(() => testSignal(), { debugName: "testComputed" })`,
          );
        });

        it('should insert debug info into computed function that already has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed} from '@angular/core';
              const testSignal = signal(123);
              const testComputed = computed(() => testSignal(), { equal: () => true });
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `computed(() => testSignal(), { ...(ngDevMode ? { debugName: "testComputed" } : {}), equal: () => true })`,
          );
        });

        it('should tree-shake away debug info if in prod mode for computed function that has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed} from '@angular/core';
              declare function equal(): boolean;

              const testSignal = signal(123);
              const testComputed = computed(() => testSignal(), { equal });
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).toContain(`testComputed = computed(() => testSignal(), { equal })`);
          expect(builtContent).not.toContain('ngDevMode');
          expect(builtContent).not.toContain('debugName');
        });

        it('should not tree-shake away debug info if in dev mode and has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed} from '@angular/core';
              declare function equal(): boolean;

              const testSignal = signal(123);
              const testComputed = computed(() => testSignal(), { equal });
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `testComputed = computed(() => testSignal(), { debugName: "testComputed", equal });`,
          );
        });
      });

      describe('Property Declaration Case', () => {
        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testSignal = signal(123);
                  testComputed = computed(() => this.testSignal());
              }
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).not.toContain('debugName');
          expect(builtContent).toContain('computed(() => this.testSignal())');
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testSignal = signal(123);
                  testComputed = computed(() => this.testSignal());
              }
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `computed(() => this.testSignal(), { debugName: "testComputed" })`,
          );
        });

        it('should insert debug info into computed function that already has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testSignal = signal(123);
                  testComputed = computed(() => this.testSignal(), { equal: () => true });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `computed(() => this.testSignal(), { ...(ngDevMode ? { debugName: "testComputed" } : {}), equal: () => true })`,
          );
        });

        it('should tree-shake away debug info if in prod mode for computed function that has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed, Component} from '@angular/core';

              declare function equal(): boolean;

              @Component({
                  template: ''
              }) class MyComponent {
                  testSignal = signal(123);
                  testComputed = computed(() => this.testSignal(), { equal });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).toContain(`computed(() => this.testSignal(), { equal })`);
          expect(builtContent).not.toContain('ngDevMode');
          expect(builtContent).not.toContain('debugName');
        });

        it('should not tree-shake away debug info if in dev mode and has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed, Component} from '@angular/core';
              declare function equal(): boolean;

              @Component({
                  template: ''
              }) class MyComponent {
                  testSignal = signal(123);
                  testComputed = computed(() => this.testSignal(), { equal });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `computed(() => this.testSignal(), { debugName: "testComputed", equal });`,
          );
        });
      });

      describe('Property Assignment Case', () => {
        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed, Component, WritableSignal, Signal} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent
              {
                  testSignal: WritableSignal<number>;
                  testComputed: Signal<number>;
                  constructor() {
                      this.testSignal = signal(123);
                      this.testComputed = computed(() => this.testSignal());
                  }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).not.toContain('debugName');
          expect(builtContent).toContain('computed(() => this.testSignal())');
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed, Component, WritableSignal, Signal} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent
              {
                  testSignal: WritableSignal<number>;
                  testComputed: Signal<number>;
                  constructor() {
                      this.testSignal = signal(123);
                      this.testComputed = computed(() => this.testSignal());
                  }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `computed(() => this.testSignal(), { debugName: "testComputed" })`,
          );
        });

        it('should insert debug info into computed function that already has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed, Component, WritableSignal, Signal} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testSignal: WritableSignal<number>;
                  testComputed: Signal<number>;
                  constructor() {
                      this.testSignal = signal(123);
                      this.testComputed = computed(() => this.testSignal(), { equal: () => true });
                  }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `computed(() => this.testSignal(), { ...(ngDevMode ? { debugName: "testComputed" } : {}), equal: () => true })`,
          );
        });

        it('should tree-shake away debug info if in prod mode for computed function that has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed, Component, WritableSignal, Signal} from '@angular/core';
              declare function equal(): boolean;

              @Component({
                  template: ''
              }) class MyComponent {
                  testSignal: WritableSignal<number>;
                  testComputed: Signal<number>;
                  constructor() {
                      this.testSignal = signal(123);
                      this.testComputed = computed(() => this.testSignal(), { equal });
                  }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).toContain(`computed(() => this.testSignal(), { equal })`);
          expect(builtContent).not.toContain('ngDevMode');
          expect(builtContent).not.toContain('debugName');
        });

        it('should not tree-shake away debug info if in dev mode and has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, computed, Component, WritableSignal, Signal} from '@angular/core';
              declare function equal(): boolean;

              @Component({
                  template: ''
              }) class MyComponent {
                  testSignal: WritableSignal<number>;
                  testComputed: Signal<number>;
                  constructor() {
                      this.testSignal = signal(123);
                      this.testComputed = computed(() => this.testSignal(), { equal });
                  }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `computed(() => this.testSignal(), { debugName: "testComputed", equal });`,
          );
        });
      });
    });

    describe('model', () => {
      it('should not insert debug info into model function if not imported from angular core', () => {
        env.write(
          'test.ts',
          `
            declare function model(value: any): any;
            import {Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testModel = model('Hello World');
            }
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('debugName');
      });

      it('should insert debug info into model function if imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {model, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testModel = model('Hello World');
                testModel2 = model();
            }
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain(
          `model('Hello World', ...(ngDevMode ? [{ debugName: "testModel" }] : [])`,
        );
        expect(jsContents).toContain(
          `model(...(ngDevMode ? [undefined, { debugName: "testModel2" }] : [])`,
        );
      });

      it('should tree-shake away debug info if in prod mode', async () => {
        env.write(
          'test.ts',
          `
            import {model, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testModel = model('Hello World');
            }
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
        expect(builtContent).not.toContain('debugName');
        expect(builtContent).toContain('model("Hello World")');
      });

      describe('.required', () => {
        it('should insert debug info into .required', () => {
          env.write(
            'test.ts',
            `
              import {model, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testModel = model.required();
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `model.required(...(ngDevMode ? [{ debugName: "testModel" }] : [])`,
          );
        });

        it('should insert debug info into .required that already has custom options', () => {
          env.write(
            'test.ts',
            `
              import {model, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testModel = model.required({ alias: 'testModelAlias' });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `model.required({ ...(ngDevMode ? { debugName: "testModel" } : {}), alias: 'testModelAlias' })`,
          );
        });

        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {model, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testModel = model.required();
              }
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).not.toContain('debugName');
          expect(builtContent).toContain('model.required();');
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {model, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testModel = model.required();
              }
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(`model.required({ debugName: "testModel" });`);
        });

        it('should tree-shake away debug info if in prod mode with custom options', async () => {
          env.write(
            'test.ts',
            `
              import {model, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testModel = model.required({ alias: 'testModelAlias' });
              }
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).not.toContain('debugName');
          expect(builtContent).toContain('model.required({ alias: "testModelAlias" });');
        });

        it('should not tree-shake away debug info if in dev mode with custom options', async () => {
          env.write(
            'test.ts',
            `
              import {model, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testModel = model.required({ alias: 'testModelAlias' });
              }
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `model.required({ debugName: "testModel", alias: "testModelAlias" });`,
          );
        });
      });
    });

    describe('input', () => {
      it('should not insert debug info into input function if not imported from angular core', () => {
        env.write(
          'test.ts',
          `
            declare function input(): any;
            import {Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testInput = input();
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('debugName');
      });

      it('should insert debug info into input function if imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {input, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testInput = input();
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain(
          `input(...(ngDevMode ? [undefined, { debugName: "testInput" }] : [])`,
        );
      });

      it('should tree-shake away debug info if in prod mode', async () => {
        env.write(
          'test.ts',
          `
            import {input, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testInput = input();
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
        expect(builtContent).not.toContain('debugName');
        expect(builtContent).toContain('input();');
      });

      describe('.required', () => {
        it('should insert debug info into .required', () => {
          env.write(
            'test.ts',
            `
              import {input, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testInput = input.required();
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `input.required(...(ngDevMode ? [{ debugName: "testInput" }] : []))`,
          );
        });

        it('should insert debug info into .required that already has custom options', () => {
          env.write(
            'test.ts',
            `
              import {input, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testInput = input.required({ alias: 'testInputAlias' });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `input.required({ ...(ngDevMode ? { debugName: "testInput" } : {}), alias: 'testInputAlias' })`,
          );
        });

        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {input, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testInput = input.required();
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).not.toContain('debugName');
          expect(builtContent).toContain('input.required();');
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {input, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testInput = input.required();
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(`input.required({ debugName: "testInput" });`);
        });

        it('should tree-shake away debug info if in prod mode with custom options', async () => {
          env.write(
            'test.ts',
            `
              import {input, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testInput = input.required({ alias: 'testInputAlias' });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).not.toContain('debugName');
          expect(builtContent).toContain('input.required({ alias: "testInputAlias" });');
        });

        it('should not tree-shake away debug info if in dev mode with custom options', async () => {
          env.write(
            'test.ts',
            `
              import {input, Component} from '@angular/core';

              @Component({
                  template: ''
              }) class MyComponent {
                  testInput = input.required({ alias: 'testInputAlias' });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `input.required({ debugName: "testInput", alias: "testInputAlias" });`,
          );
        });
      });
    });

    describe('viewChild', () => {
      it('should not insert debug info into viewChild function if not imported from angular core', () => {
        env.write(
          'test.ts',
          `
            declare function viewChild(value: any): any;
            import {Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testViewChild = viewChild('foo');
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('debugName');
      });

      it('should insert debug info into viewChild function if imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {viewChild, Component} from '@angular/core';

            @Component({
              selector: 'child-component',
              template: ''
            })
            class ChildComponent {}

            @Component({
              template: '<child-component/>',
              imports: [ChildComponent]
            })
            class MyComponent {
              testViewChild = viewChild('foo');
              testViewChildComponent = viewChild(ChildComponent);
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain(
          `viewChild('foo', ...(ngDevMode ? [{ debugName: "testViewChild" }] : [])`,
        );
        expect(jsContents).toContain(
          `viewChild(ChildComponent, ...(ngDevMode ? [{ debugName: "testViewChildComponent" }] : [])`,
        );
      });

      it('should tree-shake away debug info if in prod mode', async () => {
        env.write(
          'test.ts',
          `
            import {viewChild, Component} from '@angular/core';

            @Component({
                selector: 'child-component',
                template: ''
            }) class ChildComponent {}

            @Component({
              template: '<child-component/>',
              imports: [ChildComponent]
            })
            class MyComponent {
              testViewChild = viewChild('foo');
              testViewChildComponent = viewChild(ChildComponent);
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
        expect(builtContent).not.toContain('debugName');
        expect(builtContent).toContain(`viewChild("foo")`);
        expect(builtContent).toContain(`viewChild(ChildComponent)`);
      });

      it('should not tree-shake away debug info if in dev mode', async () => {
        env.write(
          'test.ts',
          `
            import {viewChild, Component} from '@angular/core';

            @Component({
                selector: 'child-component',
                                template: ''
            }) class ChildComponent {}

            @Component({
              template: '<child-component/>',
              imports: [ChildComponent]
            })
            class MyComponent {
              testViewChild = viewChild('foo');
              testViewChildComponent = viewChild(ChildComponent);
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
        expect(builtContent).toContain(`viewChild("foo", { debugName: "testViewChild" })`);
        expect(builtContent).toContain(
          `viewChild(ChildComponent, { debugName: "testViewChildComponent" })`,
        );
      });

      it('should tree-shake away debug info if in prod mode with existing options', async () => {
        env.write(
          'test.ts',
          `
            import {viewChild, Component, ElementRef} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testViewChild = viewChild('foo', { read: ElementRef });
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
        expect(builtContent).not.toContain('debugName');
        expect(builtContent).toContain('viewChild("foo", { read: ElementRef })');
      });

      it('should not tree-shake away debug info if in dev mode with existing options', async () => {
        env.write(
          'test.ts',
          `
            import {viewChild, Component, ElementRef} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testViewChild = viewChild('foo', { read: ElementRef });
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
        expect(builtContent).toContain(
          `viewChild("foo", { debugName: "testViewChild", read: ElementRef })`,
        );
      });
    });

    describe('viewChildren', () => {
      it('should not insert debug info into viewChildren function if not imported from angular core', () => {
        env.write(
          'test.ts',
          `
            declare function viewChildren(value: any): any;
            import {Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testViewChildren = viewChildren('foo');
            }
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('debugName');
      });

      it('should insert debug info into viewChildren function if imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {viewChildren, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testViewChildren = viewChildren('foo');
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain(
          `viewChildren('foo', ...(ngDevMode ? [{ debugName: "testViewChildren" }] : [])`,
        );
      });

      it('should tree-shake away debug info if in prod mode', async () => {
        env.write(
          'test.ts',
          `
            import {viewChildren, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testViewChildren = viewChildren('foo');
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
        expect(builtContent).not.toContain('debugName');
        expect(builtContent).toContain('viewChildren("foo")');
      });

      it('should not tree-shake away debug info if in dev mode', async () => {
        env.write(
          'test.ts',
          `
            import {viewChildren, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testViewChildren = viewChildren('foo');
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
        expect(builtContent).toContain(`viewChildren("foo", { debugName: "testViewChildren" })`);
      });

      it('should tree-shake away debug info if in prod mode with existing options', async () => {
        env.write(
          'test.ts',
          `
            import {viewChildren, Component, ElementRef} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testViewChild = viewChildren('foo', { read: ElementRef });
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
        expect(builtContent).not.toContain('debugName');
        expect(builtContent).toContain('viewChildren("foo", { read: ElementRef })');
      });

      it('should not tree-shake away debug info if in dev mode with existing options', async () => {
        env.write(
          'test.ts',
          `
            import {viewChildren, Component, ElementRef} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testViewChild = viewChildren('foo', { read: ElementRef });
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
        expect(builtContent).toContain(
          `viewChildren("foo", { debugName: "testViewChild", read: ElementRef })`,
        );
      });
    });

    describe('contentChild', () => {
      it('should not insert debug info into contentChild function if not imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {Component} from '@angular/core';
            declare function contentChild(value: any): any;

            @Component({
                template: ''
            }) class MyComponent {
                testContentChild = contentChild('foo');
            }
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('debugName');
      });

      it('should insert debug info into contentChild function if imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {contentChild, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testContentChild = contentChild('foo');
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain(
          `contentChild('foo', ...(ngDevMode ? [{ debugName: "testContentChild" }] : [])`,
        );
      });

      it('should tree-shake away debug info if in prod mode', async () => {
        env.write(
          'test.ts',
          `
            import {contentChild, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testContentChild = contentChild('foo');
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
        expect(builtContent).not.toContain('debugName');
        expect(builtContent).toContain('contentChild("foo")');
      });

      it('should not tree-shake away debug info if in dev mode', async () => {
        env.write(
          'test.ts',
          `
            import {contentChild, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testContentChild = contentChild('foo');
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
        expect(builtContent).toContain(`contentChild("foo", { debugName: "testContentChild" })`);
      });

      it('should tree-shake away debug info if in prod mode with existing options', async () => {
        env.write(
          'test.ts',
          `
            import {contentChild, Component, ElementRef} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testContentChild = contentChild('foo', { read: ElementRef });
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
        expect(builtContent).not.toContain('debugName');
        expect(builtContent).toContain('contentChild("foo", { read: ElementRef })');
      });

      it('should not tree-shake away debug info if in dev mode with existing options', async () => {
        env.write(
          'test.ts',
          `
            import {contentChild, Component, ElementRef} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testContentChild = contentChild('foo', { read: ElementRef });
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
        expect(builtContent).toContain(
          `contentChild("foo", { debugName: "testContentChild", read: ElementRef })`,
        );
      });
    });

    describe('contentChildren', () => {
      it('should not insert debug info into contentChildren function if not imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {Component} from '@angular/core';

            declare function contentChildren(value: any): any;
            const testContentChildren = contentChildren('foo');

            @Component({
                template: ''
            }) class MyComponent {
                testContentChildren = contentChildren('foo');
            }
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('debugName');
      });

      it('should insert debug info into contentChildren function if imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {contentChildren, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testContentChildren = contentChildren('foo');
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain(
          `contentChildren('foo', ...(ngDevMode ? [{ debugName: "testContentChildren" }] : [])`,
        );
      });

      it('should tree-shake away debug info if in prod mode', async () => {
        env.write(
          'test.ts',
          `
            import {contentChildren, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testContentChildren = contentChildren('foo');
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
        expect(builtContent).not.toContain('debugName');
        expect(builtContent).toContain('contentChildren("foo")');
      });

      it('should not tree-shake away debug info if in dev mode', async () => {
        env.write(
          'test.ts',
          `
            import {contentChildren, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testContentChildren = contentChildren('foo');
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
        expect(builtContent).toContain(
          `contentChildren("foo", { debugName: "testContentChildren" })`,
        );
      });

      it('should tree-shake away debug info if in prod mode with existing options', async () => {
        env.write(
          'test.ts',
          `
            import {contentChildren, Component, ElementRef} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testContentChildren = contentChildren('foo', { read: ElementRef });
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
        expect(builtContent).not.toContain('debugName');
        expect(builtContent).toContain('contentChildren("foo", { read: ElementRef })');
      });

      it('should not tree-shake away debug info if in dev mode with existing options', async () => {
        env.write(
          'test.ts',
          `
            import {contentChildren, Component, ElementRef} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testContentChildren = contentChildren('foo', { read: ElementRef });
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
        expect(builtContent).toContain(
          `contentChildren("foo", { debugName: "testContentChildren", read: ElementRef })`,
        );
      });
    });

    describe('effect', () => {
      it('should not insert debug info into effect function if not imported from angular core', () => {
        env.write(
          'test.ts',
          `
            declare function signal(val: any): any;
            declare function effect(fn: () => any): any;
            import {Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testSignal = signal(123);
                testEffect = effect(() => this.testSignal());
            }
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('debugName');
      });

      it('should insert debug info into effect function if imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {signal, effect, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testSignal = signal(123);
                testEffect = effect(() => this.testSignal());
            }
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain(
          `effect(() => this.testSignal(), ...(ngDevMode ? [{ debugName: "testEffect" }] : [])`,
        );
      });

      it('should tree-shake away debug info if in prod mode', async () => {
        env.write(
          'test.ts',
          `
            import {signal, effect, Component} from '@angular/core';
            @Component({
                template: ''
            }) class MyComponent {
                testSignal = signal(123);
                testEffect = effect(() => this.testSignal());
            }
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
        expect(builtContent).not.toContain('debugName');
        expect(builtContent).toContain('effect(() => this.testSignal())');
      });

      it('should not tree-shake away debug info if in dev mode', async () => {
        env.write(
          'test.ts',
          `
            import {signal, effect, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testSignal = signal(123);
                testEffect = effect(() => this.testSignal());
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
        expect(builtContent).toContain(
          `effect(() => this.testSignal(), { debugName: "testEffect" })`,
        );
      });

      it('should tree-shake away debug info if in prod mode with existing options', async () => {
        env.write(
          'test.ts',
          `
            import {signal, effect, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testSignal = signal(123);
                testEffect = effect(() => this.testSignal(), { manualCleanup: true, allowSignalWrites: true });
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
        expect(builtContent).not.toContain('debugName');
        expect(builtContent).toContain(
          'effect(() => this.testSignal(), { manualCleanup: !0, allowSignalWrites: !0 })',
        );
      });

      it('should not tree-shake away debug info if in dev mode with existing options', async () => {
        env.write(
          'test.ts',
          `
            import {signal, effect, Component} from '@angular/core';

            @Component({
                template: ''
            }) class MyComponent {
                testSignal = signal(123);
                testEffect = effect(() => this.testSignal(), { manualCleanup: true, allowSignalWrites: true });
            }
          `,
        );
        env.driveMain();

        const jsContents = env.getContents('test.js');
        const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
        expect(builtContent).toContain(
          `effect(() => this.testSignal(), { debugName: "testEffect", manualCleanup: !0, allowSignalWrites: !0 })`,
        );
      });
    });

    describe('linkedSignal', () => {
      it('should not insert debug info into linkedSignal function if not imported from angular core', () => {
        env.write(
          'test.ts',
          `
            declare function linkedSignal(fn: () => any): any;
            const testLinkedSignal = linkedSignal(() => 123);
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('debugName');
      });

      it('should insert debug info into linkedSignal function if imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {signal, linkedSignal} from '@angular/core';
            const testSignal = signal(123);
            const testLinkedSignal = linkedSignal(() => testSignal());
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain(
          `linkedSignal(() => testSignal(), ...(ngDevMode ? [{ debugName: "testLinkedSignal" }] : [])`,
        );
      });

      describe('Variable Declaration Case', () => {
        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal} from '@angular/core';
              const testSignal = signal(123);
              const testLinkedSignal = linkedSignal(() => testSignal());
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).not.toContain('debugName');
          expect(builtContent).toContain('linkedSignal(() => testSignal())');
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal} from '@angular/core';
              const testSignal = signal(123);
              const testLinkedSignal = linkedSignal(() => testSignal());
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `linkedSignal(() => testSignal(), { debugName: "testLinkedSignal" })`,
          );
        });

        it('should insert debug info into linkedSignal function that already has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal} from '@angular/core';
              const testSignal = signal(123);
              const testLinkedSignal = linkedSignal(() => testSignal(), { equal: () => true });
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `linkedSignal(() => testSignal(), { ...(ngDevMode ? { debugName: "testLinkedSignal" } : {}), equal: () => true })`,
          );
        });

        it('should tree-shake away debug info if in prod mode for linkedSignal function that has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal} from '@angular/core';
              declare function equal(): boolean;

              const testSignal = signal(123);
              const testLinkedSignal = linkedSignal(() => testSignal(), { equal });
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).toContain(
            `testLinkedSignal = linkedSignal(() => testSignal(), { equal })`,
          );
          expect(builtContent).not.toContain('ngDevMode');
          expect(builtContent).not.toContain('debugName');
        });

        it('should not tree-shake away debug info if in dev mode and has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal} from '@angular/core';
              declare function equal(): boolean;

              const testSignal = signal(123);
              const testLinkedSignal = linkedSignal(() => testSignal(), { equal });
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `testLinkedSignal = linkedSignal(() => testSignal(), { debugName: "testLinkedSignal", equal });`,
          );
        });

        it('should insert debug info into linkedSignal with a computation object', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal} from '@angular/core';
              const testSignal = signal(123);
              const testLinkedSignal = linkedSignal({
                source: testSignal,
                computation: (src, prev) => src,
              });
            `,
          );
          env.driveMain();

          const jsContents = cleanNewLines(env.getContents('test.js'));
          expect(jsContents).toContain(
            'testLinkedSignal = linkedSignal({ ...(ngDevMode ? { debugName: "testLinkedSignal" } : {}), ' +
              'source: testSignal, ' +
              'computation: (src, prev) => src ' +
              '})',
          );
        });

        it('should tree-shake away debug info if in prod mode for linkedSignal with a computation object', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal} from '@angular/core';
              const computation = (src: any, prev: any) => src;

              const testSignal = signal(123);
              const testLinkedSignal = linkedSignal({
                source: testSignal,
                computation,
              });
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).toContain(
            'testLinkedSignal = linkedSignal({ source: testSignal, computation })',
          );
          expect(builtContent).not.toContain('ngDevMode');
          expect(builtContent).not.toContain('debugName');
        });

        it('should not tree-shake away debug info if in dev mode and with a computation object', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal} from '@angular/core';
              const computation = (src: any, prev: any) => src;

              const testSignal = signal(123);
              const testLinkedSignal = linkedSignal({
                source: testSignal,
                computation,
              });
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).toContain(
            'testLinkedSignal = linkedSignal({ ' +
              'debugName: "testLinkedSignal", ' +
              'source: testSignal, ' +
              'computation ' +
              '})',
          );
        });
      });

      describe('Property Declaration Case', () => {
        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component} from '@angular/core';

              @Component({
                template: ''
              }) class MyComponent {
                testSignal = signal(123);
                testLinkedSignal = linkedSignal(() => this.testSignal());
              }
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).not.toContain('debugName');
          expect(builtContent).toContain('linkedSignal(() => this.testSignal())');
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component} from '@angular/core';

              @Component({
                template: ''
              }) class MyComponent {
                testSignal = signal(123);
                testLinkedSignal = linkedSignal(() => this.testSignal());
              }
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `linkedSignal(() => this.testSignal(), { debugName: "testLinkedSignal" })`,
          );
        });

        it('should insert debug info into linkedSignal function that already has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component} from '@angular/core';

              @Component({
                template: ''
              }) class MyComponent {
                testSignal = signal(123);
                testLinkedSignal = linkedSignal(() => this.testSignal(), { equal: () => true });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `linkedSignal(() => this.testSignal(), { ...(ngDevMode ? { debugName: "testLinkedSignal" } : {}), equal: () => true })`,
          );
        });

        it('should tree-shake away debug info if in prod mode for linkedSignal function that has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component} from '@angular/core';
              const equal = () => true;

              @Component({
                template: ''
              }) class MyComponent {
                testSignal = signal(123);
                testLinkedSignal = linkedSignal(() => this.testSignal(), { equal });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).toContain(
            `this.testLinkedSignal = linkedSignal(() => this.testSignal(), { equal })`,
          );
          expect(builtContent).not.toContain('ngDevMode');
          expect(builtContent).not.toContain('debugName');
        });

        it('should not tree-shake away debug info if in dev mode and has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component} from '@angular/core';
              const equal = () => true;

              @Component({
                template: ''
              }) class MyComponent {
                testSignal = signal(123);
                testLinkedSignal = linkedSignal(() => this.testSignal(), { equal });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `this.testLinkedSignal = linkedSignal(() => this.testSignal(), { debugName: "testLinkedSignal", equal });`,
          );
        });

        it('should insert debug info into linkedSignal with a computation object', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component} from '@angular/core';

              @Component({
                template: ''
              }) class MyComponent {
                testSignal = signal(123);
                testLinkedSignal = linkedSignal({
                  source: this.testSignal,
                  computation: (src, prev) => src,
                });
              }
            `,
          );
          env.driveMain();

          const jsContents = cleanNewLines(env.getContents('test.js'));
          expect(jsContents).toContain(
            'linkedSignal({ ...(ngDevMode ? { debugName: "testLinkedSignal" } : {}), ' +
              'source: this.testSignal, ' +
              'computation: (src, prev) => src ' +
              '})',
          );
        });

        it('should tree-shake away debug info if in prod mode for linkedSignal with a computation object', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component} from '@angular/core';
              const computation = (src: any, prev: any) => src;

              @Component({
                template: ''
              }) class MyComponent {
                testSignal = signal(123);
                testLinkedSignal = linkedSignal({
                  source: this.testSignal,
                  computation,
                });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).toContain(
            'this.testLinkedSignal = linkedSignal({ source: this.testSignal, computation })',
          );
          expect(builtContent).not.toContain('ngDevMode');
          expect(builtContent).not.toContain('debugName');
        });

        it('should not tree-shake away debug info if in dev mode and with a computation object', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component} from '@angular/core';
              const computation = (src: any, prev: any) => src;

              @Component({
                template: ''
              }) class MyComponent {
                testSignal = signal(123);
                testLinkedSignal = linkedSignal({
                  source: this.testSignal,
                  computation,
                });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).toContain(
            'this.testLinkedSignal = linkedSignal({ ' +
              'debugName: "testLinkedSignal", ' +
              'source: this.testSignal, ' +
              'computation ' +
              '})',
          );
        });
      });

      describe('Property Assignment Case', () => {
        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component, WritableSignal, Signal} from '@angular/core';

              @Component({
                template: ''
              }) class MyComponent {
                testSignal: WritableSignal<number>;
                testLinkedSignal: Signal<number>;

                constructor() {
                  this.testSignal = signal(123);
                  this.testLinkedSignal = linkedSignal(() => this.testSignal());
                }
              }
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).not.toContain('debugName');
          expect(builtContent).toContain('linkedSignal(() => this.testSignal())');
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component, WritableSignal, Signal} from '@angular/core';

              @Component({
                template: ''
              }) class MyComponent {
                testSignal: WritableSignal<number>;
                testLinkedSignal: Signal<number>;

                constructor() {
                  this.testSignal = signal(123);
                  this.testLinkedSignal = linkedSignal(() => this.testSignal());
                }
              }
            `,
          );
          env.driveMain();
          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `linkedSignal(() => this.testSignal(), { debugName: "testLinkedSignal" })`,
          );
        });

        it('should insert debug info into linkedSignal function that already has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component, WritableSignal, Signal} from '@angular/core';

              @Component({
                template: ''
              }) class MyComponent {
                testSignal: WritableSignal<number>;
                testLinkedSignal: Signal<number>;

                constructor() {
                  this.testSignal = signal(123);
                  this.testLinkedSignal = linkedSignal(() => this.testSignal(), { equal: () => true });
                }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          expect(jsContents).toContain(
            `linkedSignal(() => this.testSignal(), { ...(ngDevMode ? { debugName: "testLinkedSignal" } : {}), equal: () => true })`,
          );
        });

        it('should tree-shake away debug info if in prod mode for linkedSignal function that has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component, WritableSignal, Signal} from '@angular/core';
              const equal = () => true;

              @Component({
                template: ''
              }) class MyComponent {
                testSignal: WritableSignal<number>;
                testLinkedSignal: Signal<number>;

                constructor() {
                  this.testSignal = signal(123);
                  this.testLinkedSignal = linkedSignal(() => this.testSignal(), { equal });
                }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          expect(builtContent).toContain(
            `this.testLinkedSignal = linkedSignal(() => this.testSignal(), { equal })`,
          );
          expect(builtContent).not.toContain('ngDevMode');
          expect(builtContent).not.toContain('debugName');
        });

        it('should not tree-shake away debug info if in dev mode and has custom options', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component, WritableSignal, Signal} from '@angular/core';
              const equal = () => true;

              @Component({
                template: ''
              }) class MyComponent {
                testSignal: WritableSignal<number>;
                testLinkedSignal: Signal<number>;

                constructor() {
                  this.testSignal = signal(123);
                  this.testLinkedSignal = linkedSignal(() => this.testSignal(), { equal });
                }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          expect(builtContent).toContain(
            `this.testLinkedSignal = linkedSignal(() => this.testSignal(), { debugName: "testLinkedSignal", equal });`,
          );
        });

        it('should insert debug info into linkedSignal with a computation object', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component, WritableSignal, Signal} from '@angular/core';

              @Component({
                template: ''
              }) class MyComponent {
                testSignal: WritableSignal<number>;
                testLinkedSignal: Signal<number>;

                constructor() {
                  this.testSignal = signal(123);
                  this.testLinkedSignal = linkedSignal({
                    source: this.testSignal,
                    computation: (src, prev) => src,
                  });
                }
              }
            `,
          );
          env.driveMain();

          const jsContents = cleanNewLines(env.getContents('test.js'));
          expect(jsContents).toContain(
            'linkedSignal({ ...(ngDevMode ? { debugName: "testLinkedSignal" } : {}), ' +
              'source: this.testSignal, ' +
              'computation: (src, prev) => src ' +
              '})',
          );
        });

        it('should tree-shake away debug info if in prod mode for linkedSignal with a computation object', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component, WritableSignal, Signal} from '@angular/core';

              const computation = (src: any, prev: any) => src;

              @Component({
                template: ''
              }) class MyComponent {
                testSignal: WritableSignal<number>;
                testLinkedSignal: Signal<number>;

                constructor() {
                  this.testSignal = signal(123);
                  this.testLinkedSignal = linkedSignal({
                    source: this.testSignal,
                    computation,
                  });
                }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).toContain(
            'this.testLinkedSignal = linkedSignal({ source: this.testSignal, computation })',
          );
          expect(builtContent).not.toContain('ngDevMode');
          expect(builtContent).not.toContain('debugName');
        });

        it('should not tree-shake away debug info if in dev mode and with a computation object', async () => {
          env.write(
            'test.ts',
            `
              import {signal, linkedSignal, Component, WritableSignal, Signal} from '@angular/core';

              const computation = (src: any, prev: any) => src;

              @Component({
                template: ''
              }) class MyComponent {
                testSignal: WritableSignal<number>;
                testLinkedSignal: Signal<number>;

                constructor() {
                  this.testSignal = signal(123);
                  this.testLinkedSignal = linkedSignal({
                    source: this.testSignal,
                    computation,
                  });
                }
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).toContain(
            'this.testLinkedSignal = linkedSignal({ ' +
              'debugName: "testLinkedSignal", ' +
              'source: this.testSignal, ' +
              'computation ' +
              '})',
          );
        });
      });
    });

    describe('resource', () => {
      it('should not insert debug info into resource function if not imported from angular core', () => {
        env.write(
          'test.ts',
          `
            declare function resource(props: any): any;
            const testResource = resource({
              defaultValue: 'foo',
              loader: async () => 'bar',
            });
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('debugName');
      });

      it('should insert debug info into resource function if imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {resource} from '@angular/core';
            const testResource = resource({
              defaultValue: 'foo',
              loader: async () => 'bar',
            });
          `,
        );
        env.driveMain();
        const jsContents = cleanNewLines(env.getContents('test.js'));
        expect(jsContents).toContain(
          'resource({ ' +
            '...(ngDevMode ? { debugName: "testResource" } : {}), ' +
            `defaultValue: 'foo', ` +
            `loader: async () => 'bar' ` +
            '})',
        );
      });

      describe('Variable Declaration Case', () => {
        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {resource} from '@angular/core';
              const loader = async () => 'bar';
              const testResource = resource({
                defaultValue: "foo",
                loader,
              });
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).not.toContain('debugName');
          expect(contentWoNewLines).toContain(
            `testResource = resource({ defaultValue: "foo", loader })`,
          );
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {resource} from '@angular/core';
              const loader = async () => 'bar';
              const testResource = resource({
                defaultValue: 'foo',
                loader,
              });
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).toContain(
            'testResource = resource({ ' +
              'debugName: "testResource", ' +
              'defaultValue: "foo", ' +
              'loader ' +
              '})',
          );
        });
      });

      describe('Property Declaration Case', () => {
        it('should insert debug info into resource function', () => {
          env.write(
            'test.ts',
            `
              import {resource, Component} from '@angular/core';

              @Component({
                template: ''
              }) class MyComponent {
                testResource = resource({
                  defaultValue: 'foo',
                  loader: async () => 'bar',
                });
              }`,
          );
          env.driveMain();
          const jsContents = cleanNewLines(env.getContents('test.js'));
          expect(jsContents).toContain(
            'resource({ ' +
              '...(ngDevMode ? { debugName: "testResource" } : {}), ' +
              `defaultValue: 'foo', ` +
              `loader: async () => 'bar' ` +
              '})',
          );
        });

        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {resource, Component} from '@angular/core';
              const loader = async () => 'bar';

              @Component({
                template: ''
              }) class MyComponent {
                testResource = resource({
                  defaultValue: 'foo',
                  loader,
                });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).not.toContain('debugName');
          expect(contentWoNewLines).toContain(
            `testResource = resource({ defaultValue: "foo", loader })`,
          );
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {resource, Component} from '@angular/core';
              const loader = async () => 'bar';

              @Component({
                template: ''
              }) class MyComponent {
                testResource = resource({
                  defaultValue: 'foo',
                  loader,
                });
              }
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).toContain(
            'testResource = resource({ ' +
              'debugName: "testResource", ' +
              'defaultValue: "foo", ' +
              'loader ' +
              '})',
          );
        });
      });

      describe('Property Assignment Case', () => {
        it('should insert debug info into resource function', () => {
          env.write(
            'test.ts',
            `
              import {resource, ResourceRef, Component} from '@angular/core';

              @Component({
                template: ''
              }) class MyComponent {
                testResource: ResourceRef<any>;
                constructor() {
                  this.testResource = resource({
                    defaultValue: 'foo',
                    loader: async () => 'bar',
                  });
                }
              }
            `,
          );
          env.driveMain();
          const jsContents = cleanNewLines(env.getContents('test.js'));
          expect(jsContents).toContain(
            'resource({ ' +
              '...(ngDevMode ? { debugName: "testResource" } : {}), ' +
              `defaultValue: 'foo', ` +
              `loader: async () => 'bar' ` +
              '})',
          );
        });

        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
            import {resource, ResourceRef, Component} from '@angular/core';
            const loader = async () => 'bar';

            @Component({
              template: ''
            }) class MyComponent {
              testResource: ResourceRef<any>;
              constructor() {
                this.testResource = resource({
                  defaultValue: 'foo',
                  loader,
                });
              }
            }
          `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).not.toContain('debugName');
          expect(contentWoNewLines).toContain(
            `testResource = resource({ defaultValue: "foo", loader })`,
          );
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
            import {resource, ResourceRef, Component} from '@angular/core';
            const loader = async () => 'bar';

            @Component({
              template: ''
            }) class MyComponent {
              testResource: ResourceRef<any>;
              constructor() {
                this.testResource = resource({
                  defaultValue: 'foo',
                  loader,
                });
              }
            }
          `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).toContain(
            'testResource = resource({ ' +
              'debugName: "testResource", ' +
              'defaultValue: "foo", ' +
              'loader ' +
              '})',
          );
        });
      });
    });

    describe('httpResource', () => {
      it('should not insert debug info into httpResource function if not imported from angular core', () => {
        env.write(
          'test.ts',
          `
            declare function httpResource(props: any): any;
            const testResource = httpResource(() => '/api');
          `,
        );
        env.driveMain();
        const jsContents = env.getContents('test.js');
        expect(jsContents).not.toContain('debugName');
      });

      it('should insert debug info into httpResource function if imported from angular core', () => {
        env.write(
          'test.ts',
          `
            import {httpResource} from '@angular/common/http';
            const testHttpResource = httpResource(() => '/api');
          `,
        );
        env.driveMain();
        const jsContents = cleanNewLines(env.getContents('test.js'));
        expect(jsContents).toContain(
          `httpResource(() => '/api', ...(ngDevMode ? [{ debugName: "testHttpResource" }] : []))`,
        );
      });

      describe('Variable Declaration Case', () => {
        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {httpResource} from '@angular/common/http';
              const testHttpResource = httpResource(() => '/api');
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).not.toContain('debugName');
          expect(contentWoNewLines).toContain(`testHttpResource = httpResource(() => "/api")`);
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {httpResource} from '@angular/common/http';
              const testHttpResource = httpResource(() => '/api');
            `,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).toContain(
            'testHttpResource = httpResource(() => "/api", { ' +
              'debugName: "testHttpResource" ' +
              '})',
          );
        });
      });

      describe('Property Declaration Case', () => {
        it('should insert debug info into httpResource function', () => {
          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';
              import {httpResource} from '@angular/common/http';

              @Component({
                template: ''
              }) class MyComponent {
                testHttpResource = httpResource(() => '/api');
              }`,
          );
          env.driveMain();
          const jsContents = cleanNewLines(env.getContents('test.js'));
          expect(jsContents).toContain(
            `httpResource(() => '/api', ...(ngDevMode ? [{ debugName: "testHttpResource" }] : []))`,
          );
        });

        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';
              import {httpResource} from '@angular/common/http';

              @Component({
                template: ''
              }) class MyComponent {
                testHttpResource = httpResource(() => '/api');
              }`,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).not.toContain('debugName');
          expect(contentWoNewLines).toContain(`testHttpResource = httpResource(() => "/api")`);
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';
              import {httpResource} from '@angular/common/http';

              @Component({
                template: ''
              }) class MyComponent {
                testHttpResource = httpResource(() => '/api');
              }`,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).toContain(
            'testHttpResource = httpResource(() => "/api", { ' +
              'debugName: "testHttpResource" ' +
              '})',
          );
        });
      });

      describe('Property Assignment Case', () => {
        it('should insert debug info into httpResource function', () => {
          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';
              import {httpResource, HttpResourceRef} from '@angular/common/http';

              @Component({
                template: ''
              }) class MyComponent {
                testHttpResource: HttpResourceRef<any>;
                constructor() {
                  this.testHttpResource = httpResource(() => '/api');
                }
              }`,
          );
          env.driveMain();
          const jsContents = cleanNewLines(env.getContents('test.js'));
          expect(jsContents).toContain(
            `httpResource(() => '/api', ...(ngDevMode ? [{ debugName: "testHttpResource" }] : []))`,
          );
        });

        it('should tree-shake away debug info if in prod mode', async () => {
          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';
              import {httpResource, HttpResourceRef} from '@angular/common/http';

              @Component({
                template: ''
              }) class MyComponent {
                testHttpResource: HttpResourceRef<any>;
                constructor() {
                  this.testHttpResource = httpResource(() => '/api');
                }
              }`,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedProdBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).not.toContain('debugName');
          expect(contentWoNewLines).toContain(`testHttpResource = httpResource(() => "/api")`);
        });

        it('should not tree-shake away debug info if in dev mode', async () => {
          env.write(
            'test.ts',
            `
              import {Component} from '@angular/core';
              import {httpResource, HttpResourceRef} from '@angular/common/http';

              @Component({
                template: ''
              }) class MyComponent {
                testHttpResource: HttpResourceRef<any>;
                constructor() {
                  this.testHttpResource = httpResource(() => '/api');
                }
              }`,
          );
          env.driveMain();

          const jsContents = env.getContents('test.js');
          const builtContent = (await esbuild.transform(jsContents, minifiedDevBuildOptions)).code;
          const contentWoNewLines = cleanNewLines(builtContent);
          expect(contentWoNewLines).toContain(
            'testHttpResource = httpResource(() => "/api", { ' +
              'debugName: "testHttpResource" ' +
              '})',
          );
        });
      });
    });
  });
});
