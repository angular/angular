/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {PotentialImportMode} from '../../src/ngtsc/typecheck/api';
import ts from 'typescript';

import {DiagnosticCategoryLabel} from '../../src/ngtsc/core/api';
import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {absoluteFrom as _, getSourceFileOrError} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {
  expectCompleteReuse,
  getSourceCodeForDiagnostic,
  loadStandardTestFiles,
} from '../../src/ngtsc/testing';
import {factory as invalidBananaInBoxFactory} from '../../src/ngtsc/typecheck/extended/checks/invalid_banana_in_box';

import {NgtscTestEnvironment} from './env';
import {getClass} from './util';

const testFiles = loadStandardTestFiles({fakeCommon: true});

runInEachFileSystem(() => {
  describe('full type checking', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true, _enableTemplateTypeChecker: true});
    });

    describe('supports `getPrimaryAngularDecorator()` ', () => {
      it('for components', () => {
        env.write(
          'test.ts',
          `
		 import {Component} from '@angular/core';

		 @Component({
			 standalone: true,
			 selector: 'test-cmp',
			 template: '<div></div>',
		 })
		 export class TestCmp {}
		 `,
        );
        const {program, checker} = env.driveTemplateTypeChecker();
        const sf = program.getSourceFile(_('/test.ts'));
        expect(sf).not.toBeNull();
        const decorator = checker.getPrimaryAngularDecorator(getClass(sf!, 'TestCmp'));
        expect(decorator?.getText()).toContain(`selector: 'test-cmp'`);
      });

      it('for pipes', () => {
        env.write(
          'test.ts',
          `
		 import {Pipe, PipeTransform} from '@angular/core';

		 @Pipe({name: 'expPipe'})
		 export class ExpPipe implements PipeTransform {
			 transform(value: number, exponent = 1): number {
				 return Math.pow(value, exponent);
			 }
		 }
		 `,
        );
        const {program, checker} = env.driveTemplateTypeChecker();
        const sf = program.getSourceFile(_('/test.ts'));
        expect(sf).not.toBeNull();
        const decorator = checker.getPrimaryAngularDecorator(getClass(sf!, 'ExpPipe'));
        expect(decorator?.getText()).toContain(`name: 'expPipe'`);
      });

      it('for NgModules', () => {
        env.write(
          'test.ts',
          `
			 import {NgModule} from '@angular/core';

			 @NgModule({
				 declarations: [],
				 imports: [],
				 providers: [],
				 bootstrap: []
			 })
			 export class AppModule {}
		   `,
        );
        const {program, checker} = env.driveTemplateTypeChecker();
        const sf = program.getSourceFile(_('/test.ts'));
        expect(sf).not.toBeNull();
        const decorator = checker.getPrimaryAngularDecorator(getClass(sf!, 'AppModule'));
        expect(decorator?.getText()).toContain(`declarations: []`);
      });
    });

    describe('supports `getOwningNgModule()` ', () => {
      it('for components', () => {
        env.write(
          'test.ts',
          `
			  import {Component, NgModule} from '@angular/core';

			  @NgModule({
				  declarations: [AppCmp],
				  imports: [],
				  providers: [],
				  bootstrap: [AppCmp]
			  })
			  export class AppModule {}

			  @Component({
				  selector: 'app-cmp',
				  template: '<div></div>',
          standalone: false,
			  })
			  export class AppCmp {}
			`,
        );
        const {program, checker} = env.driveTemplateTypeChecker();
        const sf = program.getSourceFile(_('/test.ts'));
        expect(sf).not.toBeNull();
        const ngModuleKnownClass = getClass(sf!, 'AppModule');
        expect(ngModuleKnownClass).not.toBeNull();
        const ngModuleRetrievedClass = checker.getOwningNgModule(getClass(sf!, 'AppCmp'));
        expect(ngModuleRetrievedClass).toEqual(ngModuleKnownClass);
      });

      it('for standalone components (which should be null)', () => {
        env.write(
          'test.ts',
          `
			  import {Component, NgModule} from '@angular/core';

			  @NgModule({
				  declarations: [AppCmp],
				  imports: [],
				  providers: [],
				  bootstrap: [AppCmp]
			  })
			  export class AppModule {}

			  @Component({
				  selector: 'app-cmp',
				  template: '<div></div>',
				  standalone: true,
			  })
			  export class AppCmp {}
			`,
        );
        const {program, checker} = env.driveTemplateTypeChecker();
        const sf = program.getSourceFile(_('/test.ts'));
        expect(sf).not.toBeNull();
        const ngModuleKnownClass = getClass(sf!, 'AppModule');
        expect(ngModuleKnownClass).not.toBeNull();
        const ngModuleRetrievedClass = checker.getOwningNgModule(getClass(sf!, 'AppCmp'));
        expect(ngModuleRetrievedClass).toBe(null);
      });

      it('for pipes', () => {
        env.write(
          'test.ts',
          `
			  import {Component, NgModule, Pipe, PipeTransform} from '@angular/core';

			  @NgModule({
				  declarations: [ExpPipe],
				  imports: [],
				  providers: [],
			  })
			  export class PipeModule {}

			  @Pipe({name: 'expPipe'})
			  export class ExpPipe implements PipeTransform {
				  transform(value: number, exponent = 1): number {
					  return Math.pow(value, exponent);
				  }
			  }
			`,
        );
        const {program, checker} = env.driveTemplateTypeChecker();
        const sf = program.getSourceFile(_('/test.ts'));
        expect(sf).not.toBeNull();
        const ngModuleKnownClass = getClass(sf!, 'PipeModule');
        expect(ngModuleKnownClass).not.toBeNull();
        const ngModuleRetrievedClass = checker.getOwningNgModule(getClass(sf!, 'ExpPipe'));
        expect(ngModuleRetrievedClass).toEqual(ngModuleKnownClass);
      });
    });

    describe('can retrieve candidate directives` ', () => {
      it('which are out of scope', () => {
        env.write(
          'one.ts',
          `
		   import {Component} from '@angular/core';

		   @Component({
			   standalone: true,
			   selector: 'one-cmp',
			   template: '<div></div>',
		   })
		   export class OneCmp {}
		   `,
        );

        env.write(
          'two.ts',
          `
		   import {Component} from '@angular/core';

		   @Component({
			   standalone: true,
			   selector: 'two-cmp',
			   template: '<div></div>',
		   })
		   export class TwoCmp {}
		   `,
        );
        const {program, checker} = env.driveTemplateTypeChecker();
        const sf = program.getSourceFile(_('/one.ts'));
        expect(sf).not.toBeNull();
        const directives = checker.getPotentialTemplateDirectives(getClass(sf!, 'OneCmp'));
        expect(directives.map((d) => d.selector)).toContain('two-cmp');
      });
    });

    describe('can retrieve candidate pipes` ', () => {
      it('which are out of scope', () => {
        env.write(
          'one.ts',
          `
			 import {Pipe} from '@angular/core';

			 @Pipe({
				name: 'foo-pipe',
				standalone: true,
			  })
			  export class OnePipe {
			  }
			 `,
        );

        env.write(
          'two.ts',
          `
			 import {Component} from '@angular/core';

			 @Component({
				 standalone: true,
				 selector: 'two-cmp',
				 template: '<div></div>',
			 })
			 export class TwoCmp {}
			 `,
        );
        const {program, checker} = env.driveTemplateTypeChecker();
        const sf = program.getSourceFile(_('/one.ts'));
        expect(sf).not.toBeNull();
        const pipes = checker.getPotentialPipes(getClass(sf!, 'OnePipe'));
        expect(pipes.map((p) => p.name)).toContain('foo-pipe');
      });
    });

    describe('can generate imports` ', () => {
      it('for out of scope standalone components', () => {
        env.write(
          'one.ts',
          `
			 import {Component} from '@angular/core';

			 @Component({
				 standalone: true,
				 selector: 'one-cmp',
				 template: '<div></div>',
			 })
			 export class OneCmp {}
			 `,
        );

        env.write(
          'two.ts',
          `
			 import {Component} from '@angular/core';

			 @Component({
				 standalone: true,
				 selector: 'two-cmp',
				 template: '<div></div>',
			 })
			 export class TwoCmp {}
			 `,
        );
        const {program, checker} = env.driveTemplateTypeChecker();
        const sfOne = program.getSourceFile(_('/one.ts'));
        expect(sfOne).not.toBeNull();
        const OneCmpClass = getClass(sfOne!, 'OneCmp');

        const TwoCmpDir = checker
          .getPotentialTemplateDirectives(OneCmpClass)
          .filter((d) => d.selector === 'two-cmp')[0];
        const imports = checker.getPotentialImportsFor(
          TwoCmpDir.ref,
          OneCmpClass,
          PotentialImportMode.Normal,
        );

        expect(imports.length).toBe(1);
        expect(imports[0].moduleSpecifier).toBe('./two');
        expect(imports[0].symbolName).toBe('TwoCmp');
        expect(imports[0].isForwardReference).toBe(false);
      });

      it('for out of scope ngModules', () => {
        env.write(
          'one.ts',
          `
			 import {Component} from '@angular/core';

			 @Component({
				 standalone: true,
				 selector: 'one-cmp',
				 template: '<div></div>',
			 })
			 export class OneCmp {}
			 `,
        );

        env.write(
          'two.ts',
          `
			 import {Component} from '@angular/core';

			 @Component({
				 selector: 'two-cmp',
				 template: '<div></div>',
         standalone: false,
			 })
			 export class TwoCmp {}
			 `,
        );

        env.write(
          'twomod.ts',
          `
			import { NgModule } from '@angular/core';
			import { CommonModule } from '@angular/common';
			import { TwoCmp } from './two';

			@NgModule({
			declarations: [
				TwoCmp
			],
			exports: [
				TwoCmp
			],
			imports: [
				CommonModule
			]
			})
			export class TwoModule { }
			 `,
        );

        const {program, checker} = env.driveTemplateTypeChecker();
        const sfOne = program.getSourceFile(_('/one.ts'));
        expect(sfOne).not.toBeNull();
        const OneCmpClass = getClass(sfOne!, 'OneCmp');

        const TwoNgMod = checker
          .getPotentialTemplateDirectives(OneCmpClass)
          .filter((d) => d.selector === 'two-cmp')[0];
        const imports = checker.getPotentialImportsFor(
          TwoNgMod.ref,
          OneCmpClass,
          PotentialImportMode.Normal,
        );

        expect(imports.length).toBe(1);
        expect(imports[0].moduleSpecifier).toBe('./twomod');
        expect(imports[0].symbolName).toBe('TwoModule');
        expect(imports[0].isForwardReference).toBe(false);
      });

      it('for forward references in the same file', () => {
        env.write(
          'decls.ts',
          `
					import {Component} from '@angular/core';

					@Component({
						standalone: true,
						selector: 'one-cmp',
						template: '<div></div>',
					})
					export class OneCmp {}

					@Component({
						standalone: true,
						selector: 'two-cmp',
						template: '<div></div>',
					})
					export class TwoCmp {}
			 `,
        );
        const {program, checker} = env.driveTemplateTypeChecker();
        const sfOne = program.getSourceFile(_('/decls.ts'));
        expect(sfOne).not.toBeNull();
        const OneCmpClass = getClass(sfOne!, 'OneCmp');

        const TwoCmpDir = checker
          .getPotentialTemplateDirectives(OneCmpClass)
          .filter((d) => d.selector === 'two-cmp')[0];
        const imports = checker.getPotentialImportsFor(
          TwoCmpDir.ref,
          OneCmpClass,
          PotentialImportMode.Normal,
        );

        expect(imports.length).toBe(1);
        expect(imports[0].moduleSpecifier).toBeUndefined();
        expect(imports[0].symbolName).toBe('TwoCmp');
        expect(imports[0].isForwardReference).toBe(true);
      });
    });
  });
});
