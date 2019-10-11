/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';

import {create, getExternalFiles} from '../src/ts_plugin';
import {CompletionKind} from '../src/types';
import {MockTypescriptHost} from './test_utils';

describe('plugin', () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts']);
  const service = ts.createLanguageService(mockHost);
  const program = service.getProgram() !;
  const project = {
    projectService: {
      logger: {
        info() {},
        hasLevel: () => false,
      },
    },
    hasRoots: () => true,
  } as any;
  const plugin: ts.LanguageService = create({
    languageService: service,
    languageServiceHost: mockHost,
    project: project,
    serverHost: {} as any,
    config: {},
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
        .toBe(`Argument of type '"hello"' is not assignable to parameter of type 'number'.`);
  });

  it('should not report errors on tour of heroes', () => {
    const compilerDiags = service.getCompilerOptionsDiagnostics();
    expect(compilerDiags).toEqual([]);
    const sourceFiles = program.getSourceFiles().filter(f => !f.fileName.endsWith('.d.ts'));
    expect(sourceFiles.length).toBe(6);  // there are six .ts files in the test project
    for (const {fileName} of sourceFiles) {
      const syntacticDiags = service.getSyntacticDiagnostics(fileName);
      expect(syntacticDiags).toEqual([]);
      const semanticDiags = service.getSemanticDiagnostics(fileName);
      expect(semanticDiags).toEqual([]);
    }
  });

  it('should return external templates as external files', () => {
    const externalFiles = getExternalFiles(project);
    expect(externalFiles).toEqual(['/app/test.ng']);
  });

  it('should not report template errors on tour of heroes', () => {
    const filesWithTemplates = [
      // Ignore all '*-cases.ts' files as they intentionally contain errors.
      '/app/app.component.ts',
    ];
    for (const file of filesWithTemplates) {
      const diags = plugin.getSemanticDiagnostics(file);
      expect(diags).toEqual([]);
    }
  });

  it('should be able to get entity completions', () => {
    const fileName = '/app/app.component.ts';
    const marker = mockHost.getLocationMarkerFor(fileName, 'entity-amp');
    const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
    expectContain(completions, CompletionKind.ENTITY, ['&amp;', '&gt;', '&lt;', '&iota;']);
  });

  it('should be able to return html elements', () => {
    const fileName = '/app/app.component.ts';
    const locations = ['empty', 'start-tag-h1', 'h1-content', 'start-tag', 'start-tag-after-h'];
    for (const location of locations) {
      const marker = mockHost.getLocationMarkerFor(fileName, location);
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.ELEMENT, ['div', 'h1', 'h2', 'span']);
    }
  });

  it('should be able to return element directives', () => {
    const fileName = '/app/app.component.ts';
    const marker = mockHost.getLocationMarkerFor(fileName, 'empty');
    const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
    expectContain(completions, CompletionKind.COMPONENT, [
      'ng-form',
      'my-app',
      'ng-component',
      'test-comp',
    ]);
  });

  it('should be able to return h1 attributes', () => {
    const fileName = '/app/app.component.ts';
    const marker = mockHost.getLocationMarkerFor(fileName, 'h1-after-space');
    const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
    expectContain(completions, CompletionKind.HTML_ATTRIBUTE, [
      'class',
      'id',
      'onclick',
      'onmouseup',
    ]);
  });

  it('should be able to find common angular attributes', () => {
    const fileName = '/app/app.component.ts';
    const marker = mockHost.getLocationMarkerFor(fileName, 'div-attributes');
    const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
    expectContain(completions, CompletionKind.ATTRIBUTE, [
      '(click)',
      '[ngClass]',
      '*ngIf',
      '*ngFor',
    ]);
  });

  it('should be able to return attribute names with an incompete attribute', () => {
    const fileName = '/app/parsing-cases.ts';
    const marker = mockHost.getLocationMarkerFor(fileName, 'no-value-attribute');
    const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
    expectContain(completions, CompletionKind.HTML_ATTRIBUTE, ['id', 'class', 'dir', 'lang']);
  });

  it('should be able to return attributes of an incomplete element', () => {
    const fileName = '/app/parsing-cases.ts';
    {
      const marker = mockHost.getLocationMarkerFor(fileName, 'incomplete-open-lt');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.ELEMENT, ['a', 'div', 'p', 'span']);
    }
    {
      const marker = mockHost.getLocationMarkerFor(fileName, 'incomplete-open-a');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.ELEMENT, ['a', 'div', 'p', 'span']);
    }
    {
      const marker = mockHost.getLocationMarkerFor(fileName, 'incomplete-open-attr');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.HTML_ATTRIBUTE, ['id', 'class', 'href', 'name']);
    }
  });

  it('should be able to return completions with a missing closing tag', () => {
    const fileName = '/app/parsing-cases.ts';
    const marker = mockHost.getLocationMarkerFor(fileName, 'missing-closing');
    const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
    expectContain(completions, CompletionKind.ELEMENT, ['a', 'div', 'p', 'span', 'h1', 'h2']);
  });

  it('should be able to return common attributes of an unknown tag', () => {
    const fileName = '/app/parsing-cases.ts';
    const marker = mockHost.getLocationMarkerFor(fileName, 'unknown-element');
    const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
    expectContain(completions, CompletionKind.HTML_ATTRIBUTE, ['id', 'dir', 'lang']);
  });

  it('should be able to get the completions at the beginning of an interpolation', () => {
    const fileName = '/app/app.component.ts';
    const marker = mockHost.getLocationMarkerFor(fileName, 'h2-hero');
    const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
    expectContain(completions, CompletionKind.PROPERTY, ['title', 'hero']);
  });

  it('should not include private members of a class', () => {
    const fileName = '/app/app.component.ts';
    const marker = mockHost.getLocationMarkerFor(fileName, 'h2-hero');
    const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
    expect(completions).toBeDefined();
    const internal = completions !.entries.find(e => e.name === 'internal');
    expect(internal).toBeUndefined();
  });

  it('should be able to get the completions at the end of an interpolation', () => {
    const fileName = '/app/app.component.ts';
    const marker = mockHost.getLocationMarkerFor(fileName, 'sub-end');
    const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
    expectContain(completions, CompletionKind.PROPERTY, ['title', 'hero']);
  });

  it('should be able to get the completions in a property', () => {
    const fileName = '/app/app.component.ts';
    const marker = mockHost.getLocationMarkerFor(fileName, 'h2-name');
    const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
    expectContain(completions, CompletionKind.PROPERTY, ['id', 'name']);
  });

  it('should be able to get completions in an empty interpolation', () => {
    const fileName = '/app/parsing-cases.ts';
    const marker = mockHost.getLocationMarkerFor(fileName, 'empty-interpolation');
    const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
    expectContain(completions, CompletionKind.PROPERTY, ['title', 'subTitle']);
  });

  describe('data binding', () => {
    it('should be able to complete property value', () => {
      const fileName = '/app/parsing-cases.ts';
      const marker = mockHost.getLocationMarkerFor(fileName, 'property-binding-model');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.PROPERTY, ['test']);
    });

    it('should be able to complete an event', () => {
      const fileName = '/app/parsing-cases.ts';
      const marker = mockHost.getLocationMarkerFor(fileName, 'event-binding-model');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.METHOD, ['modelChanged']);
    });

    it('should be able to complete a two-way binding', () => {
      const fileName = '/app/parsing-cases.ts';
      const marker = mockHost.getLocationMarkerFor(fileName, 'two-way-binding-model');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.PROPERTY, ['test']);
    });
  });

  describe('with a *ngFor', () => {
    it('should include a let for empty attribute', () => {
      const fileName = '/app/parsing-cases.ts';
      const marker = mockHost.getLocationMarkerFor(fileName, 'for-empty');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.KEY, ['let', 'of']);
    });

    it('should suggest NgForRow members for let initialization expression', () => {
      const fileName = '/app/parsing-cases.ts';
      const marker = mockHost.getLocationMarkerFor(fileName, 'for-let-i-equal');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.PROPERTY, [
        '$implicit',
        'ngForOf',
        'index',
        'count',
        'first',
        'last',
        'even',
        'odd',
      ]);
    });

    it('should include a let', () => {
      const fileName = '/app/parsing-cases.ts';
      const marker = mockHost.getLocationMarkerFor(fileName, 'for-let');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.KEY, ['let', 'of']);
    });

    it('should include an "of"', () => {
      const fileName = '/app/parsing-cases.ts';
      const marker = mockHost.getLocationMarkerFor(fileName, 'for-of');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.KEY, ['let', 'of']);
    });

    it('should include field reference', () => {
      const fileName = '/app/parsing-cases.ts';
      const marker = mockHost.getLocationMarkerFor(fileName, 'for-people');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.PROPERTY, ['people']);
    });

    it('should include person in the let scope', () => {
      const fileName = '/app/parsing-cases.ts';
      const marker = mockHost.getLocationMarkerFor(fileName, 'for-interp-person');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.VARIABLE, ['person']);
    });

    // TODO: Enable when we can infer the element type of the ngFor
    // it(`should include determine person's type as Person`, () => {
    //   contains('/app/parsing-cases.ts', 'for-interp-name', 'name', 'age');
    //   contains('/app/parsing-cases.ts', 'for-interp-age', 'name', 'age');
    // });
  });

  describe('for pipes', () => {
    it('should be able to get a list of pipe values', () => {
      const fileName = '/app/parsing-cases.ts';
      for (const location of ['before-pipe', 'in-pipe', 'after-pipe']) {
        const marker = mockHost.getLocationMarkerFor(fileName, location);
        const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
        expectContain(completions, CompletionKind.PIPE, [
          'async',
          'uppercase',
          'lowercase',
          'titlecase',
        ]);
      }
    });

    it('should be able to resolve lowercase', () => {
      const fileName = '/app/expression-cases.ts';
      const marker = mockHost.getLocationMarkerFor(fileName, 'string-pipe');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.METHOD, [
        'charAt',
        'replace',
        'substring',
        'toLowerCase',
      ]);
    });
  });

  describe('with references', () => {
    it('should list references', () => {
      const fileName = '/app/parsing-cases.ts';
      const marker = mockHost.getLocationMarkerFor(fileName, 'test-comp-content');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.REFERENCE, ['div', 'test1', 'test2']);
    });

    it('should reference the component', () => {
      const fileName = '/app/parsing-cases.ts';
      const marker = mockHost.getLocationMarkerFor(fileName, 'test-comp-after-test');
      const completions = plugin.getCompletionsAtPosition(fileName, marker.start, undefined);
      expectContain(completions, CompletionKind.PROPERTY, ['name', 'testEvent']);
    });

    // TODO: Enable when we have a flag that indicates the project targets the DOM
    // it('should reference the element if no component', () => {
    //   contains('/app/parsing-cases.ts', 'test-comp-after-div', 'innerText');
    // });
  });

  describe('semantic errors', () => {
    describe('in expression-cases.ts', () => {
      const fileName = '/app/expression-cases.ts';
      const diags = plugin.getSemanticDiagnostics(fileName).map(d => d.messageText);

      it('should report access to an unknown field', () => {
        expect(diags).toContain(
            `Identifier 'foo' is not defined. ` +
            `The component declaration, template variable declarations, ` +
            `and element references do not contain such a member`);
      });

      it('should report access to an unknown sub-field', () => {
        expect(diags).toContain(
            `Identifier 'nam' is not defined. 'Person' does not contain such a member`);
      });

      it('should report access to a private member', () => {
        expect(diags).toContain(`Identifier 'myField' refers to a private member of the component`);
      });

      it('should report numeric operator errors',
         () => { expect(diags).toContain('Expected a numeric type'); });
    });

    describe('in ng-for-cases.ts', () => {
      const fileName = '/app/ng-for-cases.ts';
      const diags = plugin.getSemanticDiagnostics(fileName).map(d => d.messageText);

      it('should report an unknown field', () => {
        expect(diags).toContain(
            `Identifier 'people_1' is not defined. ` +
            `The component declaration, template variable declarations, ` +
            `and element references do not contain such a member`);
      });
      it('should report an unknown context reference', () => {
        expect(diags).toContain(`The template context does not define a member called 'even_1'`);
      });
      it('should report an unknown value in a key expression', () => {
        expect(diags).toContain(
            `Identifier 'trackBy_1' is not defined. ` +
            `The component declaration, template variable declarations, ` +
            `and element references do not contain such a member`);
      });
    });

    describe('in ng-if-cases.ts', () => {
      const fileName = '/app/ng-if-cases.ts';
      const diags = plugin.getSemanticDiagnostics(fileName).map(d => d.messageText);

      it('should report an implicit context reference', () => {
        expect(diags).toContain(`The template context does not define a member called 'unknown'`);
      });
    });

    describe(`with config 'angularOnly = true`, () => {
      const ngLS = create({
        languageService: service,
        languageServiceHost: mockHost,
        project: project,
        serverHost: {} as any,
        config: {
          angularOnly: true,
        },
      });

      it('should not produce TypeScript diagnostics', () => {
        const fileName = '/bar.ts';
        mockHost.addScript(fileName, `
          function add(x: number) {
            return x + 42;
          }
          add('hello');
        `);
        const diags = ngLS.getSemanticDiagnostics(fileName);
        expect(diags.length).toBe(0);
      });

      it('should not report template errors on TOH', () => {
        const filesWithTemplates = [
          // Ignore all '*-cases.ts' files as they intentionally contain errors.
          '/app/app.component.ts',
          '/app/test.ng',
        ];
        for (const file of filesWithTemplates) {
          const diags = ngLS.getSemanticDiagnostics(file);
          expect(diags).toEqual([]);
        }
      });

      it('should be able to get entity completions', () => {
        const fileName = '/app/app.component.ts';
        const marker = mockHost.getLocationMarkerFor(fileName, 'entity-amp');
        const completions = ngLS.getCompletionsAtPosition(fileName, marker.start, undefined);
        expectContain(completions, CompletionKind.ENTITY, ['&amp;', '&gt;', '&lt;', '&iota;']);
      });

      it('should report template diagnostics', () => {
        // TODO(kyliau): Rename these to end with '-error.ts'
        const fileName = '/app/expression-cases.ts';
        const diagnostics = ngLS.getSemanticDiagnostics(fileName);
        expect(diagnostics.map(d => d.messageText)).toEqual([
          `Identifier 'foo' is not defined. The component declaration, template variable declarations, and element references do not contain such a member`,
          `Identifier 'nam' is not defined. 'Person' does not contain such a member`,
          `Identifier 'myField' refers to a private member of the component`,
          `Expected a numeric type`,
        ]);
      });
    });
  });

});

function expectContain(
    completions: ts.CompletionInfo | undefined, kind: CompletionKind, names: string[]) {
  expect(completions).toBeDefined();
  expect(completions !.entries).toEqual(jasmine.arrayContaining(names.map(name => {
    return jasmine.objectContaining({name, kind});
  }) as any));
}
