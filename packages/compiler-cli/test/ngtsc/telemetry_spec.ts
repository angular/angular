/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('ngtsc telemetry', () => {
    let env!: NgtscTestEnvironment;
    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig();
    });

    for (const mode of ['sync', 'async']) {
      describe(`[${mode}]`, () => {
        const driveTelemetry = (expectedExitCode = 0) =>
            env.driveTelemetry(mode === 'async', expectedExitCode);
        beforeEach(() => {
          if (mode === 'async') {
            env.enablePreloading();
          }
        });

        it('record usages of apis in the appropriate scope', async () => {
          env.write('person.ts', `
            import * as ng from '@angular/core';

            export const person = ng.signal({ firstName: '', lastName: '' });
            export const name = ng.computed(() => person().firstName + ' ' + person().lastName);

            export function injectChangeDetectorRef() {
              return ng.inject(ng.ChangeDetectorRef);
            }
          `);
          env.write('main.ts', `
            import {Component, ChangeDetectorRef, computed, effect, inject} from '@angular/core';
            import {name} from './person';

            @Component({
              selector: 'test-cmp',
              template: '<div></div>',
            })
            export class TestCmp {
              cdr = inject(ChangeDetectorRef);
              name = computed(() => name());

              constructor() {
                effect(() => {
                  console.log(this.name());
                });
              }
            }
          `);

          const telemetry = await driveTelemetry();
          expect(telemetry.global.signal).toBe(1);
          expect(telemetry.global.computed).toBe(1);
          expect(telemetry.global.effect).toBe(0);
          expect(telemetry.global.inject).toBe(1);
          expect(telemetry.components.signal).toBe(0);
          expect(telemetry.components.computed).toBe(1);
          expect(telemetry.components.effect).toBe(1);
          expect(telemetry.components.inject).toBe(1);
        });

        it('does not record usages from unrelated modules', async () => {
          env.write('node_modules/not-angular-signals/index.d.ts', `
            export declare function signal<T>(value: T): () => T;
            export declare function computed<T>(fn: () => T): () => T;
          `);
          env.write('unrelated-import.ts', `
            import {signal, computed} from 'not-angular-signals';

            export const person = signal({ firstName: '', lastName: '' });
            export const name = computed(() => person().firstName + ' ' + person().lastName);
          `);

          const telemetry = await driveTelemetry();
          expect(telemetry.global.signal).toBe(0);
          expect(telemetry.global.computed).toBe(0);
        });

        it('does not record indirect usages', async () => {
          env.write('indirect.ts', `
            import {signal} from '@angular/core';

            const s = signal;
            export const person = s({ firstName: '', lastName: '' });
          `);

          const telemetry = await driveTelemetry();
          expect(telemetry.global.signal).toBe(0);
          expect(telemetry.global.computed).toBe(0);
        });

        it('should record injectable telemetry', async () => {
          env.write('service1.ts', `
            import {Injectable, ChangeDetectorRef} from '@angular/core';

            @Injectable()
            export class TestService1 {
              constructor(cdr: ChangeDetectorRef) {}
            }
          `);
          env.write('service2.ts', `
            import {Injectable, ChangeDetectorRef} from '@angular/core';
            import {TestService1} from './service1';

            @Injectable()
            export class TestService2 {
              constructor(cdr: ChangeDetectorRef, svc: TestService1) {}
            }
          `);
          env.write('service3.ts', `
            import {Injectable} from '@angular/core';

            @Injectable({ providedIn: 'root', useFactory: () => new TestService3('test') })
            export class TestService3 {
              constructor(value: string) {}
            }
          `);

          const telemetry = await driveTelemetry();
          expect(telemetry.injectables.amount).toBe(3);
          expect(telemetry.injectables.ctorInjections).toBe(3);
        });

        it('should record NgModule telemetry', async () => {
          env.write('module1.ts', `
            import {NgModule} from '@angular/core';

            @NgModule()
            export class TestModule1 {}
          `);
          env.write('module2.ts', `
            import {NgModule} from '@angular/core';
            import {TestModule1} from './module1';

            @NgModule()
            export class TestModule2 {
              constructor(mod: TestModule1) {}
            }
          `);

          const telemetry = await driveTelemetry();
          expect(telemetry.ngModule.amount).toBe(2);
          expect(telemetry.ngModule.ctorInjections).toBe(1);
        });

        it('should record directive telemetry', async () => {
          env.write('dir1.ts', `
            import {Directive} from '@angular/core';

            @Directive()
            export class TestDir1 {}
          `);
          env.write('dir2.ts', `
            import {Directive} from '@angular/core';
            import {TestDir1} from './dir1';

            @Directive({standalone: true})
            export class TestDir2 {
              constructor(dir: TestDir1) {}
            }
          `);

          const telemetry = await driveTelemetry();
          expect(telemetry.directives.amount).toBe(2);
          expect(telemetry.directives.ctorInjections).toBe(1);
          expect(telemetry.directives.standalone).toBe(1);
        });

        it('should record component telemetry', async () => {
          env.write('comp1.ts', `
            import {Component} from '@angular/core';

            @Component({
              templateUrl: './comp1.html',
              styleUrls: ['./comp1-1.css', './comp1-2.css'],
            })
            export class TestComp1 {}
          `);
          env.write('comp1.html', '');
          env.write('comp1-1.css', '');
          env.write('comp1-2.css', '');
          env.write('comp2.ts', `
            import {Component, ViewEncapsulation} from '@angular/core';
            import {TestComp1} from './comp1';

            @Component({
              standalone: true,
              template: '<div></div>',
              styles: 'div { color: red; }',
              encapsulation: ViewEncapsulation.Emulated,
            })
            export class TestComp2 {
              constructor(comp: TestComp1) {}
            }
          `);
          env.write('comp3.ts', `
            import {Component, ViewEncapsulation} from '@angular/core';

            @Component({
              template: '',
              encapsulation: ViewEncapsulation.None,
            })
            export class TestComp3 {}
          `);
          env.write('comp4.ts', `
            import {Component, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';

            @Component({
              template: '',
              changeDetection: ChangeDetectionStrategy.OnPush,
              encapsulation: ViewEncapsulation.ShadowDom,
            })
            export class TestComp4 {}
          `);
          env.write('comp5.ts', `
            import {Component, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';

            @Component({
              template: '',
              changeDetection: ChangeDetectionStrategy.OnPush,
              encapsulation: ViewEncapsulation.None,
            })
            export class TestComp5 {}
          `);

          const telemetry = await driveTelemetry();
          expect(telemetry.components.amount).toBe(5);
          expect(telemetry.components.ctorInjections).toBe(1);
          expect(telemetry.components.standalone).toBe(1);
          expect(telemetry.components.inlineTemplate).toBe(4);
          expect(telemetry.components.inlineStyles).toBe(1);
          expect(telemetry.components.externalStyles).toBe(2);
          expect(telemetry.components.noEncapsulation).toBe(2);
          expect(telemetry.components.shadowDomEncapsulation).toBe(1);
          expect(telemetry.components.onPush).toBe(2);
        });

        it('should record pipe telemetry', async () => {
          env.write('pipe1.ts', `
            import {Pipe} from '@angular/core';

            @Pipe({name: 'test1'})
            export class TestPipe1 {}
          `);
          env.write('pipe2.ts', `
            import {Pipe} from '@angular/core';
            import {TestPipe1} from './pipe1';

            @Pipe({name: 'test2', standalone: true})
            export class TestPipe2 {
              constructor(pipe: TestPipe1) {}
            }
          `);

          const telemetry = await driveTelemetry();
          expect(telemetry.pipes.amount).toBe(2);
          expect(telemetry.pipes.ctorInjections).toBe(1);
          expect(telemetry.pipes.standalone).toBe(1);
        });

        it('should not record telemetry for invalid usages', async () => {
          env.write('pipe.ts', `
            import {Pipe} from '@angular/core';

            @Pipe() // <-- requires an argument
            export class TestPipe {}
          `);

          const telemetry = await driveTelemetry(1);
          expect(telemetry.pipes.amount).toBe(0);
          expect(telemetry.pipes.ctorInjections).toBe(0);
          expect(telemetry.pipes.standalone).toBe(0);
        });
      });

      it('should work in incremental compilations', async () => {
        env.enableMultipleCompilations();
        env.write('person.ts', `
          import {signal} from '@angular/core';

          export const person = signal({ firstName: '', lastName: '' });
        `);
        env.write('empty.ts', `
          export {};
        `);
        env.write('comp.ts', `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class TestComp1 {}
        `);

        const telemetry1 = await env.driveTelemetry(false);
        expect(telemetry1.global.signal).toBe(1);
        expect(telemetry1.components.amount).toBe(1);

        env.write('comp.ts', `
          import {Component} from '@angular/core';

          @Component({template: ''})
          export class TestComp1 {}

          @Component({template: ''})
          export class TestComp2 {}
        `);

        const telemetry2 = await env.driveTelemetry(false);
        expect(telemetry2.global.signal).toBe(1);
        expect(telemetry2.components.amount).toBe(2);
      });
    }
  });
});
