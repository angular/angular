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

const testFiles = loadStandardTestFiles();

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

runInEachFileSystem(() => {
  describe('Debug Info Typescript tranformation', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    describe('signal', () => {
      xit('should not insert debug info into signal function if not imported from angular core', () => {
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

      xit('should insert debug info into signal function if imported from angular core', () => {
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
          `signal('Hello World', { ...(ngDevMode ? { debugName: "testSignal" } : {}) })`,
        );
      });

      describe('Variable Declaration Case', () => {
        xit('should tree-shake away debug info if in prod mode', async () => {
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
          expect(builtContent).toContain('signal("Hello World", {})');
        });

        xit('should not tree-shake away debug info if in dev mode', async () => {
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

        xit('should insert debug info into signal function that already has custom options', async () => {
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

        xit('should tree-shake away debug info if in prod mode for signal function that has custom options', async () => {
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
        xit('should insert debug info into signal function', () => {
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
            `signal('Hello World', { ...(ngDevMode ? { debugName: "testSignal" } : {}) })`,
          );
        });

        xit('should tree-shake away debug info if in prod mode', async () => {
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
          expect(builtContent).toContain('signal("Hello World", {})');
        });

        xit('should not tree-shake away debug info if in dev mode', async () => {
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

        xit('should insert debug info into signal function that already has custom options', async () => {
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

        xit('should tree-shake away debug info if in prod mode for signal function that has custom options', async () => {
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
        xit('should insert debug info into signal function', () => {
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
            `signal('Hello World', { ...(ngDevMode ? { debugName: "testSignal" } : {}) })`,
          );
        });

        xit('should tree-shake away debug info if in prod mode', async () => {
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
          expect(builtContent).toContain('signal("Hello World", {})');
        });

        xit('should not tree-shake away debug info if in dev mode', async () => {
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

        xit('should insert debug info into signal function that already has custom options', async () => {
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

        xit('should tree-shake away debug info if in prod mode for signal function that has custom options', async () => {
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
      xit('should not insert debug info into computed function if not imported from angular core', () => {
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

      xit('should insert debug info into computed function if imported from angular core', () => {
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
          `computed(() => testSignal(), { ...(ngDevMode ? { debugName: "testComputed" } : {}) })`,
        );
      });

      describe('Variable Declaration Case', () => {
        xit('should tree-shake away debug info if in prod mode', async () => {
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
          expect(builtContent).toContain('computed(() => testSignal(), {})');
        });

        xit('should not tree-shake away debug info if in dev mode', async () => {
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

        xit('should insert debug info into computed function that already has custom options', async () => {
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

        xit('should tree-shake away debug info if in prod mode for computed function that has custom options', async () => {
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
          expect(builtContent).toContain(`testComputed = computed(() => testSignal(), { equal }`);
          expect(builtContent).not.toContain('ngDevMode');
          expect(builtContent).not.toContain('debugName');
        });

        xit('should not tree-shake away debug info if in dev mode and has custom options', async () => {
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
        xit('should tree-shake away debug info if in prod mode', async () => {
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
          expect(builtContent).toContain('computed(() => this.testSignal(), {})');
        });

        xit('should not tree-shake away debug info if in dev mode', async () => {
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

        xit('should insert debug info into computed function that already has custom options', async () => {
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

        xit('should tree-shake away debug info if in prod mode for computed function that has custom options', async () => {
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

        xit('should not tree-shake away debug info if in dev mode and has custom options', async () => {
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
        xit('should tree-shake away debug info if in prod mode', async () => {
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
          expect(builtContent).toContain('computed(() => this.testSignal(), {})');
        });

        xit('should not tree-shake away debug info if in dev mode', async () => {
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

        xit('should insert debug info into computed function that already has custom options', async () => {
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

        xit('should tree-shake away debug info if in prod mode for computed function that has custom options', async () => {
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

        xit('should not tree-shake away debug info if in dev mode and has custom options', async () => {
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
      xit('should not insert debug info into model function if not imported from angular core', () => {
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

      xit('should insert debug info into model function if imported from angular core', () => {
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
          `model('Hello World', { ...(ngDevMode ? { debugName: "testModel" } : {}) })`,
        );
        expect(jsContents).toContain(
          `model(void 0, { ...(ngDevMode ? { debugName: "testModel2" } : {}) })`,
        );
      });

      xit('should tree-shake away debug info if in prod mode', async () => {
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
        expect(builtContent).toContain('model("Hello World", {})');
      });

      describe('.required', () => {
        xit('should insert debug info into .required', () => {
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
            `model.required({ ...(ngDevMode ? { debugName: "testModel" } : {}) })`,
          );
        });

        xit('should insert debug info into .required that already has custom options', () => {
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

        xit('should tree-shake away debug info if in prod mode', async () => {
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
          expect(builtContent).toContain('model.required({});');
        });

        xit('should not tree-shake away debug info if in dev mode', async () => {
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

        xit('should tree-shake away debug info if in prod mode with custom options', async () => {
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

        xit('should not tree-shake away debug info if in dev mode with custom options', async () => {
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
      xit('should not insert debug info into input function if not imported from angular core', () => {
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

      xit('should insert debug info into input function if imported from angular core', () => {
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
          `input(void 0, { ...(ngDevMode ? { debugName: "testInput" } : {}) })`,
        );
      });

      xit('should tree-shake away debug info if in prod mode', async () => {
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
        expect(builtContent).toContain('input(void 0, {});');
      });

      describe('.required', () => {
        xit('should insert debug info into .required', () => {
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
            `input.required({ ...(ngDevMode ? { debugName: "testInput" } : {}) })`,
          );
        });

        xit('should insert debug info into .required that already has custom options', () => {
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

        xit('should tree-shake away debug info if in prod mode', async () => {
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
          expect(builtContent).toContain('input.required({});');
        });

        xit('should not tree-shake away debug info if in dev mode', async () => {
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

        xit('should tree-shake away debug info if in prod mode with custom options', async () => {
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

        xit('should not tree-shake away debug info if in dev mode with custom options', async () => {
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
      xit('should not insert debug info into viewChild function if not imported from angular core', () => {
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

      xit('should insert debug info into viewChild function if imported from angular core', () => {
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
          `viewChild('foo', { ...(ngDevMode ? { debugName: "testViewChild" } : {}) })`,
        );
        expect(jsContents).toContain(
          `viewChild(ChildComponent, { ...(ngDevMode ? { debugName: "testViewChildComponent" } : {}) })`,
        );
      });

      xit('should tree-shake away debug info if in prod mode', async () => {
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
        expect(builtContent).toContain(`viewChild("foo", {})`);
        expect(builtContent).toContain(`viewChild(ChildComponent, {})`);
      });

      xit('should not tree-shake away debug info if in dev mode', async () => {
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

      xit('should tree-shake away debug info if in prod mode with existing options', async () => {
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

      xit('should not tree-shake away debug info if in dev mode with existing options', async () => {
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
      xit('should not insert debug info into viewChildren function if not imported from angular core', () => {
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

      xit('should insert debug info into viewChildren function if imported from angular core', () => {
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
          `viewChildren('foo', { ...(ngDevMode ? { debugName: "testViewChildren" } : {}) })`,
        );
      });

      xit('should tree-shake away debug info if in prod mode', async () => {
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
        expect(builtContent).toContain('viewChildren("foo", {})');
      });

      xit('should not tree-shake away debug info if in dev mode', async () => {
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

      xit('should tree-shake away debug info if in prod mode with existing options', async () => {
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

      xit('should not tree-shake away debug info if in dev mode with existing options', async () => {
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
      xit('should not insert debug info into contentChild function if not imported from angular core', () => {
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

      xit('should insert debug info into contentChild function if imported from angular core', () => {
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
          `contentChild('foo', { ...(ngDevMode ? { debugName: "testContentChild" } : {}) })`,
        );
      });

      xit('should tree-shake away debug info if in prod mode', async () => {
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
        expect(builtContent).toContain('contentChild("foo", {})');
      });

      xit('should not tree-shake away debug info if in dev mode', async () => {
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

      xit('should tree-shake away debug info if in prod mode with existing options', async () => {
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

      xit('should not tree-shake away debug info if in dev mode with existing options', async () => {
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
      xit('should not insert debug info into contentChildren function if not imported from angular core', () => {
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

      xit('should insert debug info into contentChildren function if imported from angular core', () => {
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
          `contentChildren('foo', { ...(ngDevMode ? { debugName: "testContentChildren" } : {}) })`,
        );
      });

      xit('should tree-shake away debug info if in prod mode', async () => {
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
        expect(builtContent).toContain('contentChildren("foo", {})');
      });

      xit('should not tree-shake away debug info if in dev mode', async () => {
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

      xit('should tree-shake away debug info if in prod mode with existing options', async () => {
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

      xit('should not tree-shake away debug info if in dev mode with existing options', async () => {
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
      xit('should not insert debug info into effect function if not imported from angular core', () => {
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

      xit('should insert debug info into effect function if imported from angular core', () => {
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
          `effect(() => this.testSignal(), { ...(ngDevMode ? { debugName: "testEffect" } : {}) })`,
        );
      });

      xit('should tree-shake away debug info if in prod mode', async () => {
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
        expect(builtContent).toContain('effect(() => this.testSignal(), {})');
      });

      xit('should not tree-shake away debug info if in dev mode', async () => {
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

      xit('should tree-shake away debug info if in prod mode with existing options', async () => {
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

      xit('should not tree-shake away debug info if in dev mode with existing options', async () => {
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
  });
});
