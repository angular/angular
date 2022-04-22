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
import {diagnosticToNode, getSourceCodeForDiagnostic, loadStandardTestFiles} from '../../src/ngtsc/testing';

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
        env.write('test.ts', `
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
            `);
        env.driveMain();
        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('dependencies: [TestDir]');
        expect(jsCode).toContain('standalone: true');

        const dtsCode = env.getContents('test.d.ts');
        expect(dtsCode).toContain(
            'i0.ɵɵDirectiveDeclaration<TestDir, "[dir]", never, {}, {}, never, never, true>;');
        expect(dtsCode).toContain(
            'i0.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, never, never, true>;');
      });

      it('should compile a recursive standalone component', () => {
        env.write('test.ts', `
              import {Component, Directive} from '@angular/core';
        
              @Component({
                selector: 'test-cmp',
                template: '<test-cmp></test-cmp>',
                standalone: true,
              })
              export class TestCmp {}
            `);
        env.driveMain();
        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('dependencies: [TestCmp]');
        expect(jsCode).toContain('standalone: true');
      });

      it('should compile a basic standalone pipe', () => {
        env.write('test.ts', `
          import {Pipe} from '@angular/core';

          @Pipe({
            standalone: true,
            name: 'test',
          })
          export class TestPipe {
            transform(value: any): any {}
          }
        `);
        env.driveMain();
        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('standalone: true');

        const dtsCode = env.getContents('test.d.ts');
        expect(dtsCode).toContain('i0.ɵɵPipeDeclaration<TestPipe, "test", true>');
      });

      it('should error when a non-standalone component tries to use imports', () => {
        env.write('test.ts', `
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
              })
              export class TestCmp {}
            `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_NOT_STANDALONE));
        expect(getSourceCodeForDiagnostic(diags[0])).toEqual('[TestDir]');
      });

      it('should compile a standalone component with schema support', () => {
        env.write('test.ts', `
              import {Component, NO_ERRORS_SCHEMA} from '@angular/core';
        
              @Component({
                selector: 'test-cmp',
                standalone: true,
                template: '<is-unknown></is-unknown>',
                schemas: [NO_ERRORS_SCHEMA],
              })
              export class TestCmp {}
            `);
        env.driveMain();

        // verify that there are no compilation errors
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(0);

        // verify generated code for the unknown element
        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('i0.ɵɵelement(0, "is-unknown");');

        // verify schemas are not included in the generated code
        const jsCodeAoT = jsCode.slice(
            0, jsCode.indexOf('(function () { (typeof ngDevMode === "undefined" || ngDevMode)'));
        expect(jsCodeAoT).not.toContain('schemas: [NO_ERRORS_SCHEMA]');
      });

      it('should error when a non-standalone component tries to use schemas', () => {
        env.write('test.ts', `
              import {Component, NO_ERRORS_SCHEMA} from '@angular/core';
        
              @Component({
                selector: 'test-cmp',
                template: '<div></div>',
                schemas: [NO_ERRORS_SCHEMA],
              })
              export class TestCmp {}
            `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_NOT_STANDALONE));
        expect(diags[0].messageText)
            .toBe(`'schemas' is only valid on a component that is standalone.`);
        expect(getSourceCodeForDiagnostic(diags[0])).toEqual('[NO_ERRORS_SCHEMA]');
      });

      it('should compile a standalone component that imports an NgModule', () => {
        env.write('test.ts', `
              import {Component, Directive, NgModule} from '@angular/core';
        
              @Directive({
                selector: '[dir]',
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
            `);
        env.driveMain();
        expect(env.getContents('test.js')).toContain('dependencies: [TestModule, TestDir]');
      });

      it('should allow nested arrays in standalone component imports', () => {
        env.write('test.ts', `
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
            `);
        env.driveMain();
        expect(env.getContents('test.js')).toContain('dependencies: [TestDir]');
      });

      it('should deduplicate standalone component imports', () => {
        env.write('test.ts', `
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
            `);
        env.driveMain();
        expect(env.getContents('test.js')).toContain('dependencies: [TestDir]');
      });

      it('should error when a standalone component imports a non-standalone entity', () => {
        env.write('test.ts', `
          import {Component, Directive, NgModule} from '@angular/core';
    
          @Directive({
            selector: '[dir]',
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
        `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_IMPORT_NOT_STANDALONE));
        expect(getSourceCodeForDiagnostic(diags[0])).toEqual('TestDir');

        // The diagnostic produced here should suggest that the directive be imported via its
        // NgModule instead.
        expect(diags[0].relatedInformation).not.toBeUndefined();
        expect(getSourceCodeForDiagnostic(diags[0].relatedInformation![0])).toEqual('TestModule');
        expect(diags[0].relatedInformation![0].messageText)
            .toContain('It can be imported using its NgModule');
      });

      it('should error when a standalone component imports a non-standalone entity, with a specific error when that entity is not exported',
         () => {
           env.write('test.ts', `
            import {Component, Directive, NgModule} from '@angular/core';
      
            @Directive({
              selector: '[dir]',
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
          `);
           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(1);
           expect(diags[0].code).toBe(ngErrorCode(ErrorCode.COMPONENT_IMPORT_NOT_STANDALONE));
           expect(getSourceCodeForDiagnostic(diags[0])).toEqual('TestDir');

           // The diagnostic produced here should suggest that the directive be imported via its
           // NgModule instead.
           expect(diags[0].relatedInformation).not.toBeUndefined();
           expect(getSourceCodeForDiagnostic(diags[0].relatedInformation![0]))
               .toEqual('TestModule');
           expect(diags[0].relatedInformation![0].messageText)
               .toEqual(
                   `It's declared in the NgModule 'TestModule', but is not exported. Consider exporting it.`);
         });

      it('should type-check standalone component templates', () => {
        env.write('test.ts', `
          import {Component, Input, NgModule} from '@angular/core';

          @Component({
            selector: 'not-standalone',
            template: '',
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
        `);

        const diags = env.driveDiagnostics().map(diag => diag.messageText);
        expect(diags.length).toBe(2);
        expect(diags).toContain(`Type 'number' is not assignable to type 'string'.`);
        expect(diags).toContain(`Type 'boolean' is not assignable to type 'string'.`);
      });
    });

    describe('NgModule-side', () => {
      it('should not allow a standalone component to be declared in an NgModule', () => {
        env.write('test.ts', `
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
            `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NGMODULE_DECLARATION_IS_STANDALONE));
        expect(diags[0].messageText).toContain('Component TestCmp is standalone');
        expect(getSourceCodeForDiagnostic(diags[0])).toEqual('TestCmp');
      });

      it('should not allow a standalone pipe to be declared in an NgModule', () => {
        env.write('test.ts', `
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
        `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NGMODULE_DECLARATION_IS_STANDALONE));
        expect(diags[0].messageText).toContain('Pipe TestPipe is standalone');
        expect(getSourceCodeForDiagnostic(diags[0])).toEqual('TestPipe');
      });

      it('should allow a standalone component to be imported by an NgModule', () => {
        env.write('test.ts', `
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
          })
          export class TestCmp {}
        
          @NgModule({
            declarations: [TestCmp],
            imports: [StandaloneCmp],
          })
          export class TestModule {}
        `);
        env.driveMain();
        expect(env.getContents('test.js')).toContain('dependencies: [StandaloneCmp]');
      });

      it('should allow a standalone directive to be imported by an NgModule', () => {
        env.write('test.ts', `
          import {Component, Directive, NgModule} from '@angular/core';
        
          @Directive({
            selector: '[st-dir]',
            standalone: true,
          })
          export class StandaloneDir {}
        
          @Component({
            selector: 'test-cmp',
            template: '<div st-dir></div>',
          })
          export class TestCmp {}
        
          @NgModule({
            declarations: [TestCmp],
            imports: [StandaloneDir],
          })
          export class TestModule {}
        `);
        env.driveMain();
        expect(env.getContents('test.js')).toContain('dependencies: [StandaloneDir]');
      });

      it('should allow a standalone pipe to be imported by an NgModule', () => {
        env.write('test.ts', `
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
          })
          export class TestCmp {
            data = 'test';
          }
        
          @NgModule({
            declarations: [TestCmp],
            imports: [StandalonePipe],
          })
          export class TestModule {}
        `);
        env.driveMain();
        expect(env.getContents('test.js')).toContain('dependencies: [StandalonePipe]');
      });

      it('should error when a standalone entity is exported by an NgModule without importing it first',
         () => {
           env.write('test.ts', `
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
        `);
           const diags = env.driveDiagnostics();
           expect(diags.length).toBe(1);
           expect(diags[0].code).toBe(ngErrorCode(ErrorCode.NGMODULE_INVALID_REEXPORT));
           expect(diags[0].messageText).toContain('it must be imported first');
           expect(diagnosticToNode(diags[0], ts.isIdentifier).parent.parent.getText())
               .toEqual('exports: [TestDir]');
         });

      it('should error when a non-standalone entity is imported into an NgModule', () => {
        env.write('test.ts', `
          import {Component, Directive, NgModule} from '@angular/core';
      
          @Directive({
            selector: '[dir]',
          })
          export class TestDir {}
      
          @NgModule({
            imports: [TestDir],
          })
          export class TestModule {}
        `);
        const diags = env.driveDiagnostics();
        expect(diags.length).toBe(1);
        expect(diags[0].messageText).toContain('is not standalone');
        expect(diagnosticToNode(diags[0], ts.isIdentifier).parent.parent.getText())
            .toEqual('imports: [TestDir]');
      });
    });

    describe('other types', () => {
      it('should compile a basic standalone directive', () => {
        env.write('test.ts', `
              import {Directive} from '@angular/core';
        
              @Directive({
                selector: '[dir]',
                standalone: true,
              })
              export class TestDir {}
            `);
        env.driveMain();
        expect(env.getContents('test.js')).toContain('standalone: true');
      });

      it('should compile a basic standalone pipe', () => {
        env.write('test.ts', `
              import {Pipe} from '@angular/core';
        
              @Pipe({
                name: 'testpipe',
                standalone: true,
              })
              export class TestPipe {}
            `);
        env.driveMain();
        expect(env.getContents('test.js')).toContain('standalone: true');
      });
    });

    describe('from libraries', () => {
      it('should consume standalone directives from libraries', () => {
        env.write('lib.d.ts', `
          import {ɵɵDirectiveDeclaration} from '@angular/core';

          export declare class StandaloneDir {
            static ɵdir: ɵɵDirectiveDeclaration<StandaloneDir, "[dir]", never, {}, {}, never, never, true>;
          }
        `);
        env.write('test.ts', `
          import {Component} from '@angular/core';
          import {StandaloneDir} from './lib';

          @Component({
            standalone: true,
            selector: 'test-cmp',
            template: '<div dir></div>',
            imports: [StandaloneDir],
          })
          export class TestCmp {}
        `);
        env.driveMain();

        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('dependencies: [StandaloneDir]');
      });

      it('should consume standalone components from libraries', () => {
        env.write('lib.d.ts', `
          import {ɵɵComponentDeclaration} from '@angular/core';

          export declare class StandaloneCmp {
            static ɵcmp: ɵɵComponentDeclaration<StandaloneCmp, "standalone-cmp", never, {}, {}, never, never, true>;
          }
        `);
        env.write('test.ts', `
          import {Component} from '@angular/core';
          import {StandaloneCmp} from './lib';

          @Component({
            standalone: true,
            selector: 'test-cmp',
            template: '<standalone-cmp></standalone-cmp>',
            imports: [StandaloneCmp],
          })
          export class TestCmp {}
        `);
        env.driveMain();

        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('dependencies: [StandaloneCmp]');
      });

      it('should consume standalone pipes from libraries', () => {
        env.write('lib.d.ts', `
          import {ɵɵPipeDeclaration} from '@angular/core';

          export declare class StandalonePipe {
            transform(value: any): any;
            static ɵpipe: ɵɵPipeDeclaration<StandalonePipe, "standalone", true>;
          }
        `);
        env.write('test.ts', `
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
        `);
        env.driveMain();

        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('dependencies: [StandalonePipe]');
      });
    });

    describe('optimizations', () => {
      it('does emit standalone components in injector imports', () => {
        env.write('test.ts', `
          import {Component, NgModule} from '@angular/core';

          @Component({
            standalone: true,
            selector: 'standalone-cmp',
            template: '',
          })
          export class StandaloneCmp {}

          @NgModule({
            imports: [StandaloneCmp],
            exports: [StandaloneCmp],
          })
          export class Module {}
        `);
        env.driveMain();

        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('i0.ɵɵdefineInjector({ imports: [StandaloneCmp] });');
      });

      it('does not emit standalone directives or pipes in injector imports', () => {
        env.write('test.ts', `
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
        `);
        env.driveMain();

        const jsCode = env.getContents('test.js');
        expect(jsCode).toContain('i0.ɵɵdefineInjector({});');
      });
    });
  });
});
