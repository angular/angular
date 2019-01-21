/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'reflect-metadata';

import * as ts from 'typescript';

import {create} from '../src/ts_plugin';

import {toh} from './test_data';
import {MockTypescriptHost} from './test_utils';

describe('plugin', () => {
  let documentRegistry = ts.createDocumentRegistry();
  let mockHost = new MockTypescriptHost(['/app/main.ts', '/app/parsing-cases.ts'], toh);
  let service = ts.createLanguageService(mockHost, documentRegistry);
  let program = service.getProgram();

  const mockProject = {projectService: {logger: {info: function() {}}}};

  it('should not report errors on tour of heroes', () => {
    expectNoDiagnostics(service.getCompilerOptionsDiagnostics());
    for (let source of program !.getSourceFiles()) {
      expectNoDiagnostics(service.getSyntacticDiagnostics(source.fileName));
      expectNoDiagnostics(service.getSemanticDiagnostics(source.fileName));
    }
  });


  let plugin = create(
      {ts: ts, languageService: service, project: mockProject, languageServiceHost: mockHost});

  it('should not report template errors on tour of heroes', () => {
    for (let source of program !.getSourceFiles()) {
      // Ignore all 'cases.ts' files as they intentionally contain errors.
      if (!source.fileName.endsWith('cases.ts')) {
        expectNoDiagnostics(plugin.getSemanticDiagnostics(source.fileName));
      }
    }
  });

  it('should be able to get entity completions',
     () => { contains('app/app.component.ts', 'entity-amp', '&amp;', '&gt;', '&lt;', '&iota;'); });

  it('should be able to return html elements', () => {
    let htmlTags = ['h1', 'h2', 'div', 'span'];
    let locations = ['empty', 'start-tag-h1', 'h1-content', 'start-tag', 'start-tag-after-h'];
    for (let location of locations) {
      contains('app/app.component.ts', location, ...htmlTags);
    }
  });

  it('should be able to return element directives',
     () => { contains('app/app.component.ts', 'empty', 'my-app'); });

  it('should be able to return h1 attributes',
     () => { contains('app/app.component.ts', 'h1-after-space', 'id', 'dir', 'lang', 'onclick'); });

  it('should be able to find common angular attributes', () => {
    contains('app/app.component.ts', 'div-attributes', '(click)', '[ngClass]', '*ngIf', '*ngFor');
  });

  it('should be able to return attribute names with an incompete attribute',
     () => { contains('app/parsing-cases.ts', 'no-value-attribute', 'id', 'dir', 'lang'); });

  it('should be able to return attributes of an incomplete element', () => {
    contains('app/parsing-cases.ts', 'incomplete-open-lt', 'a');
    contains('app/parsing-cases.ts', 'incomplete-open-a', 'a');
    contains('app/parsing-cases.ts', 'incomplete-open-attr', 'id', 'dir', 'lang');
  });

  it('should be able to return completions with a missing closing tag',
     () => { contains('app/parsing-cases.ts', 'missing-closing', 'h1', 'h2'); });

  it('should be able to return common attributes of an unknown tag',
     () => { contains('app/parsing-cases.ts', 'unknown-element', 'id', 'dir', 'lang'); });

  it('should be able to get the completions at the beginning of an interpolation',
     () => { contains('app/app.component.ts', 'h2-hero', 'hero', 'title'); });

  it('should not include private members of a class',
     () => { contains('app/app.component.ts', 'h2-hero', '-internal'); });

  it('should be able to get the completions at the end of an interpolation',
     () => { contains('app/app.component.ts', 'sub-end', 'hero', 'title'); });

  it('should be able to get the completions in a property',
     () => { contains('app/app.component.ts', 'h2-name', 'name', 'id'); });

  it('should be able to get a list of pipe values', () => {
    contains('app/parsing-cases.ts', 'before-pipe', 'lowercase', 'uppercase');
    contains('app/parsing-cases.ts', 'in-pipe', 'lowercase', 'uppercase');
    contains('app/parsing-cases.ts', 'after-pipe', 'lowercase', 'uppercase');
  });

  it('should be able to get completions in an empty interpolation',
     () => { contains('app/parsing-cases.ts', 'empty-interpolation', 'title', 'subTitle'); });

  describe('with attributes', () => {
    it('should be able to complete property value',
       () => { contains('app/parsing-cases.ts', 'property-binding-model', 'test'); });
    it('should be able to complete an event',
       () => { contains('app/parsing-cases.ts', 'event-binding-model', 'modelChanged'); });
    it('should be able to complete a two-way binding',
       () => { contains('app/parsing-cases.ts', 'two-way-binding-model', 'test'); });
  });

  describe('with a *ngFor', () => {
    it('should include a let for empty attribute',
       () => { contains('app/parsing-cases.ts', 'for-empty', 'let'); });
    it('should suggest NgForRow members for let initialization expression', () => {
      contains(
          'app/parsing-cases.ts', 'for-let-i-equal', 'index', 'count', 'first', 'last', 'even',
          'odd');
    });
    it('should include a let', () => { contains('app/parsing-cases.ts', 'for-let', 'let'); });
    it('should include an "of"', () => { contains('app/parsing-cases.ts', 'for-of', 'of'); });
    it('should include field reference',
       () => { contains('app/parsing-cases.ts', 'for-people', 'people'); });
    it('should include person in the let scope',
       () => { contains('app/parsing-cases.ts', 'for-interp-person', 'person'); });
    // TODO: Enable when we can infer the element type of the ngFor
    // it('should include determine person\'s type as Person', () => {
    //   contains('app/parsing-cases.ts', 'for-interp-name', 'name', 'age');
    //   contains('app/parsing-cases.ts', 'for-interp-age', 'name', 'age');
    // });
  });

  describe('for pipes', () => {
    it('should be able to resolve lowercase',
       () => { contains('app/expression-cases.ts', 'string-pipe', 'substring'); });
  });

  describe('with references', () => {
    it('should list references',
       () => { contains('app/parsing-cases.ts', 'test-comp-content', 'test1', 'test2', 'div'); });
    it('should reference the component',
       () => { contains('app/parsing-cases.ts', 'test-comp-after-test', 'name'); });
    // TODO: Enable when we have a flag that indicates the project targets the DOM
    // it('should reference the element if no component', () => {
    //   contains('app/parsing-cases.ts', 'test-comp-after-div', 'innerText');
    // });
  });

  describe('for semantic errors', () => {
    it('should report access to an unknown field', () => {
      expectSemanticError(
          'app/expression-cases.ts', 'foo',
          'Identifier \'foo\' is not defined. The component declaration, template variable declarations, and element references do not contain such a member');
    });
    it('should report access to an unknown sub-field', () => {
      expectSemanticError(
          'app/expression-cases.ts', 'nam',
          'Identifier \'nam\' is not defined. \'Person\' does not contain such a member');
    });
    it('should report access to a private member', () => {
      expectSemanticError(
          'app/expression-cases.ts', 'myField',
          'Identifier \'myField\' refers to a private member of the component');
    });
    it('should report numeric operator errors',
       () => { expectSemanticError('app/expression-cases.ts', 'mod', 'Expected a numeric type'); });
    describe('in ngFor', () => {
      function expectError(locationMarker: string, message: string) {
        expectSemanticError('app/ng-for-cases.ts', locationMarker, message);
      }
      it('should report an unknown field', () => {
        expectError(
            'people_1',
            'Identifier \'people_1\' is not defined. The component declaration, template variable declarations, and element references do not contain such a member');
      });
      it('should report an unknown context reference', () => {
        expectError('even_1', 'The template context does not defined a member called \'even_1\'');
      });
      it('should report an unknown value in a key expression', () => {
        expectError(
            'trackBy_1',
            'Identifier \'trackBy_1\' is not defined. The component declaration, template variable declarations, and element references do not contain such a member');
      });
    });
    describe('in ngIf', () => {
      function expectError(locationMarker: string, message: string) {
        expectSemanticError('app/ng-if-cases.ts', locationMarker, message);
      }
      it('should report an implicit context reference', () => {
        expectError(
            'implicit', 'The template context does not defined a member called \'unknown\'');
      });
    });
  });

  function getMarkerLocation(fileName: string, locationMarker: string): number {
    const location = mockHost.getMarkerLocations(fileName) ![locationMarker];
    if (location == null) {
      throw new Error(`No marker ${locationMarker} found.`);
    }
    return location;
  }
  function contains(fileName: string, locationMarker: string, ...names: string[]) {
    const location = getMarkerLocation(fileName, locationMarker);
    expectEntries(
        locationMarker, plugin.getCompletionsAtPosition(fileName, location, undefined) !, ...names);
  }

  function expectEmpty(fileName: string, locationMarker: string) {
    const location = getMarkerLocation(fileName, locationMarker);
    expect(plugin.getCompletionsAtPosition(fileName, location, undefined) !.entries || []).toEqual([
    ]);
  }

  function expectSemanticError(fileName: string, locationMarker: string, message: string) {
    const start = getMarkerLocation(fileName, locationMarker);
    const end = getMarkerLocation(fileName, locationMarker + '-end');
    const errors = plugin.getSemanticDiagnostics(fileName);
    for (const error of errors) {
      if (error.messageText.toString().indexOf(message) >= 0) {
        expect(error.start).toEqual(start);
        expect(error.length).toEqual(end - start);
        return;
      }
    }
    throw new Error(`Expected error messages to contain ${message}, in messages:\n  ${errors
                        .map(e => e.messageText.toString())
                        .join(',\n  ')}`);
  }
});


function expectEntries(locationMarker: string, info: ts.CompletionInfo, ...names: string[]) {
  let entries: {[name: string]: boolean} = {};
  if (!info) {
    throw new Error(`Expected result from ${locationMarker} to include ${names.join(
        ', ')} but no result provided`);
  } else {
    for (let entry of info.entries) {
      entries[entry.name] = true;
    }
    let shouldContains = names.filter(name => !name.startsWith('-'));
    let shouldNotContain = names.filter(name => name.startsWith('-'));
    let missing = shouldContains.filter(name => !entries[name]);
    let present = shouldNotContain.map(name => name.substr(1)).filter(name => entries[name]);
    if (missing.length) {
      throw new Error(`Expected result from ${locationMarker
          } to include at least one of the following, ${missing
              .join(', ')}, in the list of entries ${info.entries.map(entry => entry.name)
              .join(', ')}`);
    }
    if (present.length) {
      throw new Error(`Unexpected member${present.length > 1 ? 's' :
                                                   ''
                                                   } included in result: ${present.join(', ')}`);
    }
  }
}

function expectNoDiagnostics(diagnostics: ts.Diagnostic[]) {
  for (const diagnostic of diagnostics) {
    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    if (diagnostic.file && diagnostic.start) {
      let {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.error(`${message}`);
    }
  }
  expect(diagnostics.length).toBe(0);
}
