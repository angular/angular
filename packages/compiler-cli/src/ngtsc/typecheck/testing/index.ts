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
  CssSelector,
  ParseSourceFile,
  parseTemplate,
  ParseTemplateOptions,
  PropertyRead,
  R3TargetBinder,
  SelectorlessMatcher,
  SelectorMatcher,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstElement,
  TmplAstHoverDeferredTrigger,
  TmplAstInteractionDeferredTrigger,
  TmplAstLetDeclaration,
  TmplAstTextAttribute,
  TmplAstViewportDeferredTrigger,
} from '@angular/compiler';
import {readFileSync} from 'fs';
import path from 'path';
import ts from 'typescript';
import {globSync} from 'tinyglobby';

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
  ClassPropertyMapping,
  CompoundMetadataReader,
  DecoratorInputTransform,
  DirectiveMeta,
  HostDirectivesResolver,
  InputMapping,
  MatchSource,
  MetadataReaderWithIndex,
  MetaKind,
  NgModuleIndex,
  PipeMeta,
} from '../../metadata';
import {NOOP_PERF_RECORDER} from '../../perf';
import {TsCreateProgramDriver} from '../../program_driver';
import {
  ClassDeclaration,
  isNamedClassDeclaration,
  TypeScriptReflectionHost,
} from '../../reflection';
import {
  ComponentScopeKind,
  ComponentScopeReader,
  LocalModuleScope,
  ScopeData,
  TypeCheckScopeRegistry,
} from '../../scope';
import {makeProgram, resolveFromRunfiles} from '../../testing';
import {getRootDirs} from '../../util/src/typescript';
import {
  OptimizeFor,
  ProgramTypeCheckAdapter,
  TemplateContext,
  TemplateDiagnostic,
  TemplateTypeChecker,
  TypeCheckContext,
} from '../api';
import {
  TypeCheckId,
  TypeCheckableDirectiveMeta,
  TypeCheckBlockMetadata,
  TypeCheckingConfig,
} from '../api/api';
import {TemplateTypeCheckerImpl} from '../src/checker';
import {DomSchemaChecker} from '../src/dom';
import {OutOfBandDiagnosticRecorder} from '../src/oob';
import {TypeCheckShimGenerator} from '../src/shim';
import {TcbGenericContextBehavior} from '../src/type_check_block';
import {TypeCheckFile} from '../src/type_check_file';
import {sfExtensionData} from '../../shims';
import {freshCompilationTicket, NgCompiler, NgCompilerHost} from '../../core';

export function typescriptLibDts(): TestFile {
  return {
    name: absoluteFrom('/lib.d.ts'),
    contents: `
      type Partial<T> = { [P in keyof T]?: T[P]; };
      type Pick<T, K extends keyof T> = { [P in K]: T[P]; };
      type NonNullable<T> = T extends null | undefined ? never : T;

      // The following native type declarations are required for proper type inference
      declare interface Function {
        call(...args: any[]): any;
      }
      declare interface Array<T> {
        [index: number]: T;
        length: number;
      }
      declare interface Iterable<T> {}
      declare interface String {
        length: number;
      }

      declare interface Event {
        preventDefault(): void;
      }
      declare interface MouseEvent extends Event {
        readonly x: number;
        readonly y: number;
      }

      declare interface HTMLElementEventMap {
        "click": MouseEvent;
      }
      declare interface HTMLElement {
        addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any): void;
        addEventListener(type: string, listener: (evt: Event) => void): void;
      }
      declare interface HTMLDivElement extends HTMLElement {}
      declare interface HTMLImageElement extends HTMLElement {
        src: string;
        alt: string;
        width: number;
        height: number;
      }
      declare interface HTMLQuoteElement extends HTMLElement {
        cite: string;
      }
      declare interface HTMLElementTagNameMap {
        "blockquote": HTMLQuoteElement;
        "div": HTMLDivElement;
        "img": HTMLImageElement;
      }
      declare interface Document {
        createElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];
        createElement(tagName: string): HTMLElement;
      }
      declare const document: Document;
   `,
  };
}

let _angularCoreDts: TestFile[] | null = null;
export function angularCoreDtsFiles(): TestFile[] {
  if (_angularCoreDts !== null) {
    return _angularCoreDts;
  }

  const directory = resolveFromRunfiles('angular/packages/core/npm_package');
  const dtsFiles = globSync('**/*.d.ts', {cwd: directory});

  return (_angularCoreDts = dtsFiles.map((fileName) => ({
    name: absoluteFrom(`/node_modules/@angular/core/${fileName}`),
    contents: readFileSync(path.join(directory, fileName), 'utf8'),
  })));
}

export function angularAnimationsDts(): TestFile {
  return {
    name: absoluteFrom('/node_modules/@angular/animations/index.d.ts'),
    contents: `
    export declare class AnimationEvent {
      element: any;
    }
   `,
  };
}

export function ngIfDeclaration(): TestDeclaration {
  return {
    type: 'directive',
    file: absoluteFrom('/ngif.d.ts'),
    selector: '[ngIf]',
    name: 'NgIf',
    inputs: {ngIf: 'ngIf'},
    ngTemplateGuards: [{type: 'binding', inputName: 'ngIf'}],
    hasNgTemplateContextGuard: true,
    isGeneric: true,
  };
}

export function ngIfDts(): TestFile {
  return {
    name: absoluteFrom('/ngif.d.ts'),
    contents: `
    export declare class NgIf<T> {
      ngIf: T;
      static ngTemplateContextGuard<T>(dir: NgIf<T>, ctx: any): ctx is NgIfContext<Exclude<T, false|0|''|null|undefined>>
    }

    export declare class NgIfContext<T> {
      $implicit: T;
      ngIf: T;
    }`,
  };
}

export function ngForDeclaration(): TestDeclaration {
  return {
    type: 'directive',
    file: absoluteFrom('/ngfor.d.ts'),
    selector: '[ngForOf]',
    name: 'NgForOf',
    inputs: {ngForOf: 'ngForOf', ngForTrackBy: 'ngForTrackBy', ngForTemplate: 'ngForTemplate'},
    hasNgTemplateContextGuard: true,
    isGeneric: true,
  };
}

export function ngForDts(): TestFile {
  return {
    name: absoluteFrom('/ngfor.d.ts'),
    contents: `
    export declare class NgForOf<T> {
      ngForOf: T[];
      ngForTrackBy: TrackByFunction<T>;
      static ngTemplateContextGuard<T>(dir: NgForOf<T>, ctx: any): ctx is NgForOfContext<T>;
    }

    export interface TrackByFunction<T> {
      (index: number, item: T): any;
    }

    export declare class NgForOfContext<T> {
      $implicit: T;
      index: number;
      count: number;
      readonly odd: boolean;
      readonly even: boolean;
      readonly first: boolean;
      readonly last: boolean;
    }`,
  };
}

export function ngForTypeCheckTarget(): TypeCheckingTarget {
  const dts = ngForDts();
  return {...dts, fileName: dts.name, source: dts.contents, templates: {}};
}

export const ALL_ENABLED_CONFIG: Readonly<TypeCheckingConfig> = {
  applyTemplateContextGuards: true,
  checkQueries: false,
  checkTemplateBodies: true,
  checkControlFlowBodies: true,
  alwaysCheckSchemaInTemplateBodies: true,
  checkTypeOfInputBindings: true,
  honorAccessModifiersForInputBindings: true,
  strictNullInputBindings: true,
  checkTypeOfAttributes: true,
  // Feature is still in development.
  // TODO(alxhub): enable when DOM checking via lib.dom.d.ts is further along.
  checkTypeOfDomBindings: false,
  checkTypeOfOutputEvents: true,
  checkTypeOfAnimationEvents: true,
  checkTypeOfDomEvents: true,
  checkTypeOfDomReferences: true,
  checkTypeOfNonDomReferences: true,
  checkTypeOfPipes: true,
  strictSafeNavigationTypes: true,
  useContextGenericType: true,
  strictLiteralTypes: true,
  enableTemplateTypeChecker: false,
  useInlineTypeConstructors: true,
  suggestionsForSuboptimalTypeInference: false,
  controlFlowPreventingContentProjection: 'warning',
  unusedStandaloneImports: 'warning',
  allowSignalsInTwoWayBindings: true,
  checkTwoWayBoundEvents: true,
};

// Remove 'ref' from TypeCheckableDirectiveMeta and add a 'selector' instead.
export interface TestDirective
  extends Partial<
    Pick<
      TypeCheckableDirectiveMeta,
      Exclude<
        keyof TypeCheckableDirectiveMeta,
        | 'ref'
        | 'coercedInputFields'
        | 'restrictedInputFields'
        | 'stringLiteralInputFields'
        | 'undeclaredInputFields'
        | 'inputs'
        | 'outputs'
        | 'hostDirectives'
      >
    >
  > {
  selector: string | null;
  name: string;
  file?: AbsoluteFsPath;
  type: 'directive';
  inputs?: {
    [fieldName: string]:
      | string
      | {
          classPropertyName: string;
          bindingPropertyName: string;
          required: boolean;
          isSignal: boolean;
          transform: DecoratorInputTransform | null;
        };
  };
  outputs?: {[fieldName: string]: string};
  coercedInputFields?: string[];
  restrictedInputFields?: string[];
  stringLiteralInputFields?: string[];
  undeclaredInputFields?: string[];
  isGeneric?: boolean;
  code?: string;
  ngContentSelectors?: string[] | null;
  preserveWhitespaces?: boolean;
  hostDirectives?: {
    directive: TestDirective & {isStandalone: true};
    inputs?: string[];
    outputs?: string[];
  }[];
}

export interface TestPipe {
  name: string;
  file?: AbsoluteFsPath;
  isStandalone?: boolean;
  pipeName: string;
  type: 'pipe';
  code?: string;
}

export type TestDeclaration = TestDirective | TestPipe;

export function tcb(
  template: string,
  declarations: TestDeclaration[] = [],
  config?: Partial<TypeCheckingConfig>,
  options?: {emitSpans?: boolean},
  templateParserOptions?: ParseTemplateOptions,
): string {
  const codeLines = [`export class Test<T extends string> {}`];

  (function addCodeLines(currentDeclarations) {
    for (const decl of currentDeclarations) {
      if (decl.type === 'directive' && decl.hostDirectives) {
        addCodeLines(decl.hostDirectives.map((hostDir) => hostDir.directive));
      }

      codeLines.push(decl.code ?? `export class ${decl.name}<T extends string> {}`);
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

  const {matcher, pipes} = prepareDeclarations(
    declarations,
    (decl) => getClass(sf, decl.name),
    new Map(),
    selectorlessEnabled,
  );
  const binder = new R3TargetBinder<DirectiveMeta>(matcher);
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
    checkQueries: false,
    checkTypeOfInputBindings: true,
    honorAccessModifiersForInputBindings: false,
    strictNullInputBindings: true,
    checkTypeOfAttributes: true,
    checkTypeOfDomBindings: false,
    checkTypeOfOutputEvents: true,
    checkTypeOfAnimationEvents: true,
    checkTypeOfDomEvents: true,
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
    suggestionsForSuboptimalTypeInference: false,
    allowSignalsInTwoWayBindings: true,
    checkTwoWayBoundEvents: true,
    ...config,
  };
  options = options || {emitSpans: false};

  const fileName = absoluteFrom('/type-check-file.ts');

  const reflectionHost = new TypeScriptReflectionHost(program.getTypeChecker());

  const refEmmiter: ReferenceEmitter = new ReferenceEmitter([
    new LocalIdentifierStrategy(),
    new RelativePathStrategy(reflectionHost),
  ]);

  const env = new TypeCheckFile(fileName, fullConfig, refEmmiter, reflectionHost, host);

  env.addTypeCheckBlock(
    new Reference(clazz),
    meta,
    new NoopSchemaChecker(),
    new NoopOobRecorder(),
    TcbGenericContextBehavior.UseEmitter,
  );

  const rendered = env.render(!options.emitSpans /* removeComments */);
  return rendered.replace(/\s+/g, ' ');
}

/**
 * A file in the test program, along with any template information for components within the file.
 */
export interface TypeCheckingTarget {
  /**
   * Path to the file in the virtual test filesystem.
   */
  fileName: AbsoluteFsPath;

  /**
   * Raw source code for the file.
   *
   * If this is omitted, source code for the file will be generated based on any expected component
   * classes.
   */
  source?: string;

  /**
   * A map of component class names to string templates for that component.
   */
  templates?: {[className: string]: string};

  /**
   * Any declarations (e.g. directives) which should be considered as part of the scope for the
   * components in this file.
   */
  declarations?: TestDeclaration[];
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
    parseOptions?: ParseTemplateOptions;
  } = {},
): {
  templateTypeChecker: TemplateTypeChecker;
  program: ts.Program;
  programStrategy: TsCreateProgramDriver;
} {
  const files = [typescriptLibDts(), ...angularCoreDtsFiles(), angularAnimationsDts()];
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
  const emitter = new ReferenceEmitter([
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

      for (const className of Object.keys(target.templates)) {
        const classDecl = getClass(sf, className);
        const template = target.templates[className];
        const templateUrl = `${className}.html`;
        const templateFile = new ParseSourceFile(template, templateUrl);
        const {nodes, errors} = parseTemplate(template, templateUrl, overrides.parseOptions);
        if (errors !== null) {
          throw new Error('Template parse errors: \n' + errors.join('\n'));
        }

        const {matcher, pipes} = prepareDeclarations(
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
        );
        const binder = new R3TargetBinder<DirectiveMeta>(matcher);
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
  if (overrides.inlining !== undefined) {
    (programStrategy as any).supportsInlineOperations = overrides.inlining;
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
  const {program, templateTypeChecker} = setup(
    [
      {fileName: sfPath, templates: {'TestComponent': template}, source, declarations},
      ...additionalSources.map((testFile) => ({
        fileName: testFile.name,
        source: testFile.contents,
        templates: {},
      })),
    ],
    {config, options},
  );
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
        ref: new Reference(resolveDeclaration(decl)),
        name: decl.pipeName,
        nameExpr: null,
        isStandalone: false,
        decorator: null,
        isExplicitlyDeferred: false,
        isPure: true,
      });
    }
  }

  // We need to make two passes over the directives so that all declarations
  // have been registered by the time we resolve the host directives.

  if (selectorlessEnabled) {
    const registry = new Map<string, DirectiveMeta[]>();
    for (const meta of directives) {
      registry.set(meta.name, [meta, ...hostDirectiveResolder.resolve(meta)]);
    }
    return {matcher: new SelectorlessMatcher<DirectiveMeta>(registry), pipes};
  } else {
    const matcher = new SelectorMatcher<DirectiveMeta[]>();
    for (const meta of directives) {
      const selector = CssSelector.parse(meta.selector || '');
      const matches = [...hostDirectiveResolder.resolve(meta), meta] as DirectiveMeta[];
      matcher.addSelectables(selector, matches);
    }

    return {matcher, pipes};
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

function getDirectiveMetaFromDeclaration(
  decl: TestDirective,
  resolveDeclaration: DeclarationResolver,
) {
  return {
    name: decl.name,
    ref: new Reference(resolveDeclaration(decl)),
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
    imports: decl.imports,
    rawImports: null,
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
        isGeneric: decl.isGeneric ?? false,
        isPoisoned: false,
        isStructural: false,
        animationTriggerNames: null,
        isStandalone: false,
        isSignal: false,
        imports: null,
        rawImports: null,
        deferredImports: null,
        schemas: null,
        decorator: null,
        assumedToExportProviders: false,
        ngContentSelectors: decl.ngContentSelectors || null,
        preserveWhitespaces: decl.preserveWhitespaces ?? false,
        isExplicitlyDeferred: false,
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

export class NoopSchemaChecker implements DomSchemaChecker {
  get diagnostics(): ReadonlyArray<TemplateDiagnostic> {
    return [];
  }

  checkElement(): void {}
  checkTemplateElementProperty(): void {}
  checkHostElementProperty(): void {}
}

export class NoopOobRecorder implements OutOfBandDiagnosticRecorder {
  get diagnostics(): ReadonlyArray<TemplateDiagnostic> {
    return [];
  }
  missingReferenceTarget(): void {}
  missingPipe(): void {}
  deferredPipeUsedEagerly(id: TypeCheckId, ast: BindingPipe): void {}
  deferredComponentUsedEagerly(id: TypeCheckId, element: TmplAstElement): void {}
  duplicateTemplateVar(): void {}
  requiresInlineTcb(): void {}
  requiresInlineTypeConstructors(): void {}
  suboptimalTypeInference(): void {}
  splitTwoWayBinding(): void {}
  missingRequiredInputs(): void {}
  illegalForLoopTrackAccess(): void {}
  inaccessibleDeferredTriggerElement(): void {}
  controlFlowPreventingContentProjection(): void {}
  illegalWriteToLetDeclaration(id: TypeCheckId, node: AST, target: TmplAstLetDeclaration): void {}
  letUsedBeforeDefinition(
    id: TypeCheckId,
    node: PropertyRead,
    target: TmplAstLetDeclaration,
  ): void {}
  conflictingDeclaration(id: TypeCheckId, current: TmplAstLetDeclaration): void {}
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
