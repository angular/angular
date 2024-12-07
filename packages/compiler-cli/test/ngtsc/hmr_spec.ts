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

      expect(jsContents).toContain(`import * as i0 from "@angular/core";`);
      expect(jsContents).toContain('function Cmp_HmrLoad(t) {');
      expect(jsContents).toContain(
        'import(/* @vite-ignore */\n"/@ng/component?c=test.ts%40Cmp&t=" + encodeURIComponent(t))',
      );
      expect(jsContents).toContain(
        ').then(m => m.default && i0.ɵɵreplaceMetadata(Cmp, m.default, [i0], ' +
          '[Dep, transformValue, TOKEN, Component, Inject, ViewChild, Input]));',
      );
      expect(jsContents).toContain('Cmp_HmrLoad(Date.now());');
      expect(jsContents).toContain(
        'import.meta.hot && import.meta.hot.on("angular:component-update", ' +
          'd => d.id === "test.ts%40Cmp" && Cmp_HmrLoad(d.timestamp)',
      );

      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, Dep, transformValue, TOKEN, Component, Inject, ViewChild, Input) {',
      );
      expect(hmrContents).toContain(`const ɵhmr0 = ɵɵnamespaces[0];`);
      expect(hmrContents).toContain('Cmp.ɵfac = function Cmp_Factory');
      expect(hmrContents).toContain('Cmp.ɵcmp = /*@__PURE__*/ ɵhmr0.ɵɵdefineComponent');
      expect(hmrContents).toContain('ɵhmr0.ɵsetClassMetadata(Cmp,');
      expect(hmrContents).toContain('ɵhmr0.ɵsetClassDebugInfo(Cmp,');
    });

    it('should generate an HMR initializer and update function for a class that depends on multiple namespaces', () => {
      enableHmr();
      env.write(
        'dep.ts',
        `
          import {Directive, NgModule} from '@angular/core';

          @Directive({
            selector: '[dep]',
            standalone: true,
          })
          export class Dep {}

          @NgModule({
            imports: [Dep],
            exports: [Dep]
          })
          export class DepModule {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component, ViewChild, Input, Inject} from '@angular/core';
          import {DepModule} from './dep';

          @Component({
            selector: 'cmp',
            standalone: true,
            template: '<div dep><div>',
            imports: [DepModule],
          })
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');
      expect(jsContents).toContain(`import * as i0 from "@angular/core";`);
      expect(jsContents).toContain(`import * as i1 from "./dep";`);
      expect(jsContents).toContain('function Cmp_HmrLoad(t) {');
      expect(jsContents).toContain(
        'import(/* @vite-ignore */\n"/@ng/component?c=test.ts%40Cmp&t=" + encodeURIComponent(t))',
      );
      expect(jsContents).toContain(
        ').then(m => m.default && i0.ɵɵreplaceMetadata(Cmp, m.default, [i0, i1], ' +
          '[DepModule, Component]));',
      );
      expect(jsContents).toContain('Cmp_HmrLoad(Date.now());');
      expect(jsContents).toContain(
        'import.meta.hot && import.meta.hot.on("angular:component-update", ' +
          'd => d.id === "test.ts%40Cmp" && Cmp_HmrLoad(d.timestamp)',
      );

      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, DepModule, Component) {',
      );
      expect(hmrContents).toContain(`const ɵhmr0 = ɵɵnamespaces[0];`);
      expect(hmrContents).toContain(`const ɵhmr1 = ɵɵnamespaces[1];`);
      expect(hmrContents).toContain('Cmp.ɵfac = function Cmp_Factory');
      expect(hmrContents).toContain('Cmp.ɵcmp = /*@__PURE__*/ ɵhmr0.ɵɵdefineComponent');
      expect(hmrContents).toContain('ɵhmr0.ɵsetClassMetadata(Cmp,');
      expect(hmrContents).toContain('ɵhmr0.ɵsetClassDebugInfo(Cmp,');
      expect(hmrContents).toContain('dependencies: [DepModule, ɵhmr1.Dep]');
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
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, Component) {',
      );
      expect(hmrContents).toContain('function Cmp_Conditional_0_Template(rf, ctx) {');
      expect(hmrContents).toContain('ɵhmr0.ɵɵtemplate(0, Cmp_Conditional_0_Template, 1, 0);');
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
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, Component) {',
      );
      expect(hmrContents).toContain('const _c0 = [[["header"]], "*"];');
      expect(hmrContents).toContain('const _c1 = ["header", "*"];');
      expect(hmrContents).toContain('ngContentSelectors: _c1');
      expect(hmrContents).toContain('ɵhmr0.ɵɵprojectionDef(_c0);');
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
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, Component, Dep) {',
      );
      expect(hmrContents).toContain('const Cmp_Defer_1_DepsFn = () => [Dep];');
      expect(hmrContents).toContain('function Cmp_Defer_0_Template(rf, ctx) {');
      expect(hmrContents).toContain('ɵhmr0.ɵɵdefer(1, 0, Cmp_Defer_1_DepsFn);');
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
