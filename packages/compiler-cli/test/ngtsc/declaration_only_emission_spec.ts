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
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles();

runInEachFileSystem(() => {
  describe('declaration-only emission', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      const tsconfig: {[key: string]: any} = {
        extends: '../tsconfig-base.json',
        compilerOptions: {
          baseUrl: '.',
          rootDirs: ['/app'],
          emitDeclarationOnly: true,
          noCheck: true,
        },
        angularCompilerOptions: {
          _experimentalAllowEmitDeclarationOnly: true,
        },
      };
      env.write('tsconfig.json', JSON.stringify(tsconfig, null, 2));
    });

    it('should show correct error message when using an @NgModule with an external reference in declarations', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {Comp} from './comp';

        @NgModule({
          declarations: [Comp],
        })
        export class CompModule {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.VALUE_HAS_WRONG_TYPE));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toContain(
        'Value at position 0 in the NgModule.declarations of CompModule is an external reference. ' +
          'External references in @NgModule declarations are not supported in experimental declaration-only emission mode',
      );
    });

    it('should show correct error message when using an @NgModule with an external reference in imports', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {Comp} from './comp';

        @NgModule({
          imports: [Comp],
        })
        export class CompModule {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.VALUE_HAS_WRONG_TYPE));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toContain(
        'Value at position 0 in the NgModule.imports of CompModule is an external reference. ' +
          'External references in @NgModule declarations are not supported in experimental declaration-only emission mode',
      );
    });

    it('should show correct error message when using an @NgModule with an external reference in exports', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {Comp} from './comp';

        @NgModule({
          exports: [Comp],
        })
        export class CompModule {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.VALUE_HAS_WRONG_TYPE));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toContain(
        'Value at position 0 in the NgModule.exports of CompModule is an external reference. ' +
          'External references in @NgModule declarations are not supported in experimental declaration-only emission mode',
      );
    });

    it('should show correct error message when using an @NgModule with an external reference in bootstrap', () => {
      env.write(
        'test.ts',
        `
        import {NgModule} from '@angular/core';
        import {Comp} from './comp';

        @NgModule({
          bootstrap: [Comp],
        })
        export class CompModule {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.VALUE_HAS_WRONG_TYPE));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toContain(
        'Value at position 0 in the NgModule.bootstrap of CompModule is an external reference. ' +
          'External references in @NgModule declarations are not supported in experimental declaration-only emission mode',
      );
    });

    it('should show correct error message when using an external reference in simple host directive on a component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import {Dir} from './dir';

        @Component({
          template: '',
          selector: 'host-comp',
          hostDirectives: [Dir],
        })
        export class HostComp {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toBe(
        'External references in host directives are not supported in experimental declaration-only emission mode',
      );
    });

    it('should show correct error message when using an external reference in host directive object on a component', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        import {Dir} from './dir';

        @Component({
          template: '',
          selector: 'host-comp',
          hostDirectives: [{
            directive: Dir,
          }],
        })
        export class HostComp {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toBe(
        'External references in host directives are not supported in experimental declaration-only emission mode',
      );
    });

    it('should show correct error message when using an external reference in simple host directive on a directive', () => {
      env.write(
        'test.ts',
        `
        import {Directive} from '@angular/core';
        import {Dir} from './dir';

        @Directive({
          selector: '[host-dir]',
          hostDirectives: [Dir],
        })
        export class HostDir {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toBe(
        'External references in host directives are not supported in experimental declaration-only emission mode',
      );
    });

    it('should show correct error message when using an external reference in host directive object on a directive', () => {
      env.write(
        'test.ts',
        `
        import {Directive} from '@angular/core';
        import {Dir} from './dir';

        @Directive({
          selector: '[host-dir]',
          hostDirectives: [{
            directive: Dir,
          }],
        })
        export class HostDir {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.LOCAL_COMPILATION_UNSUPPORTED_EXPRESSION));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toBe(
        'External references in host directives are not supported in experimental declaration-only emission mode',
      );
    });

    it('should show correct error message when using an @Input decorator with a transform function', () => {
      env.write(
        'test.ts',
        `
        import {booleanAttribute, Component, Input} from '@angular/core';

        @Component({template: '', selector: 'comp'})
        export class Comp {
          @Input({ transform: booleanAttribute }) decoratedInput!: boolean;
        }
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.DECORATOR_UNEXPECTED));
      const errorMessage = ts.flattenDiagnosticMessageText(errors[0].messageText, '\n');
      expect(errorMessage).toContain(
        '@Input decorators with a transform function are not supported in experimental declaration-only emission mode',
      );
      expect(errorMessage).toContain(
        `Consider converting 'Comp.decoratedInput' to an input signal`,
      );
    });

    it('should show correct error message when using custom decorators', () => {
      env.write(
        'test.ts',
        `
        import {Component} from '@angular/core';
        
        export function Custom() {
          return function(target: any) {};
        }
        
        @Custom()
        @Component({template: '', selector: 'comp'})
        export class Comp {}
        `,
      );

      const errors = env.driveDiagnostics();

      expect(errors.length).toBe(1);
      expect(errors[0].code).toBe(ngErrorCode(ErrorCode.DECORATOR_UNEXPECTED));
      expect(ts.flattenDiagnosticMessageText(errors[0].messageText, '\n')).toBe(
        'In experimental declaration-only emission mode, Angular does not support custom decorators. Ensure all class decorators are from Angular.',
      );
    });
  });
});
