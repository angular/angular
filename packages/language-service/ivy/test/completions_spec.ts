/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import * as ts from 'typescript';
import {DisplayInfoKind, unsafeCastDisplayInfoKindToScriptElementKind} from '../display_parts';

import {LanguageServiceTestEnv, OpenBuffer} from '../testing';

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

const DIR_WITH_UNION_TYPE_INPUT = {
  'Dir': `
    @Directive({
      selector: '[dir]',
      inputs: ['myInput']
    })
    export class Dir {
      myInput!: 'foo'|42|null|undefined
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

const DIR_WITH_BINDING_PROPERTY_NAME = {
  'Dir': `
    @Directive({
      selector: '[dir]',
      inputs: ['model: customModel'],
      outputs: ['update: customModelChange'],
    })
    export class Dir {
      model!: any;
      update!: any;
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

const UNION_TYPE_PIPE = {
  'UnionTypePipe': `
    @Pipe({
      name: 'unionTypePipe',
    })
    export class UnionTypePipe {
      transform(value: string, config: 'foo' | 'bar'): string {
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
      const {templateFile} = setup('{{ti}}', `title!: string; hero!: number;`);
      templateFile.moveCursorToText('{{ti¦}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to complete an empty interpolation', () => {
      const {templateFile} = setup('{{  }}', `title!: string; hero!52: number;`);
      templateFile.moveCursorToText('{{ ¦ }}');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to complete a property binding', () => {
      const {templateFile} = setup('<h1 [model]="ti"></h1>', `title!: string; hero!: number;`);
      templateFile.moveCursorToText('"ti¦');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to complete an empty property binding', () => {
      const {templateFile} = setup('<h1 [model]=""></h1>', `title!: string; hero!: number;`);
      templateFile.moveCursorToText('[model]="¦"');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to retrieve details for completions', () => {
      const {templateFile} = setup('{{ti}}', `
        /** This is the title of the 'AppCmp' Component. */
        title!: string;
        /** This comment should not appear in the output of this test. */
        hero!: number;
      `);
      templateFile.moveCursorToText('{{ti¦}}');
      const details = templateFile.getCompletionEntryDetails(
          'title', /* formatOptions */ undefined,
          /* preferences */ undefined)!;
      expect(details).toBeDefined();
      expect(toText(details.displayParts)).toEqual('(property) AppCmp.title: string');
      expect(toText(details.documentation))
          .toEqual('This is the title of the \'AppCmp\' Component.');
    });

    it('should return reference completions when available', () => {
      const {templateFile} = setup(`<div #todo></div>{{t}}`, `title!: string;`);
      templateFile.moveCursorToText('{{t¦}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
      expectContain(completions, DisplayInfoKind.REFERENCE, ['todo']);
    });

    it('should return variable completions when available', () => {
      const {templateFile} = setup(
          `<div *ngFor="let hero of heroes">
            {{h}}
          </div>
        `,
          `heroes!: {name: string}[];`);
      templateFile.moveCursorToText('{{h¦}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['heroes']);
      expectContain(completions, DisplayInfoKind.VARIABLE, ['hero']);
    });

    it('should return completions inside an event binding', () => {
      const {templateFile} = setup(`<button (click)='t'></button>`, `title!: string;`);
      templateFile.moveCursorToText(`(click)='t¦'`);
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });

    it('should return completions inside an empty event binding', () => {
      const {templateFile} = setup(`<button (click)=''></button>`, `title!: string;`);
      templateFile.moveCursorToText(`(click)='¦'`);
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });

    it('should return completions inside the RHS of a two-way binding', () => {
      const {templateFile} = setup(`<h1 [(model)]="t"></h1>`, `title!: string;`);
      templateFile.moveCursorToText('[(model)]="t¦"');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });

    it('should return completions inside an empty RHS of a two-way binding', () => {
      const {templateFile} = setup(`<h1 [(model)]=""></h1>`, `title!: string;`);
      templateFile.moveCursorToText('[(model)]="¦"');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });

    it('should return completions of string literals, number literals, `true`, `false`, `null` and `undefined`',
       () => {
         const {templateFile} = setup(`<input dir [myInput]="">`, '', DIR_WITH_UNION_TYPE_INPUT);
         templateFile.moveCursorToText('dir [myInput]="¦">');

         const completions = templateFile.getCompletionsAtPosition();
         expectContain(completions, ts.ScriptElementKind.string, [`'foo'`, '42']);
         expectContain(completions, ts.ScriptElementKind.keyword, ['null']);
         expectContain(completions, ts.ScriptElementKind.variableElement, ['undefined']);
         expectDoesNotContain(completions, ts.ScriptElementKind.parameterElement, ['ctx']);
       });

    it('should return completions of string literals, number literals, `true`, `false`, `null` and `undefined` when the user tries to modify the symbol',
       () => {
         const {templateFile} = setup(`<input dir [myInput]="a">`, '', DIR_WITH_UNION_TYPE_INPUT);
         templateFile.moveCursorToText('dir [myInput]="a¦">');

         const completions = templateFile.getCompletionsAtPosition();
         expectContain(completions, ts.ScriptElementKind.string, [`'foo'`, '42']);
         expectContain(completions, ts.ScriptElementKind.keyword, ['null']);
         expectContain(completions, ts.ScriptElementKind.variableElement, ['undefined']);
         expectDoesNotContain(completions, ts.ScriptElementKind.parameterElement, ['ctx']);
       });
  });

  describe('in an expression scope', () => {
    it('should return completions in a property access expression', () => {
      const {templateFile} = setup(`{{name.f}}`, `name!: {first: string; last: string;};`);
      templateFile.moveCursorToText('{{name.f¦}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        last: ts.ScriptElementKind.memberVariableElement,
      });
    });

    it('should return completions in an empty property access expression', () => {
      const {templateFile} = setup(`{{name.}}`, `name!: {first: string; last: string;};`);
      templateFile.moveCursorToText('{{name.¦}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        last: ts.ScriptElementKind.memberVariableElement,
      });
    });

    it('should return completions in a property write expression', () => {
      const {templateFile} = setup(
          `<button (click)="name.fi = 'test"></button>`, `name!: {first: string; last: string;};`);
      templateFile.moveCursorToText('name.fi¦');
      const completions = templateFile.getCompletionsAtPosition();
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        last: ts.ScriptElementKind.memberVariableElement,
      });
    });

    it('should return completions in a method call expression', () => {
      const {templateFile} = setup(`{{name.f()}}`, `name!: {first: string; full(): string;};`);
      templateFile.moveCursorToText('{{name.f¦()}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        full: ts.ScriptElementKind.memberFunctionElement,
      });
    });

    it('should return completions in an empty method call expression', () => {
      const {templateFile} = setup(`{{name.()}}`, `name!: {first: string; full(): string;};`);
      templateFile.moveCursorToText('{{name.¦()}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        full: ts.ScriptElementKind.memberFunctionElement,
      });
    });

    it('should return completions in a safe property navigation context', () => {
      const {templateFile} = setup(`{{name?.f}}`, `name?: {first: string; last: string;};`);
      templateFile.moveCursorToText('{{name?.f¦}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        last: ts.ScriptElementKind.memberVariableElement,
      });
    });

    it('should return completions in an empty safe property navigation context', () => {
      const {templateFile} = setup(`{{name?.}}`, `name?: {first: string; last: string;};`);
      templateFile.moveCursorToText('{{name?.¦}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        last: ts.ScriptElementKind.memberVariableElement,
      });
    });

    it('should return completions in a safe method call context', () => {
      const {templateFile} = setup(`{{name?.f()}}`, `name!: {first: string; full(): string;};`);
      templateFile.moveCursorToText('{{name?.f¦()}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        full: ts.ScriptElementKind.memberFunctionElement,
      });
    });

    it('should return completions in an empty safe method call context', () => {
      const {templateFile} = setup(`{{name?.()}}`, `name!: {first: string; full(): string;};`);
      templateFile.moveCursorToText('{{name?.¦()}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectAll(completions, {
        first: ts.ScriptElementKind.memberVariableElement,
        full: ts.ScriptElementKind.memberFunctionElement,
      });
    });
  });

  describe('element tag scope', () => {
    it('should not return DOM completions for external template', () => {
      const {templateFile} = setup(`<div>`, '');
      templateFile.moveCursorToText('<div¦>');
      const completions = templateFile.getCompletionsAtPosition();
      expectDoesNotContain(
          completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ELEMENT),
          ['div', 'span']);
    });

    it('should not return DOM completions for inline template', () => {
      const {appFile} = setupInlineTemplate(`<div>`, '');
      appFile.moveCursorToText('<div¦>');
      const completions = appFile.getCompletionsAtPosition();
      expectDoesNotContain(
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
      const {templateFile} = setup(`<div>`, '', OTHER_DIR);
      templateFile.moveCursorToText('<div¦>');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(
          completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
          ['other-dir']);

      const details = templateFile.getCompletionEntryDetails('other-dir')!;
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
      const {templateFile} = setup(`<div>`, '', OTHER_CMP);
      templateFile.moveCursorToText('<div¦>');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(
          completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.COMPONENT),
          ['other-cmp']);


      const details = templateFile.getCompletionEntryDetails('other-cmp')!;
      expect(details).toBeDefined();
      expect(ts.displayPartsToString(details.displayParts))
          .toEqual('(component) AppModule.OtherCmp');
      expect(ts.displayPartsToString(details.documentation!)).toEqual('This is another component.');
    });

    it('should return completions for an incomplete tag', () => {
      const OTHER_CMP = {
        'OtherCmp': `
            /** This is another component. */
            @Component({selector: 'other-cmp', template: 'unimportant'})
            export class OtherCmp {}
          `,
      };
      const {templateFile} = setup(`<other`, '', OTHER_CMP);
      templateFile.moveCursorToText('<other¦');

      const completions = templateFile.getCompletionsAtPosition();
      expectContain(
          completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.COMPONENT),
          ['other-cmp']);
    });

    it('should return completions with a blank open tag', () => {
      const OTHER_CMP = {
        'OtherCmp': `
            @Component({selector: 'other-cmp', template: 'unimportant'})
            export class OtherCmp {}
          `,
      };
      const {templateFile} = setup(`<`, '', OTHER_CMP);
      templateFile.moveCursorToText('<¦');

      const completions = templateFile.getCompletionsAtPosition();
      expectContain(
          completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.COMPONENT),
          ['other-cmp']);
    });

    it('should return completions with a blank open tag a character before', () => {
      const OTHER_CMP = {
        'OtherCmp': `
            @Component({selector: 'other-cmp', template: 'unimportant'})
            export class OtherCmp {}
          `,
      };
      const {templateFile} = setup(`a <`, '', OTHER_CMP);
      templateFile.moveCursorToText('a <¦');

      const completions = templateFile.getCompletionsAtPosition();
      expectContain(
          completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.COMPONENT),
          ['other-cmp']);
    });

    it('should not return completions when cursor is not after the open tag', () => {
      const OTHER_CMP = {
        'OtherCmp': `
            @Component({selector: 'other-cmp', template: 'unimportant'})
            export class OtherCmp {}
          `,
      };
      const {templateFile} = setup(`\n\n<         `, '', OTHER_CMP);
      templateFile.moveCursorToText('< ¦');

      const completions = templateFile.getCompletionsAtPosition();
      expect(completions).toBeUndefined();


      const details = templateFile.getCompletionEntryDetails('other-cmp')!;
      expect(details).toBeUndefined();
    });

    describe('element attribute scope', () => {
      describe('dom completions', () => {
        it('should return dom property completions in external template', () => {
          const {templateFile} = setup(`<input >`, '');
          templateFile.moveCursorToText('<input ¦>');

          const completions = templateFile.getCompletionsAtPosition();
          expectDoesNotContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
              ['value']);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['[value]']);
        });

        it('should return completions for a new element property', () => {
          const {appFile} = setupInlineTemplate(`<input >`, '');
          appFile.moveCursorToText('<input ¦>');

          const completions = appFile.getCompletionsAtPosition();
          expectDoesNotContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
              ['value']);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['[value]']);
        });

        it('should return completions for a partial attribute', () => {
          const {appFile} = setupInlineTemplate(`<input val>`, '');
          appFile.moveCursorToText('<input val¦>');

          const completions = appFile.getCompletionsAtPosition();
          expectDoesNotContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
              ['value']);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['[value]']);
          expectReplacementText(completions, appFile.contents, 'val');
        });

        it('should return completions for a partial property binding', () => {
          const {appFile} = setupInlineTemplate(`<input [val]>`, '');
          appFile.moveCursorToText('[val¦]');

          const completions = appFile.getCompletionsAtPosition();
          expectDoesNotContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
              ['value']);
          expectDoesNotContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['[value]']);
          expectDoesNotContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['value']);
          expectReplacementText(completions, appFile.contents, 'val');
        });
      });

      describe('directive present', () => {
        it('should return directive input completions for a new attribute', () => {
          const {templateFile} = setup(`<input dir >`, '', DIR_WITH_INPUT);
          templateFile.moveCursorToText('dir ¦>');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['[myInput]']);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
              ['myInput']);
        });

        it('should return directive input completions for a partial attribute', () => {
          const {templateFile} = setup(`<input dir my>`, '', DIR_WITH_INPUT);
          templateFile.moveCursorToText('my¦>');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['[myInput]']);
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
              ['myInput']);
        });

        it('should return input completions for a partial property binding', () => {
          const {templateFile} = setup(`<input dir [my]>`, '', DIR_WITH_INPUT);
          templateFile.moveCursorToText('[my¦]');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
              ['myInput']);
        });
      });

      describe('structural directive present', () => {
        it('should return structural directive completions for an empty attribute', () => {
          const {templateFile} = setup(`<li >`, '', NG_FOR_DIR);
          templateFile.moveCursorToText('<li ¦>');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
              ['*ngFor']);
        });

        it('should return structural directive completions for an existing non-structural attribute',
           () => {
             const {templateFile} = setup(`<li ng>`, '', NG_FOR_DIR);
             templateFile.moveCursorToText('<li ng¦>');

             const completions = templateFile.getCompletionsAtPosition();
             expectContain(
                 completions,
                 unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
                 ['*ngFor']);
             expectReplacementText(completions, templateFile.contents, 'ng');
           });

        it('should return structural directive completions for an existing structural attribute',
           () => {
             const {templateFile} = setup(`<li *ng>`, '', NG_FOR_DIR);
             templateFile.moveCursorToText('*ng¦>');

             const completions = templateFile.getCompletionsAtPosition();
             expectContain(
                 completions,
                 unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
                 ['ngFor']);
             expectReplacementText(completions, templateFile.contents, 'ng');
             const details = templateFile.getCompletionEntryDetails(
                 'ngFor', /* formatOptions */ undefined,
                 /* preferences */ undefined)!;
             expect(toText(details.displayParts)).toEqual('(directive) NgFor.NgFor: NgFor');
           });

        it('should return structural directive completions for just the structural marker', () => {
          const {templateFile} = setup(`<li *>`, '', NG_FOR_DIR);
          templateFile.moveCursorToText('*¦>');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
              completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
              ['ngFor']);
          // The completion should not try to overwrite the '*'.
          expectReplacementText(completions, templateFile.contents, '');
        });
      });

      describe('directive not present', () => {
        it('should return input completions for a new attribute', () => {
          const {templateFile} = setup(`<input >`, '', DIR_WITH_SELECTED_INPUT);
          templateFile.moveCursorToText('¦>');

          const completions = templateFile.getCompletionsAtPosition();
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
        const {templateFile} = setup(`<input my>`, '', DIR_WITH_SELECTED_INPUT);
        templateFile.moveCursorToText('my¦>');

        const completions = templateFile.getCompletionsAtPosition();
        // This context should generate two completions:
        //  * `[myInput]` as a property
        //  * `myInput` as an attribute
        expectContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['[myInput]']);
        expectContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
            ['myInput']);
        expectReplacementText(completions, templateFile.contents, 'my');
      });

      it('should return input completions for a partial property binding', () => {
        const {templateFile} = setup(`<input [my]>`, '', DIR_WITH_SELECTED_INPUT);
        templateFile.moveCursorToText('[my¦');

        const completions = templateFile.getCompletionsAtPosition();
        // This context should generate two completions:
        //  * `[myInput]` as a property
        //  * `myInput` as an attribute
        expectContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['myInput']);
        expectReplacementText(completions, templateFile.contents, 'my');
      });

      it('should return output completions for an empty binding', () => {
        const {templateFile} = setup(`<input dir >`, '', DIR_WITH_OUTPUT);
        templateFile.moveCursorToText('¦>');

        const completions = templateFile.getCompletionsAtPosition();
        expectContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
            ['(myOutput)']);
      });

      it('should return output completions for a partial event binding', () => {
        const {templateFile} = setup(`<input dir (my)>`, '', DIR_WITH_OUTPUT);
        templateFile.moveCursorToText('(my¦)');

        const completions = templateFile.getCompletionsAtPosition();
        expectContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
            ['myOutput']);
        expectReplacementText(completions, templateFile.contents, 'my');
      });

      it('should return completions inside an LHS of a partially complete two-way binding', () => {
        const {templateFile} = setup(`<h1 dir [(mod)]></h1>`, ``, DIR_WITH_TWO_WAY_BINDING);
        templateFile.moveCursorToText('[(mod¦)]');
        const completions = templateFile.getCompletionsAtPosition();
        expectReplacementText(completions, templateFile.contents, 'mod');

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

      it('should return input completions for a binding property name', () => {
        const {templateFile} =
            setup(`<h1 dir [customModel]></h1>`, ``, DIR_WITH_BINDING_PROPERTY_NAME);
        templateFile.moveCursorToText('[customModel¦]');
        const completions = templateFile.getCompletionsAtPosition();
        expectReplacementText(completions, templateFile.contents, 'customModel');

        expectContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['customModel']);
      });

      it('should return output completions for a binding property name', () => {
        const {templateFile} =
            setup(`<h1 dir (customModel)></h1>`, ``, DIR_WITH_BINDING_PROPERTY_NAME);
        templateFile.moveCursorToText('(customModel¦)');
        const completions = templateFile.getCompletionsAtPosition();
        expectReplacementText(completions, templateFile.contents, 'customModel');

        expectContain(
            completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
            ['customModelChange']);
      });
    });
  });

  describe('pipe scope', () => {
    it('should complete a pipe binding', () => {
      const {templateFile} = setup(`{{ foo | some¦ }}`, '', SOME_PIPE);
      templateFile.moveCursorToText('some¦');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(
          completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PIPE),
          ['somePipe']);
      expectReplacementText(completions, templateFile.contents, 'some');
    });

    it('should complete an empty pipe binding', () => {
      const {templateFile} = setup(`{{foo | }}`, '', SOME_PIPE);
      templateFile.moveCursorToText('{{foo | ¦}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(
          completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PIPE),
          ['somePipe']);
      expectReplacementText(completions, templateFile.contents, '');
    });

    it('should not return extraneous completions', () => {
      const {templateFile} = setup(`{{ foo | some }}`, '');
      templateFile.moveCursorToText('{{ foo | some¦ }}');
      const completions = templateFile.getCompletionsAtPosition();
      expect(completions?.entries.length).toBe(0);
    });
  });

  describe('literal primitive scope', () => {
    it('should complete a string union types in square brackets binding', () => {
      const {templateFile} = setup(`<input dir [myInput]="'foo'">`, '', DIR_WITH_UNION_TYPE_INPUT);
      templateFile.moveCursorToText(`[myInput]="'foo¦'"`);
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.string, ['foo']);
      expectReplacementText(completions, templateFile.contents, 'foo');
    });

    it('should complete a string union types in binding without brackets', () => {
      const {templateFile} = setup(`<input dir myInput="foo">`, '', DIR_WITH_UNION_TYPE_INPUT);
      templateFile.moveCursorToText('myInput="foo¦"');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.string, ['foo']);
      expectReplacementText(completions, templateFile.contents, 'foo');
    });

    it('should complete a string union types in binding without brackets when the cursor at the start of the string',
       () => {
         const {templateFile} = setup(`<input dir myInput="foo">`, '', DIR_WITH_UNION_TYPE_INPUT);
         templateFile.moveCursorToText('myInput="¦foo"');
         const completions = templateFile.getCompletionsAtPosition();
         expectContain(completions, ts.ScriptElementKind.string, ['foo']);
         expectReplacementText(completions, templateFile.contents, 'foo');
       });

    it('should complete a string union types in pipe', () => {
      const {templateFile} =
          setup(`<input dir [myInput]="'foo'|unionTypePipe:'bar'">`, '', UNION_TYPE_PIPE);
      templateFile.moveCursorToText(`[myInput]="'foo'|unionTypePipe:'bar¦'"`);
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.string, ['bar']);
      expectReplacementText(completions, templateFile.contents, 'bar');
    });

    it('should complete a number union types', () => {
      const {templateFile} = setup(`<input dir [myInput]="42">`, '', DIR_WITH_UNION_TYPE_INPUT);
      templateFile.moveCursorToText(`[myInput]="42¦"`);
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.string, ['42']);
      expectReplacementText(completions, templateFile.contents, '42');
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
    template: string, classContents: string, otherDeclarations: {[name: string]: string} = {}): {
  templateFile: OpenBuffer,
} {
  const decls = ['AppCmp', ...Object.keys(otherDeclarations)];

  const otherDirectiveClassDecls = Object.values(otherDeclarations).join('\n\n');

  const env = LanguageServiceTestEnv.setup();
  const project = env.addProject('test', {
    'test.ts': `
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
    'test.html': template,
  });
  return {templateFile: project.openFile('test.html')};
}

function setupInlineTemplate(
    template: string, classContents: string, otherDeclarations: {[name: string]: string} = {}): {
  appFile: OpenBuffer,
} {
  const decls = ['AppCmp', ...Object.keys(otherDeclarations)];

  const otherDirectiveClassDecls = Object.values(otherDeclarations).join('\n\n');

  const env = LanguageServiceTestEnv.setup();
  const project = env.addProject('test', {
    'test.ts': `
        import {Component, Directive, NgModule, Pipe, TemplateRef} from '@angular/core';

        @Component({
          template: '${template}',
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
  });
  return {appFile: project.openFile('test.ts')};
}
