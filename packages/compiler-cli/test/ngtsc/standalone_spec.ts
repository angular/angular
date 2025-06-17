/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {
  diagnosticToNode,
  getSourceCodeForDiagnostic,
  loadStandardTestFiles,
} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('ngtsc compilation of standalone types', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true});
    });

    describe('component-side', () => {
      it('should compile a basic standalone component', () => {
        env.write(
          'test.ts',
          `
              import {Component, Directive} from '@angular/core';

              @Directive({
                selector: '[dir]',
                standalone: true,
              })
              export class TestDir {}

              @Component({
                selector: 'test-cmp',
                template: '<div dir></div>',
                standalone: true,
                imports: [TestDir],
              })
              export class TestCmp {}
            `,
        );
        env.driveMain();
        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('dependencies: [TestDir]');
        expect(jsCode).toContain('standalone: true');

        const dtsCode = env.getContents('test.d.ts');
        expect(dtsCode).toContain(
          'i0.ɵɵDirectiveDeclaration<TestDir, "[dir]", never, {}, {}, never, never, true, never>;',
        );
        expect(dtsCode).toContain(
          'i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, true, never>;',
        );
      });

      it('should compile a recursive standalone component', () => {
        env.write(
          'test.ts',
          `
              import {Component, Directive} from '@angular/core';

              @Component({
                selector: 'test-cmp',
                template: '<test-cmp></test-cmp>',
                standalone: true,
              })
              export class TestCmp {}
            `,
        );
        env.driveMain();
        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('dependencies: [TestCmp]');
        expect(jsCode).toContain('standalone: true');
      });

      it('should compile a basic standalone pipe', () => {
        env.write(
          'test.ts',
          `
          import {Pipe} from '@angular/core';

          @Pipe({
            standalone: true,
            name: 'test',
          })
          export class TestPipe {
            transform(value: any): any {}
          }
        `,
        );
        env.driveMain();
        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('standalone: true');

        const dtsCode = env.getContents('test.d.ts');
        expect(dtsCode).toContain('i0.ɵɵPipeDeclaration<TestPipe, "test", true>');
      });

      it('should use existing imports for dependencies', () => {
        env.write(
          'dep.ts',
          `
          import {Directive} from '@angular/core';

          @Directive({
            standalone: true,
            selector: '[dir]',
          })
          export class TestDir {}
        `,
        );
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {TestDir} from './dep';

          @Component({
            standalone: true,
            imports: [TestDir],
            selector: 'test-cmp',
            template: '<div dir></div>',
          })
          export class TestCmp {}
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('dependencies: [TestDir]');
      });

      it('should compile a standalone component even in the presence of cycles', () => {
        env.write(
          'dep.ts',
          `
          import {Directive, Input} from '@angular/core';

          // This import creates a cycle, since 'test.ts' imports 'dir.ts'.
          import {TestType} from './test';

          @Directive({
            standalone: true,
            selector: '[dir]',
          })
          export class TestDir {
            @Input() value?: TestType;
          }
        `,
        );
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {TestDir} from './dep';

          export interface TestType {
            value: string;
          }

          @Component({
            standalone: true,
            imports: [TestDir],
            selector: 'test-cmp',
            template: '<div dir></div>',
          })
          export class TestCmp {}
        `,
        );

        env.driveMain();

        const jsContents = env.getContents('test.js');
        expect(jsContents).toContain('dependencies: [TestDir]');
      });

      it('should compile a standalone component in a cycle with its module', () => {
        env.write(
          'module.ts',
          `
          import {Component, NgModule, forwardRef} from '@angular/core';

          import {StandaloneCmp} from './component';

          @Component({
            selector: 'module-cmp',
            template: '<standalone-cmp></standalone-cmp>',
            standalone: false,
          })
          export class ModuleCmp {}

          @NgModule({
            declarations: [ModuleCmp],
            exports: [ModuleCmp],
            imports: [forwardRef(() => StandaloneCmp)],
          })
          export class Module {}
        `,
        );

        env.write(
          'component.ts',
          `
          import {Component, forwardRef} from '@angular/core';

          import {Module} from './module';

          @Component({
            standalone: true,
            imports: [forwardRef(() => Module)],
            selector: 'standalone-cmp',
            template: '<module-cmp></module-cmp>',
          })
          export class StandaloneCmp {}
        `,
        );
        env.driveMain();

        const moduleJs = env.getContents('module.js');
        expect(moduleJs).toContain(
          'i0.ɵɵsetComponentScope(ModuleCmp, function () { return [i1.StandaloneCmp]; }, []);',
        );

        const cmpJs = env.getContents('component.js');
        expect(cmpJs).toContain('dependencies: () => [Module, i1.ModuleCmp]');
      });

      it('should error when a non-standalone component tries to use imports', () => {
        env.write(
          'test.ts',
          `
              import {Component, Directive} from '@angular/core';

              @Directive({
                selector: '[dir]',
                standalone: true,
              })
              export class TestDir {}

              @Component({
                selector: 'test-cmp',
                template: '<div dir></div>',
                imports: [TestDir],
                standalone: false,
              })
              export class TestCmp {}
            `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_NOT_STANDALONE));
        expect(getSourceCodeForDiagnostic(diags[0])).toEqual('[TestDir]');
      });

      it('should compile a standalone component with schema support', () => {
        env.write(
          'test.ts',
          `
              import {Component, NO_ERRORS_SCHEMA} from '@angular/core';

              @Component({
                selector: 'test-cmp',
                standalone: true,
                template: '<is-unknown></is-unknown>',
                schemas: [NO_ERRORS_SCHEMA],
              })
              export class TestCmp {}
            `,
        );
        env.driveMain();

        // verify that there are no compilation errors
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);

        // verify generated code for the unknown element
        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('i0.ɵɵdomElement(0, "is-unknown");');

        // verify schemas are not included in the generated code
        const jsCodeAoT = jsCode.slice(
          0,
          jsCode.indexOf('(() => { (typeof ngDevMode === "undefined" || ngDevMode)'),
        );
        expect(jsCodeAoT).not.toContain('schemas: [NO_ERRORS_SCHEMA]');
      });

      it('should error when a non-standalone component tries to use schemas', () => {
        env.write(
          'test.ts',
          `
              import {Component, NO_ERRORS_SCHEMA} from '@angular/core';

              @Component({
                selector: 'test-cmp',
                template: '<div></div>',
                schemas: [NO_ERRORS_SCHEMA],
                standalone: false,
              })
              export class TestCmp {}
            `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_NOT_STANDALONE));
        expect(diags[0].messageText).toBe(
          `'schemas' is only valid on a component that is standalone.`,
        );
        expect(getSourceCodeForDiagnostic(diags[0])).toEqual('[NO_ERRORS_SCHEMA]');
      });

      it('should compile a standalone component that imports an NgModule', () => {
        env.write(
          'test.ts',
          `
              import {Component, Directive, NgModule} from '@angular/core';

              @Directive({
                selector: '[dir]',
                standalone: false,
              })
              export class TestDir {}

              @NgModule({
                declarations: [TestDir],
                exports: [TestDir],
              })
              export class TestModule {}

              @Component({
                selector: 'test-cmp',
                template: '<div dir></div>',
                standalone: true,
                imports: [TestModule],
              })
              export class TestCmp {}
            `,
        );
        env.driveMain();
        expect(env.getContents('test.js')).toContain('dependencies: [TestModule, TestDir]');
      });

      it('should allow nested arrays in standalone component imports', () => {
        env.write(
          'test.ts',
          `
              import {Component, Directive} from '@angular/core';

              @Directive({
                selector: '[dir]',
                standalone: true,
              })
              export class TestDir {}

              export const DIRECTIVES = [TestDir];

              @Component({
                selector: 'test-cmp',
                template: '<div dir></div>',
                standalone: true,
                imports: [DIRECTIVES],
              })
              export class TestCmp {}
            `,
        );
        env.driveMain();
        expect(env.getContents('test.js')).toContain('dependencies: [TestDir]');
      });

      it('should deduplicate standalone component imports', () => {
        env.write(
          'test.ts',
          `
              import {Component, Directive} from '@angular/core';

              @Directive({
                selector: '[dir]',
                standalone: true,
              })
              export class TestDir {}

              export const DIRECTIVES = [TestDir];

              @Component({
                selector: 'test-cmp',
                template: '<div dir></div>',
                standalone: true,
                imports: [TestDir, DIRECTIVES],
              })
              export class TestCmp {}
            `,
        );
        env.driveMain();
        expect(env.getContents('test.js')).toContain('dependencies: [TestDir]');
      });

      it('should error when a standalone component imports a non-standalone entity', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: false,
          })
          export class TestDir {}

          @NgModule({
            declarations: [TestDir],
            exports: [TestDir],
          })
          export class TestModule {}

          @Component({
            selector: 'test-cmp',
            template: '<div dir></div>',
            standalone: true,
            imports: [TestDir],
          })
          export class TestCmp {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_IMPORT_NOT_STANDALONE));
        expect(getSourceCodeForDiagnostic(diags[0])).toEqual('TestDir');

        // The diagnostic produced here should suggest that the directive be imported via its
        // NgModule instead.
        expect(diags[0].relatedInformation).not.toBeUndefined();
        expect(getSourceCodeForDiagnostic(diags[0].relatedInformation![0])).toEqual('TestModule');
        expect(diags[0].relatedInformation![0].messageText).toMatch(
          /It can be imported using its '.*' NgModule instead./,
        );
      });

      it('should error when a standalone component imports a ModuleWithProviders using a foreign function', () => {
        env.write(
          'test.ts',
          `
             import {Component, ModuleWithProviders, NgModule} from '@angular/core';

             @NgModule({})
             export class TestModule {}

             declare function moduleWithProviders(): ModuleWithProviders<TestModule>;

             @Component({
               selector: 'test-cmp',
               template: '<div></div>',
               standalone: true,
               // @ts-ignore
               imports: [moduleWithProviders()],
             })
             export class TestCmpWithLiteralImports {}

             const IMPORTS = [moduleWithProviders()];

             @Component({
               selector: 'test-cmp',
               template: '<div></div>',
               standalone: true,
               // @ts-ignore
               imports: IMPORTS,
             })
             export class TestCmpWithReferencedImports {}
           `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(2);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_UNKNOWN_IMPORT));
        // The import occurs within the array literal, such that the error can be reported for
        // the specific import that is rejected.
        expect(getSourceCodeForDiagnostic(diags[0])).toEqual('moduleWithProviders()');

        expect(diags[1].code).toBe(ngErrorCode(ErrorCode.COMPONENT_UNKNOWN_IMPORT));
        // The import occurs in a referenced variable, which reports the error on the full
        // `imports` expression.
        expect(getSourceCodeForDiagnostic(diags[1])).toEqual('IMPORTS');
      });

      it('should error when a standalone component imports a ModuleWithProviders', () => {
        env.write(
          'test.ts',
          `
          import {Component, ModuleWithProviders, NgModule} from '@angular/core';

          @NgModule({})
          export class TestModule {
            static forRoot(): ModuleWithProviders<TestModule> {
              return {ngModule: TestModule};
            }
          }

          @Component({
            selector: 'test-cmp',
            template: '<div></div>',
            standalone: true,
            // @ts-ignore
            imports: [TestModule.forRoot()],
          })
          export class TestCmp {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_UNKNOWN_IMPORT));
        // The static interpreter does not track source locations for locally evaluated functions,
        // so the error is reported on the full `imports` expression.
        expect(getSourceCodeForDiagnostic(diags[0])).toEqual('[TestModule.forRoot()]');
      });

      it('should error when a standalone component imports a non-standalone entity, with a specific error when that entity is not exported', () => {
        env.write(
          'test.ts',
          `
            import {Component, Directive, NgModule} from '@angular/core';

            @Directive({
              selector: '[dir]',
              standalone: false,
            })
            export class TestDir {}

            @NgModule({
              declarations: [TestDir],
            })
            export class TestModule {}

            @Component({
              selector: 'test-cmp',
              template: '<div dir></div>',
              standalone: true,
              imports: [TestDir],
            })
            export class TestCmp {}
          `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_IMPORT_NOT_STANDALONE));
        expect(getSourceCodeForDiagnostic(diags[0])).toEqual('TestDir');

        expect(diags[0].relatedInformation).not.toBeUndefined();
        expect(getSourceCodeForDiagnostic(diags[0].relatedInformation![0])).toEqual('TestModule');
        expect(diags[0].relatedInformation![0].messageText).toEqual(
          `It's declared in the 'TestModule' NgModule, but is not exported. Consider exporting it and importing the NgModule instead.`,
        );
      });

      it('should type-check standalone component templates', () => {
        env.write(
          'test.ts',
          `
          import {Component, Input, NgModule} from '@angular/core';

          @Component({
            selector: 'not-standalone',
            template: '',
            standalone: false,
          })
          export class NotStandaloneCmp {
            @Input() value!: string;
          }

          @NgModule({
            declarations: [NotStandaloneCmp],
            exports: [NotStandaloneCmp],
          })
          export class NotStandaloneModule {}

          @Component({
            standalone: true,
            selector: 'is-standalone',
            template: '',
          })
          export class IsStandaloneCmp {
            @Input() value!: string;
          }

          @Component({
            standalone: true,
            selector: 'test-cmp',
            imports: [NotStandaloneModule, IsStandaloneCmp],
            template: '<not-standalone [value]="3"></not-standalone><is-standalone [value]="true"></is-standalone>',
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics().map((diag) => diag.messageText);
        expect(diags.length).toBe(2);
        expect(diags).toContain(`Type 'number' is not assignable to type 'string'.`);
        expect(diags).toContain(`Type 'boolean' is not assignable to type 'string'.`);
      });

      it('should not spam errors if imports is misconfigured', () => {
        env.write(
          'test.ts',
          `
          import {Component, Input} from '@angular/core';

          @Component({
            standalone: true,
            selector: 'dep-cmp',
            template: '',
          })
          export class DepCmp {}

          @Component({
            // standalone: false, would ordinarily cause template type-checking errors
            // as well as an error about imports on a non-standalone component.
            imports: [DepCmp],
            selector: 'test-cmp',
            template: '<dep-cmp></dep-cmp>',
            standalone: false,
          })
          export class TestCmp {}
        `,
        );

        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('imports');
      });

      it('should handle a forwardRef used inside `imports`', () => {
        env.write(
          'test.ts',
          `
          import {Component, forwardRef} from '@angular/core';

          @Component({
            selector: 'test',
            standalone: true,
            imports: [forwardRef(() => StandaloneComponent)],
            template: "<other-standalone></other-standalone>"
          })
          class TestComponent {
          }

          @Component({selector: 'other-standalone', standalone: true, template: ""})
          class StandaloneComponent {
          }
        `,
        );
        const diags = env.driveDiagnostics();
        const jsCode = env.getContents('test.js');

        expect(diags.length).toBe(0);
        expect(jsCode).toContain('standalone: true');
        expect(jsCode).toContain('dependencies: () => [StandaloneComponent]');
      });
    });

    describe('NgModule-side', () => {
      it('should not allow a standalone component to be declared in an NgModule', () => {
        env.write(
          'test.ts',
          `
              import {Component, NgModule} from '@angular/core';

              @Component({
                selector: 'test-cmp',
                template: 'Test',
                standalone: true,
              })
              export class TestCmp {}

              @NgModule({
                declarations: [TestCmp],
              })
              export class TestModule {}
            `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NGMODULE_DECLARATION_IS_STANDALONE));
        expect(diags[0].messageText).toContain('Component TestCmp is standalone');
        expect(getSourceCodeForDiagnostic(diags[0])).toEqual('TestCmp');
      });

      it('should not allow a standalone pipe to be declared in an NgModule', () => {
        env.write(
          'test.ts',
          `
          import {Pipe, NgModule} from '@angular/core';

          @Pipe({
            name: 'test',
            standalone: true,
          })
          export class TestPipe {}

          @NgModule({
            declarations: [TestPipe],
          })
          export class TestModule {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NGMODULE_DECLARATION_IS_STANDALONE));
        expect(diags[0].messageText).toContain('Pipe TestPipe is standalone');
        expect(getSourceCodeForDiagnostic(diags[0])).toEqual('TestPipe');
      });

      it('should allow a standalone component to be imported by an NgModule', () => {
        env.write(
          'test.ts',
          `
          import {Component, NgModule} from '@angular/core';

          @Component({
            selector: 'st-cmp',
            standalone: true,
            template: 'Test',
          })
          export class StandaloneCmp {}

          @Component({
            selector: 'test-cmp',
            template: '<st-cmp></st-cmp>',
            standalone: false,
          })
          export class TestCmp {}

          @NgModule({
            declarations: [TestCmp],
            imports: [StandaloneCmp],
          })
          export class TestModule {}
        `,
        );
        env.driveMain();
        expect(env.getContents('test.js')).toContain('dependencies: [StandaloneCmp]');
      });

      it('should allow a standalone directive to be imported by an NgModule', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule} from '@angular/core';

          @Directive({
            selector: '[st-dir]',
            standalone: true,
          })
          export class StandaloneDir {}

          @Component({
            selector: 'test-cmp',
            template: '<div st-dir></div>',
            standalone: false,
          })
          export class TestCmp {}

          @NgModule({
            declarations: [TestCmp],
            imports: [StandaloneDir],
          })
          export class TestModule {}
        `,
        );
        env.driveMain();
        expect(env.getContents('test.js')).toContain('dependencies: [StandaloneDir]');
      });

      it('should allow a standalone pipe to be imported by an NgModule', () => {
        env.write(
          'test.ts',
          `
          import {Component, Pipe, NgModule} from '@angular/core';

          @Pipe({
            name: 'stpipe',
            standalone: true,
          })
          export class StandalonePipe {
            transform(value: any): any {
              return value;
            }
          }

          @Component({
            selector: 'test-cmp',
            template: '{{data | stpipe}}',
            standalone: false,
          })
          export class TestCmp {
            data = 'test';
          }

          @NgModule({
            declarations: [TestCmp],
            imports: [StandalonePipe],
          })
          export class TestModule {}
        `,
        );
        env.driveMain();
        expect(env.getContents('test.js')).toContain('dependencies: [StandalonePipe]');
      });

      it('should error when a standalone entity is exported by an NgModule without importing it first', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: true,
          })
          export class TestDir {}

          @NgModule({
            exports: [TestDir],
          })
          export class TestModule {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NGMODULE_INVALID_REEXPORT));
        expect(diags[0].messageText).toContain('it must be imported first');
        expect(diagnosticToNode(diags[0], ts.isIdentifier).parent.parent.getText()).toEqual(
          'exports: [TestDir]',
        );
      });

      it('should error when a non-standalone entity is imported into an NgModule', () => {
        env.write(
          'test.ts',
          `
          import {Component, Directive, NgModule} from '@angular/core';

          @Directive({
            selector: '[dir]',
            standalone: false,
          })
          export class TestDir {}

          @NgModule({
            imports: [TestDir],
          })
          export class TestModule {}
        `,
        );
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('is not standalone');
        expect(diagnosticToNode(diags[0], ts.isIdentifier).parent.parent.getText()).toEqual(
          'imports: [TestDir]',
        );
      });
    });

    describe('other types', () => {
      it('should compile a basic standalone directive', () => {
        env.write(
          'test.ts',
          `
              import {Directive} from '@angular/core';

              @Directive({
                selector: '[dir]',
                standalone: true,
              })
              export class TestDir {}
            `,
        );
        env.driveMain();
        expect(env.getContents('test.js')).toContain('standalone: true');
      });

      it('should compile a basic standalone pipe', () => {
        env.write(
          'test.ts',
          `
              import {Pipe} from '@angular/core';

              @Pipe({
                name: 'testpipe',
                standalone: true,
              })
              export class TestPipe {}
            `,
        );
        env.driveMain();
        expect(env.getContents('test.js')).toContain('standalone: true');
      });
    });

    describe('from libraries', () => {
      it('should consume standalone directives from libraries', () => {
        env.write(
          'lib.d.ts',
          `
          import {ɵɵDirectiveDeclaration} from '@angular/core';

          export declare class StandaloneDir {
            static ɵdir: ɵɵDirectiveDeclaration<StandaloneDir, "[dir]", never, {}, {}, never, never, true>;
          }
        `,
        );
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {StandaloneDir} from './lib';

          @Component({
            standalone: true,
            selector: 'test-cmp',
            template: '<div dir></div>',
            imports: [StandaloneDir],
          })
          export class TestCmp {}
        `,
        );
        env.driveMain();

        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('dependencies: [StandaloneDir]');
      });

      it('should consume standalone components from libraries', () => {
        env.write(
          'lib.d.ts',
          `
          import {ɵɵComponentDeclaration} from '@angular/core';

          export declare class StandaloneCmp {
            static ɵcmp: ɵɵComponentDeclaration<StandaloneCmp, "standalone-cmp", never, {}, {}, never, never, true>;
          }
        `,
        );
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {StandaloneCmp} from './lib';

          @Component({
            standalone: true,
            selector: 'test-cmp',
            template: '<standalone-cmp></standalone-cmp>',
            imports: [StandaloneCmp],
          })
          export class TestCmp {}
        `,
        );
        env.driveMain();

        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('dependencies: [StandaloneCmp]');
      });

      it('should consume standalone pipes from libraries', () => {
        env.write(
          'lib.d.ts',
          `
          import {ɵɵPipeDeclaration} from '@angular/core';

          export declare class StandalonePipe {
            transform(value: any): any;
            static ɵpipe: ɵɵPipeDeclaration<StandalonePipe, "standalone", true>;
          }
        `,
        );
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';
          import {StandalonePipe} from './lib';

          @Component({
            standalone: true,
            selector: 'test-cmp',
            template: '{{value | standalone}}',
            imports: [StandalonePipe],
          })
          export class StandaloneComponent {
            value!: string;
          }
        `,
        );
        env.driveMain();

        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('dependencies: [StandalonePipe]');
      });

      it('should compile imports using a const tuple in external library', () => {
        env.write(
          'node_modules/external/index.d.ts',
          `
          import {ɵɵDirectiveDeclaration} from '@angular/core';

          export declare class StandaloneDir {
            static ɵdir: ɵɵDirectiveDeclaration<StandaloneDir, "[dir]", never, {}, {}, never, never, true>;
          }

          export declare const DECLARATIONS: readonly [typeof StandaloneDir];
        `,
        );
        env.write(
          'test.ts',
          `
          import {Component, Directive} from '@angular/core';
          import {DECLARATIONS} from 'external';

          @Component({
            standalone: true,
            selector: 'test-cmp',
            template: '<div dir></div>',
            imports: [DECLARATIONS],
          })
          export class TestCmp {}
        `,
        );
        env.driveMain();

        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('import * as i1 from "external";');
        expect(jsCode).toContain('dependencies: [i1.StandaloneDir]');
      });
    });

    describe('optimizations', () => {
      it('does emit standalone components in injector imports if they contain providers', () => {
        env.write(
          'test.ts',
          `
          import {Component, Injectable, NgModule} from '@angular/core';

          @Injectable()
          export class Service {}

          @NgModule({
            providers: [Service],
          })
          export class DepModule {}

          @Component({
            standalone: true,
            selector: 'standalone-cmp',
            imports: [DepModule],
            template: '',
          })
          export class StandaloneCmp {}

          @NgModule({
            imports: [StandaloneCmp],
            exports: [StandaloneCmp],
          })
          export class Module {}
        `,
        );
        env.driveMain();

        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('i0.ɵɵdefineInjector({ imports: [StandaloneCmp] });');
      });

      it('does emit standalone components in injector imports if they import a NgModule from .d.ts', () => {
        env.write(
          'dep.d.ts',
          `
            import {ɵɵNgModuleDeclaration} from '@angular/core';

            declare class DepModule {
              static ɵmod: ɵɵNgModuleDeclaration<DepModule, never, never, never>;
            }
          `,
        );

        env.write(
          'test.ts',
          `
            import {Component, Injectable, NgModule} from '@angular/core';
            import {DepModule} from './dep';

            @Component({
              standalone: true,
              selector: 'standalone-cmp',
              imports: [DepModule],
              template: '',
            })
            export class StandaloneCmp {}

            @NgModule({
              imports: [StandaloneCmp],
              exports: [StandaloneCmp],
            })
            export class Module {}
          `,
        );
        env.driveMain();

        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('i0.ɵɵdefineInjector({ imports: [StandaloneCmp] });');
      });

      it('does emit standalone components in injector imports if they import a component from .d.ts', () => {
        env.write(
          'dep.d.ts',
          `
              import {ɵɵComponentDeclaration} from '@angular/core';

              export declare class DepCmp {
                static ɵcmp: ɵɵComponentDeclaration<DepCmp, "dep-cmp", never, {}, {}, never, never, true>
              }
            `,
        );

        env.write(
          'test.ts',
          `
              import {Component, Injectable, NgModule} from '@angular/core';
              import {DepCmp} from './dep';

              @Component({
                standalone: true,
                selector: 'standalone-cmp',
                imports: [DepCmp],
                template: '<dep-cmp/>',
              })
              export class StandaloneCmp {}

              @NgModule({
                imports: [StandaloneCmp],
                exports: [StandaloneCmp],
              })
              export class Module {}
            `,
        );
        env.driveMain();

        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('i0.ɵɵdefineInjector({ imports: [StandaloneCmp] });');
      });

      it('does not emit standalone directives or pipes in injector imports', () => {
        env.write(
          'test.ts',
          `
          import {Directive, NgModule, Pipe} from '@angular/core';

          @Directive({
            standalone: true,
            selector: '[dir]',
          })
          export class StandaloneDir {}

          @Pipe({
            standalone: true,
            name: 'standalone',
          })
          export class StandalonePipe {
            transform(value: any): any {}
          }

          @NgModule({
            imports: [StandaloneDir, StandalonePipe],
            exports: [StandaloneDir, StandalonePipe],
          })
          export class Module {}
        `,
        );
        env.driveMain();

        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('i0.ɵɵdefineInjector({});');
      });

      it('should exclude directives from NgModule imports if they expose no providers', () => {
        env.write(
          'test.ts',
          `
            import {Component, NgModule} from '@angular/core';

            @NgModule({})
            export class DepModule {}

            @Component({
              standalone: true,
              selector: 'test-cmp',
              imports: [DepModule],
              template: '',
            })
            export class TestCmp {}

            @NgModule({
              imports: [TestCmp],
              exports: [TestCmp],
            })
            export class TestModule {}
          `,
        );

        env.driveMain();
        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('i0.ɵɵdefineInjector({});');
      });
    });
  });

  describe('strictStandalone flag', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true, strictStandalone: true});
    });

    it('should not allow a non-standalone component', () => {
      env.write(
        'app.ts',
        `
        import {Component} from '@angular/core';

        @Component({standalone: false, template: ''})
        export class TestCmp {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].code).toEqual(ngErrorCode(ErrorCode.NON_STANDALONE_NOT_ALLOWED));
      expect(diags[0].messageText).toContain('component');
    });

    it('should not allow a non-standalone directive', () => {
      env.write(
        'app.ts',
        `
        import {Directive} from '@angular/core';

        @Directive({standalone: false})
        export class TestDir {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].code).toEqual(ngErrorCode(ErrorCode.NON_STANDALONE_NOT_ALLOWED));
      expect(diags[0].messageText).toContain('directive');
    });

    it('should allow a no-arg directive', () => {
      env.write(
        'app.ts',
        `
        import {Directive} from '@angular/core';

        @Directive()
        export class TestDir {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(0);
    });

    it('should not allow a non-standalone pipe', () => {
      env.write(
        'app.ts',
        `
        import {Pipe} from '@angular/core';

        @Pipe({name: 'test', standalone: false})
        export class TestPipe {}
      `,
      );

      const diags = env.driveDiagnostics();
      expect(diags.length).toBe(1);
      expect(diags[0].code).toEqual(ngErrorCode(ErrorCode.NON_STANDALONE_NOT_ALLOWED));
      expect(diags[0].messageText).toContain('pipe');
    });
  });
});
