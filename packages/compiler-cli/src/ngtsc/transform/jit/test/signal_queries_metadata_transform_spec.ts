/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ImportedSymbolsTracker} from '../../../imports';
import {TypeScriptReflectionHost} from '../../../reflection';
import {getDownlevelDecoratorsTransform, getInitializerApiJitTransform} from '../index';

import {MockAotContext, MockCompilerHost} from '../../../../../test/mocks';

const TEST_FILE_INPUT = '/test.ts';
const TEST_FILE_OUTPUT = `/test.js`;

describe('signal queries metadata transform', () => {
  let host: MockCompilerHost;
  let context: MockAotContext;

  beforeEach(() => {
    context = new MockAotContext('/', {
      'core.d.ts': `
        export declare const Component: any;

        export declare const ViewChild: any;
        export declare const ViewChildren: any;
        export declare const ContentChild: any;
        export declare const ContentChildren: any;

        export declare const viewChild: any;
        export declare const viewChildren: any;
        export declare const contentChild: any;
        export declare const contentChildren: any;
      `,
    });
    host = new MockCompilerHost(context);
  });

  function transform(contents: string, postDownlevelDecoratorsTransform = false) {
    context.writeFile(TEST_FILE_INPUT, contents);

    const program = ts.createProgram(
      [TEST_FILE_INPUT],
      {
        module: ts.ModuleKind.ESNext,
        lib: ['dom', 'es2022'],
        target: ts.ScriptTarget.ES2022,
        traceResolution: true,
        experimentalDecorators: true,
        paths: {
          '@angular/core': ['./core.d.ts'],
        },
      },
      host,
    );

    const testFile = program.getSourceFile(TEST_FILE_INPUT);
    const typeChecker = program.getTypeChecker();
    const reflectionHost = new TypeScriptReflectionHost(typeChecker);
    const importTracker = new ImportedSymbolsTracker();
    const transformers: ts.CustomTransformers = {
      before: [getInitializerApiJitTransform(reflectionHost, importTracker, /* isCore */ false)],
    };

    if (postDownlevelDecoratorsTransform) {
      transformers.before!.push(
        getDownlevelDecoratorsTransform(
          typeChecker,
          reflectionHost,
          [],
          /* isCore */ false,
          /* isClosureCompilerEnabled */ false,
        ),
      );
    }

    let output: string | null = null;
    const emitResult = program.emit(
      testFile,
      (fileName, outputText) => {
        if (fileName === TEST_FILE_OUTPUT) {
          output = outputText;
        }
      },
      undefined,
      undefined,
      transformers,
    );

    expect(emitResult.diagnostics.length).toBe(0);
    expect(output).not.toBeNull();

    return omitLeadingWhitespace(output!);
  }

  it('should add `@ViewChild` decorator for a signal `viewChild`', () => {
    const result = transform(`
      import {viewChild, Component} from '@angular/core';

      @Component({})
      class MyDir {
        el = viewChild('el');
      }
    `);

    expect(result).toContain(
      omitLeadingWhitespace(`
      __decorate([
        i0.ViewChild('el', { isSignal: true })
      ], MyDir.prototype, "el", void 0);
    `),
    );
  });

  it('should add `@ViewChild` decorator for a required `viewChild`', () => {
    const result = transform(`
      import {viewChild, Component} from '@angular/core';

      @Component({})
      class MyDir {
        el = viewChild.required('el');
      }
    `);

    expect(result).toContain(
      omitLeadingWhitespace(`
      __decorate([
        i0.ViewChild('el', { isSignal: true })
      ], MyDir.prototype, "el", void 0);
    `),
    );
  });

  it('should add `@ViewChild` decorator for `viewChild` with read option', () => {
    const result = transform(`
      import {viewChild, Component} from '@angular/core';
      import * as bla from '@angular/core';

      const SomeToken = null!;

      @Component({})
      class MyDir {
        el = viewChild('el', {read: SomeToken});
        el2 = viewChild('el', {read: bla.Component});
      }
    `);

    expect(result).toContain(
      omitLeadingWhitespace(`
      __decorate([
        bla.ViewChild('el', { ...{ read: SomeToken }, isSignal: true })
        ], MyDir.prototype, "el", void 0);
    `),
    );
    expect(result).toContain(
      omitLeadingWhitespace(`
      __decorate([
        bla.ViewChild('el', { ...{ read: bla.Component }, isSignal: true })
        ], MyDir.prototype, "el2", void 0);
  `),
    );
  });

  it('should add `@ContentChild` decorator for signal queries with `descendants` option', () => {
    const result = transform(`
      import {contentChild, Directive} from '@angular/core';

      class X {}

      @Directive({})
      class MyDir {
        el = contentChild(X, {descendants: true});
      }
    `);

    expect(result).toContain(
      omitLeadingWhitespace(`
      __decorate([
        i0.ContentChild(X, { ...{ descendants: true }, isSignal: true })
      ], MyDir.prototype, "el", void 0);
    `),
    );
  });

  it('should not transform decorators for non-signal queries', () => {
    const result = transform(`
      import {ViewChildren, viewChild, Component} from '@angular/core';

      @Component({})
      class MyDir {
        el = viewChild('el');
        @ViewChild('el', {someOptionIndicatingThatNothingChanged: true}) nonSignalQuery: any = null;
      }
    `);

    expect(result).toContain(
      omitLeadingWhitespace(`
      __decorate([
        i0.ViewChild('el', { isSignal: true })
        ], MyDir.prototype, "el", void 0);
      __decorate([
        ViewChild('el', { someOptionIndicatingThatNothingChanged: true })
        ], MyDir.prototype, "nonSignalQuery", void 0);
    `),
    );
  });

  it('should not transform signal queries with an existing decorator', () => {
    // This is expected to not happen because technically the TS code for signal inputs
    // should never discover both decorators and a signal query declaration. We handle this
    // gracefully though in case someone compiles without the Angular compiler (which would report a
    // diagnostic).
    const result = transform(`
        import {contentChildren, ContentChildren, Directive} from '@angular/core';

        @Directive({})
        class MyDir {
          @ContentChildren('els', {isSignal: true}) els = contentChildren('els');
        }
      `);

    expect(result).toContain(
      omitLeadingWhitespace(`
      __decorate([
        ContentChildren('els', { isSignal: true })
        ], MyDir.prototype, "els", void 0);
      `),
    );
  });

  it('should preserve existing decorators applied on signal inputs fields', () => {
    const result = transform(`
        import {contentChild, Directive} from '@angular/core';

        declare const MyCustomDecorator: any;

        @Directive({})
        class MyDir {
          @MyCustomDecorator() bla = contentChild('el', {descendants: false});
        }
      `);

    expect(result).toContain(
      omitLeadingWhitespace(`
      __decorate([
        i0.ContentChild('el', { ...{ descendants: false }, isSignal: true }),
        MyCustomDecorator()
        ], MyDir.prototype, "bla", void 0);
      `),
    );
  });

  it('should work with decorator downleveling post-transform', () => {
    const result = transform(
      `
      import {viewChild, Component} from '@angular/core';

      class X {}

      @Component({})
      class MyDir {
        el = viewChild('el', {read: X});
      }
    `,
      /* postDownlevelDecoratorsTransform */ true,
    );

    expect(result).toContain(
      omitLeadingWhitespace(`
      static propDecorators = {
        el: [{ type: i0.ViewChild, args: ['el', { ...{ read: X }, isSignal: true },] }]
      };
    `),
    );
  });
});

/** Omits the leading whitespace for each line of the given text. */
function omitLeadingWhitespace(text: string): string {
  return text.replace(/^\s+/gm, '');
}
