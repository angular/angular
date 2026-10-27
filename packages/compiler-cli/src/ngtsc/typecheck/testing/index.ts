/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  BindingPipe,
  ClassPropertyMapping,
  CssSelector,
  DomSchemaChecker,
  ForeignComponentMeta,
  MatchSource,
  OutOfBandDiagnosticRecorder,
  ParseSourceFile,
  parseTemplate,
  ParseTemplateOptions,
  PropertyRead,
  R3TargetBinder,
  SelectorlessMatcher,
  SelectorMatcher,
  TcbDirectiveMetadata,
  TcbGenericContextBehavior,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstElement,
  TmplAstHoverDeferredTrigger,
  TmplAstInteractionDeferredTrigger,
  TmplAstLetDeclaration,
  TmplAstTemplate,
  TmplAstTextAttribute,
  TmplAstViewportDeferredTrigger,
  TypeCheckId,
  TypeCheckingConfig,
} from '@angular/compiler';
import ts from 'typescript';

import {freshCompilationTicket, NgCompiler, NgCompilerHost} from '../../core';
import {
  absoluteFrom,
  AbsoluteFsPath,
  getFileSystem,
  getSourceFileOrError,
  LogicalFileSystem,
  NgtscCompilerHost,
} from '../../file_system';
import {TestFile} from '../../file_system/testing';
import {
  AbsoluteModuleStrategy,
  LocalIdentifierStrategy,
  LogicalProjectStrategy,
  ModuleResolver,
  Reference,
  ReferenceEmitter,
  RelativePathStrategy,
} from '../../imports';
import {NOOP_INCREMENTAL_BUILD, NoopIncrementalBuildStrategy} from '../../incremental';
import {
  CompoundMetadataReader,
  DirectiveMeta,
  HostDirectivesResolver,
  InputMapping,
  MetadataReaderWithIndex,
  MetaKind,
  NgModuleIndex,
  PipeMeta,
} from '../../metadata';
import {NOOP_PERF_RECORDER} from '../../perf';
import {InliningMode, TsCreateProgramDriver} from '../../program_driver';
import {
  ClassDeclaration,
  isNamedClassDeclaration,
  isNamedFunctionDeclaration,
  TypeScriptReflectionHost,
} from '../../reflection';
import {
  ComponentScopeKind,
  ComponentScopeReader,
  LocalModuleScope,
  ScopeData,
  TypeCheckScopeRegistry,
} from '../../scope';
import {sfExtensionData} from '../../shims';
import {isNgpTestMode, makeProgram} from '../../testing';
import {getRootDirs} from '../../util/src/typescript';
import {
  OptimizeFor,
  ProgramTypeCheckAdapter,
  TemplateContext,
  TemplateDiagnostic,
  TemplateTypeChecker,
  TypeCheckContext,
} from '../api';
import {TypeCheckableDirectiveMeta, TypeCheckBlockMetadata} from '../api/api';
import {TemplateTypeCheckerImpl} from '../src/checker';
import {TypeCheckShimGenerator} from '../src/shim';
import {TypeCheckFile} from '../src/type_check_file';
import {compileTargetsWithNgp, registerNgpTypeCheckSetup} from './src/ngp_typecheck_testing';
import {
  ALL_ENABLED_CONFIG,
  angularAnimationsDts,
  angularCoreDtsFiles,
  angularFormsDtsFiles,
  TestDeclaration,
  TestDirective,
  TypeCheckingTarget,
  typescriptLibDts,
} from './src/test_support';

export * from './src/test_support';

export function tcb(
  template: string,
  declarations: TestDeclaration[] = [],
  config?: Partial<TypeCheckingConfig>,
  options?: {emitSpans?: boolean},
  templateParserOptions?: ParseTemplateOptions,
  foreignComponents: string[] = [],
): string {
  const codeLines = [
    'declare const ɵNgFieldDirective: unique symbol;',
    `export class Test<T extends string> {}`,
  ];

  (function addCodeLines(currentDeclarations) {
    for (const decl of currentDeclarations) {
      if (decl.type === 'directive' && decl.hostDirectives) {
        addCodeLines(decl.hostDirectives.map((hostDir) => hostDir.directive));
      }

      codeLines.push(
        decl.code ??
          `export class ${decl.name}${decl.type === 'directive' || decl.isGeneric ? '<T extends string>' : ''} { ${
            (decl as TestDirective).hasNgFieldDirective === true ? '[ɵNgFieldDirective]: any;' : ''
          } }`,
      );
    }
  })(declarations);

  const rootFilePath = absoluteFrom('/synthetic.ts');
  const {program, host} = makeProgram([
    {name: rootFilePath, contents: codeLines.join('\n'), isRoot: true},
  ]);

  const sf = getSourceFileOrError(program, rootFilePath);
  const clazz = getClass(sf, 'Test');
  const templateUrl = 'synthetic.html';
  const {nodes, errors} = parseTemplate(template, templateUrl, templateParserOptions);
  const selectorlessEnabled = templateParserOptions?.enableSelectorless ?? false;

  if (errors !== null) {
    throw new Error('Template parse errors: \n' + errors.join('\n'));
  }

  const {matcher, pipes, foreignMatcher} = prepareDeclarations(
    declarations,
    (decl) => getClass(sf, decl.name),
    new Map(),
    selectorlessEnabled,
    foreignComponents,
  );
  const binder = new R3TargetBinder<DirectiveMeta>(matcher, foreignMatcher);
  const boundTarget = binder.bind({template: nodes});

  const id = 'tcb' as TypeCheckId;
  const meta: TypeCheckBlockMetadata = {
    id,
    boundTarget,
    pipes,
    schemas: [],
    isStandalone: false,
    preserveWhitespaces: false,
  };

  const fullConfig: TypeCheckingConfig = {
    applyTemplateContextGuards: true,
    checkTypeOfInputBindings: true,
    honorAccessModifiersForInputBindings: false,
    strictNullInputBindings: true,
    checkTypeOfAttributes: true,
    checkTypeOfDomBindings: false,
    checkTypeOfOutputEvents: true,
    checkTypeOfAnimationEvents: true,
    checkTypeOfDomEvents: true,
    checkUnclaimedEventNames: false,
    checkTypeOfDomReferences: true,
    checkTypeOfNonDomReferences: true,
    checkTypeOfPipes: true,
    checkTemplateBodies: true,
    checkControlFlowBodies: true,
    alwaysCheckSchemaInTemplateBodies: true,
    controlFlowPreventingContentProjection: 'warning',
    unusedStandaloneImports: 'warning',
    strictSafeNavigationTypes: true,
    useContextGenericType: true,
    strictLiteralTypes: true,
    enableTemplateTypeChecker: false,
    useInlineTypeConstructors: true,
    allowSignalsInTwoWayBindings: true,
    allowDomEventAssertion: true,
    checkUnknownElements: true,
    ...config,
  };
  options = options || {emitSpans: false};

  const fileName = absoluteFrom('/type-check-file.ts');

  const reflectionHost = new TypeScriptReflectionHost(program.getTypeChecker());

  const refEmmiter: ReferenceEmitter = new ReferenceEmitter([
    new LocalIdentifierStrategy(),
    new RelativePathStrategy(reflectionHost),
  ]);

  const env = new TypeCheckFile(fileName, fullConfig, refEmmiter, host);

  env.addTypeCheckBlock(
    new Reference(clazz),
    meta,
    new NoopSchemaChecker(),
    new NoopOobRecorder(),
    TcbGenericContextBehavior.UseEmitter,
    reflectionHost,
  );

  let rendered = env.render();

  if (!options.emitSpans) {
    rendered = rendered.replace(/\s+\/\*[\s\S]*?\*\//g, '');
  }

  return rendered.replace(/\s+/g, ' ');
}

/**
 * Create a testing environment for template type-checking which contains a number of given test
 * targets.
 *
 * A full Angular environment is not necessary to exercise the template type-checking system.
 * Components only need to be classes which exist, with templates specified in the target
 * configuration. In many cases, it's not even necessary to include source code for test files, as
 * that can be auto-generated based on the provided target configuration.
 */
export function setup(
  targets: TypeCheckingTarget[],
  overrides: {
    config?: Partial<TypeCheckingConfig>;
    options?: ts.CompilerOptions;
    inlining?: boolean;
    inliningMode?: InliningMode;
    parseOptions?: ParseTemplateOptions;
    referenceEmitter?: ReferenceEmitter;
  } = {},
  load: {
    forms?: boolean;
  } = {},
): {
  templateTypeChecker: TemplateTypeChecker;
  program: ts.Program;
  programStrategy: TsCreateProgramDriver;
} {
  const files = [
    typescriptLibDts(),
    ...angularCoreDtsFiles(),
    angularAnimationsDts(),
    ...(load.forms ? angularFormsDtsFiles() : []),
  ];
  const fakeMetadataRegistry = new Map();
  const shims = new Map<AbsoluteFsPath, AbsoluteFsPath>();

  for (const target of targets) {
    let contents: string;
    if (target.source !== undefined) {
      contents = target.source;
    } else {
      contents = `// generated from templates\n\nexport const MODULE = true;\n\n`;
      if (target.templates) {
        for (const className of Object.keys(target.templates)) {
          contents += `export class ${className} {}\n`;
        }
      }
    }

    files.push({name: target.fileName, contents});

    if (!target.fileName.endsWith('.d.ts')) {
      const shimName = TypeCheckShimGenerator.shimFor(target.fileName);
      shims.set(target.fileName, shimName);
      files.push({name: shimName, contents: 'export const MODULE = true;'});
    }
  }

  const opts = overrides.options ?? {};
  const config = overrides.config ?? {};

  const {program, host, options} = makeProgram(
    files,
    {strictNullChecks: true, skipLibCheck: true, noImplicitAny: true, ...opts},
    /* host */ undefined,
    /* checkForErrors */ false,
  );
  const checker = program.getTypeChecker();
  const logicalFs = new LogicalFileSystem(getRootDirs(host, options), host);
  const reflectionHost = new TypeScriptReflectionHost(checker);
  const moduleResolver = new ModuleResolver(
    program,
    options,
    host,
    /* moduleResolutionCache */ null,
  );
  const emitter =
    overrides.referenceEmitter ??
    new ReferenceEmitter([
      new LocalIdentifierStrategy(),
      new AbsoluteModuleStrategy(
        program,
        checker,
        moduleResolver,
        new TypeScriptReflectionHost(checker),
      ),
      new LogicalProjectStrategy(reflectionHost, logicalFs),
    ]);

  const fullConfig = {
    ...ALL_ENABLED_CONFIG,
    useInlineTypeConstructors:
      overrides.inlining !== undefined
        ? overrides.inlining
        : ALL_ENABLED_CONFIG.useInlineTypeConstructors,
    ...config,
  };

  // Map out the scope of each target component, which is needed for the ComponentScopeReader.
  const scopeMap = new Map<ClassDeclaration, ScopeData>();
  for (const target of targets) {
    const sf = getSourceFileOrError(program, target.fileName);
    const scope = makeScope(program, sf, target.declarations ?? []);

    if (shims.has(target.fileName)) {
      const shimFileName = shims.get(target.fileName)!;
      const shimSf = getSourceFileOrError(program, shimFileName);
      sfExtensionData(shimSf).fileShim = {extension: 'ngtypecheck', generatedFrom: target.fileName};
    }

    if (target.templates) {
      for (const className of Object.keys(target.templates)) {
        const classDecl = getClass(sf, className);
        scopeMap.set(classDecl, scope);
      }
    }
  }

  const checkAdapter = createTypeCheckAdapter((sf, ctx) => {
    for (const target of targets) {
      if (getSourceFileOrError(program, target.fileName) !== sf || !target.templates) {
        continue;
      }

      const declarations = target.declarations ?? [];
      const foreignComponents = target.foreignComponents ?? [];

      for (const className of Object.keys(target.templates)) {
        const classDecl = getClass(sf, className);
        const template = target.templates[className];
        const templateUrl = `${className}.html`;
        const templateFile = new ParseSourceFile(template, templateUrl);
        const {nodes, errors} = parseTemplate(template, templateUrl, overrides.parseOptions);
        if (errors !== null) {
          throw new Error('Template parse errors: \n' + errors.join('\n'));
        }

        const {matcher, pipes, foreignMatcher} = prepareDeclarations(
          declarations,
          (decl) => {
            let declFile = sf;
            if (decl.file !== undefined) {
              declFile = program.getSourceFile(decl.file)!;
              if (declFile === undefined) {
                throw new Error(`Unable to locate ${decl.file} for ${decl.type} ${decl.name}`);
              }
            }
            return getClass(declFile, decl.name);
          },
          fakeMetadataRegistry,
          overrides.parseOptions?.enableSelectorless ?? false,
          foreignComponents,
        );
        const binder = new R3TargetBinder<DirectiveMeta>(matcher, foreignMatcher);
        const classRef = new Reference(classDecl);
        const templateContext: TemplateContext = {
          nodes,
          pipes,
          sourceMapping: {
            type: 'external',
            template,
            templateUrl,
            componentClass: classRef.node,
            node: classRef.node.name, // Use the class's name for error mappings.
          },
          file: templateFile,
          parseErrors: errors,
          preserveWhitespaces: false,
        };

        ctx.addDirective(classRef, binder, [], templateContext, null, false);
      }
    }
  });

  const programStrategy = new TsCreateProgramDriver(program, host, options, ['ngtypecheck']);
  if (overrides.inliningMode !== undefined) {
    (programStrategy as any).inliningMode = overrides.inliningMode;
  } else if (overrides.inlining !== undefined) {
    (programStrategy as any).inliningMode = overrides.inlining
      ? InliningMode.InlineOps
      : InliningMode.Error;
  }

  const fakeScopeReader: ComponentScopeReader = {
    getRemoteScope(): null {
      return null;
    },
    // If there is a module with [className] + 'Module' in the same source file, that will be
    // returned as the NgModule for the class.
    getScopeForComponent(clazz: ClassDeclaration): LocalModuleScope | null {
      try {
        const ngModule = getClass(clazz.getSourceFile(), `${clazz.name.getText()}Module`);

        if (!scopeMap.has(clazz)) {
          // This class wasn't part of the target set of components with templates, but is
          // probably a declaration used in one of them. Return an empty scope.
          const emptyScope: ScopeData = {dependencies: [], isPoisoned: false};
          return {
            kind: ComponentScopeKind.NgModule,
            ngModule,
            compilation: emptyScope,
            reexports: [],
            schemas: [],
            exported: emptyScope,
          };
        }
        const scope = scopeMap.get(clazz)!;

        return {
          kind: ComponentScopeKind.NgModule,
          ngModule,
          compilation: scope,
          reexports: [],
          schemas: [],
          exported: scope,
        };
      } catch (e) {
        // No NgModule was found for this class, so it has no scope.
        return null;
      }
    },
  };

  const fakeMetadataReader = getFakeMetadataReader(fakeMetadataRegistry);
  const fakeNgModuleIndex = getFakeNgModuleIndex(fakeMetadataRegistry);
  const typeCheckScopeRegistry = new TypeCheckScopeRegistry(
    fakeScopeReader,
    new CompoundMetadataReader([fakeMetadataReader]),
    new HostDirectivesResolver(fakeMetadataReader),
  );

  const templateTypeChecker = new TemplateTypeCheckerImpl(
    program,
    programStrategy,
    checkAdapter,
    fullConfig,
    emitter,
    reflectionHost,
    host,
    NOOP_INCREMENTAL_BUILD,
    fakeMetadataReader,
    fakeMetadataReader,
    fakeNgModuleIndex,
    fakeScopeReader,
    typeCheckScopeRegistry,
    NOOP_PERF_RECORDER,
  );
  if (isNgpTestMode()) {
    registerNgpTypeCheckSetup(templateTypeChecker, {targets, overrides, load});
  }
  return {templateTypeChecker, program, programStrategy};
}

/**
 * Diagnoses the given template with the specified declarations.
 *
 * @returns a list of error diagnostics.
 */
export function diagnose(
  template: string,
  source: string,
  declarations?: TestDeclaration[],
  additionalSources: TestFile[] = [],
  config?: Partial<TypeCheckingConfig>,
  options?: ts.CompilerOptions,
): string[] {
  const sfPath = absoluteFrom('/main.ts');
  const targets: TypeCheckingTarget[] = [
    {fileName: sfPath, templates: {'TestComponent': template}, source, declarations},
    ...additionalSources.map((testFile) => ({
      fileName: testFile.name,
      source: testFile.contents,
      templates: {},
    })),
  ];
  if (isNgpTestMode()) {
    const diagnostics = compileTargetsWithNgp(targets, {config, options});
    return diagnostics.map((diag) => {
      const text = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
      let fileName = diag.file!.fileName;
      if (fileName.endsWith('/TestComponent.html') || fileName.endsWith('\\TestComponent.html')) {
        fileName = 'TestComponent.html';
      }
      const {line, character} = ts.getLineAndCharacterOfPosition(diag.file!, diag.start!);
      return `${fileName}(${line + 1}, ${character + 1}): ${text}`;
    });
  }
  const {program, templateTypeChecker} = setup(targets, {config, options});
  const sf = getSourceFileOrError(program, sfPath);
  const diagnostics = templateTypeChecker.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram);

  return diagnostics.map((diag) => {
    const text = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
    const fileName = diag.file!.fileName;
    const {line, character} = ts.getLineAndCharacterOfPosition(diag.file!, diag.start!);
    return `${fileName}(${line + 1}, ${character + 1}): ${text}`;
  });
}

function createTypeCheckAdapter(
  fn: (sf: ts.SourceFile, ctx: TypeCheckContext) => void,
): ProgramTypeCheckAdapter {
  return {typeCheck: fn};
}

function getFakeMetadataReader(
  fakeMetadataRegistry: Map<any, DirectiveMeta | null>,
): MetadataReaderWithIndex {
  return {
    getDirectiveMetadata(node: Reference<ClassDeclaration>): DirectiveMeta | null {
      return fakeMetadataRegistry.get(node.debugName) ?? null;
    },
    getKnown(kind: MetaKind): Array<ClassDeclaration> {
      switch (kind) {
        // TODO: This is not needed for these ngtsc tests, but may be wanted in the future.
        default:
          return [];
      }
    },
  } as MetadataReaderWithIndex;
}

function getFakeNgModuleIndex(fakeMetadataRegistry: Map<any, DirectiveMeta | null>): NgModuleIndex {
  return {
    getNgModulesExporting(trait: ClassDeclaration): Array<Reference<ClassDeclaration>> {
      return [];
    },
  } as NgModuleIndex;
}

type DeclarationResolver = (decl: TestDeclaration) => ClassDeclaration<ts.ClassDeclaration>;

function prepareDeclarations(
  declarations: TestDeclaration[],
  resolveDeclaration: DeclarationResolver,
  metadataRegistry: Map<string, TypeCheckableDirectiveMeta>,
  selectorlessEnabled: boolean,
  foreignComponentNames: string[] = [],
) {
  const pipes = new Map<string, PipeMeta>();
  const hostDirectiveResolder = new HostDirectivesResolver(
    getFakeMetadataReader(metadataRegistry as Map<string, DirectiveMeta>),
  );
  const directives: DirectiveMeta[] = [];
  const registerDirective = (decl: TestDirective) => {
    const meta = getDirectiveMetaFromDeclaration(decl, resolveDeclaration);
    directives.push(meta as DirectiveMeta);
    metadataRegistry.set(decl.name, meta);
    decl.hostDirectives?.forEach((hostDecl) => registerDirective(hostDecl.directive));
  };

  for (const decl of declarations) {
    if (decl.type === 'directive') {
      registerDirective(decl);
    } else if (decl.type === 'pipe') {
      pipes.set(decl.pipeName, {
        kind: MetaKind.Pipe,
        ref: new Reference(resolveDeclaration(decl), decl.bestGuessOwningModule),
        name: decl.pipeName,
        nameExpr: null,
        isStandalone: false,
        decorator: null,
        isExplicitlyDeferred: false,
        deferredBlocks: null,
        isPure: true,
      });
    }
  }

  const foreignRegistry = new Map<string, ForeignComponentMeta[]>();
  for (const name of foreignComponentNames) {
    foreignRegistry.set(name, [{name}]);
  }
  const foreignMatcher = new SelectorlessMatcher<ForeignComponentMeta>(foreignRegistry);

  // We need to make two passes over the directives so that all declarations
  // have been registered by the time we resolve the host directives.

  if (selectorlessEnabled) {
    const registry = new Map<string, DirectiveMeta[]>();
    for (const meta of directives) {
      registry.set(meta.name, [meta, ...hostDirectiveResolder.resolve(meta)]);
    }
    return {matcher: new SelectorlessMatcher<DirectiveMeta>(registry), pipes, foreignMatcher};
  } else {
    const matcher = new SelectorMatcher<DirectiveMeta[]>();
    for (const meta of directives) {
      const selector = CssSelector.parse(meta.selector || '');
      const matches = [...hostDirectiveResolder.resolve(meta), meta] as DirectiveMeta[];
      matcher.addSelectables(selector, matches);
    }

    return {matcher, pipes, foreignMatcher};
  }
}

export function getClass(sf: ts.SourceFile, name: string): ClassDeclaration<ts.ClassDeclaration> {
  for (const stmt of sf.statements) {
    if (isNamedClassDeclaration(stmt) && stmt.name.text === name) {
      return stmt;
    }
  }
  throw new Error(`Class ${name} not found in file: ${sf.fileName}: ${sf.text}`);
}

export function getFunction(
  sf: ts.SourceFile,
  name: string,
): ClassDeclaration<ts.FunctionDeclaration> {
  for (const stmt of sf.statements) {
    if (isNamedFunctionDeclaration(stmt) && stmt.name.text === name) {
      return stmt;
    }
  }
  throw new Error(`Function ${name} not found in file: ${sf.fileName}`);
}

function getDirectiveMetaFromDeclaration(
  decl: TestDirective,
  resolveDeclaration: DeclarationResolver,
) {
  return {
    name: decl.name,
    ref: new Reference(resolveDeclaration(decl), decl.bestGuessOwningModule),
    exportAs: decl.exportAs || null,
    selector: decl.selector || null,
    hasNgTemplateContextGuard: decl.hasNgTemplateContextGuard || false,
    inputs: ClassPropertyMapping.fromMappedObject<InputMapping>(decl.inputs || {}),
    isComponent: decl.isComponent || false,
    ngTemplateGuards: decl.ngTemplateGuards || [],
    coercedInputFields: new Set<string>(decl.coercedInputFields || []),
    restrictedInputFields: new Set<string>(decl.restrictedInputFields || []),
    stringLiteralInputFields: new Set<string>(decl.stringLiteralInputFields || []),
    undeclaredInputFields: new Set<string>(decl.undeclaredInputFields || []),
    publicMethods: new Set<string>(decl.publicMethods || []),
    isGeneric: decl.isGeneric ?? false,
    outputs: ClassPropertyMapping.fromMappedObject(decl.outputs || {}),
    queries: decl.queries || [],
    isStructural: false,
    isStandalone: !!decl.isStandalone,
    isSignal: !!decl.isSignal,
    baseClass: null,
    animationTriggerNames: null,
    decorator: null,
    ngContentSelectors: decl.ngContentSelectors || null,
    preserveWhitespaces: decl.preserveWhitespaces ?? false,
    isExplicitlyDeferred: false,
    deferredBlocks: null,
    imports: decl.imports,
    rawImports: null,
    matchSource: MatchSource.Selector,
    hostDirectives:
      decl.hostDirectives === undefined
        ? null
        : decl.hostDirectives.map((hostDecl) => {
            return {
              directive: new Reference(resolveDeclaration(hostDecl.directive)),
              inputs: parseInputOutputMappingArray(hostDecl.inputs || []),
              outputs: parseInputOutputMappingArray(hostDecl.outputs || []),
            };
          }),
  } as TypeCheckableDirectiveMeta;
}

/**
 * Synthesize `ScopeData` metadata from an array of `TestDeclaration`s.
 */
function makeScope(program: ts.Program, sf: ts.SourceFile, decls: TestDeclaration[]): ScopeData {
  const scope: ScopeData = {dependencies: [], isPoisoned: false};

  for (const decl of decls) {
    let declSf = sf;
    if (decl.file !== undefined) {
      declSf = getSourceFileOrError(program, decl.file);
    }
    const declClass = getClass(declSf, decl.name);

    if (decl.type === 'directive') {
      scope.dependencies.push({
        kind: MetaKind.Directive,
        matchSource: MatchSource.Selector,
        ref: new Reference(declClass),
        baseClass: null,
        name: decl.name,
        selector: decl.selector,
        queries: [],
        inputs: ClassPropertyMapping.fromMappedObject<InputMapping>(decl.inputs || {}),
        outputs: ClassPropertyMapping.fromMappedObject(decl.outputs || {}),
        isComponent: decl.isComponent ?? false,
        exportAs: decl.exportAs ?? null,
        ngTemplateGuards: decl.ngTemplateGuards ?? [],
        hasNgTemplateContextGuard: decl.hasNgTemplateContextGuard ?? false,
        coercedInputFields: new Set<string>(decl.coercedInputFields ?? []),
        restrictedInputFields: new Set<string>(decl.restrictedInputFields ?? []),
        stringLiteralInputFields: new Set<string>(decl.stringLiteralInputFields ?? []),
        undeclaredInputFields: new Set<string>(decl.undeclaredInputFields ?? []),
        publicMethods: new Set<string>(decl.publicMethods ?? []),
        isGeneric: decl.isGeneric ?? false,
        isPoisoned: false,
        isStructural: false,
        animationTriggerNames: null,
        isStandalone: false,
        isSignal: false,
        imports: null,
        foreignImports: null,
        rawImports: null,
        deferredImports: null,
        deferredImportsByBlock: null,
        schemas: null,
        decorator: null,
        assumedToExportProviders: false,
        ngContentSelectors: decl.ngContentSelectors || null,
        preserveWhitespaces: decl.preserveWhitespaces ?? false,
        isExplicitlyDeferred: false,
        deferredBlocks: null,
        inputFieldNamesFromMetadataArray: null,
        selectorlessEnabled: false,
        localReferencedSymbols: null,
        hostDirectives:
          decl.hostDirectives === undefined
            ? null
            : decl.hostDirectives.map((hostDecl) => {
                return {
                  directive: new Reference(
                    getClass(
                      hostDecl.directive.file
                        ? getSourceFileOrError(program, hostDecl.directive.file)
                        : sf,
                      hostDecl.directive.name,
                    ),
                  ),
                  origin: sf,
                  isForwardReference: false,
                  inputs: hostDecl.inputs || {},
                  outputs: hostDecl.outputs || {},
                };
              }),
      });
    } else if (decl.type === 'pipe') {
      scope.dependencies.push({
        kind: MetaKind.Pipe,
        ref: new Reference(declClass),
        name: decl.pipeName,
        nameExpr: null,
        isStandalone: false,
        decorator: null,
        isExplicitlyDeferred: false,
        deferredBlocks: null,
        isPure: true,
      });
    }
  }

  return scope;
}

function parseInputOutputMappingArray(values: string[]) {
  return values.reduce(
    (results, value) => {
      // Either the value is 'field' or 'field: property'. In the first case, `property` will
      // be undefined, in which case the field name should also be used as the property name.
      const [field, property] = value.split(':', 2).map((str) => str.trim());
      results[field] = property || field;
      return results;
    },
    {} as {[field: string]: string},
  );
}

export class NoopSchemaChecker implements DomSchemaChecker<TemplateDiagnostic> {
  get diagnostics(): ReadonlyArray<TemplateDiagnostic> {
    return [];
  }

  checkElement(): void {}
  checkTemplateElementProperty(): void {}
  checkTemplateElementEvent(): void {}
  checkHostElementProperty(): void {}
}

export class NoopOobRecorder implements OutOfBandDiagnosticRecorder<TemplateDiagnostic> {
  get diagnostics(): ReadonlyArray<TemplateDiagnostic> {
    return [];
  }
  missingReferenceTarget(): void {}
  missingPipe(): void {}
  deferredPipeUsedEagerly(
    id: TypeCheckId,
    ast: BindingPipe,
    currentBlockName: string | null,
    declaredBlocks: string[] | null,
  ): void {}
  deferredComponentUsedEagerly(
    id: TypeCheckId,
    element: TmplAstElement | TmplAstTemplate,
    dirMeta: TcbDirectiveMetadata,
    currentBlockName: string | null,
    declaredBlocks: string[] | null,
  ): void {}
  duplicateTemplateVar(): void {}
  suboptimalTypeInference(): void {}
  splitTwoWayBinding(): void {}
  missingRequiredInputs(): void {}
  illegalForLoopTrackAccess(): void {}
  inaccessibleDeferredTriggerElement(): void {}
  controlFlowPreventingContentProjection(): void {}
  formFieldUnsupportedBinding(): void {}
  illegalWriteToLetDeclaration(id: TypeCheckId, node: AST, target: TmplAstLetDeclaration): void {}
  letUsedBeforeDefinition(
    id: TypeCheckId,
    node: PropertyRead,
    target: TmplAstLetDeclaration,
  ): void {}
  conflictingDeclaration(id: TypeCheckId, current: TmplAstLetDeclaration): void {}
  multipleMatchingComponents(
    id: TypeCheckId,
    element: TmplAstElement,
    componentNames: string[],
  ): void {}
  missingNamedTemplateDependency(
    id: TypeCheckId,
    node: TmplAstComponent | TmplAstDirective,
  ): void {}
  unclaimedDirectiveBinding(
    id: TypeCheckId,
    directive: TmplAstDirective,
    node: TmplAstBoundAttribute | TmplAstTextAttribute | TmplAstBoundEvent,
  ): void {}
  incorrectTemplateDependencyType(
    id: TypeCheckId,
    node: TmplAstComponent | TmplAstDirective,
  ): void {}
  deferImplicitTriggerMissingPlaceholder(
    id: TypeCheckId,
    trigger:
      | TmplAstHoverDeferredTrigger
      | TmplAstInteractionDeferredTrigger
      | TmplAstViewportDeferredTrigger,
  ): void {}
  deferImplicitTriggerInvalidPlaceholder(
    id: TypeCheckId,
    trigger:
      | TmplAstHoverDeferredTrigger
      | TmplAstInteractionDeferredTrigger
      | TmplAstViewportDeferredTrigger,
  ): void {}
  conflictingHostDirectiveBinding(): void {}
}

export function createNgCompilerForFile(fileContent: string) {
  const fs = getFileSystem();
  fs.ensureDir(absoluteFrom('/node_modules/@angular/core'));
  const FILE = absoluteFrom('/main.ts');

  fs.writeFile(FILE, fileContent);

  const options: ts.CompilerOptions = {
    strictTemplates: true,
    lib: ['dom', 'dom.iterable', 'esnext'],
  };
  const baseHost = new NgtscCompilerHost(getFileSystem(), options);
  const host = NgCompilerHost.wrap(baseHost, [FILE], options, /* oldProgram */ null);
  const program = ts.createProgram({host, options, rootNames: host.inputFiles});

  const ticket = freshCompilationTicket(
    program,
    options,
    new NoopIncrementalBuildStrategy(),
    new TsCreateProgramDriver(program, host, options, []),
    /* perfRecorder */ null,
    /*enableTemplateTypeChecker*/ true,
    /*usePoisonedData*/ false,
  );
  const compiler = NgCompiler.fromTicket(ticket, host);
  return {compiler, sourceFile: program.getSourceFile(FILE)!};
}
