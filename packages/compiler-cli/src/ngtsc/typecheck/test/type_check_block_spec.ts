/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {TypeCheckingConfig, WrappedNodeExpr} from '@angular/compiler';
import {absoluteFrom, getSourceFileOrError} from '../../file_system';
import {initMockFileSystem} from '../../file_system/testing';
import {
  ImportFlags,
  LocalIdentifierStrategy,
  Reference,
  ReferenceEmitKind,
  ReferenceEmitResult,
  ReferenceEmitter,
} from '../../imports';
import {InliningMode} from '../../program_driver';
import {OptimizeFor} from '../api';
import {TypeCheckShimGenerator} from '../src/shim';
import {diagnose, setup, tcb, TestDeclaration, TestDirective} from '../testing';

/**
 * The type-check block generator itself is tested in `packages/compiler/test/typecheck`. The specs
 * here cover the ngtsc-specific layers around it: adapting `ts.Node`-based metadata into
 * `TcbDirectiveMetadata` (generic parameters, input transforms, field directives), import and
 * reference emission in type-check files, and diagnostics that require a real TypeScript program.
 */
describe('type check blocks (ngtsc)', () => {
  beforeEach(() => initMockFileSystem('Native'));

  describe('metadata adaptation', () => {
    it('should handle missing property bindings', () => {
      const TEMPLATE = `<div dir [inputA]="foo"></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: '[dir]',
          inputs: {
            fieldA: 'inputA',
            fieldB: 'inputB',
          },
          isGeneric: true,
        },
      ];
      const actual = tcb(TEMPLATE, DIRECTIVES);
      expect(actual).toContain(
        'const _ctor1: <T extends string = any>(init: Pick<i0.Dir<T>, "fieldA" | "fieldB">) => i0.Dir<T> = null!;',
      );
      expect(actual).toContain(
        'var _t1 = _ctor1({ "fieldA": (((this).foo)), "fieldB": 0 as any });',
      );
    });

    it('should use transform type if an input has one', () => {
      const TEMPLATE = `<div dir [fieldA]="expr"></div>`;
      const DIRECTIVES: TestDeclaration[] = [
        {
          type: 'directive',
          name: 'Dir',
          selector: '[dir]',
          inputs: {
            fieldA: {
              bindingPropertyName: 'fieldA',
              classPropertyName: 'fieldA',
              required: false,
              isSignal: false,
              transform: {
                node: ts.factory.createFunctionDeclaration(
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  [],
                  undefined,
                  undefined,
                ),
                type: new Reference(
                  ts.factory.createUnionTypeNode([
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
                    ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                  ]),
                ),
              },
            },
          },
          coercedInputFields: ['fieldA'],
        },
      ];

      const block = tcb(TEMPLATE, DIRECTIVES);

      expect(block).toContain('var _t1 = null! as boolean | string; ' + '_t1 = (((this).expr));');
    });

    it(
      'should use `any` type for type constructors with bound generic params ' +
        'when `useInlineTypeConstructors` is `false`',
      () => {
        const template = `
      <div dir
        [inputA]='foo'
        [inputB]='bar'
        ></div>
      `;
        const declarations: TestDeclaration[] = [
          {
            code: `
             interface PrivateInterface{};
             export class Dir<T extends PrivateInterface, U extends string> {};
          `,
            type: 'directive',
            name: 'Dir',
            selector: '[dir]',
            inputs: {
              inputA: 'inputA',
              inputB: 'inputB',
            },
            isGeneric: true,
          },
        ];

        const renderedTcb = tcb(template, declarations, {useInlineTypeConstructors: false});

        expect(renderedTcb).toContain(`var _t1 = null! as i0.Dir<any, any>;`);
        expect(renderedTcb).toContain(`_t1.inputA = (((this).foo));`);
        expect(renderedTcb).toContain(`_t1.inputB = (((this).bar));`);
      },
    );

    it('should use the generic type of the context when enabled', () => {
      const block = tcb('Test');
      expect(block).toContain('function _tcb1<T extends string>(this: i0.Test<T>)');
    });

    it('should use any for the context generic type when disabled', () => {
      const DISABLED_CONFIG: Partial<TypeCheckingConfig> = {useContextGenericType: false};
      const block = tcb('Test', undefined, DISABLED_CONFIG);
      expect(block).toContain('function _tcb1(this: i0.Test<any>)');
    });

    const FIELD_DIRECTIVE: TestDirective = {
      type: 'directive',
      name: 'FormField',
      selector: '[formField]',
      hasNgFieldDirective: true,
      inputs: {
        field: 'formField',
      },
    };

    it('should generate a string field for an input without a type', () => {
      const block = tcb('<input [formField]="f"/>', [FIELD_DIRECTIVE]);
      expect(block).toContain(
        'var _t1 = null! as { (): string; set: (v: string) => void; } | { (): number | null; set: (v: number | null) => void; };',
      );
      expect(block).toContain('_t1 = ((this).f)().value;');
      expect(block).toContain('var _t2 = null! as i0.FormField;');
      expect(block).toContain('_t2.field = (((this).f));');
    });
  });

  describe('import generation', () => {
    const TEMPLATE = `<div dir [test]="null"></div>`;
    const DIRECTIVE: TestDeclaration = {
      type: 'directive',
      name: 'Dir',
      selector: '[dir]',
      inputs: {
        test: {
          isSignal: true,
          bindingPropertyName: 'test',
          classPropertyName: 'test',
          required: true,
          transform: null,
        },
      },
    };

    it('should prefer namespace imports in type check files for new imports', () => {
      const result = tcb(TEMPLATE, [DIRECTIVE]);

      expect(result).toContain(`import * as i1 from '@angular/core';`);
      expect(result).toContain(`[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]`);
    });

    it('should re-use existing imports from original source files', () => {
      // This is especially important for inline type check blocks.
      // See: https://github.com/angular/angular/pull/53521#pullrequestreview-1778130879.
      const {templateTypeChecker, program, programStrategy} = setup([
        {
          fileName: absoluteFrom('/test.ts'),
          templates: {'AppComponent': TEMPLATE},
          declarations: [DIRECTIVE],
          source: `
          import {Component} from '@angular/core'; // should be re-used

          class AppComponent {}
          export class Dir {}
        `,
        },
      ]);

      // Trigger type check block generation.
      templateTypeChecker.getDiagnosticsForFile(
        getSourceFileOrError(program, absoluteFrom('/test.ts')),
        OptimizeFor.SingleFile,
      );

      const testSf = getSourceFileOrError(programStrategy.getProgram(), absoluteFrom('/test.ts'));
      expect(testSf.text).toContain(
        `import { Component, ɵINPUT_SIGNAL_BRAND_WRITE_TYPE } from '@angular/core'; // should be re-used`,
      );
      expect(testSf.text).toContain(`[ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]`);
    });

    function removeSpans(text: string): string {
      return text.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    it('should copy source content to shim file in CopySourceToTcb mode', () => {
      const TEMPLATE = '<div>{{hello}}</div>';
      const {templateTypeChecker, program, programStrategy} = setup(
        [
          {
            fileName: absoluteFrom('/test.ts'),
            templates: {'AppComponent': TEMPLATE},
            // Use non-exported class to force inlining need
            source: `
              import {Component} from '@angular/core';
              class AppComponent {
                hello = 'world';
              }
            `,
          },
        ],
        {
          inliningMode: InliningMode.CopySourceToTcb,
        },
      );

      // Trigger type check block generation.
      templateTypeChecker.getDiagnosticsForFile(
        getSourceFileOrError(program, absoluteFrom('/test.ts')),
        OptimizeFor.SingleFile,
      );

      const typeCheckProgram = programStrategy.getProgram();
      const originalSf = getSourceFileOrError(typeCheckProgram, absoluteFrom('/test.ts'));
      const shimSf = getSourceFileOrError(
        typeCheckProgram,
        TypeCheckShimGenerator.shimFor(absoluteFrom('/test.ts')),
      );

      // Original file should NOT contain the TCB
      expect(originalSf.text).not.toContain('function tcb');

      // Shim file SHOULD contain the copied source and the TCB
      expect(shimSf.text).toContain('class AppComponent');
      expect(shimSf.text).toContain('function _tcb_');

      // Verify that the TCB contains the binding check
      // The TCB contains spans in comments, so we clean them up for the assertion.
      const cleanShimText = removeSpans(shimSf.text);
      expect(cleanShimText).toContain('"" + (((this).hello');
    });

    it('should not produce conflicting or duplicate imports when using external directives and signal inputs in CopySourceToTcb mode', () => {
      const TEMPLATE = '<div externalDir [data]="123"></div>';
      const EXTERNAL_DIR: TestDirective = {
        type: 'directive',
        name: 'ExternalDir',
        selector: '[externalDir]',
        file: absoluteFrom('/dir.ts'),
        inputs: {
          data: {
            isSignal: true,
            bindingPropertyName: 'data',
            classPropertyName: 'data',
            required: true,
            transform: null,
          },
        },
      };

      const {templateTypeChecker, program, programStrategy} = setup(
        [
          {
            fileName: absoluteFrom('/dir.ts'),
            source: `export class ExternalDir { data: any; }`,
          },
          {
            fileName: absoluteFrom('/existing.ts'),
            source: `export const existing = 1;`,
          },
          {
            fileName: absoluteFrom('/app.ts'),
            templates: {'AppComponent': TEMPLATE},
            declarations: [EXTERNAL_DIR],
            // Non-exported class forces inlining / CopySourceToTcb.
            // Also include an existing `i0` namespace import to verify that the shared
            // ImportManager avoids colliding with identifiers from the copied source.
            source: `
              import {Component} from '@angular/core';
              import * as i0 from './existing';
              class AppComponent {
                existing = i0.existing;
              }
            `,
          },
        ],
        {
          inliningMode: InliningMode.CopySourceToTcb,
        },
      );

      const appSf = getSourceFileOrError(program, absoluteFrom('/app.ts'));
      const diagnostics = templateTypeChecker.getDiagnosticsForFile(appSf, OptimizeFor.SingleFile);
      expect(diagnostics).toEqual([]);

      const typeCheckProgram = programStrategy.getProgram();
      const shimSf = getSourceFileOrError(
        typeCheckProgram,
        TypeCheckShimGenerator.shimFor(absoluteFrom('/app.ts')),
      );

      // Verify that the generated shim has no syntax or semantic errors.
      expect(typeCheckProgram.getSyntacticDiagnostics(shimSf)).toEqual([]);
      expect(typeCheckProgram.getSemanticDiagnostics(shimSf)).toEqual([]);

      const cleanShimText = removeSpans(shimSf.text);

      // Verify that `./dir` is imported with `i0_1` (avoiding collision with existing `i0`) followed
      // by a newline, and `@angular/core` re-uses the existing import from the copied source rather
      // than emitting a second `@angular/core` import declaration.
      expect(cleanShimText).toContain(`import * as i0_1 from './dir'\n`);
      expect(cleanShimText).toContain(
        `import { Component, ɵINPUT_SIGNAL_BRAND_WRITE_TYPE } from '@angular/core';`,
      );
      expect(cleanShimText).not.toContain(`import * as i0 from '@angular/core'`);
      expect(cleanShimText).toContain('null! as i0_1.ExternalDir');
      expect(cleanShimText).toContain('_t1.data[ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]');
    });

    it('should not produce conflicting namespace imports in CopySourceToTcb mode when source has no imports', () => {
      const TEMPLATE = '<div externalDir [data]="123"></div>';
      const EXTERNAL_DIR: TestDirective = {
        type: 'directive',
        name: 'ExternalDir',
        selector: '[externalDir]',
        file: absoluteFrom('/dir.ts'),
        inputs: {
          data: {
            isSignal: true,
            bindingPropertyName: 'data',
            classPropertyName: 'data',
            required: true,
            transform: null,
          },
        },
      };

      const {templateTypeChecker, program, programStrategy} = setup(
        [
          {
            fileName: absoluteFrom('/dir.ts'),
            source: `export class ExternalDir { data: any; }`,
          },
          {
            fileName: absoluteFrom('/app.ts'),
            templates: {'AppComponent': TEMPLATE},
            declarations: [EXTERNAL_DIR],
            source: `
              class AppComponent {}
            `,
          },
        ],
        {
          inliningMode: InliningMode.CopySourceToTcb,
        },
      );

      const appSf = getSourceFileOrError(program, absoluteFrom('/app.ts'));
      const diagnostics = templateTypeChecker.getDiagnosticsForFile(appSf, OptimizeFor.SingleFile);
      expect(diagnostics).toEqual([]);

      const typeCheckProgram = programStrategy.getProgram();
      const shimSf = getSourceFileOrError(
        typeCheckProgram,
        TypeCheckShimGenerator.shimFor(absoluteFrom('/app.ts')),
      );

      expect(typeCheckProgram.getSyntacticDiagnostics(shimSf)).toEqual([]);
      expect(typeCheckProgram.getSemanticDiagnostics(shimSf)).toEqual([]);

      const cleanShimText = removeSpans(shimSf.text);
      expect(cleanShimText).toContain(
        `import * as i0 from './dir'\nimport * as i1 from '@angular/core'\n`,
      );
      expect(cleanShimText).not.toContain(`import * as i0 from '@angular/core'`);
      expect(cleanShimText).toContain('null! as i0.ExternalDir');
      expect(cleanShimText).toContain('_t1.data[i1.ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]');
    });
  });

  describe('reference emission', () => {
    it('should not report diagnostics for aliased directive references via PropertyAccessExpression', () => {
      const fileName = absoluteFrom('/main.ts');
      const source = `
      import {Directive, Input} from '@angular/core';

      @Directive({
        selector: '[dir]',
        standalone: true
      })
      export class OriginalDir {
         @Input() input: string = '';
      }

      export const ns = {
        AliasedDir: OriginalDir
      };

      @Directive({
        selector: 'test-cmp',
        standalone: true,
        imports: [ns.AliasedDir]
      })
      export class TestCmp {}

      // Shadow the original class name to induce a diagnostic error if the
      // type checking block generator falls back to using 'OriginalDir'
      // instead of the aliased 'ns.AliasedDir'.
      const OriginalDir = null;
    `;

      // We need a custom emitter to force the usage of the alias `ns.AliasedDir`.
      // The standard LocalIdentifierStrategy would just return `OriginalDir` since it is exported.
      const localIdStrategy = new LocalIdentifierStrategy();
      const mockRefEmitter = {
        emit(ref: Reference, context: ts.SourceFile, flags: ImportFlags): ReferenceEmitResult {
          if (ts.isClassDeclaration(ref.node) && ref.node.name?.text === 'OriginalDir') {
            return {
              kind: ReferenceEmitKind.Success,
              expression: new WrappedNodeExpr(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier('ns'),
                  'AliasedDir',
                ),
              ),
              importedFile: null,
            } as any;
          }
          const fallback = localIdStrategy.emit(ref, context, flags);
          return fallback ?? {kind: ReferenceEmitKind.Failed, reason: 'mock', context, ref};
        },
      } as unknown as ReferenceEmitter;

      const {program, templateTypeChecker} = setup(
        [
          {
            fileName,
            source,
            templates: {
              TestCmp: '<div dir [input]="\'value\'"></div>',
            },
            declarations: [
              {
                type: 'directive',
                name: 'OriginalDir',
                selector: '[dir]',
                isStandalone: true,
                inputs: {input: 'input'},
              },
            ],
          },
        ],
        {
          // Use our mock emitter
          referenceEmitter: mockRefEmitter,
        },
      );

      const sf = getSourceFileOrError(program, fileName);
      const testCmp = sf.statements.find(
        (s) => ts.isClassDeclaration(s) && s.name?.text === 'TestCmp',
      ) as ts.ClassDeclaration;

      if (!testCmp) {
        throw new Error('Could not find class');
      }

      const diagnostics = templateTypeChecker.getDiagnosticsForComponent(testCmp);
      expect(diagnostics.map((d) => d.messageText)).toEqual([]);
    });
  });

  describe('diagnostics', () => {
    it('should not report unused locals for exhaustiveness check variable', () => {
      const TEMPLATE = `
        @switch (expr) {
          @case (1) {}
          @default never;
        }
      `;
      const SOURCE = `
        export class TestComponent {
          expr!: 1|2;
        }
      `;
      expect(diagnose(TEMPLATE, SOURCE, undefined, [], undefined, {noUnusedLocals: true})).toEqual([
        `TestComponent.html(2, 18): Type '2' is not assignable to type 'never'.`,
      ]);
    });
  });
});
