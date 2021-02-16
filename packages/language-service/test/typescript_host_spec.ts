/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

import {TypeScriptServiceHost} from '../src/typescript_host';

import {findDirectiveMetadataByName, MockTypescriptHost} from './test_utils';


describe('TypeScriptServiceHost', () => {
  it('should be able to create a typescript host and analyze modules', () => {
    const tsLSHost = new MockTypescriptHost(['/app/main.ts']);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    const analyzedModules = ngLSHost.getAnalyzedModules();
    expect(analyzedModules.files.length).toBeGreaterThan(0);
    expect(analyzedModules.ngModules.length).toBeGreaterThan(0);
    expect(analyzedModules.ngModuleByPipeOrDirective.size).toBeGreaterThan(0);
    expect(analyzedModules.symbolsMissingModule).toEqual([]);
    // NgClass is defined in @angular/common, which is imported in main.ts
    const ngClass = findDirectiveMetadataByName(analyzedModules, 'NgClass');
    expect(ngClass).toBeDefined();
    // AppComponent is defined in app.component.ts
    const appComp = findDirectiveMetadataByName(analyzedModules, 'AppComponent');
    expect(appComp).toBeDefined();
  });

  it('should be able to analyze modules without a tsconfig.json file', () => {
    const tsLSHost = new MockTypescriptHost(['foo.ts']);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    const analyzedModules = ngLSHost.getAnalyzedModules();
    expect(analyzedModules.files.length).toBeGreaterThan(0);
    expect(analyzedModules.ngModules.length).toBe(0);
    expect(analyzedModules.ngModuleByPipeOrDirective.size).toBe(0);
    expect(analyzedModules.symbolsMissingModule).toEqual([]);
  });

  it('should not throw if there is no script names', () => {
    const tsLSHost = new MockTypescriptHost([]);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    const analyzedModules = ngLSHost.getAnalyzedModules();
    expect(analyzedModules.files.length).toBe(0);
    expect(analyzedModules.ngModules.length).toBe(0);
    expect(analyzedModules.ngModuleByPipeOrDirective.size).toBe(0);
    expect(analyzedModules.symbolsMissingModule).toBeUndefined();
  });

  it('should clear the caches if new script is added', () => {
    // First create a TypescriptHost with empty script names
    const tsLSHost = new MockTypescriptHost([]);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    const oldModules = ngLSHost.getAnalyzedModules();
    expect(oldModules.ngModules).toEqual([]);
    // Now add a script, this would change the program
    const fileName = '/app/main.ts';
    const content = tsLSHost.readFile(fileName)!;
    tsLSHost.addScript(fileName, content);
    // If the caches are not cleared, we would get back an empty array.
    // But if the caches are cleared then the analyzed modules will be non-empty.
    const newModules = ngLSHost.getAnalyzedModules();
    expect(newModules.ngModules.length).toBeGreaterThan(0);
  });

  it('should throw if getSourceFile is called on non-TS file', () => {
    const tsLSHost = new MockTypescriptHost([]);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    expect(() => {
      ngLSHost.getSourceFile('/src/test.ng');
    }).toThrowError('Non-TS source file requested: /src/test.ng');
  });

  it('should be able to find a single inline template', () => {
    const tsLSHost = new MockTypescriptHost(['/app/app.component.ts']);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    const templates = ngLSHost.getTemplates('/app/app.component.ts');
    expect(templates.length).toBe(1);
    const template = templates[0];
    expect(template.source).toContain('<h2>{{hero.name}} details!</h2>');
  });

  it('should be able to find multiple inline templates', () => {
    const tsLSHost = new MockTypescriptHost(['/app/parsing-cases.ts']);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    const templates = ngLSHost.getTemplates('/app/parsing-cases.ts');
    expect(templates.length).toBe(1);
  });

  it('should be able to find external template', () => {
    const tsLSHost = new MockTypescriptHost(['/app/main.ts']);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    ngLSHost.getAnalyzedModules();
    const templates = ngLSHost.getTemplates('/app/test.ng');
    expect(templates.length).toBe(1);
    const template = templates[0];
    expect(template.source).toContain('<h2>{{hero.name}} details!</h2>');
  });

  // https://github.com/angular/vscode-ng-language-service/issues/892
  it('should resolve external templates with `#` in the path', () => {
    const tsLSHost = new MockTypescriptHost(['/app/main.ts']);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    ngLSHost.getAnalyzedModules();
    expect(ngLSHost.getExternalTemplates() as string[]).toContain('/app/#inner/inner.html');
  });

  // https://github.com/angular/angular/issues/32301
  it('should clear caches when program changes', () => {
    const tsLSHost = new MockTypescriptHost(['/app/main.ts']);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    const fileName = '/app/app.component.ts';

    // Get initial state
    const oldModules = ngLSHost.getAnalyzedModules();
    // First, make sure there is no missing modules
    expect(oldModules.symbolsMissingModule).toEqual([]);
    // Expect to find AppComponent in the old modules
    const oldFile = oldModules.files.find(f => f.fileName === fileName);
    expect(oldFile!.directives.length).toBe(1);
    const appComp = oldFile!.directives[0];
    expect(appComp.name).toBe('AppComponent');
    expect(oldModules.ngModuleByPipeOrDirective.has(appComp)).toBe(true);

    // Now, override app.component.ts with a different component
    tsLSHost.override(fileName, `
      import {Component} from '@angular/core';

      @Component({
        template: '<div>Hello</div>',
      })
      export class HelloComponent {}
    `);
    // And override the containing NgModule to import the new component
    tsLSHost.override('/app/main.ts', `
      import {NgModule} from '@angular/core';
      import {HelloComponent} from './app.component';

      @NgModule({
        declarations: [
          HelloComponent,
        ]
      })
      export class AppModule {}
    `);
    // Get the new state
    const newModules = ngLSHost.getAnalyzedModules();
    // Make sure there's no missing modules. If caches are not cleared properly,
    // it will be a non-empty array
    expect(newModules.symbolsMissingModule).toEqual([]);
    // Expect to find HelloComponent in the new modules
    const newFile = newModules.files.find(f => f.fileName === fileName);
    expect(newFile!.directives.length).toBe(1);
    const helloComp = newFile!.directives[0];
    expect(helloComp.name).toBe('HelloComponent');
    expect(newModules.ngModuleByPipeOrDirective.has(helloComp)).toBe(true);
    expect(newModules.ngModuleByPipeOrDirective.has(appComp)).toBe(false);
  });

  it('should not clear caches when external template changes', () => {
    const tsLSHost = new MockTypescriptHost(['/app/main.ts']);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    const oldModules = ngLSHost.getAnalyzedModules();
    const oldProgram = ngLSHost.program;
    tsLSHost.override('/app/test.ng', '<div></div>');
    const newModules = ngLSHost.getAnalyzedModules();
    const newProgram = ngLSHost.program;
    // The program should not have changed since external templates are not part of
    // the TS source files. This is an improvement in TS 3.9 over previous versions.
    expect(newProgram).toBe(oldProgram);
    // And also analyzed modules should remain the same because none of the source
    // files have changed.
    expect(newModules).toBe(oldModules);
  });

  it('should not reload @angular/core on changes', () => {
    const tsLSHost = new MockTypescriptHost(['/app/main.ts']);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    const oldModules = ngLSHost.getAnalyzedModules();
    const ngCore = '/node_modules/@angular/core/core.d.ts';
    const originalContent = tsLSHost.readFile(ngCore);
    const oldVersion = tsLSHost.getScriptVersion(ngCore);
    tsLSHost.override(ngCore, originalContent + '\n\n');
    const newVersion = tsLSHost.getScriptVersion(ngCore);
    expect(newVersion).not.toBe(oldVersion);
    const newModules = ngLSHost.getAnalyzedModules();
    // Had @angular/core been invalidated, we'd get a different instance of
    // analyzed modules, with one module missing - ApplicationModule
    // The absence of this module will cause language service to stop working.
    expect(newModules).toBe(oldModules);
    const ApplicationModule =
        newModules.ngModules.find(m => m.type.reference.name === 'ApplicationModule');
    expect(ApplicationModule).toBeDefined();
  });

  it('should reload @angular/common on changes', () => {
    const tsLSHost = new MockTypescriptHost(['/app/main.ts']);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    const oldModules = ngLSHost.getAnalyzedModules();
    const ngCommon = '/node_modules/@angular/common/common.d.ts';
    const originalContent = tsLSHost.readFile(ngCommon);
    const oldVersion = tsLSHost.getScriptVersion(ngCommon);
    tsLSHost.override(ngCommon, originalContent + '\n\n');
    const newVersion = tsLSHost.getScriptVersion(ngCommon);
    expect(newVersion).not.toBe(oldVersion);
    const newModules = ngLSHost.getAnalyzedModules();
    // We get a new instance of analyzed modules
    expect(newModules).not.toBe(oldModules);
    // But the content should be exactly the same
    expect(newModules).toEqual(oldModules);
  });

  it('should recover from error in analyzing ng modules', () => {
    // First create a TypescriptHost with empty script names
    const tsLSHost = new MockTypescriptHost([]);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    const oldModules = ngLSHost.getAnalyzedModules();
    expect(oldModules.ngModules).toEqual([]);
    // Now add a script, this would change the program
    let fileName = '/app/main.ts';
    let content = `
    import {CommonModule} from '@angular/common';
    import {NgModule} from '@angular/core';

    @NgModule({
      entryComponents: [CommonModule],
    })
    export class AppModule {}
    `;
    tsLSHost.addScript(fileName, content);

    // If analyzing modules throws, the old modules should be returned.
    let newModules = ngLSHost.getAnalyzedModules();
    expect(newModules.ngModules).toEqual([]);
    expect(tsLSHost.errors).toEqual([
      'Analyzing NgModules failed. Error: CommonModule cannot be used as an entry component.'
    ]);

    content = `
    import {CommonModule} from '@angular/common';
    import {NgModule} from '@angular/core';

    @NgModule({})
    export class AppModule {}
    `;
    tsLSHost.override(fileName, content);
    // Check that analyzing modules successfully still works.
    newModules = ngLSHost.getAnalyzedModules();
    expect(newModules.ngModules.length).toBeGreaterThan(0);
  });

  it('should normalize path on Windows', () => {
    // Spy on the `path.resolve()` method called by the URL resolver and mimic
    // behavior on Windows.
    spyOn(path, 'resolve').and.callFake((...pathSegments: string[]) => {
      return path.win32.resolve(...pathSegments);
    });
    const tsLSHost = new MockTypescriptHost(['/app/main.ts']);
    const tsLS = ts.createLanguageService(tsLSHost);
    const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
    ngLSHost.getAnalyzedModules();
    const externalTemplates: string[] = ngLSHost.getExternalTemplates();
    // External templates should be normalized.
    expect(externalTemplates).toContain('/app/test.ng');
  });
});
