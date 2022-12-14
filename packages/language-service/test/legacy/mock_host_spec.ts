/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript/lib/tsserverlibrary';

import {APP_COMPONENT, APP_MAIN, MockService, setup, TEST_SRCDIR} from './mock_host';

describe('mock host', () => {
  let service: MockService;
  let project: ts.server.Project;
  let tsLS: ts.LanguageService;

  beforeAll(() => {
    const {project: _project, service: _service, tsLS: _tsLS} = setup();
    project = _project;
    service = _service;
    tsLS = _tsLS;
  });

  beforeEach(() => {
    service.reset();
  });

  it('can load test project from Bazel runfiles', () => {
    expect(project).toBeInstanceOf(ts.server.ConfiguredProject);
    const configPath = (project as ts.server.ConfiguredProject).getConfigFilePath();
    expect(configPath.substring(TEST_SRCDIR.length))
        .toBe('/angular/packages/language-service/test/legacy/project/tsconfig.json');
    const program = tsLS.getProgram();
    expect(program).toBeDefined();
    const sourceFiles = program!.getSourceFiles().map(sf => {
      const {fileName} = sf;
      if (fileName.startsWith(TEST_SRCDIR)) {
        return fileName.substring(TEST_SRCDIR.length);
      }
      return fileName;
    });
    expect(sourceFiles).toEqual(jasmine.arrayContaining([
      // This shows that module resolution works
      '/angular/packages/common/src/common.d.ts',
      '/angular/packages/core/src/core.d.ts',
      '/angular/packages/forms/src/forms.d.ts',
      // This shows that project files are present
      '/angular/packages/language-service/test/legacy/project/app/app.component.ts',
      '/angular/packages/language-service/test/legacy/project/app/main.ts',
      '/angular/packages/language-service/test/legacy/project/app/parsing-cases.ts',
    ]));
  });

  it('produces no TS error for test project', () => {
    const errors = project.getAllProjectErrors();
    expect(errors).toEqual([]);
    const globalErrors = project.getGlobalProjectErrors();
    expect(globalErrors).toEqual([]);
    const diags = tsLS.getSemanticDiagnostics(APP_MAIN);
    expect(diags).toEqual([]);
  });

  it('can overwrite test file', () => {
    service.overwrite(APP_MAIN, `const x: string = 0`);
    const scriptInfo = service.getScriptInfo(APP_MAIN);
    expect(getText(scriptInfo)).toBe('const x: string = 0');
  });

  describe('overwrite()', () => {
    it('will return the cursor position', () => {
      const {position} = service.overwrite(APP_MAIN, `const fo¦o = 'hello world';`);
      expect(position).toBe(8);
    });

    it('will remove the cursor in overwritten text', () => {
      const {text} = service.overwrite(APP_MAIN, `const fo¦o = 'hello world';`);
      expect(text).toBe(`const foo = 'hello world';`);
    });

    it('will update script info without cursor', () => {
      const {text} = service.overwrite(APP_MAIN, `const fo¦o = 'hello world';`);
      const scriptInfo = service.getScriptInfo(APP_MAIN);
      const snapshot = getText(scriptInfo);
      expect(snapshot).toBe(`const foo = 'hello world';`);
      expect(snapshot).toBe(text);
    });

    it('will throw if there is more than one cursor', () => {
      expect(() => service.overwrite(APP_MAIN, `const f¦oo = 'hello wo¦rld';`))
          .toThrowError(/matches more than one occurrence in text/);
    });

    it('will return -1 if cursor is not present', () => {
      const {position} = service.overwrite(APP_MAIN, `const foo = 'hello world';`);
      expect(position).toBe(-1);
    });
  });

  describe('overwriteInlineTemplate()', () => {
    it('will return the cursor position', () => {
      const {position, text} = service.overwriteInlineTemplate(APP_COMPONENT, `{{ fo¦o }}`);
      // The position returned should be relative to the start of the source
      // file, not the start of the template.
      expect(position).not.toBe(5);
      expect(text.substring(position, position + 4)).toBe('o }}');
    });

    it('will remove the cursor in overwritten text', () => {
      const {text} = service.overwriteInlineTemplate(APP_COMPONENT, `{{ fo¦o }}`);
      expect(text).toContain(`{{ foo }}`);
    });

    it('will return the entire content of the source file', () => {
      const {text} = service.overwriteInlineTemplate(APP_COMPONENT, `{{ foo }}`);
      expect(text).toContain(`@Component`);
    });

    it('will update script info without cursor', () => {
      service.overwriteInlineTemplate(APP_COMPONENT, `{{ fo¦o }}`);
      const scriptInfo = service.getScriptInfo(APP_COMPONENT);
      expect(getText(scriptInfo)).toContain(`{{ foo }}`);
    });

    it('will throw if there is no template in file', () => {
      expect(() => service.overwriteInlineTemplate(APP_MAIN, `{{ foo }}`))
          .toThrowError(/does not contain a component with template/);
    });

    it('will throw if there is more than one cursor', () => {
      expect(() => service.overwriteInlineTemplate(APP_COMPONENT, `{{ f¦o¦o }}`))
          .toThrowError(/matches more than one occurrence in text/);
    });

    it('will return -1 if cursor is not present', () => {
      const {position} = service.overwriteInlineTemplate(APP_COMPONENT, `{{ foo }}`);
      expect(position).toBe(-1);
    });

    it('will throw if there is more than one component with template', () => {
      service.overwrite(APP_COMPONENT, `
        import {Component} from '@angular/core';

        @Component({
          template: \`<h1></h1>\`,
        })
        export class ComponentA {}

        @Component({
          template: \`<h2></h2>\`,
        })
        export class ComponentB {}
      `);
      expect(() => service.overwriteInlineTemplate(APP_COMPONENT, `<p></p>`))
          .toThrowError(/matches more than one occurrence in text/);
    });
  });
});

function getText(scriptInfo: ts.server.ScriptInfo): string {
  const snapshot = scriptInfo.getSnapshot();
  return snapshot.getText(0, snapshot.getLength());
}
