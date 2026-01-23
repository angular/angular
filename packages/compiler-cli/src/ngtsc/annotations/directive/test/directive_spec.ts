/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  CssSelector,
  DirectiveMeta as T2DirectiveMeta,
  parseTemplate,
  R3TargetBinder,
  SelectorMatcher,
  TmplAstElement,
} from '@angular/compiler';
import ts from 'typescript';

import {absoluteFrom} from '../../../file_system';
import {runInEachFileSystem} from '../../../file_system/testing';
import {ImportedSymbolsTracker, ReferenceEmitter} from '../../../imports';
import {
  CompoundMetadataReader,
  DtsMetadataReader,
  HostDirectivesResolver,
  LocalMetadataRegistry,
  ResourceRegistry,
} from '../../../metadata';
import {PartialEvaluator} from '../../../partial_evaluator';
import {NOOP_PERF_RECORDER} from '../../../perf';
import {
  ClassDeclaration,
  isNamedClassDeclaration,
  TypeScriptReflectionHost,
} from '../../../reflection';
import {
  LocalModuleScopeRegistry,
  MetadataDtsModuleScopeResolver,
  TypeCheckScopeRegistry,
} from '../../../scope';
import {getDeclaration, makeProgram} from '../../../testing';
import {CompilationMode} from '../../../transform';
import {
  InjectableClassRegistry,
  JitDeclarationRegistry,
  NoopReferencesRegistry,
} from '../../common';
import {DirectiveDecoratorHandler} from '../index';

runInEachFileSystem(() => {
  let _: typeof absoluteFrom;
  beforeEach(() => (_ = absoluteFrom));

  describe('DirectiveDecoratorHandler', () => {
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

      const analysis1 = analyzeDirective(program, 'TestDir1', /*hasBaseClass*/ false);
      expect(analysis1.meta.usesInheritance).toBe(false);

      const analysis2 = analyzeDirective(program, 'TestDir2', /*hasBaseClass*/ true);
      expect(analysis2.meta.usesInheritance).toBe(true);
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

    it('should produce metadata compatible with template binding', () => {
      const src = `
        import {Directive, Input} from '@angular/core';

        @Directive({selector: '[dir]'})
        export class TestDir {
          @Input('propName')
          fieldName: string;
        }
      `;
      const {program} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Directive: any; export const Input: any;',
        },
        {
          name: _('/entry.ts'),
          contents: src,
        },
      ]);

      const analysis = analyzeDirective(program, 'TestDir');
      const matcher = new SelectorMatcher<T2DirectiveMeta[]>();
      const dirMeta: T2DirectiveMeta = {
        exportAs: null,
        inputs: analysis.inputs,
        outputs: analysis.outputs,
        isComponent: false,
        name: 'Dir',
        selector: '[dir]',
        isStructural: false,
        animationTriggerNames: null,
        ngContentSelectors: null,
        preserveWhitespaces: false,
      };
      matcher.addSelectables(CssSelector.parse('[dir]'), [dirMeta]);

      const {nodes} = parseTemplate('<div dir [propName]="expr"></div>', 'unimportant.html');
      const binder = new R3TargetBinder(matcher).bind({template: nodes});
      const propBinding = (nodes[0] as TmplAstElement).inputs[0];
      const propBindingConsumer = binder.getConsumerOfBinding(propBinding);

      // Assert that the consumer of the binding is the directive, which means that the metadata
      // fed into the SelectorMatcher was compatible with the binder, and did not confuse property
      // and field names.
      expect(propBindingConsumer).toBe(dirMeta);
    });

    it('should identify a structural directive', () => {
      const src = `
        import {Directive, TemplateRef} from '@angular/core';

        @Directive({selector: 'test-dir'})
        export class TestDir {
          constructor(private ref: TemplateRef) {}
        }
      `;
      const {program} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Directive: any; export declare class TemplateRef {}',
        },
        {
          name: _('/entry.ts'),
          contents: src,
        },
      ]);

      const analysis = analyzeDirective(program, 'TestDir');
      expect(analysis.isStructural).toBeTrue();
    });
  });

  // Helpers
  function analyzeDirective(program: ts.Program, dirName: string, hasBaseClass: boolean = false) {
    class TestReflectionHost extends TypeScriptReflectionHost {
      constructor(checker: ts.TypeChecker) {
        super(checker);
      }

      override hasBaseClass(_class: ClassDeclaration): boolean {
        return hasBaseClass;
      }
    }

    const checker = program.getTypeChecker();
    const reflectionHost = new TestReflectionHost(checker);
    const evaluator = new PartialEvaluator(reflectionHost, checker, /*dependencyTracker*/ null);
    const metaReader = new LocalMetadataRegistry();
    const dtsReader = new DtsMetadataReader(checker, reflectionHost);
    const refEmitter = new ReferenceEmitter([]);
    const referenceRegistry = new NoopReferencesRegistry();
    const scopeRegistry = new LocalModuleScopeRegistry(
      metaReader,
      new CompoundMetadataReader([metaReader, dtsReader]),
      new MetadataDtsModuleScopeResolver(dtsReader, null),
      refEmitter,
      null,
    );
    const injectableRegistry = new InjectableClassRegistry(reflectionHost, /* isCore */ false);
    const importTracker = new ImportedSymbolsTracker();
    const jitDeclarationRegistry = new JitDeclarationRegistry();
    const resourceRegistry = new ResourceRegistry();
    const hostDirectivesResolver = new HostDirectivesResolver(metaReader);
    const typeCheckScopeRegistry = new TypeCheckScopeRegistry(
      scopeRegistry,
      metaReader,
      hostDirectivesResolver,
    );

    const handler = new DirectiveDecoratorHandler(
      reflectionHost,
      evaluator,
      scopeRegistry,
      scopeRegistry,
      metaReader,
      injectableRegistry,
      refEmitter,
      referenceRegistry,
      /*isCore*/ false,
      /*strictCtorDeps*/ false,
      /*semanticDepGraphUpdater*/ null,
      /*annotateForClosureCompiler*/ false,
      NOOP_PERF_RECORDER,
      importTracker,
      /*includeClassMetadata*/ true,
      typeCheckScopeRegistry,
      /*compilationMode */ CompilationMode.FULL,
      jitDeclarationRegistry,
      resourceRegistry,
      /* strictStandalone */ false,
      /* implicitStandaloneValue */ true,
      /* usePoisonedData */ false,
      /* typeCheckHostBindings */ true,
      /* emitDeclarationOnly */ false,
    );

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
