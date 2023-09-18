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

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('local compilation', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      const tsconfig: {[key: string]: any} = {
        extends: '../tsconfig-base.json',
        compilerOptions: {
          baseUrl: '.',
          rootDirs: ['/app'],
        },
        angularCompilerOptions: {
          compilationMode: 'experimental-local',
        },
      };
      env.write('tsconfig.json', JSON.stringify(tsconfig, null, 2));
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

    describe('constructor injection', () => {
      it('should include injector types with all possible import/injection styles into component factory',
         () => {
           env.write('test.ts', `
          import {Component, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'

          @Component({
            selector: 'test-main',
            template: '<span>Hello world</span>',
          })
          export class MainComponent {         
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
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
                   `MainComponent.ɵfac = function MainComponent_Factory(t) { return new (t || MainComponent)(i0.ɵɵdirectiveInject(SomeService1), i0.ɵɵdirectiveInject(SomeService2), i0.ɵɵdirectiveInject(SomeWhere3.SomeService3), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN)); };`);
         });

      it('should include injector types with all possible import/injection styles into standalone component factory',
         () => {
           env.write('test.ts', `
          import {Component, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'

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
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}  
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainComponent.ɵfac = function MainComponent_Factory(t) { return new (t || MainComponent)(i0.ɵɵdirectiveInject(SomeService1), i0.ɵɵdirectiveInject(SomeService2), i0.ɵɵdirectiveInject(SomeWhere3.SomeService3), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN)); };`);
         });

      it('should include injector types with all possible import/injection styles into directive factory',
         () => {
           env.write('test.ts', `
          import {Directive, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'

          @Directive({
          })
          export class MainDirective {         
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
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
                   `MainDirective.ɵfac = function MainDirective_Factory(t) { return new (t || MainDirective)(i0.ɵɵdirectiveInject(SomeService1), i0.ɵɵdirectiveInject(SomeService2), i0.ɵɵdirectiveInject(SomeWhere3.SomeService3), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN)); };`);
         });

      it('should include injector types with all possible import/injection styles into standalone directive factory',
         () => {
           env.write('test.ts', `
          import {Directive, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'

          @Directive({
            standalone: true,
          })
          export class MainDirective {         
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}  
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainDirective.ɵfac = function MainDirective_Factory(t) { return new (t || MainDirective)(i0.ɵɵdirectiveInject(SomeService1), i0.ɵɵdirectiveInject(SomeService2), i0.ɵɵdirectiveInject(SomeWhere3.SomeService3), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN)); };`);
         });

      it('should include injector types with all possible import/injection styles into pipe factory',
         () => {
           env.write('test.ts', `
          import {Pipe, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'

          @Pipe({name: 'pipe'})
          export class MainPipe {         
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
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
                   `MainPipe.ɵfac = function MainPipe_Factory(t) { return new (t || MainPipe)(i0.ɵɵdirectiveInject(SomeService1, 16), i0.ɵɵdirectiveInject(SomeService2, 16), i0.ɵɵdirectiveInject(SomeWhere3.SomeService3, 16), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN, 16)); };`);
         });

      it('should include injector types with all possible import/injection styles into standalone pipe factory',
         () => {
           env.write('test.ts', `
          import {Pipe, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'

          @Pipe({
            name: 'pipe',
            standalone: true,
          })
          export class MainPipe {         
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}  
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainPipe.ɵfac = function MainPipe_Factory(t) { return new (t || MainPipe)(i0.ɵɵdirectiveInject(SomeService1, 16), i0.ɵɵdirectiveInject(SomeService2, 16), i0.ɵɵdirectiveInject(SomeWhere3.SomeService3, 16), i0.ɵɵinjectAttribute('title'), i0.ɵɵdirectiveInject(MESSAGE_TOKEN, 16)); };`);
         });

      it('should include injector types with all possible import/injection styles into injectable factory',
         () => {
           env.write('test.ts', `
          import {Injectable, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'

          @Injectable({
            providedIn: 'root',
          })
          export class MainService {         
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}  
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainService.ɵfac = function MainService_Factory(t) { return new (t || MainService)(i0.ɵɵinject(SomeService1), i0.ɵɵinject(SomeService2), i0.ɵɵinject(SomeWhere3.SomeService3), i0.ɵɵinjectAttribute('title'), i0.ɵɵinject(MESSAGE_TOKEN)); };`);
         });

      it('should include injector types with all possible import/injection styles into ng module factory',
         () => {
           env.write('test.ts', `
          import {Component, NgModule, Attribute, Inject} from '@angular/core';
          import {SomeClass} from './some-where'
          import {SomeService1} from './some-where1'
          import SomeService2 from './some-where2'
          import * as SomeWhere3 from './some-where3'

          @NgModule({
          })
          export class MainModule {         
            constructor(
              private someService1: SomeService1,
              private someService2: SomeService2,
              private someService3: SomeWhere3.SomeService3,
              @Attribute('title') title: string,
              @Inject(MESSAGE_TOKEN) tokenMessage: SomeClass,
              ) {}  
          }
          `);

           env.driveMain();
           const jsContents = env.getContents('test.js');

           expect(jsContents)
               .toContain(
                   `MainModule.ɵfac = function MainModule_Factory(t) { return new (t || MainModule)(i0.ɵɵinject(SomeService1), i0.ɵɵinject(SomeService2), i0.ɵɵinject(SomeWhere3.SomeService3), i0.ɵɵinjectAttribute('title'), i0.ɵɵinject(MESSAGE_TOKEN)); };`);
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
  });
});
