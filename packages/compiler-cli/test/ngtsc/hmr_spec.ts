/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';
import {NgtscTestEnvironment} from './env';

runInEachFileSystem(() => {
  describe('HMR code generation', () => {
    const testFiles = loadStandardTestFiles();
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    function enableHmr(): void {
      env.write(
        'tsconfig.json',
        JSON.stringify({
          extends: './tsconfig-base.json',
          angularCompilerOptions: {
            _enableHmr: true,
          },
        }),
      );
    }

    it('should not generate an HMR code by default', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            template: 'hello',
            standalone: true,
          })
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');
      expect(jsContents).not.toContain('import.meta.hot');
      expect(jsContents).not.toContain('replaceMetadata');
      expect(hmrContents).toBe(null);
    });

    it('should generate an HMR initializer and update code when enabled', () => {
      enableHmr();
      env.write(
        'dep.ts',
        `
          import {Directive, InjectionToken} from '@angular/core';

          export const TOKEN = new InjectionToken<any>('token');

          export function transformValue(value: string) {
            return parseInt(value);
          }

          @Directive({
            selector: '[dep]',
            standalone: true,
          })
          export class Dep {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component, ViewChild, Input, Inject} from '@angular/core';
          import {Dep, transformValue, TOKEN} from './dep';

          @Component({
            selector: 'cmp',
            standalone: true,
            template: '<div dep><div>',
            imports: [Dep],
          })
          export class Cmp {
            @ViewChild(Dep) dep: Dep;
            @Input({transform: transformValue}) value: number;
            constructor(@Inject(TOKEN) readonly token: any) {}
          }
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');

      // We need a regex match here, because the file path changes based on
      // the file system and the timestamp will be different for each test run.
      expect(jsContents).toMatch(
        /import\.meta\.hot && import\.meta\.hot\.on\("angular:component-update", d => { if \(d\.id == "test\.ts%40Cmp"\) {/,
      );
      expect(jsContents).toMatch(
        /import\(\s*\/\* @vite-ignore \*\/\s+"\/@ng\/component\?c=test\.ts%40Cmp&t=" \+ encodeURIComponent\(d.timestamp\)/,
      );
      expect(jsContents).toMatch(
        /\).then\(m => i0\.ɵɵreplaceMetadata\(Cmp, m\.default, \[Dep, transformValue, TOKEN, Component, Inject, ViewChild, Input\]\)\);/,
      );

      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, __ngCore__, Dep, transformValue, TOKEN, Component, Inject, ViewChild, Input) {',
      );
      expect(hmrContents).toContain('Cmp.ɵfac = function Cmp_Factory');
      expect(hmrContents).toContain('Cmp.ɵcmp = /*@__PURE__*/ __ngCore__.ɵɵdefineComponent');
      expect(hmrContents).toContain('__ngCore__.ɵsetClassMetadata(Cmp,');
      expect(hmrContents).toContain('__ngCore__.ɵsetClassDebugInfo(Cmp,');
    });

    it('should generate an HMR update function for a component that has embedded views', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            standalone: true,
            template: '@if (true) {hello}',
          })
          export class Cmp {}
        `,
      );

      const hmrContents = env.driveHmr('test.ts', 'Cmp');

      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, __ngCore__, Component) {',
      );
      expect(hmrContents).toContain('function Cmp_Conditional_0_Template(rf, ctx) {');
      expect(hmrContents).toContain('__ngCore__.ɵɵtemplate(0, Cmp_Conditional_0_Template, 1, 0);');
    });

    it('should generate an HMR update function for a component whose definition produces variables', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            standalone: true,
            template: '<ng-content select="header"/><ng-content/>',
          })
          export class Cmp {}
        `,
      );

      const hmrContents = env.driveHmr('test.ts', 'Cmp');

      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, __ngCore__, Component) {',
      );
      expect(hmrContents).toContain('const _c0 = [[["header"]], "*"];');
      expect(hmrContents).toContain('const _c1 = ["header", "*"];');
      expect(hmrContents).toContain('ngContentSelectors: _c1');
      expect(hmrContents).toContain('__ngCore__.ɵɵprojectionDef(_c0);');
    });

    it('should not defer dependencies when HMR is enabled', () => {
      enableHmr();
      env.write(
        'dep.ts',
        `
          import {Directive} from '@angular/core';

          @Directive({
            selector: '[dep]',
            standalone: true,
          })
          export class Dep {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {Dep} from './dep';

          @Component({
            selector: 'cmp',
            standalone: true,
            template: '@defer (on timer(1000)) {<div dep></div>}',
            imports: [Dep],
          })
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');

      expect(jsContents).toContain(`import { Dep } from './dep';`);
      expect(jsContents).toContain('const Cmp_Defer_1_DepsFn = () => [Dep];');
      expect(jsContents).toContain('function Cmp_Defer_0_Template(rf, ctx) { if (rf & 1) {');
      expect(jsContents).toContain('i0.ɵɵdefer(1, 0, Cmp_Defer_1_DepsFn);');

      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, __ngCore__, Component, Dep) {',
      );
      expect(hmrContents).toContain('const Cmp_Defer_1_DepsFn = () => [Dep];');
      expect(hmrContents).toContain('function Cmp_Defer_0_Template(rf, ctx) {');
      expect(hmrContents).toContain('__ngCore__.ɵɵdefer(1, 0, Cmp_Defer_1_DepsFn);');
      expect(hmrContents).not.toContain('import(');
    });

    it('should not generate an HMR update function for a component that has errors', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({
            selector: 'cmp',
            standalone: true,
            template: '{{#invalid}}',
          })
          export class Cmp {}
        `,
      );

      const hmrContents = env.driveHmr('test.ts', 'Cmp');
      expect(hmrContents).toBe(null);
    });

    it('should not generate an HMR update function for an Angular class that does not support HMR', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          import {Directive} from '@angular/core';

          @Component({
            selector: '[dir]',
            standalone: true
          })
          export class Dir {}
        `,
      );

      const hmrContents = env.driveHmr('test.ts', 'Dir');
      expect(hmrContents).toBe(null);
    });

    it('should not generate an HMR update function for an undecorated class', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          export class Foo {}
        `,
      );

      const hmrContents = env.driveHmr('test.ts', 'Foo');
      expect(hmrContents).toBe(null);
    });
  });
});
