/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import ts from 'typescript';

import {
  DisplayInfoKind,
  unsafeCastDisplayInfoKindToScriptElementKind,
} from '../src/utils/display_parts';
import {LanguageServiceTestEnv, OpenBuffer, TestableOptions} from '../testing';

const DIR_WITH_INPUT = {
  'Dir': `
     @Directive({
       selector: '[dir]',
       inputs: ['myInput']
       standalone: false,
     })
     export class Dir {
       myInput!: string;
     }
   `,
};

const DIR_WITH_UNION_TYPE_INPUT = {
  'Dir': `
     @Directive({
       selector: '[dir]',
       inputs: ['myInput']
       standalone: false,
     })
     export class Dir {
       myInput!: 'foo'|42|null|undefined
     }
   `,
};

const DIR_WITH_OUTPUT = {
  'Dir': `
     @Directive({
       selector: '[dir]',
       outputs: ['myOutput']
       standalone: false,
     })
     export class Dir {
       myInput!: any;
     }
   `,
};

const CUSTOM_BUTTON = {
  'Button': `
     @Directive({
       selector: 'button[mat-button]',
       inputs: ['color']
       standalone: false,
     })
     export class Button {
       color!: any;
     }
   `,
};

const DIR_WITH_TWO_WAY_BINDING = {
  'Dir': `
     @Directive({
       selector: '[dir]',
       inputs: ['model', 'otherInput'],
       outputs: ['modelChange', 'otherOutput'],
       standalone: false,
     })
     export class Dir {
       model!: any;
       modelChange!: any;
       otherInput!: any;
       otherOutput!: any;
     }
   `,
};

const DIR_WITH_BINDING_PROPERTY_NAME = {
  'Dir': `
     @Directive({
       selector: '[dir]',
       inputs: ['model: customModel'],
       outputs: ['update: customModelChange'],
       standalone: false,
     })
     export class Dir {
       model!: any;
       update!: any;
     }
   `,
};

const NG_FOR_DIR = {
  'NgFor': `
     @Directive({
       selector: '[ngFor][ngForOf]',
       standalone: false,
     })
     export class NgFor {
       constructor(ref: TemplateRef<any>) {}
       ngForOf!: any;
     }
   `,
};

const DIR_WITH_SELECTED_INPUT = {
  'Dir': `
     @Directive({
       selector: '[myInput]',
       inputs: ['myInput']
       standalone: false,
     })
     export class Dir {
       myInput!: string;
     }
   `,
};

const SOME_PIPE = {
  'SomePipe': `
     @Pipe({
       name: 'somePipe',
       standalone: false,
     })
     export class SomePipe {
       transform(value: string): string {
         return value;
       }
     }
    `,
};

const UNION_TYPE_PIPE = {
  'UnionTypePipe': `
     @Pipe({
       name: 'unionTypePipe',
       standalone: false,
     })
     export class UnionTypePipe {
       transform(value: string, config: 'foo' | 'bar'): string {
         return value;
       }
     }
    `,
};

const ANIMATION_TRIGGER_FUNCTION = `
function trigger(name: string) {
  return {name};
}
`;

const ANIMATION_METADATA = `animations: [trigger('animationName')],`;

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
      const {templateFile} = setup(
        '{{ti}}',
        `
         /** This is the title of the 'AppCmp' Component. */
         title!: string;
         /** This comment should not appear in the output of this test. */
         hero!: number;
       `,
      );
      templateFile.moveCursorToText('{{ti¦}}');
      const details = templateFile.getCompletionEntryDetails(
        'title',
        /* formatOptions */ undefined,
        /* preferences */ undefined,
      )!;
      expect(details).toBeDefined();
      expect(toText(details.displayParts)).toEqual('(property) AppCmp.title: string');
      expect(toText(details.documentation)).toEqual("This is the title of the 'AppCmp' Component.");
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
        `heroes!: {name: string}[];`,
      );
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

    it('should not include the trailing quote inside the RHS of a two-way binding', () => {
      const {templateFile} = setup(`<h1 [(model)]="title."></h1>`, `title!: string;`);
      templateFile.moveCursorToText('[(model)]="title.¦"');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberFunctionElement, ['charAt']);
      expectReplacementText(completions, templateFile.contents, '');
    });

    it('should return completions inside an empty RHS of a two-way binding', () => {
      const {templateFile} = setup(`<h1 [(model)]=""></h1>`, `title!: string;`);
      templateFile.moveCursorToText('[(model)]="¦"');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });

    it('should return completions of string literals, number literals, `true`, `false`, `null` and `undefined`', () => {
      const {templateFile} = setup(`<input dir [myInput]="">`, '', DIR_WITH_UNION_TYPE_INPUT);
      templateFile.moveCursorToText('dir [myInput]="¦">');

      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.string, [`'foo'`, '42']);
      expectContain(completions, ts.ScriptElementKind.keyword, ['null']);
      expectContain(completions, ts.ScriptElementKind.variableElement, ['undefined']);
      expectDoesNotContain(completions, ts.ScriptElementKind.parameterElement, ['ctx']);
    });

    it('should return completions of string literals, number literals, `true`, `false`, `null` and `undefined` when the user tries to modify the symbol', () => {
      const {templateFile} = setup(`<input dir [myInput]="a">`, '', DIR_WITH_UNION_TYPE_INPUT);
      templateFile.moveCursorToText('dir [myInput]="a¦">');

      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.string, [`'foo'`, '42']);
      expectContain(completions, ts.ScriptElementKind.keyword, ['null']);
      expectContain(completions, ts.ScriptElementKind.variableElement, ['undefined']);
      expectDoesNotContain(completions, ts.ScriptElementKind.parameterElement, ['ctx']);
    });
  });

  describe('signal inputs', () => {
    const signalInputDirectiveWithUnionType = {
      'Dir': `
         @Directive({
           selector: '[dir]',
           standalone: false,
         })
         export class Dir {
           myInput = input<'foo'|42|null>();
         }
    `,
    };

    it('should return property access completions', () => {
      const {templateFile} = setup(
        `<input dir [myInput]="'foo'.">`,
        '',
        signalInputDirectiveWithUnionType,
      );
      templateFile.moveCursorToText(`dir [myInput]="'foo'.¦">`);

      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberFunctionElement, [
        `charAt`,
        'toLowerCase' /* etc. */,
      ]);
    });

    it(
      'should return completions of string literals, number literals, `true`, ' +
        '`false`, `null` and `undefined`',
      () => {
        const {templateFile} = setup(
          `<input dir [myInput]="">`,
          '',
          signalInputDirectiveWithUnionType,
        );
        templateFile.moveCursorToText('dir [myInput]="¦">');

        const completions = templateFile.getCompletionsAtPosition();
        expectContain(completions, ts.ScriptElementKind.string, [`'foo'`, '42']);
        expectContain(completions, ts.ScriptElementKind.keyword, ['null']);
        expectContain(completions, ts.ScriptElementKind.variableElement, ['undefined']);
        expectDoesNotContain(completions, ts.ScriptElementKind.parameterElement, ['ctx']);
      },
    );

    it(
      'should return completions of string literals, number literals, `true`, `false`, ' +
        '`null` and `undefined` when the user tries to modify the symbol',
      () => {
        const {templateFile} = setup(
          `<input dir [myInput]="a">`,
          '',
          signalInputDirectiveWithUnionType,
        );
        templateFile.moveCursorToText('dir [myInput]="a¦">');

        const completions = templateFile.getCompletionsAtPosition();
        expectContain(completions, ts.ScriptElementKind.string, [`'foo'`, '42']);
        expectContain(completions, ts.ScriptElementKind.keyword, ['null']);
        expectContain(completions, ts.ScriptElementKind.variableElement, ['undefined']);
        expectDoesNotContain(completions, ts.ScriptElementKind.parameterElement, ['ctx']);
      },
    );

    it('should complete a string union types in binding without brackets', () => {
      const {templateFile} = setup(
        `<input dir myInput="foo">`,
        '',
        signalInputDirectiveWithUnionType,
      );
      templateFile.moveCursorToText('myInput="foo¦"');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.string, ['foo']);
      expectReplacementText(completions, templateFile.contents, 'foo');
    });
  });

  describe('initializer-based output() API', () => {
    const initializerOutputDirectiveWithUnionType = {
      'Dir': `
         @Directive({
           selector: '[dir]',
           standalone: false,
         })
         export class Dir {
           bla = output<string>();
         }
    `,
    };

    it('should return event completion', () => {
      const {templateFile} = setup(
        `<button dir ></button>`,
        ``,
        initializerOutputDirectiveWithUnionType,
      );
      templateFile.moveCursorToText(`<button dir ¦>`);
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, DisplayInfoKind.EVENT, ['(bla)']);
    });

    it('should return property access completions', () => {
      const {templateFile} = setup(
        `<input dir (bla)="'foo'.">`,
        '',
        initializerOutputDirectiveWithUnionType,
      );
      templateFile.moveCursorToText(`dir (bla)="'foo'.¦">`);

      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberFunctionElement, [
        `charAt`,
        'toLowerCase' /* etc. */,
      ]);
    });

    it(
      'should return completions of string literals, number literals, `true`, ' +
        '`false`, `null` and `undefined`',
      () => {
        const {templateFile} = setup(
          `<input dir (bla)="$event.">`,
          '',
          initializerOutputDirectiveWithUnionType,
        );
        templateFile.moveCursorToText('dir (bla)="$event.¦">');

        const completions = templateFile.getCompletionsAtPosition();

        expectContain(completions, ts.ScriptElementKind.memberFunctionElement, [
          `charAt`,
          'toLowerCase' /* etc. */,
        ]);
      },
    );
  });

  describe('initializer-based outputFromObservable() API', () => {
    const initializerOutputDirectiveWithUnionType = {
      'Dir': `
         @Directive({
           selector: '[dir]',
           standalone: false,
         })
         export class Dir {
           bla = outputFromObservable(new Subject<string>());
         }
    `,
    };

    it('should return event completion', () => {
      const {templateFile} = setup(
        `<button dir ></button>`,
        ``,
        initializerOutputDirectiveWithUnionType,
      );
      templateFile.moveCursorToText(`<button dir ¦>`);
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, DisplayInfoKind.EVENT, ['(bla)']);
    });

    it('should return property access completions', () => {
      const {templateFile} = setup(
        `<input dir (bla)="'foo'.">`,
        '',
        initializerOutputDirectiveWithUnionType,
      );
      templateFile.moveCursorToText(`dir (bla)="'foo'.¦">`);

      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberFunctionElement, [
        `charAt`,
        'toLowerCase' /* etc. */,
      ]);
    });

    it(
      'should return completions of string literals, number literals, `true`, ' +
        '`false`, `null` and `undefined`',
      () => {
        const {templateFile} = setup(
          `<input dir (bla)="$event.">`,
          '',
          initializerOutputDirectiveWithUnionType,
        );
        templateFile.moveCursorToText('dir (bla)="$event.¦">');

        const completions = templateFile.getCompletionsAtPosition();

        expectContain(completions, ts.ScriptElementKind.memberFunctionElement, [
          `charAt`,
          'toLowerCase' /* etc. */,
        ]);
      },
    );
  });

  describe('model inputs', () => {
    const directiveWithModel = {
      'Dir': `
         @Directive({
           selector: '[dir]',
           standalone: false,
         })
         export class Dir {
           twoWayValue = model<string>();
         }
    `,
    };

    it('should return completions for both properties and events', () => {
      const {templateFile} = setup(`<button dir ></button>`, ``, directiveWithModel);
      templateFile.moveCursorToText(`<button dir ¦>`);
      const completions = templateFile.getCompletionsAtPosition();

      expectContain(completions, DisplayInfoKind.PROPERTY, ['[twoWayValue]']);
      expectContain(completions, DisplayInfoKind.PROPERTY, ['[(twoWayValue)]']);
      expectContain(completions, DisplayInfoKind.EVENT, ['(twoWayValueChange)']);
    });

    it('should return property access completions in the property side of the binding', () => {
      const {templateFile} = setup(`<input dir [twoWayValue]="'foo'.">`, '', directiveWithModel);
      templateFile.moveCursorToText(`dir [twoWayValue]="'foo'.¦">`);

      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberFunctionElement, [
        `charAt`,
        'toLowerCase' /* etc. */,
      ]);
    });

    it('should return property access completions in the event side of the binding', () => {
      const {templateFile} = setup(
        `<input dir (twoWayValueChange)="'foo'.">`,
        '',
        directiveWithModel,
      );
      templateFile.moveCursorToText(`dir (twoWayValueChange)="'foo'.¦">`);

      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberFunctionElement, [
        `charAt`,
        'toLowerCase' /* etc. */,
      ]);
    });

    it('should return property access completions in a two-way binding', () => {
      const {templateFile} = setup(`<input dir [(twoWayValue)]="'foo'.">`, '', directiveWithModel);
      templateFile.moveCursorToText(`dir [(twoWayValue)]="'foo'.¦">`);

      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberFunctionElement, [
        `charAt`,
        'toLowerCase' /* etc. */,
      ]);
    });

    it(
      'should return completions of string literals, number literals, `true`, ' +
        '`false`, `null` and `undefined`',
      () => {
        const {templateFile} = setup(
          `<input dir (twoWayValueChange)="$event.">`,
          '',
          directiveWithModel,
        );
        templateFile.moveCursorToText('dir (twoWayValueChange)="$event.¦">');

        const completions = templateFile.getCompletionsAtPosition();

        expectContain(completions, ts.ScriptElementKind.memberFunctionElement, [
          `charAt`,
          'toLowerCase' /* etc. */,
        ]);
      },
    );
  });

  describe('for blocks', () => {
    const completionPrefixes = ['@', '@i'];

    describe(`at top level`, () => {
      for (const completionPrefix of completionPrefixes) {
        it(`in empty file (with prefix ${completionPrefix})`, () => {
          const {templateFile} = setup(`${completionPrefix}`, ``);
          templateFile.moveCursorToText(`${completionPrefix}¦`);
          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.BLOCK),
            ['if'],
          );
        });

        it(`after text (with prefix ${completionPrefix})`, () => {
          const {templateFile} = setup(`foo ${completionPrefix}`, ``);
          templateFile.moveCursorToText(`${completionPrefix}¦`);
          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.BLOCK),
            ['if'],
          );
        });

        it(`before text (with prefix ${completionPrefix})`, () => {
          const {templateFile} = setup(`${completionPrefix} foo`, ``);
          templateFile.moveCursorToText(`${completionPrefix}¦`);
          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.BLOCK),
            ['if'],
          );
        });

        it(`after newline with text on preceding line (with prefix ${completionPrefix})`, () => {
          const {templateFile} = setup(`foo\n${completionPrefix}`, ``);
          templateFile.moveCursorToText(`${completionPrefix}¦`);
          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.BLOCK),
            ['if'],
          );
        });

        it(`before newline with text on newline (with prefix ${completionPrefix})`, () => {
          const {templateFile} = setup(`${completionPrefix}\nfoo`, ``);
          templateFile.moveCursorToText(`${completionPrefix}¦`);
          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.BLOCK),
            ['if'],
          );
        });

        it(`in a practical case, on its own line (with prefix ${completionPrefix})`, () => {
          const {templateFile} = setup(`<div></div>\n  ${completionPrefix}\n<span></span>`, ``);
          templateFile.moveCursorToText(`${completionPrefix}¦`);
          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.BLOCK),
            ['if'],
          );
        });
      }
    });

    it('inside if', () => {
      const {templateFile} = setup(`@if (1) { @s }`, ``);
      templateFile.moveCursorToText('@s¦');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.BLOCK),
        ['switch'],
      );
    });

    it('inside switch', () => {
      const {templateFile} = setup(`@switch (1) { @c }`, ``);
      templateFile.moveCursorToText('@c¦');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.BLOCK),
        ['case'],
      );
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
        `<button (click)="name.fi = 'test"></button>`,
        `name!: {first: string; last: string;};`,
      );
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
  });

  describe('element tag scope', () => {
    it('should not return DOM completions for external template', () => {
      const {templateFile} = setup(`<div>`, '');
      templateFile.moveCursorToText('<div¦>');
      const completions = templateFile.getCompletionsAtPosition();
      expectDoesNotContain(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ELEMENT),
        ['div', 'span'],
      );
    });

    it('should not return DOM completions for inline template', () => {
      const {appFile} = setupInlineTemplate(`<div>`, '');
      appFile.moveCursorToText('<div¦>');
      const completions = appFile.getCompletionsAtPosition();
      expectDoesNotContain(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ELEMENT),
        ['div', 'span'],
      );
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
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
        ['other-dir'],
      );

      const details = templateFile.getCompletionEntryDetails('other-dir')!;
      expect(details).toBeDefined();
      expect(ts.displayPartsToString(details.displayParts)).toEqual(
        '(directive) AppModule.OtherDir',
      );
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
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.COMPONENT),
        ['other-cmp'],
      );

      const details = templateFile.getCompletionEntryDetails('other-cmp')!;
      expect(details).toBeDefined();
      expect(ts.displayPartsToString(details.displayParts)).toEqual(
        '(component) AppModule.OtherCmp',
      );
      expect(ts.displayPartsToString(details.documentation!)).toEqual('This is another component.');
    });

    // TODO: check why this test is now broken
    xit('should return component completions not imported', () => {
      const {templateFile} = setup(
        `<other-cmp>`,
        '',
        {},
        `
        @Component({selector: 'other-cmp', template: 'unimportant', standalone: true})
        export class OtherCmp {}
      `,
      );
      templateFile.moveCursorToText('<other-cmp¦>');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.COMPONENT),
        ['other-cmp'],
      );

      const details = templateFile.getCompletionEntryDetails('other-cmp')!;
      expect(details).toBeDefined();
      expect(details.codeActions?.[0].description).toEqual('Import OtherCmp');
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
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.COMPONENT),
        ['other-cmp'],
      );
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
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.COMPONENT),
        ['other-cmp'],
      );
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
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.COMPONENT),
        ['other-cmp'],
      );
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
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
            ['value'],
          );
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['[value]'],
          );
        });

        it('should return completions for a new element property', () => {
          const {appFile} = setupInlineTemplate(`<input >`, '');
          appFile.moveCursorToText('<input ¦>');

          const completions = appFile.getCompletionsAtPosition();
          expectDoesNotContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
            ['value'],
          );
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['[value]'],
          );
        });

        it('should return event completion', () => {
          const {templateFile} = setup(`<button ></button>`, ``);
          templateFile.moveCursorToText(`<button ¦>`);
          const completions = templateFile.getCompletionsAtPosition();
          expectContain(completions, DisplayInfoKind.EVENT, ['(click)']);
        });

        it('should return event completion for self closing tag', () => {
          const {templateFile} = setup(`<br />`, ``);
          templateFile.moveCursorToText(`<br ¦`);
          const completions = templateFile.getCompletionsAtPosition();
          expectContain(completions, DisplayInfoKind.EVENT, ['(click)']);
        });

        it('should not return element completions in end tag', () => {
          const {templateFile} = setup(`<button ></button>`, ``);
          templateFile.moveCursorToText(`</¦button>`);
          const completions = templateFile.getCompletionsAtPosition();
          expect(completions).not.toBeDefined();
        });

        it('should not return element completions in between start and end tag', () => {
          const {templateFile} = setup(`<button></button>`, ``);
          templateFile.moveCursorToText(`<button>¦</button>`);
          const completions = templateFile.getCompletionsAtPosition();
          expect(completions).not.toBeDefined();
        });

        it('should return event completion with empty parens', () => {
          const {templateFile} = setup(`<button ()></button>`, ``);
          templateFile.moveCursorToText(`<button (¦)>`);
          const completions = templateFile.getCompletionsAtPosition();
          expectContain(completions, DisplayInfoKind.EVENT, ['(click)']);
        });

        it('should return completions for a partial attribute', () => {
          const {appFile} = setupInlineTemplate(`<input val>`, '');
          appFile.moveCursorToText('<input val¦>');

          const completions = appFile.getCompletionsAtPosition();
          expectDoesNotContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
            ['value'],
          );
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['[value]'],
          );
          expectReplacementText(completions, appFile.contents, 'val');
        });

        it('should return completions for a partial property binding', () => {
          const {appFile} = setupInlineTemplate(`<input [val]>`, '');
          appFile.moveCursorToText('[val¦]');

          const completions = appFile.getCompletionsAtPosition();
          expectDoesNotContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
            ['value'],
          );
          expectDoesNotContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['[value]'],
          );
          expectDoesNotContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['value'],
          );
          expectReplacementText(completions, appFile.contents, 'val');
        });

        it('should return completions inside an event binding', () => {
          const {templateFile} = setup(`<button (cl)=''></button>`, ``);
          templateFile.moveCursorToText(`(cl¦)=''`);
          const completions = templateFile.getCompletionsAtPosition();
          expectContain(completions, DisplayInfoKind.EVENT, ['(click)']);
        });
      });

      describe('directive present', () => {
        it('should return directive input completions for a new attribute', () => {
          const {templateFile} = setup(`<input dir >`, '', DIR_WITH_INPUT);
          templateFile.moveCursorToText('dir ¦>');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['[myInput]'],
          );
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
            ['myInput'],
          );
        });

        it('should return directive input completions for a partial attribute', () => {
          const {templateFile} = setup(`<input dir my>`, '', DIR_WITH_INPUT);
          templateFile.moveCursorToText('my¦>');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['[myInput]'],
          );
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
            ['myInput'],
          );
        });

        it('should return input completions for a partial property binding', () => {
          const {templateFile} = setup(`<input dir [my]>`, '', DIR_WITH_INPUT);
          templateFile.moveCursorToText('[my¦]');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['myInput'],
          );
        });

        it('should return completion for input coming from a host directive', () => {
          const {templateFile} = setup(`<input dir my>`, '', {
            'Dir': `
              @Directive({
                standalone: true,
                inputs: ['myInput']
              })
              export class HostDir {
                myInput = 'foo';
              }

              @Directive({
                selector: '[dir]',
                hostDirectives: [{
                  directive: HostDir,
                  inputs: ['myInput']
                }],
                standalone: false,
              })
              export class Dir {
              }
             `,
          });
          templateFile.moveCursorToText('my¦>');

          const completions = templateFile.getCompletionsAtPosition();

          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['[myInput]'],
          );
        });

        it('should not return completion for hidden host directive input', () => {
          const {templateFile} = setup(`<input dir my>`, '', {
            'Dir': `
              @Directive({
                standalone: true,
                inputs: ['myInput']
              })
              export class HostDir {
                myInput = 'foo';
              }

              @Directive({
                selector: '[dir]',
                hostDirectives: [HostDir]
              })
              export class Dir {
              }
             `,
          });
          templateFile.moveCursorToText('my¦>');

          const completions = templateFile.getCompletionsAtPosition();

          expectDoesNotContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['[myInput]'],
          );
        });

        it('should return completion for aliased host directive input', () => {
          const {templateFile} = setup(`<input dir ali>`, '', {
            'Dir': `
              @Directive({
                standalone: true,
                inputs: ['myInput']
              })
              export class HostDir {
                myInput = 'foo';
              }

              @Directive({
                selector: '[dir]',
                hostDirectives: [{
                  directive: HostDir,
                  inputs: ['myInput: alias']
                }],
                standalone: false,
              })
              export class Dir {
              }
             `,
          });
          templateFile.moveCursorToText('ali¦>');

          const completions = templateFile.getCompletionsAtPosition();

          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['[alias]'],
          );
        });

        it('should return completion for aliased host directive input that has a different public name', () => {
          const {templateFile} = setup(`<input dir ali>`, '', {
            'Dir': `
                  @Directive({
                    standalone: true,
                    inputs: ['myInput: myPublicInput']
                  })
                  export class HostDir {
                    myInput = 'foo';
                  }

                  @Directive({
                    selector: '[dir]',
                    hostDirectives: [{
                      directive: HostDir,
                      inputs: ['myPublicInput: alias']
                    }],
                    standalone: false,
                  })
                  export class Dir {
                  }
             `,
          });
          templateFile.moveCursorToText('ali¦>');

          const completions = templateFile.getCompletionsAtPosition();

          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['[alias]'],
          );
        });
      });

      describe('structural directive present', () => {
        it('should return structural directive completions for an empty attribute', () => {
          const {templateFile} = setup(`<li >`, '', NG_FOR_DIR);
          templateFile.moveCursorToText('<li ¦>');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
            ['*ngFor'],
          );
        });

        it('should return structural directive completions for an existing non-structural attribute', () => {
          const {templateFile} = setup(`<li ng>`, '', NG_FOR_DIR);
          templateFile.moveCursorToText('<li ng¦>');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
            ['*ngFor'],
          );
          expectReplacementText(completions, templateFile.contents, 'ng');
        });

        it('should return structural directive completions for an existing structural attribute', () => {
          const {templateFile} = setup(`<li *ng>`, '', NG_FOR_DIR);
          templateFile.moveCursorToText('*ng¦>');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
            ['ngFor'],
          );
          expectReplacementText(completions, templateFile.contents, 'ng');
          const details = templateFile.getCompletionEntryDetails(
            'ngFor',
            /* formatOptions */ undefined,
            /* preferences */ undefined,
          )!;
          expect(toText(details.displayParts)).toEqual('(directive) NgFor.NgFor: NgFor');
        });

        it('should return structural directive completions for just the structural marker', () => {
          const {templateFile} = setup(`<li *>`, '', NG_FOR_DIR);
          templateFile.moveCursorToText('*¦>');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
            ['ngFor'],
          );
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
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
            ['[myInput]'],
          );
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
            ['myInput'],
          );
        });
      });

      describe('animations', () => {
        it('should return animation names for the property binding', () => {
          const {templateFile} = setup(
            `<input [@my]>`,
            '',
            {},
            ANIMATION_TRIGGER_FUNCTION,
            ANIMATION_METADATA,
          );
          templateFile.moveCursorToText('[@my¦]');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
            ['animationName'],
          );
          expectReplacementText(completions, templateFile.contents, 'my');
        });

        it('should return animation names when the property binding animation name is empty', () => {
          const {templateFile} = setup(
            `<input [@]>`,
            '',
            {},
            ANIMATION_TRIGGER_FUNCTION,
            ANIMATION_METADATA,
          );
          templateFile.moveCursorToText('[@¦]');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
            ['animationName'],
          );
        });

        it('should return the special animation control binding called @.disabled ', () => {
          const {templateFile} = setup(
            `<input [@.dis]>`,
            '',
            {},
            ANIMATION_TRIGGER_FUNCTION,
            ANIMATION_METADATA,
          );
          templateFile.moveCursorToText('[@.dis¦]');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
            ['.disabled'],
          );
          expectReplacementText(completions, templateFile.contents, '.dis');
        });

        it('should return animation names for the event binding', () => {
          const {templateFile} = setup(
            `<input (@my)>`,
            '',
            {},
            ANIMATION_TRIGGER_FUNCTION,
            ANIMATION_METADATA,
          );
          templateFile.moveCursorToText('(@my¦)');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
            ['animationName'],
          );
          expectReplacementText(completions, templateFile.contents, 'my');
        });

        it('should return animation names when the event binding animation name is empty', () => {
          const {templateFile} = setup(
            `<input (@)>`,
            '',
            {},
            ANIMATION_TRIGGER_FUNCTION,
            ANIMATION_METADATA,
          );
          templateFile.moveCursorToText('(@¦)');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
            ['animationName'],
          );
        });

        it('should return the animation phase for the event binding', () => {
          const {templateFile} = setup(
            `<input (@my.do)>`,
            '',
            {},
            ANIMATION_TRIGGER_FUNCTION,
            ANIMATION_METADATA,
          );
          templateFile.moveCursorToText('(@my.do¦)');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
            ['done'],
          );
          expectReplacementText(completions, templateFile.contents, 'do');
        });

        it('should return the animation phase when the event binding animation phase is empty', () => {
          const {templateFile} = setup(
            `<input (@my.)>`,
            '',
            {},
            ANIMATION_TRIGGER_FUNCTION,
            ANIMATION_METADATA,
          );
          templateFile.moveCursorToText('(@my.¦)');

          const completions = templateFile.getCompletionsAtPosition();
          expectContain(
            completions,
            unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
            ['done'],
          );
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
          completions,
          unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
          ['[myInput]'],
        );
        expectContain(
          completions,
          unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
          ['myInput'],
        );
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
          completions,
          unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
          ['myInput'],
        );
        expectReplacementText(completions, templateFile.contents, 'my');
      });

      it('should return output completions for an empty binding', () => {
        const {templateFile} = setup(`<input dir >`, '', DIR_WITH_OUTPUT);
        templateFile.moveCursorToText('¦>');

        const completions = templateFile.getCompletionsAtPosition();
        expectContain(
          completions,
          unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
          ['(myOutput)'],
        );
      });

      it('should return output completions for a partial event binding', () => {
        const {templateFile} = setup(`<input dir (my)>`, '', DIR_WITH_OUTPUT);
        templateFile.moveCursorToText('(my¦)');

        const completions = templateFile.getCompletionsAtPosition();
        expectContain(
          completions,
          unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
          ['myOutput'],
        );
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
          completions,
          unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
          ['modelChange'],
        );
        expectDoesNotContain(completions, ts.ScriptElementKind.memberVariableElement, [
          'otherInput',
        ]);
        expectDoesNotContain(
          completions,
          unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
          ['otherOutput'],
        );
      });

      it('should return input completions for a binding property name', () => {
        const {templateFile} = setup(
          `<h1 dir [customModel]></h1>`,
          ``,
          DIR_WITH_BINDING_PROPERTY_NAME,
        );
        templateFile.moveCursorToText('[customModel¦]');
        const completions = templateFile.getCompletionsAtPosition();
        expectReplacementText(completions, templateFile.contents, 'customModel');

        expectContain(
          completions,
          unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
          ['customModel'],
        );
      });

      it('should return output completions for a binding property name', () => {
        const {templateFile} = setup(
          `<h1 dir (customModel)></h1>`,
          ``,
          DIR_WITH_BINDING_PROPERTY_NAME,
        );
        templateFile.moveCursorToText('(customModel¦)');
        const completions = templateFile.getCompletionsAtPosition();
        expectReplacementText(completions, templateFile.contents, 'customModel');

        expectContain(
          completions,
          unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
          ['customModelChange'],
        );
      });

      it('should return completion for output coming from a host directive', () => {
        const {templateFile} = setup(`<input dir (my)>`, '', {
          'Dir': `
            @Directive({
              standalone: true,
              outputs: ['myOutput']
            })
            export class HostDir {
              myOutput: any;
            }

            @Directive({
              selector: '[dir]',
              hostDirectives: [{
                directive: HostDir,
                outputs: ['myOutput']
              }],
              standalone: false,
            })
            export class Dir {
            }
           `,
        });
        templateFile.moveCursorToText('(my¦)');

        const completions = templateFile.getCompletionsAtPosition();
        expectContain(
          completions,
          unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
          ['myOutput'],
        );
        expectReplacementText(completions, templateFile.contents, 'my');
      });

      it('should not return completion for hidden host directive output', () => {
        const {templateFile} = setup(`<input dir (my)>`, '', {
          'Dir': `
            @Directive({
              standalone: true,
              outputs: ['myOutput']
            })
            export class HostDir {
              myOutput: any;
            }

            @Directive({
              selector: '[dir]',
              hostDirectives: [HostDir]
            })
            export class Dir {
            }
           `,
        });
        templateFile.moveCursorToText('(my¦)');

        const completions = templateFile.getCompletionsAtPosition();
        expectDoesNotContain(
          completions,
          unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
          ['myOutput'],
        );
      });

      it('should return completion for aliased host directive output that has a different public name', () => {
        const {templateFile} = setup(`<input dir (ali)>`, '', {
          'Dir': `
            @Directive({
              standalone: true,
              outputs: ['myOutput: myPublicOutput']
            })
            export class HostDir {
              myOutput: any;
            }

            @Directive({
              selector: '[dir]',
              hostDirectives: [{
                directive: HostDir,
                outputs: ['myPublicOutput: alias']
              }],
              standalone: false,
            })
            export class Dir {
            }
           `,
        });
        templateFile.moveCursorToText('(ali¦)');

        const completions = templateFile.getCompletionsAtPosition();
        expectContain(
          completions,
          unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
          ['alias'],
        );
        expectReplacementText(completions, templateFile.contents, 'ali');
      });
    });
  });

  describe('pipe scope', () => {
    it('should complete a pipe binding', () => {
      const {templateFile} = setup(`{{ foo | some¦ }}`, '', SOME_PIPE);
      templateFile.moveCursorToText('some¦');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PIPE),
        ['somePipe'],
      );
      expectReplacementText(completions, templateFile.contents, 'some');
    });

    it('should complete an empty pipe binding', () => {
      const {templateFile} = setup(`{{foo | }}`, '', SOME_PIPE);
      templateFile.moveCursorToText('{{foo | ¦}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PIPE),
        ['somePipe'],
      );
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

    it('should complete a string union types in binding without brackets when the cursor at the start of the string', () => {
      const {templateFile} = setup(`<input dir myInput="foo">`, '', DIR_WITH_UNION_TYPE_INPUT);
      templateFile.moveCursorToText('myInput="¦foo"');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.string, ['foo']);
      expectReplacementText(completions, templateFile.contents, 'foo');
    });

    it('should complete a string union types in pipe', () => {
      const {templateFile} = setup(
        `<input dir [myInput]="'foo'|unionTypePipe:'bar'">`,
        '',
        UNION_TYPE_PIPE,
      );
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

  describe('auto-apply optional chaining', () => {
    it('should be able to complete on nullable symbol', () => {
      const {templateFile} = setup('{{article.title}}', `article?: { title: string };`);
      templateFile.moveCursorToText('{{article.title¦}}');
      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithInsertText: true,
        includeAutomaticOptionalChainCompletions: true,
      });
      expectContainInsertText(completions, ts.ScriptElementKind.memberVariableElement, ['?.title']);
      expectReplacementText(completions, templateFile.contents, '.title');
    });

    it('should be able to complete on NonNullable symbol', () => {
      const {templateFile} = setup('{{article.title}}', `article: { title: string };`);
      templateFile.moveCursorToText('{{article.title¦}}');
      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithInsertText: true,
        includeAutomaticOptionalChainCompletions: true,
      });
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
      expectReplacementText(completions, templateFile.contents, 'title');
    });

    it('should not shift the start location when the user has input the optional chaining', () => {
      const {templateFile} = setup('{{article?.title}}', `article?: { title: string };`);
      templateFile.moveCursorToText('{{article?.title¦}}');
      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithInsertText: true,
        includeAutomaticOptionalChainCompletions: true,
      });
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
      expectReplacementText(completions, templateFile.contents, 'title');
    });
  });

  describe('insert snippet text', () => {
    it('should be able to complete for an empty attribute', () => {
      const {templateFile} = setup(`<input dir >`, '', DIR_WITH_OUTPUT);
      templateFile.moveCursorToText('¦>');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      expectContainInsertTextWithSnippet(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
        ['(myOutput)="$1"'],
      );
    });

    it('should be able to complete for a partial attribute', () => {
      const {templateFile} = setup(`<input dir my>`, '', DIR_WITH_OUTPUT);
      templateFile.moveCursorToText('¦>');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      expectContainInsertTextWithSnippet(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
        ['(myOutput)="$1"'],
      );
      expectReplacementText(completions, templateFile.contents, 'my');
    });

    it('should be able to complete for the event binding with the value is empty', () => {
      const {templateFile} = setup(`<input dir ()="">`, '', DIR_WITH_OUTPUT);
      templateFile.moveCursorToText('(¦)="">');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      expectContainInsertTextWithSnippet(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
        ['(myOutput)="$1"'],
      );
      expectReplacementText(completions, templateFile.contents, '()=""');
    });

    it('should be able to complete for the event binding', () => {
      const {templateFile} = setup(`<input dir ()>`, '', DIR_WITH_OUTPUT);
      templateFile.moveCursorToText('(¦)>');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      expectContainInsertTextWithSnippet(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
        ['(myOutput)="$1"'],
      );
      expectReplacementText(completions, templateFile.contents, '()');
    });

    it('should be able to complete for the dom event binding', () => {
      const {templateFile} = setup(`<input dir (cli)>`, '', DIR_WITH_OUTPUT);
      templateFile.moveCursorToText('(cli¦)>');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      expectContainInsertTextWithSnippet(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.EVENT),
        ['(click)="$1"'],
      );
      expectReplacementText(completions, templateFile.contents, '(cli)');
    });

    it('should be able to complete for the property binding with the value is empty', () => {
      const {templateFile} = setup(`<input [my]="">`, '', DIR_WITH_SELECTED_INPUT);
      templateFile.moveCursorToText('[my¦]=""');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      expectContainInsertTextWithSnippet(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
        ['[myInput]="$1"'],
      );
      expectReplacementText(completions, templateFile.contents, '[my]=""');
    });

    it('should be able to complete for the property binding', () => {
      const {templateFile} = setup(`<input [my]>`, '', DIR_WITH_SELECTED_INPUT);
      templateFile.moveCursorToText('[my¦]');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      expectContainInsertTextWithSnippet(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
        ['[myInput]="$1"'],
      );
      expectReplacementText(completions, templateFile.contents, '[my]');
    });

    it('should be able to complete for the dom property binding', () => {
      const {templateFile} = setup(`<input [val]>`, '', DIR_WITH_SELECTED_INPUT);
      templateFile.moveCursorToText('[val¦]');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      expectContainInsertTextWithSnippet(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
        ['[value]="$1"'],
      );
      expectReplacementText(completions, templateFile.contents, '[val]');
    });

    it('should be able to complete for the two way binding with the value is empty', () => {
      const {templateFile} = setup(`<h1 dir [(mod)]=""></h1>`, ``, DIR_WITH_TWO_WAY_BINDING);
      templateFile.moveCursorToText('[(mod¦)]=""');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      expectContainInsertTextWithSnippet(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
        ['[(model)]="$1"'],
      );
      expectReplacementText(completions, templateFile.contents, '[(mod)]=""');
    });

    it('should be able to complete for the two way binding via', () => {
      const {templateFile} = setup(`<h1 dir [(mod)]></h1>`, ``, DIR_WITH_TWO_WAY_BINDING);
      templateFile.moveCursorToText('[(mod¦)]');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      expectContainInsertTextWithSnippet(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.PROPERTY),
        ['[(model)]="$1"'],
      );
      expectReplacementText(completions, templateFile.contents, '[(mod)]');
    });

    it('should be able to complete for the structural directive with the value is empty', () => {
      const {templateFile} = setup(`<input dir *ngFor="">`, '', NG_FOR_DIR);
      templateFile.moveCursorToText('ngFor¦="">');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      // Now here is using the `=` to check the value of the structural directive. If the
      // sourceSpan/valueSpan made more sense, it should behave like this `ngFor¦="" -> ngFor="¦"`,
      // and enable comments below.
      //
      // expectContainInsertTextWithSnippet(
      //     completions, unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
      //     ['ngFor="$1"']);
      // expectReplacementText(completions, templateFile.contents, 'ngFor=""');
      expectContain(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
        ['ngFor'],
      );
      expect(completions?.entries[0]).toBeDefined();
      expect(completions?.entries[0].isSnippet).toBeUndefined();
      expectReplacementText(completions, templateFile.contents, 'ngFor');
    });

    it('should be able to complete for the structural directive', () => {
      const {templateFile} = setup(`<input dir *ngFor>`, '', NG_FOR_DIR);
      templateFile.moveCursorToText('ngFor¦>');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      expectContainInsertTextWithSnippet(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
        ['ngFor="$1"'],
      );
      expectReplacementText(completions, templateFile.contents, 'ngFor');
    });

    it('should not be included in the completion for an attribute with a value', () => {
      const {templateFile} = setup(`<input dir myInput="1">`, '', DIR_WITH_SELECTED_INPUT);
      templateFile.moveCursorToText('myInput¦="1">');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      expectContain(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
        ['myInput'],
      );
      expectDoesNotContainInsertTextWithSnippet(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.ATTRIBUTE),
        ['myInput="$1"'],
      );
      expectReplacementText(completions, templateFile.contents, 'myInput');
    });

    it('should not be included in the completion for a directive attribute without input', () => {
      const {templateFile} = setup(`<button mat-></button>`, '', CUSTOM_BUTTON);
      templateFile.moveCursorToText('mat-¦>');

      const completions = templateFile.getCompletionsAtPosition({
        includeCompletionsWithSnippetText: true,
        includeCompletionsWithInsertText: true,
      });
      expectContain(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
        ['mat-button'],
      );
      expectDoesNotContainInsertTextWithSnippet(
        completions,
        unsafeCastDisplayInfoKindToScriptElementKind(DisplayInfoKind.DIRECTIVE),
        ['mat-button="$1"'],
      );
      expectReplacementText(completions, templateFile.contents, 'mat-');
    });
  });

  describe('let declarations', () => {
    it('should complete a let declaration', () => {
      const {templateFile} = setup(
        `
        @let message = 'hello';
        {{mess}}
      `,
        '',
      );
      templateFile.moveCursorToText('{{mess¦}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, DisplayInfoKind.LET, ['message']);
    });

    it('should complete an empty let declaration with a terminating character', () => {
      const {templateFile} = setup('@let foo = ;', `title!: string; hero!52: number;`);
      templateFile.moveCursorToText('@let foo = ¦;');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should complete a single let declaration without a terminating character', () => {
      const {templateFile} = setup('@let foo =  ', `title!: string; hero!52: number;`);
      templateFile.moveCursorToText('@let foo = ¦');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should complete a let declaration property in the global scope', () => {
      const {templateFile} = setup(
        `
        @let hobbit = {name: 'Frodo', age: 53};
        {{hobbit.}}
      `,
        '',
      );
      templateFile.moveCursorToText('{{hobbit.¦}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['age', 'name']);
    });

    it('should complete a shadowed let declaration property', () => {
      const {templateFile} = setup(
        `
        @let hobbit = {name: 'Frodo', age: 53};

        @if (true) {
          @let hobbit = {hasRing: true, size: 'small'};
          {{hobbit.}}
        }
      `,
        '',
      );
      templateFile.moveCursorToText('{{hobbit.¦}}');
      const completions = templateFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['hasRing', 'size']);
    });
  });

  describe('host bindings', () => {
    it('should be able to complete a property host binding', () => {
      const {appFile} = setupInlineTemplate(
        '',
        `title!: string; hero!: number;`,
        undefined,
        `host: {'[title]': 'ti'},`,
        {
          typeCheckHostBindings: true,
        },
      );
      appFile.moveCursorToText(`'ti¦'`);
      const completions = appFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to complete a listener host binding', () => {
      const {appFile} = setupInlineTemplate(
        '',
        `title!: string; hero!: number;`,
        undefined,
        `host: {'(click)': 't'},`,
        {
          typeCheckHostBindings: true,
        },
      );
      appFile.moveCursorToText(`'(click)': 't¦'`);
      const completions = appFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to complete inside `host` of a directive', () => {
      const {appFile} = setupInlineTemplate(
        '',
        '',
        {
          'Dir': `
            @Directive({
              host: {'[title]': 'ti'},
            })
            export class Dir {
              title!: string;
              hero!: number;
            }
          `,
        },
        undefined,
        {
          typeCheckHostBindings: true,
        },
      );
      appFile.moveCursorToText(`'ti¦'`);
      const completions = appFile.getCompletionsAtPosition();
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });
  });
});

function expectContainInsertText(
  completions: ts.CompletionInfo | undefined,
  kind: ts.ScriptElementKind | DisplayInfoKind,
  insertTexts: string[],
) {
  expect(completions).toBeDefined();
  for (const insertText of insertTexts) {
    expect(completions!.entries).toContain(jasmine.objectContaining({insertText, kind} as any));
  }
}

function expectContainInsertTextWithSnippet(
  completions: ts.CompletionInfo | undefined,
  kind: ts.ScriptElementKind | DisplayInfoKind,
  insertTexts: string[],
) {
  expect(completions).toBeDefined();
  for (const insertText of insertTexts) {
    expect(completions!.entries).toContain(
      jasmine.objectContaining({insertText, kind, isSnippet: true} as any),
    );
  }
}

function expectDoesNotContainInsertTextWithSnippet(
  completions: ts.CompletionInfo | undefined,
  kind: ts.ScriptElementKind | DisplayInfoKind,
  insertTexts: string[],
) {
  expect(completions).toBeDefined();
  for (const insertText of insertTexts) {
    expect(completions!.entries).not.toContain(
      jasmine.objectContaining({insertText, kind, isSnippet: true} as any),
    );
  }
}

function expectContain(
  completions: ts.CompletionInfo | undefined,
  kind: ts.ScriptElementKind | DisplayInfoKind,
  names: string[],
) {
  expect(completions).toBeDefined();
  for (const name of names) {
    expect(completions!.entries).toContain(jasmine.objectContaining({name, kind} as any));
  }
}

function expectAll(
  completions: ts.CompletionInfo | undefined,
  contains: {[name: string]: ts.ScriptElementKind | DisplayInfoKind},
): void {
  expect(completions).toBeDefined();
  for (const [name, kind] of Object.entries(contains)) {
    expect(completions!.entries).toContain(jasmine.objectContaining({name, kind} as any));
  }
  expect(completions!.entries.length).toEqual(Object.keys(contains).length);
}

function expectDoesNotContain(
  completions: ts.CompletionInfo | undefined,
  kind: ts.ScriptElementKind | DisplayInfoKind,
  names: string[],
) {
  expect(completions).toBeDefined();
  for (const name of names) {
    expect(completions!.entries).not.toContain(jasmine.objectContaining({name, kind} as any));
  }
}

function expectReplacementText(
  completions: ts.CompletionInfo | undefined,
  text: string,
  replacementText: string,
) {
  if (completions === undefined) {
    return;
  }

  for (const entry of completions.entries) {
    expect(entry.replacementSpan).toBeDefined();
    const completionReplaces = text.slice(
      entry.replacementSpan!.start,
      entry.replacementSpan!.start + entry.replacementSpan!.length,
    );
    expect(completionReplaces).toBe(replacementText);
  }
}

function toText(displayParts?: ts.SymbolDisplayPart[]): string {
  return (displayParts ?? []).map((p) => p.text).join('');
}

function setup(
  template: string,
  classContents: string,
  otherDeclarations: {[name: string]: string} = {},
  functionDeclarations: string = '',
  componentMetadata: string = '',
): {
  templateFile: OpenBuffer;
} {
  const decls = ['AppCmp', ...Object.keys(otherDeclarations)];

  const otherDirectiveClassDecls = Object.values(otherDeclarations).join('\n\n');

  const env = LanguageServiceTestEnv.setup();
  const project = env.addProject('test', {
    'test.ts': `
         import {Component,
          input,
          output,
          model,
          Directive,
          NgModule,
          Pipe,
          TemplateRef,
        } from '@angular/core';
        import {outputFromObservable} from '@angular/core/rxjs-interop';
        import {Subject} from 'rxjs';

         ${functionDeclarations}

         @Component({
           templateUrl: './test.html',
           selector: 'app-cmp',
           ${componentMetadata}
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
  template: string,
  classContents: string,
  otherDeclarations: {[name: string]: string} = {},
  componentMetadata = '',
  compilerOptions?: TestableOptions,
): {
  appFile: OpenBuffer;
} {
  const decls = ['AppCmp', ...Object.keys(otherDeclarations)];

  const otherDirectiveClassDecls = Object.values(otherDeclarations).join('\n\n');

  const env = LanguageServiceTestEnv.setup();
  const project = env.addProject(
    'test',
    {
      'test.ts': `
         import {Component, Directive, NgModule, Pipe, TemplateRef} from '@angular/core';

         @Component({
           template: '${template}',
           selector: 'app-cmp',
           ${componentMetadata}
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
    },
    compilerOptions,
  );
  return {appFile: project.openFile('test.ts')};
}
