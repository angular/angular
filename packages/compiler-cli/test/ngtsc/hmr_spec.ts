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
import {CompilerOptions} from '../../src/transformers/api';
import {createCompilerHost} from '../../src/transformers/compiler_host';
import {NgtscProgram} from '../../src/ngtsc/program';
import ts from 'typescript';

runInEachFileSystem(() => {
  describe('HMR code generation', () => {
    const testFiles = loadStandardTestFiles();
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    function enableHmr(
      additionalAngularOptions: Record<string, unknown> = {},
      additionalCompilerOptions: Record<string, unknown> = {},
    ): void {
      env.write(
        'tsconfig.json',
        JSON.stringify({
          extends: './tsconfig-base.json',
          ...additionalCompilerOptions,
          angularCompilerOptions: {
            _enableHmr: true,
            ...additionalAngularOptions,
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
      expect(jsContents).toContain('const id = "test.ts%40Cmp";');
      expect(jsContents).toContain('function Cmp_HmrLoad(t) {');
      expect(jsContents).toContain(
        'import(/* @vite-ignore */\ni0.ɵɵgetReplaceMetadataURL(id, t, import.meta.url)',
      );
      expect(jsContents).toContain(
        ').then(m => m.default && i0.ɵɵreplaceMetadata(Cmp, m.default, [i0], ' +
          '[Dep, transformValue, TOKEN, Component, Inject, ViewChild, Input], import.meta, id));',
      );
      expect(jsContents).toContain('Cmp_HmrLoad(Date.now());');
      expect(jsContents).toContain(
        'import.meta.hot && import.meta.hot.on("angular:component-update", ' +
          'd => d.id === id && Cmp_HmrLoad(d.timestamp)',
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
      expect(jsContents).toContain('const id = "test.ts%40Cmp";');
      expect(jsContents).toContain('function Cmp_HmrLoad(t) {');
      expect(jsContents).toContain(
        'import(/* @vite-ignore */\ni0.ɵɵgetReplaceMetadataURL(id, t, import.meta.url)',
      );
      expect(jsContents).toContain(
        ').then(m => m.default && i0.ɵɵreplaceMetadata(Cmp, m.default, [i0, i1], ' +
          '[DepModule, Component], import.meta, id));',
      );
      expect(jsContents).toContain('Cmp_HmrLoad(Date.now());');
      expect(jsContents).toContain(
        'import.meta.hot && import.meta.hot.on("angular:component-update", ' +
          'd => d.id === id && Cmp_HmrLoad(d.timestamp)',
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
      expect(hmrContents).toContain(
        'ɵhmr0.ɵɵconditionalCreate(0, Cmp_Conditional_0_Template, 1, 0);',
      );
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
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, Dep, Component) {',
      );
      expect(hmrContents).toContain('const Cmp_Defer_1_DepsFn = () => [Dep];');
      expect(hmrContents).toContain('function Cmp_Defer_0_Template(rf, ctx) {');
      expect(hmrContents).toContain('ɵhmr0.ɵɵdefer(1, 0, Cmp_Defer_1_DepsFn);');
      expect(hmrContents).not.toContain('import(');
    });

    it('should capture deferred dependencies when no class metadata is produced', () => {
      // `supportTestBed` determines whether we produce `setClassMetadata` calls.
      enableHmr({supportTestBed: false});
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
      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0], [Dep], import.meta, id));',
      );
      expect(jsContents).not.toContain('setClassMetadata');

      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, Dep) {',
      );
      expect(hmrContents).toContain('const Cmp_Defer_1_DepsFn = () => [Dep];');
      expect(hmrContents).toContain('function Cmp_Defer_0_Template(rf, ctx) {');
      expect(hmrContents).toContain('ɵhmr0.ɵɵdefer(1, 0, Cmp_Defer_1_DepsFn);');
      expect(hmrContents).not.toContain('import(');
      expect(hmrContents).not.toContain('setClassMetadata');
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

    it('should capture self-referencing component during HMR', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({selector: 'cmp', template: '<cmp/>',})
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');
      expect(jsContents).toContain('dependencies: [Cmp]');
      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0], [Component], import.meta, id));',
      );
      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, Component) {',
      );
    });

    it('should capture component in its own dependencies if it is not used in the template', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({selector: 'cmp', template: ''})
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');
      expect(jsContents).not.toContain('dependencies');
      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0], [Component], import.meta, id));',
      );
      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, Component) {',
      );
    });

    it('should capture shorthand property assignment dependencies', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          const providers: any[] = [];

          @Component({template: '', providers})
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');

      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0], [providers, Component], import.meta, id));',
      );
      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, providers, Component) {',
      );
    });

    it('should capture variable initializer dependencies', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          import {Component, InjectionToken} from '@angular/core';

          const token = new InjectionToken<number>('TEST');
          const value = 123;

          @Component({
            template: '',
            providers: [{
              provide: token,
              useFactory: () => {
                const v = value;
                return v;
              }
            }]
          })
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');

      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0], [token, value, Component], import.meta, id));',
      );
      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, token, value, Component) {',
      );
    });

    it('should capture arrow function dependencies', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          import {Component, InjectionToken} from '@angular/core';

          const token = new InjectionToken<number>('TEST');
          const value = 123;

          @Component({
            template: '',
            providers: [{
              provide: token,
              useFactory: () => value
            }]
          })
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');

      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0], [token, value, Component], import.meta, id));',
      );
      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, token, value, Component) {',
      );
    });

    it('should capture conditional expression dependencies', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          import {Component, InjectionToken} from '@angular/core';

          const providersA: any[] = [];
          const providersB: any[] = [];
          const condition = true;

          @Component({
            template: '',
            providers: [condition ? providersA : providersB]
          })
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');

      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0], [condition, providersA, providersB, Component], import.meta, id));',
      );
      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, condition, providersA, providersB, Component) {',
      );
    });

    it('should capture parenthesized dependencies', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          import {Component, InjectionToken} from '@angular/core';

          const token = new InjectionToken<number>('TEST');
          const value = 123;
          const otherValue = 321;

          @Component({
            template: '',
            providers: [{
              provide: token,
              useFactory: () => [(value), ((((otherValue))))]
            }]
          })
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');
      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0], [token, value, otherValue, Component], import.meta, id));',
      );
      expect(jsContents).toContain('useFactory: () => [(value), ((((otherValue))))]');
      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, token, value, otherValue, Component) {',
      );
    });

    it('should capture new expression dependencies', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          import {Component, InjectionToken, Optional} from '@angular/core';
          const token = new InjectionToken<number>('TEST');
          const dep = new InjectionToken<number>('TEST-DEP');
          const value = 5;
          @Component({
            template: '',
            providers: [{
              provide: token,
              useFactory: () => {
                const v = value;
                return v;
              },
              deps: [[new Optional(), dep]]
            }]
          })
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');

      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0], [token, value, Optional, dep, Component], import.meta, id));',
      );
      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, token, value, Optional, dep, Component) {',
      );
    });

    it('should preserve eager standalone imports in HMR even if they are not used in the template', () => {
      enableHmr({
        // Disable class metadata since it can add noise to the test.
        supportTestBed: false,
        extendedDiagnostics: {
          checks: {
            // Disable the diagnostic that flags standalone imports since
            // we need one to simulate the case we're looking for.
            unusedStandaloneImports: 'suppress',
          },
        },
      });

      env.write(
        'dep.ts',
        `
          import {Directive} from '@angular/core';

          @Directive({selector: '[dep]'})
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
            template: '',
            imports: [Dep],
          })
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');

      expect(jsContents).toContain('dependencies: [Dep]');
      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0], [Dep], import.meta, id));',
      );
      expect(hmrContents).toContain('function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, Dep) {');
    });

    it('should preserve eager module imports inside standalone component in HMR even if they are not used in the template', () => {
      enableHmr({
        // Disable class metadata since it can add noise to the test.
        supportTestBed: false,
      });

      env.write(
        'dep.ts',
        `
          import {NgModule, Directive} from '@angular/core';

          @Directive({selector: '[dep]', standalone: false})
          export class Dep {}

          @NgModule({declarations: [Dep], exports: [Dep]})
          export class DepModule {}
        `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {DepModule} from './dep';

          @Component({
            selector: 'cmp',
            template: '',
            imports: [DepModule],
          })
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');

      expect(jsContents).toContain('dependencies: [DepModule, i1.Dep]');
      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0, i1], [DepModule], import.meta, id));',
      );
      expect(hmrContents).toContain('function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, DepModule) {');
    });

    it('should preserve eager module imports inside non-standalone component in HMR even if they are not used in the template', () => {
      enableHmr({
        // Disable class metadata since it can add noise to the test.
        supportTestBed: false,
      });

      env.write(
        'dep.ts',
        `
          import {NgModule, Directive} from '@angular/core';

          @Directive({selector: '[dep]', standalone: false})
          export class Dep {}

          @NgModule({declarations: [Dep], exports: [Dep]})
          export class DepModule {}
        `,
      );

      env.write(
        'test-module.ts',
        `
        import {NgModule} from '@angular/core';
        import {Cmp} from './test';
        import {DepModule} from './dep';

        @NgModule({imports: [DepModule], declarations: [Cmp], exports: [Cmp]})
        export class CmpModule {}
      `,
      );

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';
          import {DepModule} from './dep';

          @Component({
            selector: 'cmp',
            template: '',
            standalone: false,
          })
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');

      expect(jsContents).toContain('dependencies: [i1.Dep]');
      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0, i1], [], import.meta, id));',
      );
      expect(hmrContents).toContain('function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces) {');
    });

    it('should pass const enums defined in the same file as an object literal', () => {
      enableHmr();
      env.write(
        'test.ts',
        `
          import {Component, InjectionToken} from '@angular/core';

          const token = new InjectionToken<number>('TEST');

          const numberThree = 3;

          export const enum Foo {
            one,
            two = '2',
            three = numberThree
          }

          @Component({
            template: '',
            providers: [{
              provide: token,
              useValue: Foo.three
            }]
          })
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');
      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0], [token, { one: 0, two: "2", three: 3 }, Component], import.meta, id));',
      );
      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, token, Foo, Component) {',
      );
    });

    it('should pass const enum defined in other file as an object literal', () => {
      enableHmr();

      env.write(
        'deps.ts',
        `
        const numberThree = 3;

        export const enum Foo {
          one,
          two = '2',
          three = numberThree
        }
      `,
      );

      env.write(
        'test.ts',
        `
          import {Component, InjectionToken} from '@angular/core';
          import {Foo} from './deps';

          const token = new InjectionToken<number>('TEST');

          @Component({
            template: '',
            providers: [{
              provide: token,
              useValue: Foo.three
            }]
          })
          export class Cmp {}
        `,
      );

      env.driveMain();

      const jsContents = env.getContents('test.js');
      const hmrContents = env.driveHmr('test.ts', 'Cmp');
      expect(jsContents).toContain(
        'ɵɵreplaceMetadata(Cmp, m.default, [i0], [token, { one: 0, two: "2", three: 3 }, Component], import.meta, id));',
      );
      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, token, Foo, Component) {',
      );
    });

    it('should generate HMR code for a transformed class', () => {
      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class Cmp {}
        `,
      );

      const options: CompilerOptions = {
        target: ts.ScriptTarget.Latest,
        module: ts.ModuleKind.ESNext,
        _enableHmr: true,
      };

      const program = new NgtscProgram(['/test.ts'], options, createCompilerHost({options}));
      const transformers = program.compiler.prepareEmit().transformers;

      transformers.before!.unshift((ctx) => (sourceFile) => {
        const visitor = (node: ts.Node) => {
          if (ts.isClassDeclaration(node) && node.name?.getText() === 'Cmp') {
            const newMember = ctx.factory.createPropertyDeclaration(
              undefined,
              'newProp',
              undefined,
              undefined,
              ctx.factory.createNumericLiteral(123),
            );

            return ctx.factory.updateClassDeclaration(
              node,
              node.modifiers,
              node.name,
              node.typeParameters,
              node.heritageClauses,
              [newMember, ...node.members],
            );
          }
          return ts.visitEachChild(node, visitor, ctx);
        };
        return ts.visitEachChild(sourceFile, visitor, ctx);
      });

      const {diagnostics, emitSkipped} = program
        .getTsProgram()
        .emit(undefined, undefined, undefined, undefined, transformers);
      const declaration = program
        .getTsProgram()
        .getSourceFile('/test.ts')
        ?.statements.find(
          (stmt) => ts.isClassDeclaration(stmt) && stmt.name?.getText() === 'Cmp',
        ) as ts.ClassDeclaration;

      const jsContents = env.getContents('/test.js');
      const hmrContents = program.compiler.emitHmrUpdateModule(declaration);

      expect(diagnostics.length).toBe(0);
      expect(emitSkipped).toBe(false);

      expect(jsContents).toContain('ɵreplaceMetadata(Cmp');
      expect(jsContents).toContain('newProp = 123');
      expect(hmrContents).toContain('export default function Cmp_UpdateMetadata');
    });

    it('should generate an HMR initializer and update function for a class that depends on multiple namespaces', () => {
      enableHmr(undefined, {
        compilerOptions: {
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
        },
      });

      env.write(
        'test.ts',
        `
          import {Component} from '@angular/core';

          @Component({selector: 'cmp', template: ''})
          export class Cmp {}
        `,
      );

      env.driveMain();

      const hmrContents = env.driveHmr('test.ts', 'Cmp');
      expect(hmrContents).toContain(
        'export default function Cmp_UpdateMetadata(Cmp, ɵɵnamespaces, Component) {',
      );
    });
  });
});
