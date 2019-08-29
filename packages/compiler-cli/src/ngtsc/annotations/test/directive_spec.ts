/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {absoluteFrom} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {NOOP_DEFAULT_IMPORT_RECORDER, ReferenceEmitter} from '../../imports';
import {DtsMetadataReader, LocalMetadataRegistry} from '../../metadata';
import {PartialEvaluator} from '../../partial_evaluator';
import {ClassDeclaration, TypeScriptReflectionHost, isNamedClassDeclaration} from '../../reflection';
import {LocalModuleScopeRegistry, MetadataDtsModuleScopeResolver} from '../../scope';
import {getDeclaration, makeProgram} from '../../testing';
import {DirectiveDecoratorHandler} from '../src/directive';

runInEachFileSystem(() => {
  describe('DirectiveDecoratorHandler', () => {
    let _: typeof absoluteFrom;
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

      const checker = program.getTypeChecker();
      const reflectionHost = new TestReflectionHost(checker);
      const evaluator = new PartialEvaluator(reflectionHost, checker);
      const metaReader = new LocalMetadataRegistry();
      const dtsReader = new DtsMetadataReader(checker, reflectionHost);
      const scopeRegistry = new LocalModuleScopeRegistry(
          metaReader, new MetadataDtsModuleScopeResolver(dtsReader, null), new ReferenceEmitter([]),
          null);
      const handler = new DirectiveDecoratorHandler(
          reflectionHost, evaluator, scopeRegistry, NOOP_DEFAULT_IMPORT_RECORDER, false);

      const analyzeDirective = (dirName: string) => {
        const DirNode = getDeclaration(program, _('/entry.ts'), dirName, isNamedClassDeclaration);

        const detected =
            handler.detect(DirNode, reflectionHost.getDecoratorsOfDeclaration(DirNode));
        if (detected === undefined) {
          throw new Error(`Failed to recognize @Directive (${dirName}).`);
        }

        const {analysis} = handler.analyze(DirNode, detected.metadata);
        if (analysis === undefined) {
          throw new Error(`Failed to analyze @Directive (${dirName}).`);
        }

        return analysis;
      };

      // By default, `TestReflectionHost#hasBaseClass()` returns `false`.
      const analysis1 = analyzeDirective('TestDir1');
      expect(analysis1.meta.usesInheritance).toBe(false);

      // Tweak `TestReflectionHost#hasBaseClass()` to return true.
      reflectionHost.hasBaseClassReturnValue = true;

      const analysis2 = analyzeDirective('TestDir2');
      expect(analysis2.meta.usesInheritance).toBe(true);
    });
  });

  // Helpers
  class TestReflectionHost extends TypeScriptReflectionHost {
    hasBaseClassReturnValue = false;

    hasBaseClass(clazz: ClassDeclaration): boolean { return this.hasBaseClassReturnValue; }
  }
});
