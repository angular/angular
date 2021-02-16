/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import * as ts from 'typescript';
import {DisplayInfoKind, unsafeCastDisplayInfoKindToScriptElementKind} from '../display_parts';
import {LanguageService} from '../language_service';

import {extractCursorInfo, LanguageServiceTestEnvironment} from './env';

const DIR_WITH_INPUT = {
  'Dir': `
    @Directive({
      selector: '[dir]',
      inputs: ['myInput']
    })
    export class Dir {
      myInput!: string;
    }
  `
};

const DIR_WITH_OUTPUT = {
  'Dir': `
    @Directive({
      selector: '[dir]',
      outputs: ['myOutput']
    })
    export class Dir {
      myInput!: any;
    }
  `
};

const DIR_WITH_TWO_WAY_BINDING = {
  'Dir': `
    @Directive({
      selector: '[dir]',
      inputs: ['model', 'otherInput'],
      outputs: ['modelChange', 'otherOutput'],
    })
    export class Dir {
      model!: any;
      modelChange!: any;
      otherInput!: any;
      otherOutput!: any;
    }
  `
};

const NG_FOR_DIR = {
  'NgFor': `
    @Directive({
      selector: '[ngFor][ngForOf]',
    })
    export class NgFor {
      constructor(ref: TemplateRef<any>) {}

      ngForOf!: any;
    }
  `
};

const DIR_WITH_SELECTED_INPUT = {
  'Dir': `
    @Directive({
      selector: '[myInput]',
      inputs: ['myInput']
    })
    export class Dir {
      myInput!: string;
    }
  `
};

const SOME_PIPE = {
  'SomePipe': `
    @Pipe({
      name: 'somePipe',
    })
    export class SomePipe {
      transform(value: string): string {
        return value;
      }
    }
   `
};

describe('completions', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  describe('in the global scope', () => {
    it('should be able to complete an interpolation', () => {
      const {ngLS, fileName, cursor} = setup('{{ti¦}}', `title!: string; hero!: number;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to complete an empty interpolation', () => {
      const {ngLS, fileName, cursor} = setup('{{ ¦ }}', `title!: string; hero!: number;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to complete a property binding', () => {
      const {ngLS, fileName, cursor} =
          setup('<h1 [model]="ti¦"></h1>', `title!: string; hero!: number;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to complete an empty property binding', () => {
      const {ngLS, fileName, cursor} =
          setup('<h1 [model]="¦"></h1>', `title!: string; hero!: number;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to retrieve details for completions', () => {
      const {ngLS, fileName, cursor} = setup('{{ti¦}}', `
        /** This is the title of the 'AppCmp' Component. */
        title!: string;
        /** This comment should not appear in the output of this test. */
        hero!: number;
      `);
      const details = ngLS.getCompletionEntryDetails(
          fileName, cursor, 'title', /* formatOptions */ undefined,
          /* preferences */ undefined)!;
      expect(details).toBeDefined();
      expect(toText(details.displayParts)).toEqual('(property) AppCmp.title: string');
      expect(toText(details.documentation))
          .toEqual('This is the title of the \'AppCmp\' Component.');
    });

    it('should return reference completions when available', () => {
      const {ngLS, fileName, cursor} = setup(`<div #todo></div>{{t¦}}`, `title!: string;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
      expectContain(completions, DisplayInfoKind.REFERENCE, ['todo']);
    });

    it('should return variable completions when available', () => {
      const {ngLS, fileName, cursor} = setup(
          `<div *ngFor="let hero of heroes">
            {{h¦}}
          </div>
        `,
          `heroes!: {name: string}[];`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['heroes']);
      expectContain(completions, DisplayInfoKind.VARIABLE, ['hero']);
    });

    it('should return completions inside an event binding', () => {
      const {ngLS, fileName, cursor} = setup(`<button (click)='t¦'></button>`, `title!: string;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });

    it('should return completions inside an empty event binding', () => {
      const {ngLS, fileName, cursor} = setup(`<button (click)='¦'></button>`, `title!: string;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });

    it('should return completions inside the RHS of a two-way binding', () => {
      const {ngLS, fileName, cursor} = setup(`<h1 [(model)]="t¦"></h1>`, `title!: string;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });

    it('should return completions inside an empty RHS of a two-way binding', () => {
      const {ngLS, fileName, cursor} = setup(`<h1 [(model)]="¦"></h1>`, `title!: string;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });
  });

  describe('in an expression scope', () => {
    it('should return completions in a property access expression', () => {
      const {ngLS, fileName, cursor} =
          setup(`{{name.f¦}}`, `name!: {first: string; last: string;};`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        last: ts.ScriptElementKind.memberVariableElement,
      });
    });

    it('should return completions in an empty property access expression', () => {
      const {ngLS, fileName, cursor} =
          setup(`{{name.¦}}`, `name!: {first: string; last: string;};`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        last: ts.ScriptElementKind.memberVariableElement,
      });
    });

    it('should return completions in a property write expression', () => {
      const {ngLS, fileName, cursor} = setup(
          `<button (click)="name.fi¦ = 'test"></button>`, `name!: {first: string; last: string;};`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        last: ts.ScriptElementKind.memberVariableElement,
      });
    });

    it('should return completions in a method call expression', () => {
      const {ngLS, fileName, cursor} =
          setup(`{{name.f¦()}}`, `name!: {first: string; full(): string;};`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        full: ts.ScriptElementKind.memberFunctionElement,
      });
    });

    it('should return completions in an empty method call expression', () => {
      const {ngLS, fileName, cursor} =
          setup(`{{name.¦()}}`, `name!: {first: string; full(): string;};`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        full: ts.ScriptElementKind.memberFunctionElement,
      });
    });

    it('should return completions in a safe property navigation context', () => {
      const {ngLS, fileName, cursor} =
          setup(`{{name?.f¦}}`, `name?: {first: string; last: string;};`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        last: ts.ScriptElementKind.memberVariableElement,
      });
    });

    it('should return completions in an empty safe property navigation context', () => {
      const {ngLS, fileName, cursor} =
          setup(`{{name?.¦}}`, `name?: {first: string; last: string;};`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        last: ts.ScriptElementKind.memberVariableElement,
      });
    });

    it('should return completions in a safe method call context', () => {
      const {ngLS, fileName, cursor} =
          setup(`{{name?.f¦()}}`, `name!: {first: string; full(): string;};`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        full: ts.ScriptElementKind.memberFunctionElement,
      });
    });

    it('should return completions in an empty safe method call context', () => {
      const {ngLS, fileName, cursor} =
          setup(`{{name?.¦()}}`, `name!: {first: string; full(): string;};`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        full: ts.ScriptElementKind.memberFunctionElement,
      });
    });
  });

  describe('element tag scope', () => {
    it('should return DOM completions', () => {
      const {ngLS, fileName, cursor} = setup(`<div¦>`, '');
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(
          completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ELEMENT),
          ['div', 'span']);
    });

    it('should return directive completions', () => {
      const OTHER_DIR = {
        'OtherDir': `
            /** This is another directive. */
            @Directive({selector: 'other-dir'})
            export class OtherDir {}
          `,
      };
      const {ngLS, fileName, cursor} = setup(`<div¦>`, '', OTHER_DIR);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(
          completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
          ['other-dir']);

      const details =
          ngLS.getCompletionEntryDetails(fileName, cursor, 'other-dir', undefined, undefined)!;
      expect(details).toBeDefined();
      expect(ts.displayPartsToString(details.displayParts))
          .toEqual('(directive) AppModule.OtherDir');
      expect(ts.displayPartsToString(details.documentation!)).toEqual('This is another directive.');
    });

    it('should return component completions', () => {
      const OTHER_CMP = {
        'OtherCmp': `
            /** This is another component. */
            @Component({selector: 'other-cmp', template: 'unimportant'})
            export class OtherCmp {}
          `,
      };
      const {ngLS, fileName, cursor} = setup(`<div¦>`, '', OTHER_CMP);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(
          completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.COMPONENT),
          ['other-cmp']);


      const details =
          ngLS.getCompletionEntryDetails(fileName, cursor, 'other-cmp', undefined, undefined)!;
      expect(details).toBeDefined();
      expect(ts.displayPartsToString(details.displayParts))
          .toEqual('(component) AppModule.OtherCmp');
      expect(ts.displayPartsToString(details.documentation!)).toEqual('This is another component.');
    });

    describe('element attribute scope', () => {
      describe('dom completions', () => {
        it('should return completions for a new element attribute', () => {
          const {ngLS, fileName, cursor} = setup(`<input ¦>`, '');

          const completions =
              ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
              ['value']);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['[value]']);
        });

        it('should return completions for a partial attribute', () => {
          const {ngLS, fileName, cursor, text} = setup(`<input val¦>`, '');

          const completions =
              ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
              ['value']);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['[value]']);
          expectReplacementText(completions, text, 'val');
        });

        it('should return completions for a partial property binding', () => {
          const {ngLS, fileName, cursor, text} = setup(`<input [val¦]>`, '');

          const completions =
              ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
          expectDoesNotContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
              ['value']);
          expectDoesNotContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['[value]']);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['value']);
          expectReplacementText(completions, text, 'val');
        });
      });

      describe('directive present', () => {
        it('should return directive input completions for a new attribute', () => {
          const {ngLS, fileName, cursor, text} = setup(`<input dir ¦>`, '', DIR_WITH_INPUT);

          const completions =
              ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['[myInput]']);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
              ['myInput']);
        });

        it('should return directive input completions for a partial attribute', () => {
          const {ngLS, fileName, cursor, text} = setup(`<input dir my¦>`, '', DIR_WITH_INPUT);

          const completions =
              ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['[myInput]']);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
              ['myInput']);
        });

        it('should return input completions for a partial property binding', () => {
          const {ngLS, fileName, cursor, text} = setup(`<input dir [my¦]>`, '', DIR_WITH_INPUT);

          const completions =
              ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['myInput']);
        });
      });

      describe('structural directive present', () => {
        it('should return structural directive completions for an empty attribute', () => {
          const {ngLS, fileName, cursor, text} = setup(`<li ¦>`, '', NG_FOR_DIR);

          const completions =
              ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
              ['*ngFor']);
        });

        it('should return structural directive completions for an existing non-structural attribute',
           () => {
             const {ngLS, fileName, cursor, text} = setup(`<li ng¦>`, '', NG_FOR_DIR);

             const completions =
                 ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
             expectContain(
                 completions,
                 unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
                 ['*ngFor']);
             expectReplacementText(completions, text, 'ng');
           });

        it('should return structural directive completions for an existing structural attribute',
           () => {
             const {ngLS, fileName, cursor, text} = setup(`<li *ng¦>`, '', NG_FOR_DIR);

             const completions =
                 ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
             expectContain(
                 completions,
                 unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
                 ['ngFor']);
             expectReplacementText(completions, text, 'ng');
           });

        it('should return structural directive completions for just the structural marker', () => {
          const {ngLS, fileName, cursor, text} = setup(`<li *¦>`, '', NG_FOR_DIR);

          const completions =
              ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
              ['ngFor']);
          // The completion should not try to overwrite the '*'.
          expectReplacementText(completions, text, '');
        });
      });

      describe('directive not present', () => {
        it('should return input completions for a new attribute', () => {
          const {ngLS, fileName, cursor, text} = setup(`<input ¦>`, '', DIR_WITH_SELECTED_INPUT);

          const completions =
              ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
          // This context should generate two completions:
          //  * `[myInput]` as a property
          //  * `myInput` as an attribute
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['[myInput]']);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
              ['myInput']);
        });
      });

      it('should return input completions for a partial attribute', () => {
        const {ngLS, fileName, cursor, text} = setup(`<input my¦>`, '', DIR_WITH_SELECTED_INPUT);

        const completions =
            ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
        // This context should generate two completions:
        //  * `[myInput]` as a property
        //  * `myInput` as an attribute
        expectContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['[myInput]']);
        expectContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
            ['myInput']);
        expectReplacementText(completions, text, 'my');
      });

      it('should return input completions for a partial property binding', () => {
        const {ngLS, fileName, cursor, text} = setup(`<input [my¦]>`, '', DIR_WITH_SELECTED_INPUT);

        const completions =
            ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
        // This context should generate two completions:
        //  * `[myInput]` as a property
        //  * `myInput` as an attribute
        expectContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['myInput']);
        expectReplacementText(completions, text, 'my');
      });

      it('should return output completions for an empty binding', () => {
        const {ngLS, fileName, cursor, text} = setup(`<input dir ¦>`, '', DIR_WITH_OUTPUT);

        const completions =
            ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
        expectContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
            ['(myOutput)']);
      });

      it('should return output completions for a partial event binding', () => {
        const {ngLS, fileName, cursor, text} = setup(`<input dir (my¦)>`, '', DIR_WITH_OUTPUT);

        const completions =
            ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
        expectContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
            ['myOutput']);
        expectReplacementText(completions, text, 'my');
      });

      it('should return completions inside an LHS of a partially complete two-way binding', () => {
        const {ngLS, fileName, cursor, text} =
            setup(`<h1 dir [(mod¦)]></h1>`, ``, DIR_WITH_TWO_WAY_BINDING);
        const completions =
            ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
        expectReplacementText(completions, text, 'mod');

        expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['model']);

        // The completions should not include the events (because the 'Change' suffix is not used in
        // the two way binding) or inputs that do not have a corresponding name+'Change' output.
        expectDoesNotContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
            ['modelChange']);
        expectDoesNotContain(
            completions, ts.ScriptElementKind.memberVariableElement, ['otherInput']);
        expectDoesNotContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
            ['otherOutput']);
      });
    });
  });

  describe('pipe scope', () => {
    it('should complete a pipe binding', () => {
      const {ngLS, fileName, cursor, text} = setup(`{{ foo | some¦ }}`, '', SOME_PIPE);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(
          completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PIPE),
          ['somePipe']);
      expectReplacementText(completions, text, 'some');
    });

    it('should complete an empty pipe binding', () => {
      const {ngLS, fileName, cursor, text} = setup(`{{foo | ¦}}`, '', SOME_PIPE);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(
          completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PIPE),
          ['somePipe']);
      expectReplacementText(completions, text, '');
    });

    it('should not return extraneous completions', () => {
      const {ngLS, fileName, cursor, text} = setup(`{{ foo | some¦ }}`, '');
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expect(completions?.entries.length).toBe(0);
    });
  });
});

function expectContain(
    completions: ts.CompletionInfo|undefined, kind: ts.ScriptElementKind|DisplayInfoKind,
    names: string[]) {
  expect(completions).toBeDefined();
  for (const name of names) {
    expect(completions!.entries).toContain(jasmine.objectContaining({name, kind} as any));
  }
}

function expectAll(
    completions: ts.CompletionInfo|undefined,
    contains: {[name: string]: ts.ScriptElementKind|DisplayInfoKind}): void {
  expect(completions).toBeDefined();
  for (const [name, kind] of Object.entries(contains)) {
    expect(completions!.entries).toContain(jasmine.objectContaining({name, kind} as any));
  }
  expect(completions!.entries.length).toEqual(Object.keys(contains).length);
}

function expectDoesNotContain(
    completions: ts.CompletionInfo|undefined, kind: ts.ScriptElementKind|DisplayInfoKind,
    names: string[]) {
  expect(completions).toBeDefined();
  for (const name of names) {
    expect(completions!.entries).not.toContain(jasmine.objectContaining({name, kind} as any));
  }
}

function expectReplacementText(
    completions: ts.CompletionInfo|undefined, text: string, replacementText: string) {
  if (completions === undefined) {
    return;
  }

  for (const entry of completions.entries) {
    expect(entry.replacementSpan).toBeDefined();
    const completionReplaces =
        text.substr(entry.replacementSpan!.start, entry.replacementSpan!.length);
    expect(completionReplaces).toBe(replacementText);
  }
}

function toText(displayParts?: ts.SymbolDisplayPart[]): string {
  return (displayParts ?? []).map(p => p.text).join('');
}

function setup(
    templateWithCursor: string, classContents: string,
    otherDeclarations: {[name: string]: string} = {}): {
  env: LanguageServiceTestEnvironment,
  fileName: AbsoluteFsPath,
  AppCmp: ts.ClassDeclaration,
  ngLS: LanguageService,
  cursor: number,
  text: string,
} {
  const codePath = absoluteFrom('/test.ts');
  const templatePath = absoluteFrom('/test.html');

  const decls = ['AppCmp', ...Object.keys(otherDeclarations)];

  const otherDirectiveClassDecls = Object.values(otherDeclarations).join('\n\n');

  const {cursor, text: templateWithoutCursor} = extractCursorInfo(templateWithCursor);
  const env = LanguageServiceTestEnvironment.setup([
    {
      name: codePath,
      contents: `
        import {Component, Directive, NgModule, Pipe, TemplateRef} from '@angular/core';

        @Component({
          templateUrl: './test.html',
          selector: 'app-cmp',
        })
        export class AppCmp {
          ${classContents}
        }
        
        ${otherDirectiveClassDecls}

        @NgModule({
          declarations: [${decls.join(', ')}],
        })
        export class AppModule {}
        `,
      isRoot: true,
    },
    {
      name: templatePath,
      contents: templateWithoutCursor,
    }
  ]);
  return {
    env,
    fileName: templatePath,
    AppCmp: env.getClass(codePath, 'AppCmp'),
    ngLS: env.ngLS,
    text: templateWithoutCursor,
    cursor,
  };
}
