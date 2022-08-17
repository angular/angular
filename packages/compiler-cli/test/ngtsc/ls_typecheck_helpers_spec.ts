/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';

import {DiagnosticCategoryLabel} from '../../src/ngtsc/core/api';
import {ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {absoluteFrom as _, getSourceFileOrError} from '../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {expectCompleteReuse, getSourceCodeForDiagnostic, loadStandardTestFiles} from '../../src/ngtsc/testing';
import {factory as invalidBananaInBoxFactory} from '../../src/ngtsc/typecheck/extended/checks/invalid_banana_in_box';

import {NgtscTestEnvironment} from './env';
import {getClass} from './util';

const testFiles = loadStandardTestFiles({fakeCore: true, fakeCommon: true});



runInEachFileSystem(() => {
  describe('full type checking', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
      env.tsconfig({strictTemplates: true, _enableTemplateTypeChecker: true});
    });


    describe('supports `getPrimaryAngularDecorator()` ', () => {
      it('for components', () => {
        env.write('test.ts', `
		import {Component} from '@angular/core';

		@Component({
			standalone: true,
			selector: 'test-cmp',
			template: '<div></div>',
		})
		export class TestCmp {}
		`);
        const {program, checker} = env.driveTemplateTypeChecker();
        const sf = program.getSourceFile(_('/test.ts'));
        expect(sf).not.toBeNull();
        const decorator = checker.getPrimaryAngularDecorator(getClass(sf!, 'TestCmp'));
        expect(decorator?.getText()).toContain(`selector: 'test-cmp'`);
      });

      it('for pipes', () => {
        env.write('test.ts', `
		import {Pipe, PipeTransform} from '@angular/core';

		@Pipe({name: 'expPipe'})
		export class ExpPipe implements PipeTransform {
			transform(value: number, exponent = 1): number {
				return Math.pow(value, exponent);
			}
		}
		`);
        const {program, checker} = env.driveTemplateTypeChecker();
        const sf = program.getSourceFile(_('/test.ts'));
        expect(sf).not.toBeNull();
        const decorator = checker.getPrimaryAngularDecorator(getClass(sf!, 'ExpPipe'));
        expect(decorator?.getText()).toContain(`name: 'expPipe'`);
      });

      it('for NgModules', () => {
        env.write('test.ts', `
			import {NgModule} from '@angular/core';

			@NgModule({
				declarations: [],
				imports: [],
				providers: [],
				bootstrap: []
			})
			export class AppModule {}
		  `);
        const {program, checker} = env.driveTemplateTypeChecker();
        const sf = program.getSourceFile(_('/test.ts'));
        expect(sf).not.toBeNull();
        const decorator = checker.getPrimaryAngularDecorator(getClass(sf!, 'AppModule'));
        expect(decorator?.getText()).toContain(`declarations: []`);
      });
    });
  });
});
