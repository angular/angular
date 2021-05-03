/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {create, getExternalFiles} from '../src/ts_plugin';
import {CompletionKind} from '../src/types';

import {MockTypescriptHost} from './test_utils';

const mockProject = {
  projectService: {
    logger: {
      info() {},
      hasLevel: () => false,
    },
  },
  hasRoots: () => true,
  fileExists: () => true,
} as any;

describe('plugin', () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts']);
  const tsLS = ts.createLanguageService(mockHost);
  const program = tsLS.getProgram()!;
  const plugin = create({
    languageService: tsLS,
    languageServiceHost: mockHost,
    project: mockProject,
    serverHost: {} as any,
    config: {},
  });

  beforeEach(() => {
    mockHost.reset();
  });

  it('should produce TypeScript diagnostics', () => {
    const fileName = '/foo.ts';
    mockHost.addScript(fileName, `
      function add(x: number) {
        return x + 42;
      }
      add('hello');
    `);
    const diags = plugin.getSemanticDiagnostics(fileName);
    expect(diags.length).toBe(1);
    expect(diags[0].messageText)
        .toBe(`Argument of type 'string' is not assignable to parameter of type 'number'.`);
  });

  it('should not report TypeScript errors on tour of heroes', () => {
    const compilerDiags = tsLS.getCompilerOptionsDiagnostics();
    expect(compilerDiags).toEqual([]);
    const sourceFiles = program.getSourceFiles().filter(f => !f.fileName.endsWith('.d.ts'));
    // there are four .ts files in the test project
    expect(sourceFiles.length).toBe(4);
    for (const {fileName} of sourceFiles) {
      const syntacticDiags = tsLS.getSyntacticDiagnostics(fileName);
      expect(syntacticDiags).toEqual([]);
      const semanticDiags = tsLS.getSemanticDiagnostics(fileName);
      expect(semanticDiags).toEqual([]);
    }
  });

  it('should not report template errors on tour of heroes', () => {
    const filesWithTemplates = [
      // Ignore all '*-cases.ts' files as they intentionally contain errors.
      '/app/app.component.ts',
    ];
    for (const fileName of filesWithTemplates) {
      const diags = plugin.getSemanticDiagnostics(fileName);
      expect(diags).toEqual([]);
    }
  });

  it('should respect paths configuration', () => {
    const SHARED_MODULE = '/app/foo/bar/shared.ts';
    const MY_COMPONENT = '/app/my.component.ts';
    mockHost.overrideOptions({
      baseUrl: '/app',
      paths: {'bar/*': ['foo/bar/*']},
    });
    mockHost.addScript(SHARED_MODULE, `
      export interface Node {
        children: Node[];
      }
    `);
    mockHost.addScript(MY_COMPONENT, `
      import { Component, NgModule } from '@angular/core';
      import { Node } from 'bar/shared';

      @Component({
        selector: 'my-component',
        template: '{{ tree.~{tree}children }}'
      })
      export class MyComponent {
        tree: Node = {
          children: [],
        };
      }

      @NgModule({
        declarations: [MyComponent],
      })
      export class MyModule {}
    `);
    // First, make sure there are no errors in newly added scripts.
    for (const fileName of [SHARED_MODULE, MY_COMPONENT]) {
      const syntacticDiags = plugin.getSyntacticDiagnostics(fileName);
      expect(syntacticDiags).toEqual([]);
      const semanticDiags = plugin.getSemanticDiagnostics(fileName);
      expect(semanticDiags).toEqual([]);
    }
    const marker = mockHost.getLocationMarkerFor(MY_COMPONENT, 'tree');
    const completions = plugin.getCompletionsAtPosition(MY_COMPONENT, marker.start, undefined);
    expect(completions).toBeDefined();
    expect(completions!.entries).toEqual([
      {
        name: 'children',
        kind: CompletionKind.PROPERTY as any,
        sortText: 'children',
        replacementSpan: {start: 182, length: 8},
        insertText: 'children',
      },
    ]);
  });

  it('should return external templates when getExternalFiles() is called', () => {
    const externalTemplates = getExternalFiles(mockProject);
    expect(new Set(externalTemplates)).toEqual(new Set([
      '/app/test.ng',
      '/app/#inner/inner.html',
    ]));
  });

  it('should not return external template that does not exist', () => {
    spyOn(mockProject, 'fileExists').and.returnValue(false);
    const externalTemplates = getExternalFiles(mockProject);
    expect(externalTemplates.length).toBe(0);
  });
});

describe(`with config 'angularOnly = true`, () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts']);
  const tsLS = ts.createLanguageService(mockHost);
  const plugin = create({
    languageService: tsLS,
    languageServiceHost: mockHost,
    project: mockProject,
    serverHost: {} as any,
    config: {
      angularOnly: true,
    },
  });

  it('should not produce TypeScript diagnostics', () => {
    const fileName = '/foo.ts';
    mockHost.addScript(fileName, `
      function add(x: number) {
        return x + 42;
      }
      add('hello');
    `);
    const diags = plugin.getSemanticDiagnostics(fileName);
    expect(diags).toEqual([]);
  });

  it('should not report template errors on TOH', () => {
    const filesWithTemplates = [
      // Ignore all '*-cases.ts' files as they intentionally contain errors.
      '/app/app.component.ts',
      '/app/test.ng',
    ];
    for (const fileName of filesWithTemplates) {
      const diags = plugin.getSemanticDiagnostics(fileName);
      expect(diags).toEqual([]);
    }
  });
});
