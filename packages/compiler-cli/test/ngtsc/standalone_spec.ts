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
      env.tsconfig();
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
  });
});
