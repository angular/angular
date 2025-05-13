/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ConstantPool, ViewEncapsulation} from '@angular/compiler';
import ts from 'typescript';

import {CycleAnalyzer, CycleHandlingStrategy, ImportGraph} from '../../../cycles';
import {ErrorCode, FatalDiagnosticError, ngErrorCode} from '../../../diagnostics';
import {absoluteFrom} from '../../../file_system';
import {runInEachFileSystem} from '../../../file_system/testing';
import {
  DeferredSymbolTracker,
  ImportedSymbolsTracker,
  ModuleResolver,
  Reference,
  ReferenceEmitter,
} from '../../../imports';
import {
  CompoundMetadataReader,
  DtsMetadataReader,
  HostDirectivesResolver,
  LocalMetadataRegistry,
  ResourceRegistry,
} from '../../../metadata';
import {PartialEvaluator} from '../../../partial_evaluator';
import {NOOP_PERF_RECORDER} from '../../../perf';
import {isNamedClassDeclaration, TypeScriptReflectionHost} from '../../../reflection';
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
  ResourceLoader,
  ResourceLoaderContext,
} from '../../common';
import {ComponentDecoratorHandler} from '../src/handler';

export class StubResourceLoader implements ResourceLoader {
  resolve(v: string): string {
    return v;
  }
  canPreload = false;
  canPreprocess = false;
  load(v: string): string {
    return '';
  }
  preload(): Promise<void> | undefined {
    throw new Error('Not implemented');
  }
  preprocessInline(_data: string, _context: ResourceLoaderContext): Promise<string> {
    throw new Error('Not implemented');
  }
}

function setup(
  program: ts.Program,
  options: ts.CompilerOptions,
  host: ts.CompilerHost,
  opts: {
    compilationMode?: CompilationMode;
    usePoisonedData?: boolean;
    externalRuntimeStyles?: boolean;
  } = {},
) {
  const {
    compilationMode = CompilationMode.FULL,
    usePoisonedData,
    externalRuntimeStyles = false,
  } = opts;
  const checker = program.getTypeChecker();
  const reflectionHost = new TypeScriptReflectionHost(checker);
  const evaluator = new PartialEvaluator(reflectionHost, checker, /* dependencyTracker */ null);
  const moduleResolver = new ModuleResolver(
    program,
    options,
    host,
    /* moduleResolutionCache */ null,
  );
  const importGraph = new ImportGraph(checker, NOOP_PERF_RECORDER);
  const cycleAnalyzer = new CycleAnalyzer(importGraph);
  const metaRegistry = new LocalMetadataRegistry();
  const dtsReader = new DtsMetadataReader(checker, reflectionHost);
  const dtsResolver = new MetadataDtsModuleScopeResolver(dtsReader, null);
  const metaReader = new CompoundMetadataReader([metaRegistry, dtsReader]);
  const scopeRegistry = new LocalModuleScopeRegistry(
    metaRegistry,
    metaReader,
    dtsResolver,
    new ReferenceEmitter([]),
    null,
  );
  const refEmitter = new ReferenceEmitter([]);
  const referencesRegistry = new NoopReferencesRegistry();
  const injectableRegistry = new InjectableClassRegistry(reflectionHost, /* isCore */ false);
  const resourceRegistry = new ResourceRegistry();
  const hostDirectivesResolver = new HostDirectivesResolver(metaReader);
  const typeCheckScopeRegistry = new TypeCheckScopeRegistry(
    scopeRegistry,
    metaReader,
    hostDirectivesResolver,
  );
  const resourceLoader = new StubResourceLoader();
  const importTracker = new ImportedSymbolsTracker();
  const jitDeclarationRegistry = new JitDeclarationRegistry();

  const handler = new ComponentDecoratorHandler(
    reflectionHost,
    evaluator,
    metaRegistry,
    metaReader,
    scopeRegistry,
    {
      getCanonicalFileName: (fileName) => fileName,
    },
    scopeRegistry,
    typeCheckScopeRegistry,
    resourceRegistry,
    /* isCore */ false,
    /* strictCtorDeps */ false,
    resourceLoader,
    /* rootDirs */ ['/'],
    /* defaultPreserveWhitespaces */ false,
    /* i18nUseExternalIds */ true,
    /* enableI18nLegacyMessageIdFormat */ false,
    !!usePoisonedData,
    /* i18nNormalizeLineEndingsInICUs */ false,
    moduleResolver,
    cycleAnalyzer,
    CycleHandlingStrategy.UseRemoteScoping,
    refEmitter,
    referencesRegistry,
    /* depTracker */ null,
    injectableRegistry,
    /* semanticDepGraphUpdater */ null,
    /* annotateForClosureCompiler */ false,
    NOOP_PERF_RECORDER,
    hostDirectivesResolver,
    importTracker,
    true,
    compilationMode,
    new DeferredSymbolTracker(checker, /* onlyExplicitDeferDependencyImports */ false),
    /* forbidOrphanRenderering */ false,
    /* enableBlockSyntax */ true,
    /* enableLetSyntax */ true,
    externalRuntimeStyles,
    /* localCompilationExtraImportsTracker */ null,
    jitDeclarationRegistry,
    /* i18nPreserveSignificantWhitespace */ true,
    /* strictStandalone */ false,
    /* enableHmr */ false,
    /* implicitStandaloneValue */ true,
    /* typeCheckHostBindings */ true,
    /* enableSelectorless */ false,
    /* emitDeclarationOnly */ false,
  );
  return {reflectionHost, handler, resourceLoader, metaRegistry};
}

runInEachFileSystem(() => {
  describe('ComponentDecoratorHandler', () => {
    let _: typeof absoluteFrom;
    beforeEach(() => (_ = absoluteFrom));

    it('should produce a diagnostic when @Component has non-literal argument', () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          const TEST = '';
          @Component(TEST) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host);
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      try {
        handler.analyze(TestCmp, detected.metadata);
        return fail('Analysis should have failed');
      } catch (err) {
        if (!(err instanceof FatalDiagnosticError)) {
          return fail('Error should be a FatalDiagnosticError');
        }
        const diag = err.toDiagnostic();
        expect(diag.code).toEqual(ivyCode(ErrorCode.DECORATOR_ARG_NOT_LITERAL));
        expect(diag.file.fileName.endsWith('entry.ts')).toBe(true);
        expect(diag.start).toBe(detected.metadata.args![0].getStart());
      }
    });

    it('should keep track of inline template', () => {
      const template = '<span>inline</span>';
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '${template}',
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host);
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.resources.template?.path).toBeNull();
      expect(analysis?.resources.template?.node.getText()).toEqual(`'${template}'`);
    });

    it('should keep track of external template', () => {
      const templateUrl = '/myTemplate.ng.html';
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _(templateUrl),
          contents: '<div>hello world</div>',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            templateUrl: '${templateUrl}',
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host);
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.resources.template?.path).toContain(templateUrl);
      expect(analysis?.resources.template?.node.getText()).toContain(`'${templateUrl}'`);
    });

    it('should keep track of internal and external styles', () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/myStyle.css'),
          contents: '<div>hello world</div>',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          // These are ignored because we only attempt to store string literals
          const ignoredStyleUrl = 'asdlfkj';
          const ignoredStyle = '';
          @Component({
            template: '',
            styleUrls: ['/myStyle.css', ignoredStyleUrl],
            styles: ['a { color: red; }', 'b { color: blue; }', ignoredStyle, ...[ignoredStyle]],
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host);
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.resources.styles?.size).toBe(3);
    });

    it('should use an empty source map URL for an indirect template', () => {
      const template = '<span>indirect</span>';
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          const TEMPLATE = '${template}';

          @Component({
            template: TEMPLATE,
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host);
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.template.file?.url).toEqual('');
    });

    it('does not emit a program with template parse errors', () => {
      const template = '{{x ? y }}';
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';
          @Component({
            template: '${template}',
          }) class TestCmp {}
      `,
        },
      ]);

      const {reflectionHost, handler} = setup(program, options, host);
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      const symbol = handler.symbol(TestCmp, analysis!);
      const resolution = handler.resolve(TestCmp, analysis!, symbol);

      const compileResult = handler.compileFull(
        TestCmp,
        analysis!,
        resolution.data!,
        new ConstantPool(),
      );
      expect(compileResult).toEqual([]);
    });

    it('should populate externalStyles from styleUrl when externalRuntimeStyles is enabled', () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/myStyle.css'),
          contents: '<div>hello world</div>',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            styleUrl: '/myStyle.css',
            styles: ['a { color: red; }', 'b { color: blue; }'],
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host, {
        externalRuntimeStyles: true,
      });
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.resources.styles?.size).toBe(2);
      expect(analysis?.meta.externalStyles).toEqual(['/myStyle.css']);
    });

    it('should populate externalStyles from styleUrls when externalRuntimeStyles is enabled', () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/myStyle.css'),
          contents: '<div>hello world</div>',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            styleUrls: ['/myStyle.css', '/myOtherStyle.css'],
            styles: ['a { color: red; }', 'b { color: blue; }'],
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host, {
        externalRuntimeStyles: true,
      });
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.resources.styles?.size).toBe(2);
      expect(analysis?.meta.externalStyles).toEqual(['/myStyle.css', '/myOtherStyle.css']);
    });

    it('should keep default emulated view encapsulation with styleUrls when externalRuntimeStyles is enabled', () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/myStyle.css'),
          contents: '<div>hello world</div>',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            styleUrls: ['/myStyle.css', '/myOtherStyle.css'],
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host, {
        externalRuntimeStyles: true,
      });
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.meta.encapsulation).toBe(ViewEncapsulation.Emulated);
    });

    it('should populate externalStyles from template link element when externalRuntimeStyles is enabled', () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/myStyle.css'),
          contents: '<div>hello world</div>',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '<link rel="stylesheet" href="myTemplateStyle.css" />',
            styles: ['a { color: red; }', 'b { color: blue; }'],
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host, {
        externalRuntimeStyles: true,
      });
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.resources.styles?.size).toBe(2);
      expect(analysis?.meta.externalStyles).toEqual(['myTemplateStyle.css']);
    });

    it('should populate externalStyles with resolve return values when externalRuntimeStyles is enabled', () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/myStyle.css'),
          contents: '<div>hello world</div>',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '<link rel="stylesheet" href="myTemplateStyle.css" />',
            styleUrl: '/myStyle.css',
            styles: ['a { color: red; }', 'b { color: blue; }'],
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler, resourceLoader} = setup(program, options, host, {
        externalRuntimeStyles: true,
      });
      resourceLoader.resolve = (v) => 'abc/' + v;
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.resources.styles?.size).toBe(2);
      expect(analysis?.meta.externalStyles).toEqual([
        'abc//myStyle.css',
        'abc/myTemplateStyle.css',
      ]);
    });

    it('should populate externalStyles from inline style transform when externalRuntimeStyles is enabled', async () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            styles: ['.abc {}']
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler, resourceLoader} = setup(program, options, host, {
        externalRuntimeStyles: true,
      });
      resourceLoader.canPreload = true;
      resourceLoader.canPreprocess = true;
      resourceLoader.preprocessInline = async function (data, context) {
        expect(data).toBe('.abc {}');
        expect(context.containingFile).toBe(_('/entry.ts').toLowerCase());
        expect(context.type).toBe('style');
        expect(context.order).toBe(0);

        return 'abc/myInlineStyle.css';
      };

      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }

      await handler.preanalyze(TestCmp, detected.metadata);

      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.resources.styles?.size).toBe(1);
      expect(analysis?.meta.externalStyles).toEqual(['abc/myInlineStyle.css']);
      expect(analysis?.meta.styles).toEqual([]);
    });

    it('should not populate externalStyles from inline style when externalRuntimeStyles is enabled and no transform', async () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            styles: ['.abc {}']
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host, {
        externalRuntimeStyles: true,
      });

      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }

      await handler.preanalyze(TestCmp, detected.metadata);

      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.resources.styles?.size).toBe(1);
      expect(analysis?.meta.externalStyles).toEqual([]);
      expect(analysis?.meta.styles).toEqual(['.abc {}']);
    });

    it('should not populate externalStyles from inline style when externalRuntimeStyles is enabled and no preanalyze', async () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            styles: ['.abc {}']
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler} = setup(program, options, host, {
        externalRuntimeStyles: true,
      });

      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }

      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.resources.styles?.size).toBe(1);
      expect(analysis?.meta.externalStyles).toEqual([]);
      expect(analysis?.meta.styles).toEqual(['.abc {}']);
    });

    it('should replace inline style content with transformed content', async () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            styles: ['.abc {}']
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler, resourceLoader} = setup(program, options, host);
      resourceLoader.canPreload = true;
      resourceLoader.canPreprocess = true;
      resourceLoader.preprocessInline = async function (data, context) {
        expect(data).toBe('.abc {}');
        expect(context.containingFile).toBe(_('/entry.ts').toLowerCase());
        expect(context.type).toBe('style');

        return '.xyz {}';
      };

      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }

      await handler.preanalyze(TestCmp, detected.metadata);

      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.inlineStyles).toEqual(jasmine.arrayWithExactContents(['.xyz {}']));
    });

    it('should replace template style element content for inline template with transformed content', async () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '<style>.abc {}</style>',
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler, resourceLoader} = setup(program, options, host);
      resourceLoader.canPreload = true;
      resourceLoader.canPreprocess = true;
      resourceLoader.preprocessInline = async function (data, context) {
        expect(data).toBe('.abc {}');
        expect(context.containingFile).toBe(_('/entry.ts').toLowerCase());
        expect(context.type).toBe('style');

        return '.xyz {}';
      };

      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }

      await handler.preanalyze(TestCmp, detected.metadata);

      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.inlineStyles).toEqual(jasmine.arrayWithExactContents(['.xyz {}']));
    });

    it('should replace template style element content for external template with transformed content', async () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/component.ng.html'),
          contents: '<style>.abc {}</style>',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            templateUrl: '/component.ng.html',
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler, resourceLoader} = setup(program, options, host);
      resourceLoader.canPreload = true;
      resourceLoader.canPreprocess = true;
      resourceLoader.resolve = function (v) {
        return _(v).toLowerCase();
      };
      resourceLoader.load = function (v) {
        return host.readFile(v) ?? '';
      };
      resourceLoader.preload = () => Promise.resolve();
      resourceLoader.preprocessInline = async function (data, context) {
        expect(data).toBe('.abc {}');
        expect(context.containingFile).toBe(_('/component.ng.html').toLowerCase());
        expect(context.type).toBe('style');

        return '.xyz {}';
      };

      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }

      await handler.preanalyze(TestCmp, detected.metadata);

      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      expect(analysis?.inlineStyles).toEqual(jasmine.arrayWithExactContents(['.xyz {}']));
    });

    it('should error if canPreprocess is true and async analyze is not used', async () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '',
            styles: ['.abc {}']
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler, resourceLoader} = setup(program, options, host);
      resourceLoader.canPreload = true;
      resourceLoader.canPreprocess = true;

      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }

      expect(() => handler.analyze(TestCmp, detected.metadata)).toThrowError(
        'Inline resource processing requires asynchronous preanalyze.',
      );
    });

    it('should not error if component has no inline styles and canPreprocess is true', async () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';

          @Component({
            template: '',
          }) class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler, resourceLoader} = setup(program, options, host);
      resourceLoader.canPreload = true;
      resourceLoader.canPreprocess = true;
      resourceLoader.preprocessInline = async function (data, context) {
        fail('preprocessInline should not have been called.');
        return data;
      };

      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }

      await handler.preanalyze(TestCmp, detected.metadata);

      expect(() => handler.analyze(TestCmp, detected.metadata)).not.toThrow();
    });

    it('should evaluate the name of animations', () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/node_modules/@angular/animations/index.d.ts'),
          contents: 'export declare function trigger(name: any): any',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';
          import {trigger} from '@angular/animations';

          @Component({
            template: '',
            animations: [
              trigger('animationName'),
              [trigger('nestedAnimationName')],
            ],
          })
          class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler, metaRegistry} = setup(program, options, host);
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      handler.register(TestCmp, analysis!);
      const meta = metaRegistry.getDirectiveMetadata(new Reference(TestCmp));
      expect(meta?.animationTriggerNames?.staticTriggerNames).toEqual([
        'animationName',
        'nestedAnimationName',
      ]);
      expect(meta?.animationTriggerNames?.includesDynamicAnimations).toBeFalse();
    });

    it('should tell if the animations include a dynamic value', () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/node_modules/@angular/animations/index.d.ts'),
          contents: 'export declare function trigger(name: any): any',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';
          import {trigger} from '@angular/animations';

          function buildComplexAnimations() {
            const name = 'complex';
            return [trigger(name)];
          }
          @Component({
            template: '',
            animations: [
              trigger('animationName'),
              buildComplexAnimations(),
            ],
          })
          class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler, metaRegistry} = setup(program, options, host);
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      handler.register(TestCmp, analysis!);
      const meta = metaRegistry.getDirectiveMetadata(new Reference(TestCmp));
      expect(meta?.animationTriggerNames?.staticTriggerNames).toEqual(['animationName']);
      expect(meta?.animationTriggerNames?.includesDynamicAnimations).toBeTrue();
    });

    it('should treat complex animations expressions as dynamic', () => {
      const {program, options, host} = makeProgram([
        {
          name: _('/node_modules/@angular/core/index.d.ts'),
          contents: 'export const Component: any;',
        },
        {
          name: _('/node_modules/@angular/animations/index.d.ts'),
          contents: 'export declare function trigger(name: any): any',
        },
        {
          name: _('/entry.ts'),
          contents: `
          import {Component} from '@angular/core';
          import {trigger} from '@angular/animations';

          function buildComplexAnimations() {
            const name = 'complex';
            return [trigger(name)];
          }
          @Component({
            template: '',
            animations: buildComplexAnimations(),
          })
          class TestCmp {}
      `,
        },
      ]);
      const {reflectionHost, handler, metaRegistry} = setup(program, options, host);
      const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);
      const detected = handler.detect(TestCmp, reflectionHost.getDecoratorsOfDeclaration(TestCmp));
      if (detected === undefined) {
        return fail('Failed to recognize @Component');
      }
      const {analysis} = handler.analyze(TestCmp, detected.metadata);
      handler.register(TestCmp, analysis!);
      const meta = metaRegistry.getDirectiveMetadata(new Reference(TestCmp));
      expect(meta?.animationTriggerNames?.includesDynamicAnimations).toBeTrue();
      expect(meta?.animationTriggerNames?.staticTriggerNames.length).toBe(0);
    });

    describe('localCompilation', () => {
      it('should not produce diagnostic for cross-file imports in standalone component', () => {
        const {program, options, host} = makeProgram(
          [
            {
              name: _('/node_modules/@angular/core/index.d.ts'),
              contents: 'export const Component: any;',
            },
            {
              name: _('/entry.ts'),
              contents: `
            import {Component} from '@angular/core';
            import {SomeModule} from './some_where';

            @Component({
              standalone: true,
              selector: 'main',
              template: '<span>Hi!</span>',
              imports: [SomeModule],
            }) class TestCmp {}
        `,
            },
          ],
          undefined,
          undefined,
          false,
        );
        const {reflectionHost, handler} = setup(program, options, host, {
          compilationMode: CompilationMode.LOCAL,
        });
        const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);

        const detected = handler.detect(
          TestCmp,
          reflectionHost.getDecoratorsOfDeclaration(TestCmp),
        );
        if (detected === undefined) {
          return fail('Failed to recognize @Component');
        }
        const {diagnostics} = handler.analyze(TestCmp, detected.metadata);

        expect(diagnostics).toBeUndefined();
      });

      it('should produce diagnostic for imports in non-standalone component', () => {
        const {program, options, host} = makeProgram(
          [
            {
              name: _('/node_modules/@angular/core/index.d.ts'),
              contents: 'export const Component: any;',
            },
            {
              name: _('/entry.ts'),
              contents: `
            import {Component} from '@angular/core';
            import {SomeModule} from './some_where';

            @Component({
              selector: 'main',
              template: '<span>Hi!</span>',
              imports: [SomeModule],
              standalone: false,
            }) class TestCmp {}
        `,
            },
          ],
          undefined,
          undefined,
          false,
        );
        const {reflectionHost, handler} = setup(program, options, host, {
          compilationMode: CompilationMode.LOCAL,
        });
        const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);

        const detected = handler.detect(
          TestCmp,
          reflectionHost.getDecoratorsOfDeclaration(TestCmp),
        );
        if (detected === undefined) {
          return fail('Failed to recognize @Component');
        }
        const {diagnostics} = handler.analyze(TestCmp, detected.metadata);

        expect(diagnostics).toContain(
          jasmine.objectContaining({
            code: ngErrorCode(ErrorCode.COMPONENT_NOT_STANDALONE),
            messageText: jasmine.stringContaining(`'imports' is only valid`),
          }),
        );
      });

      it('should not produce diagnostic for cross-file schemas in standalone component', () => {
        const {program, options, host} = makeProgram(
          [
            {
              name: _('/node_modules/@angular/core/index.d.ts'),
              contents: 'export const Component: any; export const CUSTOM_ELEMENTS_SCHEMA: any;',
            },
            {
              name: _('/entry.ts'),
              contents: `
            import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
            import {SomeModule} from './some_where';

            @Component({
              standalone: true,
              selector: 'main',
              template: '<span>Hi!</span>',
              schemas: [CUSTOM_ELEMENTS_SCHEMA],
            }) class TestCmp {}
        `,
            },
          ],
          undefined,
          undefined,
          false,
        );
        const {reflectionHost, handler} = setup(program, options, host, {
          compilationMode: CompilationMode.LOCAL,
        });
        const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);

        const detected = handler.detect(
          TestCmp,
          reflectionHost.getDecoratorsOfDeclaration(TestCmp),
        );
        if (detected === undefined) {
          return fail('Failed to recognize @Component');
        }

        const {diagnostics} = handler.analyze(TestCmp, detected.metadata);

        expect(diagnostics).toBeUndefined();
      });

      it('should produce diagnostic for schemas in non-standalone component', () => {
        const {program, options, host} = makeProgram(
          [
            {
              name: _('/node_modules/@angular/core/index.d.ts'),
              contents: 'export const Component: any; export const CUSTOM_ELEMENTS_SCHEMA: any;',
            },
            {
              name: _('/entry.ts'),
              contents: `
            import {Component, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
            import {SomeModule} from './some_where';

            @Component({
              selector: 'main',
              standalone: false,
              template: '<span>Hi!</span>',
              schemas: [CUSTOM_ELEMENTS_SCHEMA],
            }) class TestCmp {}
        `,
            },
          ],
          undefined,
          undefined,
          false,
        );
        const {reflectionHost, handler} = setup(program, options, host, {
          compilationMode: CompilationMode.LOCAL,
        });
        const TestCmp = getDeclaration(program, _('/entry.ts'), 'TestCmp', isNamedClassDeclaration);

        const detected = handler.detect(
          TestCmp,
          reflectionHost.getDecoratorsOfDeclaration(TestCmp),
        );
        if (detected === undefined) {
          return fail('Failed to recognize @Component');
        }

        const {diagnostics} = handler.analyze(TestCmp, detected.metadata);

        expect(diagnostics).toContain(
          jasmine.objectContaining({
            code: ngErrorCode(ErrorCode.COMPONENT_NOT_STANDALONE),
            messageText: jasmine.stringContaining(`'schemas' is only valid`),
          }),
        );
      });
    });
  });

  function ivyCode(code: ErrorCode): number {
    return Number('-99' + code.valueOf());
  }
});
