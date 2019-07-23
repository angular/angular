/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {absoluteFrom} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {NOOP_DEFAULT_IMPORT_RECORDER, ReferenceEmitter} from '../../imports';
import {DtsMetadataReader, InjectableClassRegistry, LocalMetadataRegistry} from '../../metadata';
import {PartialEvaluator} from '../../partial_evaluator';
import {ClassDeclaration, TypeScriptReflectionHost, isNamedClassDeclaration} from '../../reflection';
import {LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver} from '../../scope';
import {getDeclaration, makeProgram} from '../../testing';
import {DirectiveDecoratorHandler} from '../src/directive';

runInEachFileSystem(() => {
  let _: typeof absoluteFrom;

  describe('DirectiveDecoratorHandler', () => {
    beforeEach(() => _ = absoluteFrom);

    it('should use the `ReflectionHost` to detect class inheritance', () => {
      const {program} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Directive: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Directive} from '@angular/core';

          @Directive({selector: 'test-dir-1'})
          export class TestDir1 {}

          @Directive({selector: 'test-dir-2'})
          export class TestDir2 {}
        `,
        },
      ]);

      // By default, `TestReflectionHost#hasBaseClass()` returns `false`.
      const analysis1 = analyzeDirective(program, 'TestDir1');
      expect(analysis1.meta.usesInheritance).toBe(false);

      // Tweak `TestReflectionHost#hasBaseClass()` to return true.
      TestReflectionHost.hasBaseClassReturnValue = true;

      const analysis2 = analyzeDirective(program, 'TestDir2');
      expect(analysis2.meta.usesInheritance).toBe(true);

      TestReflectionHost.hasBaseClassReturnValue = false;
    });

    it('should record the source span of a Directive class type', () => {
      const src = `
        import {Directive} from '@angular/core';

        @Directive({selector: 'test-dir'})
        export class TestDir {}
      `;
      const {program} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Directive: any;',
        },
        {
          name: _('/entry.ts'),
          contents: src,
        },
      ]);

      const analysis = analyzeDirective(program, 'TestDir');
      const span = analysis.meta.typeSourceSpan;
      expect(span.toString()).toBe('TestDir');
      expect(span.start.toString()).toContain('/entry.ts@5:22');
      expect(span.end.toString()).toContain('/entry.ts@5:29');
    });
  });

  // Helpers
  class TestReflectionHost extends TypeScriptReflectionHost {
    static hasBaseClassReturnValue = false;

    hasBaseClass(_clazz: ClassDeclaration): boolean {
      return TestReflectionHost.hasBaseClassReturnValue;
    }
  }

  function analyzeDirective(program: ts.Program, dirName: string) {
    const checker = program.getTypeChecker();
    const reflectionHost = new TestReflectionHost(checker);
    const evaluator = new PartialEvaluator(reflectionHost, checker, /*dependencyTracker*/ null);
    const metaReader = new LocalMetadataRegistry();
    const dtsReader = new DtsMetadataReader(checker, reflectionHost);
    const scopeRegistry = new LocalModuleScopeRegistry(
        metaReader, new MetadataDtsModuleScopeResolver(dtsReader, null), new ReferenceEmitter([]),
        null);
    const injectableRegistry = new InjectableClassRegistry(reflectionHost);
    const handler = new DirectiveDecoratorHandler(
        reflectionHost, evaluator, scopeRegistry, scopeRegistry, metaReader,
        NOOP_DEFAULT_IMPORT_RECORDER, injectableRegistry, /*isCore*/ false,
        /*annotateForClosureCompiler*/ false);

    const DirNode = getDeclaration(program, _('/entry.ts'), dirName, isNamedClassDeclaration);

    const detected = handler.detect(DirNode, reflectionHost.getDecoratorsOfDeclaration(DirNode));
    if (detected === undefined) {
      throw new Error(`Failed to recognize @Directive (${dirName}).`);
    }

    const {analysis} = handler.analyze(DirNode, detected.metadata);
    if (analysis === undefined) {
      throw new Error(`Failed to analyze @Directive (${dirName}).`);
    }

    return analysis;
  }
});
