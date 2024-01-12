/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment, TsConfigOptions} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('local compilation', () => {
    let env!: NgtscTestEnvironment;

    function tsconfig(extraOpts: TsConfigOptions = {}) {
      const tsconfig: {[key: string]: any} = {
        extends: '../tsconfig-base.json',
        compilerOptions: {
          baseUrl: '.',
          rootDirs: ['/app'],
        },
        angularCompilerOptions: {
          compilationMode: 'experimental-local',
          ...extraOpts,
        },
      };
      env.write('tsconfig.json', JSON.stringify(tsconfig, null, 2));
    }

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      tsconfig();
    });

    it('should produce no TS semantic diagnostics', () => {
      env.write('test.ts', `
        import {SubExternalStuff} from './some-where';
        `);

      env.driveMain();
      const diags = env.driveDiagnostics();

      expect(diags).toEqual([]);
    });

    describe('ng module injector def', () => {
      it('should produce empty injector def imports when module has no imports/exports', () => {
        env.write('test.ts', `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class MainModule {
        }
        `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({})');
      });

      it('should include raw module imports array elements (including forward refs) in the injector def imports',
         () => {
           env.write('test.ts', `
        import {NgModule, forwardRef} from '@angular/core';
        import {SubModule1} from './some-where';
        import {SubModule2} from './another-where';

        @NgModule({})
        class LocalModule1 {}

        @NgModule({
          imports: [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)],
        })
        export class MainModule {
        }

        @NgModule({})
        class LocalModule2 {}
        `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)] })');
         });

      it('should include non-array raw module imports as it is in the injector def imports', () => {
        env.write('test.ts', `
        import {NgModule, forwardRef} from '@angular/core';
        import {SubModule1} from './some-where';
        import {SubModule2} from './another-where';

        const NG_IMPORTS = [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)];

        @NgModule({})
        class LocalModule1 {}

        @NgModule({
          imports: NG_IMPORTS,
        })
        export class MainModule {
        }

        @NgModule({})
        class LocalModule2 {}
        `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents)
            .toContain(
                'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [NG_IMPORTS] })');
      });

      it('should include raw module exports array elements (including forward refs) in the injector def imports',
         () => {
           env.write('test.ts', `
        import {NgModule, forwardRef} from '@angular/core';
        import {SubModule1} from './some-where';
        import {SubModule2} from './another-where';

        @NgModule({})
        class LocalModule1 {}

        @NgModule({
          exports: [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)],
        })
        export class MainModule {
        }

        @NgModule({})
        class LocalModule2 {}
        `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)] })');
         });

      it('should include non-array raw module exports (including forward refs) in the injector def imports',
         () => {
           env.write('test.ts', `
        import {NgModule, forwardRef} from '@angular/core';
        import {SubModule1} from './some-where';
        import {SubModule2} from './another-where';

        const NG_EXPORTS = [SubModule1, forwardRef(() => SubModule2), LocalModule1, forwardRef(() => LocalModule2)];

        @NgModule({})
        class LocalModule1 {}

        @NgModule({
          exports: NG_EXPORTS,
        })
        export class MainModule {
        }

        @NgModule({})
        class LocalModule2 {}
        `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [NG_EXPORTS] })');
         });

      it('should concat raw module imports and exports arrays (including forward refs) in the injector def imports',
         () => {
           env.write('test.ts', `
        import {NgModule, forwardRef} from '@angular/core';
        import {SubModule1, SubModule2} from './some-where';
        import {SubModule3, SubModule4} from './another-where';

        @NgModule({
          imports: [SubModule1, forwardRef(() => SubModule2)],
          exports: [SubModule3, forwardRef(() => SubModule4)],
        })
        export class MainModule {
        }
        `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [SubModule1, forwardRef(() => SubModule2), SubModule3, forwardRef(() => SubModule4)] })');
         });

      it('should combines non-array raw module imports and exports (including forward refs) in the injector def imports',
         () => {
           env.write('test.ts', `
        import {NgModule, forwardRef} from '@angular/core';
        import {NG_IMPORTS} from './some-where';
        import {NG_EXPORTS} from './another-where';

        @NgModule({
          imports: NG_IMPORTS,
          exports: NG_EXPORTS,
        })
        export class MainModule {
        }
        `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   'MainModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ imports: [NG_IMPORTS, NG_EXPORTS] })');
         });
    });

    describe('component dependencies', () => {
      it('should generate ɵɵgetComponentDepsFactory for component def dependencies - for non-standalone component ',
         () => {
           env.write('test.ts', `
          import {NgModule, Component} from '@angular/core';

          @Component({
            selector: 'test-main',
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }

          @NgModule({
            declarations: [MainComponent],
          })
          export class MainModule {
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain('dependencies: i0.ɵɵgetComponentDepsFactory(MainComponent)');
         });

      it('should generate ɵɵgetComponentDepsFactory with raw imports as second param for component def dependencies - for standalone component with non-empty imports',
         () => {
           env.write('test.ts', `
          import {Component, forwardRef} from '@angular/core';
          import {SomeThing} from 'some-where';
          import {SomeThing2} from 'some-where2';

          @Component({
            standalone: true,
            imports: [SomeThing, forwardRef(()=>SomeThing2)],
            selector: 'test-main',
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   'dependencies: i0.ɵɵgetComponentDepsFactory(MainComponent, [SomeThing, forwardRef(() => SomeThing2)])');
         });

      it('should generate ɵɵgetComponentDepsFactory with raw non-array imports as second param for component def dependencies - for standalone component with non-empty imports',
         () => {
           env.write('test.ts', `
          import {Component, forwardRef} from '@angular/core';
          import {SomeThing} from 'some-where';
          import {SomeThing2} from 'some-where2';

          const NG_IMPORTS = [SomeThing, forwardRef(()=>SomeThing2)];

          @Component({
            standalone: true,
            imports: NG_IMPORTS,
            selector: 'test-main',
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain('dependencies: i0.ɵɵgetComponentDepsFactory(MainComponent, NG_IMPORTS)');
         });

      it('should generate ɵɵgetComponentDepsFactory with empty array as secon d arg for standalone component with empty imports',
         () => {
           env.write('test.ts', `
      import {Component} from '@angular/core';

      @Component({
        standalone: true,
        imports: [],
        selector: 'test-main',
        template: '<span>Hello world!</span>',
      })
      export class MainComponent {
      }
      `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain('dependencies: i0.ɵɵgetComponentDepsFactory(MainComponent, [])');
         });

      it('should not generate ɵɵgetComponentDepsFactory for standalone component with no imports',
         () => {
           env.write('test.ts', `
          import {Component} from '@angular/core';

          @Component({
            standalone: true,
            selector: 'test-main',
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents).not.toContain('i0.ɵɵgetComponentDepsFactory');
         });
    });

    describe('component fields', () => {
      it('should place the changeDetection as it is into the component def', () => {
        env.write('test.ts', `
          import {Component} from '@angular/core';
          import {SomeWeirdThing} from 'some-where';

          @Component({
            changeDetection: SomeWeirdThing,
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents).toContain('changeDetection: SomeWeirdThing');
      });

      it('should place the correct value of encapsulation into the component def - case of ViewEncapsulation.Emulated with no styles',
         () => {
           env.write('test.ts', `
          import {Component, ViewEncapsulation} from '@angular/core';

          @Component({
            encapsulation: ViewEncapsulation.Emulated,
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           // If there is no style, don't generate css selectors on elements by setting
           // encapsulation to none (=2)
           expect(jsContents).toContain('encapsulation: 2');
         });

      it('should place the correct value of encapsulation into the component def - case of ViewEncapsulation.Emulated with styles',
         () => {
           env.write('test.ts', `
          import {Component, ViewEncapsulation} from '@angular/core';

          @Component({
            encapsulation: ViewEncapsulation.Emulated,
            styles: ['color: blue'],
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           // encapsulation is set only for non-default value
           expect(jsContents).not.toContain('encapsulation: 0');
           expect(jsContents).toContain('styles: ["color: blue"]');
         });

      it('should place the correct value of encapsulation into the component def - case of ViewEncapsulation.ShadowDom',
         () => {
           env.write('test.ts', `
          import {Component, ViewEncapsulation} from '@angular/core';

          @Component({
            encapsulation: ViewEncapsulation.ShadowDom,
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents).toContain('encapsulation: 3');
         });

      it('should place the correct value of encapsulation into the component def - case of ViewEncapsulation.None',
         () => {
           env.write('test.ts', `
          import {Component, ViewEncapsulation} from '@angular/core';

          @Component({
            encapsulation: ViewEncapsulation.None,
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents).toContain('encapsulation: 2');
         });

      it('should default encapsulation to Emulated', () => {
        env.write('test.ts', `
          import {Component, ViewEncapsulation} from '@angular/core';

          @Component({
            template: '<span>Hello world!</span>',
          })
          export class MainComponent {
          }
          `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // If there is no style, don't generate css selectors on elements by setting
        // encapsulation to none (=2)
        expect(jsContents).toContain('encapsulation: 2');
      });
    });

    describe('constructor injection', () => {
      it('should include injector types with all possible import/injection styles into component factory',
         () => {
           env.write('test.ts', `
          import {Component, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Component({
            selector: 'test-main',
            template: '<span>Hello world</span>',
          })
          export class MainComponent {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }

          @NgModule({
            declarations: [MainComponent],
          })
          export class MainModule {
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainComponent.ɵfac = function MainComponent_Factory(t) { return new (t || MainComponent)(i0.ɵɵdirectiveInject(i1.SomeService1), i0.ɵɵdirectiveInject(SomeService2), i0.ɵɵdirectiveInject(i2.SomeService3), i0.ɵɵdirectiveInject(i3.nested.SomeService4), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN)); };`);
         });

      it('should include injector types with all possible import/injection styles into standalone component factory',
         () => {
           env.write('test.ts', `
          import {Component, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Component({
            standalone: true,
            selector: 'test-main',
            template: '<span>Hello world</span>',
          })
          export class MainComponent {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainComponent.ɵfac = function MainComponent_Factory(t) { return new (t || MainComponent)(i0.ɵɵdirectiveInject(i1.SomeService1), i0.ɵɵdirectiveInject(SomeService2), i0.ɵɵdirectiveInject(i2.SomeService3), i0.ɵɵdirectiveInject(i3.nested.SomeService4), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN)); };`);
         });

      it('should include injector types with all possible import/injection styles into directive factory',
         () => {
           env.write('test.ts', `
          import {Directive, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Directive({
          })
          export class MainDirective {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }

          @NgModule({
            declarations: [MainDirective],
          })
          export class MainModule {
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainDirective.ɵfac = function MainDirective_Factory(t) { return new (t || MainDirective)(i0.ɵɵdirectiveInject(i1.SomeService1), i0.ɵɵdirectiveInject(SomeService2), i0.ɵɵdirectiveInject(i2.SomeService3), i0.ɵɵdirectiveInject(i3.nested.SomeService4), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN)); };`);
         });

      it('should include injector types with all possible import/injection styles into standalone directive factory',
         () => {
           env.write('test.ts', `
          import {Directive, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Directive({
            standalone: true,
          })
          export class MainDirective {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainDirective.ɵfac = function MainDirective_Factory(t) { return new (t || MainDirective)(i0.ɵɵdirectiveInject(i1.SomeService1), i0.ɵɵdirectiveInject(SomeService2), i0.ɵɵdirectiveInject(i2.SomeService3), i0.ɵɵdirectiveInject(i3.nested.SomeService4), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN)); };`);
         });

      it('should include injector types with all possible import/injection styles into pipe factory',
         () => {
           env.write('test.ts', `
          import {Pipe, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Pipe({name: 'pipe'})
          export class MainPipe {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }

          @NgModule({
            declarations: [MainPipe],
          })
          export class MainModule {
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainPipe.ɵfac = function MainPipe_Factory(t) { return new (t || MainPipe)(i0.ɵɵdirectiveInject(i1.SomeService1, 16), i0.ɵɵdirectiveInject(SomeService2, 16), i0.ɵɵdirectiveInject(i2.SomeService3, 16), i0.ɵɵdirectiveInject(i3.nested.SomeService4, 16), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN, 16)); };`);
         });

      it('should include injector types with all possible import/injection styles into standalone pipe factory',
         () => {
           env.write('test.ts', `
          import {Pipe, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Pipe({
            name: 'pipe',
            standalone: true,
          })
          export class MainPipe {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainPipe.ɵfac = function MainPipe_Factory(t) { return new (t || MainPipe)(i0.ɵɵdirectiveInject(i1.SomeService1, 16), i0.ɵɵdirectiveInject(SomeService2, 16), i0.ɵɵdirectiveInject(i2.SomeService3, 16), i0.ɵɵdirectiveInject(i3.nested.SomeService4, 16), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN, 16)); };`);
         });

      it('should include injector types with all possible import/injection styles into injectable factory',
         () => {
           env.write('test.ts', `
          import {Injectable, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @Injectable({
            providedIn: 'root',
          })
          export class MainService {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainService.ɵfac = function MainService_Factory(t) { return new (t || MainService)(i0.ɵɵinject(i1.SomeService1), i0.ɵɵinject(SomeService2), i0.ɵɵinject(i2.SomeService3), i0.ɵɵinject(i3.nested.SomeService4), i0.ɵɵinjectAttribute('title'), i0.ɵɵinject(MESSAGE_TOKEN)); };`);
         });

      it('should include injector types with all possible import/injection styles into ng module factory',
         () => {
           env.write('test.ts', `
          import {Component, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'
          import * as SomeWhere4 from './some-where4'

          @NgModule({
          })
          export class MainModule {
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              private someService4: SomeWhere4.nested.SomeService4,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainModule.ɵfac = function MainModule_Factory(t) { return new (t || MainModule)(i0.ɵɵinject(i1.SomeService1), i0.ɵɵinject(SomeService2), i0.ɵɵinject(i2.SomeService3), i0.ɵɵinject(i3.nested.SomeService4), i0.ɵɵinjectAttribute('title'), i0.ɵɵinject(MESSAGE_TOKEN)); };`);
         });

      it('should generate invalid factory for injectable when type parameter types are used as token',
         () => {
           env.write('test.ts', `
          import {Injectable} from '@angular/core';

          @Injectable()
          export class MainService<S> {
            constructor(
              private someService1: S,
              ) {}
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainService.ɵfac = function MainService_Factory(t) { i0.ɵɵinvalidFactory(); };`);
         });

      it('should generate invalid factory for injectable when when token is imported as type',
         () => {
           env.write('test.ts', `
          import {Injectable} from '@angular/core';
          import {type MyService} from './somewhere';

          @Injectable()
          export class MainService {
            constructor(
              private myService: MyService,
              ) {}
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainService.ɵfac = function MainService_Factory(t) { i0.ɵɵinvalidFactory(); };`);
         });

      it('should generate invalid factory for injectable when when token is a type', () => {
        env.write('test.ts', `
          import {Injectable} from '@angular/core';

          type MyService = {a:string};

          @Injectable()
          export class MainService {
            constructor(
              private myService: MyService,
              ) {}
          }
          `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents)
            .toContain(
                `MainService.ɵfac = function MainService_Factory(t) { i0.ɵɵinvalidFactory(); };`);
      });

      it('should generate invalid factory for injectable when when token is an interface', () => {
        env.write('test.ts', `
          import {Injectable} from '@angular/core';

          interface MyService {a:string}

          @Injectable()
          export class MainService {
            constructor(
              private myService: MyService,
              ) {}
          }
          `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents)
            .toContain(
                `MainService.ɵfac = function MainService_Factory(t) { i0.ɵɵinvalidFactory(); };`);
      });

      it('should generate invalid factory for directive without selector type parameter types are used as token',
         () => {
           env.write('test.ts', `
          import {Directive} from '@angular/core';

          @Directive()
          export class MyDirective<S> {
            constructor(
              private myService: S,
              ) {}
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MyDirective.ɵfac = function MyDirective_Factory(t) { i0.ɵɵinvalidFactory(); };`);
         });

      it('should generate invalid factory for directive without selector when token is imported as type',
         () => {
           env.write('test.ts', `
          import {Directive} from '@angular/core';
          import {type MyService} from './somewhere';

          @Directive()
          export class MyDirective {
            constructor(
              private myService: MyService,
              ) {}
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MyDirective.ɵfac = function MyDirective_Factory(t) { i0.ɵɵinvalidFactory(); };`);
         });

      it('should generate invalid factory for directive without selector when token is a type',
         () => {
           env.write('test.ts', `
          import {Directive} from '@angular/core';

          type MyService = {a:string};

          @Directive()
          export class MyDirective {
            constructor(
              private myService: MyService,
              ) {}
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MyDirective.ɵfac = function MyDirective_Factory(t) { i0.ɵɵinvalidFactory(); };`);
         });

      it('should generate invalid factory for directive without selector when token is an interface',
         () => {
           env.write('test.ts', `
          import {Directive} from '@angular/core';

          interface MyService {a:string}

          @Directive()
          export class MyDirective {
            constructor(
              private myService: MyService,
              ) {}
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MyDirective.ɵfac = function MyDirective_Factory(t) { i0.ɵɵinvalidFactory(); };`);
         });
    });

    describe('local compilation specific errors', () => {
      it('should show extensive error message when using an imported symbol for component template',
         () => {
           env.write('test.ts', `
          import {Component} from '@angular/core';
          import {ExternalString} from './some-where';

          @Component({
            template: ExternalString,
          })
          export class Main {
          }
          `);

           const errors = env.driveDiagnostics();

           expect(errors.length).toBe(1);

           const {code, messageText} = errors[0];

           expect(code).toBe(ngErrorCode(ErrorCode.

                                         LOCAL_COMPILATION_IMPORTED_TEMPLATE_STRING));
           const text = ts.flattenDiagnosticMessageText(messageText, '\n');

           expect(text).toContain('Unknown identifier used as template string: ExternalString');
           expect(text).toContain('either inline it or move it to a separate file');
         });

      it('should show extensive error message when using an imported symbol for component styles',
         () => {
           env.write('test.ts', `
          import {Component} from '@angular/core';
          import {ExternalString} from './some-where';

          @Component({
            styles: [ExternalString],
            template: '',

          })
          export class Main {
          }
          `);

           const errors = env.driveDiagnostics();

           expect(errors.length).toBe(1);

           const {code, messageText} = errors[0];

           expect(code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_IMPORTED_STYLES_STRING));
           const text = ts.flattenDiagnosticMessageText(messageText, '\n');

           expect(text).toContain('Unknown identifier used as styles string: ExternalString');
           expect(text).toContain('either inline it or move it to a separate file');
         });
    });

    describe('ng module bootstrap def', () => {
      it('should include the bootstrap definition in ɵɵsetNgModuleScope instead of ɵɵdefineNgModule',
         () => {
           env.write('test.ts', `
        import {NgModule} from '@angular/core';
        import {App} from './some-where';

        @NgModule({
          declarations: [App],
          bootstrap: [App],
        })
        export class AppModule {
        }
        `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   'AppModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });');
           expect(jsContents)
               .toContain(
                   'ɵɵsetNgModuleScope(AppModule, { declarations: [App], bootstrap: [App] }); })();');
         });

      it('should include no bootstrap definition in ɵɵsetNgModuleScope if the NgModule has no bootstrap field',
         () => {
           env.write('test.ts', `
        import {NgModule} from '@angular/core';
        import {App} from './some-where';

        @NgModule({
          declarations: [App],
        })
        export class AppModule {
        }
        `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   'AppModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: AppModule });');
           expect(jsContents)
               .toContain('ɵɵsetNgModuleScope(AppModule, { declarations: [App] }); })();');
         });
    });

    describe('input transform', () => {
      it('should generate input info for transform function imported externally using name', () => {
        env.write('test.ts', `
        import {Component, NgModule, Input} from '@angular/core';
        import {externalFunc} from './some_where';

        @Component({
          template: '<span>{{x}}</span>',
        })
        export class Main {
          @Input({transform: externalFunc})
          x: string = '';
        }
     `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents)
            .toContain(
                'inputs: { x: [i0.ɵɵInputFlags.HasDecoratorInputTransform, "x", "x", externalFunc] }');
      });

      it('should generate input info for transform function imported externally using namespace', () => {
        env.write('test.ts', `
        import {Component, NgModule, Input} from '@angular/core';
        import * as n from './some_where';

        @Component({
          template: '<span>{{x}}</span>',
        })
        export class Main {
          @Input({transform: n.externalFunc})
          x: string = '';
        }
     `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents)
            .toContain(
                'inputs: { x: [i0.ɵɵInputFlags.HasDecoratorInputTransform, "x", "x", n.externalFunc] }');
      });

      it('should generate input info for transform function defined locally', () => {
        env.write('test.ts', `
        import {Component, NgModule, Input} from '@angular/core';

        @Component({
          template: '<span>{{x}}</span>',
        })
        export class Main {
          @Input({transform: localFunc})
          x: string = '';
        }

        function localFunc(value: string) {
          return value;
        }
     `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents)
            .toContain(
                'inputs: { x: [i0.ɵɵInputFlags.HasDecoratorInputTransform, "x", "x", localFunc] }');
      });

      it('should generate input info for inline transform function', () => {
        env.write('test.ts', `
        import {Component, NgModule, Input} from '@angular/core';

        @Component({
          template: '<span>{{x}}</span>',
        })
        export class Main {
          @Input({transform: (v: string) => v + 'TRANSFORMED!'})
          x: string = '';
        }
     `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents)
            .toContain(
                'inputs: { x: [i0.ɵɵInputFlags.HasDecoratorInputTransform, "x", "x", (v) => v + \'TRANSFORMED!\'] }');
      });

      it('should not check inline function param type', () => {
        env.write('test.ts', `
        import {Component, NgModule, Input} from '@angular/core';

        @Component({
          template: '<span>{{x}}</span>',
        })
        export class Main {
          @Input({transform: v => v + 'TRANSFORMED!'})
          x: string = '';
        }
     `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        expect(jsContents)
            .toContain(
                'inputs: { x: [i0.ɵɵInputFlags.HasDecoratorInputTransform, "x", "x", v => v + \'TRANSFORMED!\'] }');
      });
    });

    describe('@defer', () => {
      beforeEach(() => {
        tsconfig({onlyExplicitDeferDependencyImports: true});
      });

      it('should handle `@Component.deferredImports` field', () => {
        env.write('deferred-a.ts', `
          import {Component} from '@angular/core';
          @Component({
            standalone: true,
            selector: 'deferred-cmp-a',
            template: 'DeferredCmpA contents',
          })
          export class DeferredCmpA {
          }
        `);

        env.write('deferred-b.ts', `
          import {Component} from '@angular/core';
          @Component({
            standalone: true,
            selector: 'deferred-cmp-b',
            template: 'DeferredCmpB contents',
          })
          export class DeferredCmpB {
          }
        `);

        env.write('test.ts', `
          import {Component} from '@angular/core';
          import {DeferredCmpA} from './deferred-a';
          import {DeferredCmpB} from './deferred-b';
          @Component({
            standalone: true,
            deferredImports: [DeferredCmpA, DeferredCmpB],
            template: \`
              @defer {
                <deferred-cmp-a />
              }
              @defer {
                <deferred-cmp-b />
              }
            \`,
          })
          export class AppCmp {
          }
        `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // Expect that all deferrableImports in local compilation mode
        // are located in a single function (since we can't detect in
        // the local mode which components belong to which block).
        expect(jsContents)
            .toContain(
                'const AppCmp_DeferFn = () => [' +
                'import("./deferred-a").then(m => m.DeferredCmpA), ' +
                'import("./deferred-b").then(m => m.DeferredCmpB)];');

        // Make sure there are no eager imports present in the output.
        expect(jsContents).not.toContain(`from './deferred-a'`);
        expect(jsContents).not.toContain(`from './deferred-b'`);

        // All defer instructions use the same dependency function.
        expect(jsContents).toContain('ɵɵdefer(1, 0, AppCmp_DeferFn);');
        expect(jsContents).toContain('ɵɵdefer(4, 3, AppCmp_DeferFn);');

        // Expect `ɵsetClassMetadataAsync` to contain dynamic imports too.
        expect(jsContents)
            .toContain(
                'ɵsetClassMetadataAsync(AppCmp, () => [' +
                'import("./deferred-a").then(m => m.DeferredCmpA), ' +
                'import("./deferred-b").then(m => m.DeferredCmpB)], ' +
                '(DeferredCmpA, DeferredCmpB) => {');
      });

      it('should handle `@Component.imports` field', () => {
        env.write('deferred-a.ts', `
          import {Component} from '@angular/core';
          @Component({
            standalone: true,
            selector: 'deferred-cmp-a',
            template: 'DeferredCmpA contents',
          })
          export class DeferredCmpA {
          }
        `);

        env.write('test.ts', `
          import {Component} from '@angular/core';
          import {DeferredCmpA} from './deferred-a';
          @Component({
            standalone: true,
            imports: [DeferredCmpA],
            template: \`
              @defer {
                <deferred-cmp-a />
              }
            \`,
          })
          export class AppCmp {
          }
        `);

        env.driveMain();
        const jsContents = env.getContents('test.js');

        // In local compilation mode we can't detect which components
        // belong to `@defer` blocks, thus can't determine whether corresponding
        // classes can be defer-loaded. In this case we retain eager imports
        // and do not generate defer dependency functions for `@defer` instructions.

        // Eager imports are retained in the output.
        expect(jsContents).toContain(`from './deferred-a'`);

        // Defer instructions do not have a dependency function,
        // since all dependencies were defined in `@Component.imports`.
        expect(jsContents).toContain('ɵɵdefer(1, 0);');

        // Expect `ɵsetClassMetadata` (sync) to be generated.
        expect(jsContents).toContain('ɵsetClassMetadata(AppCmp,');
      });

      it('should handle defer blocks that rely on deps from `deferredImports` and `imports`',
         () => {
           env.write('eager-a.ts', `
              import {Component} from '@angular/core';
              @Component({
                standalone: true,
                selector: 'eager-cmp-a',
                template: 'EagerCmpA contents',
              })
              export class EagerCmpA {
              }
            `);

           env.write('deferred-a.ts', `
              import {Component} from '@angular/core';
              @Component({
                standalone: true,
                selector: 'deferred-cmp-a',
                template: 'DeferredCmpA contents',
              })
              export class DeferredCmpA {
              }
            `);

           env.write('deferred-b.ts', `
              import {Component} from '@angular/core';
              @Component({
                standalone: true,
                selector: 'deferred-cmp-b',
                template: 'DeferredCmpB contents',
              })
              export class DeferredCmpB {
              }
            `);

           env.write('test.ts', `
              import {Component} from '@angular/core';
              import {DeferredCmpA} from './deferred-a';
              import {DeferredCmpB} from './deferred-b';
              import {EagerCmpA} from './eager-a';
              @Component({
                standalone: true,
                imports: [EagerCmpA],
                deferredImports: [DeferredCmpA, DeferredCmpB],
                template: \`
                  @defer {
                    <eager-cmp-a />
                    <deferred-cmp-a />
                  }
                  @defer {
                    <eager-cmp-a />
                    <deferred-cmp-b />
                  }
                \`,
              })
              export class AppCmp {
              }
            `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           // Expect that all deferrableImports in local compilation mode
           // are located in a single function (since we can't detect in
           // the local mode which components belong to which block).
           // Eager dependencies are **not* included here.
           expect(jsContents)
               .toContain(
                   'const AppCmp_DeferFn = () => [' +
                   'import("./deferred-a").then(m => m.DeferredCmpA), ' +
                   'import("./deferred-b").then(m => m.DeferredCmpB)];');

           // Make sure there are no eager imports present in the output.
           expect(jsContents).not.toContain(`from './deferred-a'`);
           expect(jsContents).not.toContain(`from './deferred-b'`);

           // Eager dependencies retain their imports.
           expect(jsContents).toContain(`from './eager-a';`);

           // All defer instructions use the same dependency function.
           expect(jsContents).toContain('ɵɵdefer(1, 0, AppCmp_DeferFn);');
           expect(jsContents).toContain('ɵɵdefer(4, 3, AppCmp_DeferFn);');

           // Expect `ɵsetClassMetadataAsync` to contain dynamic imports too.
           expect(jsContents)
               .toContain(
                   'ɵsetClassMetadataAsync(AppCmp, () => [' +
                   'import("./deferred-a").then(m => m.DeferredCmpA), ' +
                   'import("./deferred-b").then(m => m.DeferredCmpB)], ' +
                   '(DeferredCmpA, DeferredCmpB) => {');
         });

      it('should support importing multiple deferrable deps from a single file ' +
             'and use them within `@Component.deferrableImports` field',
         () => {
           env.write('deferred-deps.ts', `
              import {Component} from '@angular/core';

              @Component({
                standalone: true,
                selector: 'deferred-cmp-a',
                template: 'DeferredCmpA contents',
              })
              export class DeferredCmpA {
              }

              @Component({
                standalone: true,
                selector: 'deferred-cmp-b',
                template: 'DeferredCmpB contents',
              })
              export class DeferredCmpB {
              }
            `);

           env.write('test.ts', `
              import {Component} from '@angular/core';

              // This import brings multiple symbols, but all of them are
              // used within @Component.deferredImports, thus this import
              // can be removed in favor of dynamic imports.
              import {DeferredCmpA, DeferredCmpB} from './deferred-deps';

              @Component({
                standalone: true,
                deferredImports: [DeferredCmpA],
                template: \`
                  @defer {
                    <deferred-cmp-a />
                  }
                \`,
              })
              export class AppCmpA {}

              @Component({
                standalone: true,
                deferredImports: [DeferredCmpB],
                template: \`
                  @defer {
                    <deferred-cmp-b />
                  }
                \`,
              })
              export class AppCmpB {}
            `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           // Expect that we generate 2 different defer functions
           // (one for each component).
           expect(jsContents)
               .toContain(
                   'const AppCmpA_DeferFn = () => [' +
                   'import("./deferred-deps").then(m => m.DeferredCmpA)]');
           expect(jsContents)
               .toContain(
                   'const AppCmpB_DeferFn = () => [' +
                   'import("./deferred-deps").then(m => m.DeferredCmpB)]');

           // Make sure there are no eager imports present in the output.
           expect(jsContents).not.toContain(`from './deferred-deps'`);

           // Defer instructions use per-component dependency function.
           expect(jsContents).toContain('ɵɵdefer(1, 0, AppCmpA_DeferFn)');
           expect(jsContents).toContain('ɵɵdefer(1, 0, AppCmpB_DeferFn)');

           // Expect `ɵsetClassMetadataAsync` to contain dynamic imports too.
           expect(jsContents)
               .toContain(
                   'ɵsetClassMetadataAsync(AppCmpA, () => [' +
                   'import("./deferred-deps").then(m => m.DeferredCmpA)]');
           expect(jsContents)
               .toContain(
                   'ɵsetClassMetadataAsync(AppCmpB, () => [' +
                   'import("./deferred-deps").then(m => m.DeferredCmpB)]');
         });

      it('should produce a diagnostic in case imports with symbols used ' +
             'in `deferredImports` can not be removed',
         () => {
           env.write('deferred-deps.ts', `
              import {Component} from '@angular/core';

              @Component({
                standalone: true,
                selector: 'deferred-cmp-a',
                template: 'DeferredCmpA contents',
              })
              export class DeferredCmpA {
              }

              @Component({
                standalone: true,
                selector: 'deferred-cmp-b',
                template: 'DeferredCmpB contents',
              })
              export class DeferredCmpB {
              }

              export function utilityFn() {}
            `);

           env.write('test.ts', `
              import {Component} from '@angular/core';

              // This import can not be removed, since it'd contain
              // 'utilityFn' symbol once we remove 'DeferredCmpA' and
              // 'DeferredCmpB' and generate a dynamic import for it.
              // In this situation compiler produces a diagnostic to
              // indicate that.
              import {DeferredCmpA, DeferredCmpB, utilityFn} from './deferred-deps';

              @Component({
                standalone: true,
                deferredImports: [DeferredCmpA],
                template: \`
                  @defer {
                    <deferred-cmp-a />
                  }
                \`,
              })
              export class AppCmpA {
                ngOnInit() {
                  utilityFn();
                }
              }

              @Component({
                standalone: true,
                deferredImports: [DeferredCmpB],
                template: \`
                  @defer {
                    <deferred-cmp-b />
                  }
                \`,
              })
              export class AppCmpB {}

              @Component({
                standalone: true,
                template: 'Component without any dependencies'
              })
              export class ComponentWithoutDeps {}
            `);

           const diags = env.driveDiagnostics();

           // Expect 2 diagnostics: one for each component `AppCmpA` and `AppCmpB`,
           // since both of them refer to symbols from an import declaration that
           // can not be removed.
           expect(diags.length).toBe(2);

           const components = ['AppCmpA', 'AppCmpB'];
           for (let i = 0; i < components.length; i++) {
             const component = components[i];
             const {code, messageText} = diags[i];
             expect(code).toBe(ngErrorCode(ErrorCode.DEFERRED_DEPENDENCY_IMPORTED_EAGERLY));
             expect(messageText)
                 .toContain(
                     'This import contains symbols used in the `@Component.deferredImports` ' +
                     `array of the \`${component}\` component`);
           }
         });
    });
  });
});
