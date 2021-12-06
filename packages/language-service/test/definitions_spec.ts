/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {assertFileNames, assertTextSpans, humanizeDocumentSpanLike, LanguageServiceTestEnv, Project} from '../testing';

describe('definitions', () => {
  let env: LanguageServiceTestEnv;

  describe('when an input has a dollar sign', () => {
    const files = {
      'app.ts': `
	 import {Component, NgModule, Input} from '@angular/core';

	 @Component({selector: 'dollar-cmp', template: ''})
	 export class DollarCmp {
	   @Input() obs$!: string;
	 }
 
	 @Component({template: '<dollar-cmp [obs$]="greeting"></dollar-cmp>'})
	 export class AppCmp {
	   greeting = 'hello';
	 }
 
	 @NgModule({declarations: [AppCmp, DollarCmp]})
	 export class AppModule {}
       `,
    };

    beforeEach(() => {
      initMockFileSystem('Native');
      env = LanguageServiceTestEnv.setup();
    });

    it('can get definitions for input', () => {
      const project = env.addProject('test', files, {strictTemplates: false});
      const definitions = getDefinitionsAndAssertBoundSpan(project, 'app.ts', '[o¦bs$]="greeting"');
      expect(definitions!.length).toEqual(1);

      assertTextSpans(definitions, ['obs$']);
      assertFileNames(definitions, ['app.ts']);
    });

    it('can get definitions for component', () => {
      const project = env.addProject('test', files, {strictTemplates: false});
      const definitions = getDefinitionsAndAssertBoundSpan(project, 'app.ts', '<dollar-cm¦p');
      expect(definitions!.length).toEqual(1);

      assertTextSpans(definitions, ['DollarCmp']);
      assertFileNames(definitions, ['app.ts']);
    });
  });

  describe('when a selector and input of a directive have a dollar sign', () => {
    it('can get definitions', () => {
      initMockFileSystem('Native');
      env = LanguageServiceTestEnv.setup();
      const files = {
        'app.ts': `
	 import {Component, Directive, NgModule, Input} from '@angular/core';

	 @Directive({selector: '[dollar\\\\$]', template: ''})
	 export class DollarDir {
	   @Input() dollar$!: string;
	 }
 
	 @Component({template: '<div [dollar$]="greeting"></div>'})
	 export class AppCmp {
	   greeting = 'hello';
	 }
 
	 @NgModule({declarations: [AppCmp, DollarDir]})
	 export class AppModule {}
       `,
      };
      const project = env.addProject('test', files, {strictTemplates: false});
      const definitions =
          getDefinitionsAndAssertBoundSpan(project, 'app.ts', '[dollar¦$]="greeting"');
      expect(definitions!.length).toEqual(2);

      assertTextSpans(definitions, ['dollar$', 'DollarDir']);
      assertFileNames(definitions, ['app.ts']);
    });
  });

  function getDefinitionsAndAssertBoundSpan(project: Project, file: string, targetText: string) {
    const template = project.openFile(file);
    env.expectNoSourceDiagnostics();
    project.expectNoTemplateDiagnostics('app.ts', 'AppCmp');

    template.moveCursorToText(targetText);
    const defAndBoundSpan = template.getDefinitionAndBoundSpan();
    expect(defAndBoundSpan).toBeTruthy();
    expect(defAndBoundSpan!.definitions).toBeTruthy();
    return defAndBoundSpan!.definitions!.map(d => humanizeDocumentSpanLike(d, env));
  }
});
