/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ClassPropertyMapping,
  CssSelector,
  DomSchemaChecker,
  ForeignComponentMeta,
  generateTypeCheckBlock,
  isUnsafeObjectKey,
  MatchSource,
  OutOfBandDiagnosticRecorder,
  parseTemplate,
  ParseTemplateOptions,
  R3Identifiers,
  R3TargetBinder,
  SelectorlessMatcher,
  SelectorMatcher,
  TcbComponentMetadata,
  TcbDirectiveMetadata,
  TcbEnvironment,
  TcbExpr,
  TcbInputMapping,
  TcbPipeMetadata,
  TcbReferenceKey,
  TcbReferenceMetadata,
  TcbTypeCheckBlockMetadata,
  TcbTypeParameter,
  TemplateGuardMeta,
  TypeCheckId,
  TypeCheckingConfig,
  TypeCtorMetadata,
} from '../../src/compiler';

/**
 * Module specifier under which all test declarations (and the component under test) are emitted.
 * Mirrors the compiler-cli test setup, where every declaration lives in `/synthetic.ts` and the
 * type-check block is generated into a separate file that imports it as `./synthetic`.
 */
const SYNTHETIC_MODULE = './synthetic';
const SYNTHETIC_FILE = '/synthetic.ts';

/** Name of the component class that owns the template under test. */
const COMPONENT_NAME = 'Test';

/** Type parameters assigned to the component and to every directive unless overridden. */
const DEFAULT_TYPE_PARAMETERS = ['T extends string'];

/** An input declared with full metadata, as opposed to the `field: 'bindingName'` shorthand. */
export interface TestInput {
  classPropertyName: string;
  bindingPropertyName: string;
  required: boolean;
  isSignal: boolean;
  /** String representation of the type accepted by the input's transform function, if any. */
  transformType?: string;
}

export interface TestDirective {
  type: 'directive';
  name: string;
  selector: string | null;
  exportAs?: string[] | null;
  inputs?: {[fieldName: string]: string | TestInput};
  outputs?: {[fieldName: string]: string};
  isComponent?: boolean;
  isStandalone?: boolean;
  isGeneric?: boolean;
  isStructural?: boolean;
  ngTemplateGuards?: TemplateGuardMeta[];
  hasNgTemplateContextGuard?: boolean;
  hasNgFieldDirective?: boolean;
  coercedInputFields?: string[];
  restrictedInputFields?: string[];
  stringLiteralInputFields?: string[];
  undeclaredInputFields?: string[];
  publicMethods?: string[];
  ngContentSelectors?: string[] | null;
  preserveWhitespaces?: boolean;
  hostDirectives?: {
    directive: TestDirective & {isStandalone: true};
    inputs?: string[];
    outputs?: string[];
  }[];
  /**
   * Source representation of the directive class' type parameters (e.g. `T extends Foo`).
   * Defaults to `['T extends string']`.
   */
  typeParameters?: string[];
  /**
   * Whether the directive's generic bounds can't be emitted into the type-check file, requiring
   * an inline type constructor. Defaults to `false`.
   */
  requiresInlineTypeCtor?: boolean;
}

export interface TestPipe {
  type: 'pipe';
  name: string;
  pipeName: string;
  isStandalone?: boolean;
  isGeneric?: boolean;
}

export type TestDeclaration = TestDirective | TestPipe;

/** Default config used by `tcb`, matching the one used by the compiler-cli TCB tests. */
const DEFAULT_CONFIG: TypeCheckingConfig = {
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
};

export const ALL_ENABLED_CONFIG: Readonly<TypeCheckingConfig> = {
  ...DEFAULT_CONFIG,
  honorAccessModifiersForInputBindings: true,
};

/**
 * Generates a type-check block for the given template and returns it as a single line of code.
 *
 * @param template Template to generate the type-check block for.
 * @param declarations Directives and pipes available to the template.
 * @param config Overrides for the type-checking config.
 * @param options Rendering options. With `emitSpans`, the source span comments are preserved.
 * @param templateParserOptions Options passed through to the template parser.
 * @param foreignComponents Names of foreign components available in the template scope.
 */
export function tcb(
  template: string,
  declarations: TestDeclaration[] = [],
  config?: Partial<TypeCheckingConfig>,
  options?: {emitSpans?: boolean},
  templateParserOptions?: ParseTemplateOptions,
  foreignComponents: string[] = [],
): string {
  const fullConfig: TypeCheckingConfig = {...DEFAULT_CONFIG, ...config};
  const {nodes, errors} = parseTemplate(template, 'synthetic.html', templateParserOptions);

  if (errors !== null) {
    throw new Error('Template parse errors: \n' + errors.join('\n'));
  }

  const {matcher, pipes, foreignMatcher} = prepareDeclarations(
    declarations,
    fullConfig,
    foreignComponents,
  );
  const boundTarget = new R3TargetBinder<TcbDirectiveMetadata>(matcher, foreignMatcher).bind({
    template: nodes,
  });

  // Only pipes that are actually used by the template are passed to the generator.
  const usedPipes = new Map<string, TcbPipeMetadata>();
  for (const name of boundTarget.getUsedPipes()) {
    const pipe = pipes.get(name);
    if (pipe !== undefined) {
      usedPipes.set(name, pipe);
    }
  }

  const meta: TcbTypeCheckBlockMetadata = {
    id: 'tcb' as TypeCheckId,
    boundTarget,
    pipes: usedPipes,
    schemas: [],
    isStandalone: false,
    preserveWhitespaces: false,
  };

  const typeParameters = toTcbTypeParameters(DEFAULT_TYPE_PARAMETERS);
  const component: TcbComponentMetadata = {
    ref: createReference(COMPONENT_NAME),
    typeParameters,
    typeArguments: fullConfig.useContextGenericType
      ? typeParameters.map((param) => param.name)
      : typeParameters.map(() => 'any'),
  };

  const env = new TestTcbEnvironment(fullConfig);
  env.addTypeCheckBlock(
    generateTypeCheckBlock(
      env,
      component,
      '_tcb1',
      meta,
      new NoopSchemaChecker(),
      new NoopOobRecorder(),
    ),
  );

  let rendered = env.render();

  if (!options?.emitSpans) {
    rendered = rendered.replace(/\s+\/\*[\s\S]*?\*\//g, '');
  }

  return rendered.replace(/\s+/g, ' ');
}

/**
 * Minimal, TypeScript-free `TcbEnvironment` that mimics a type-check file: shared declarations
 * (pipe instances and type constructors) are hoisted to the top of the file and every symbol
 * from another module is referenced through a namespace import (`i0`, `i1`, ...), allocated in the
 * order in which modules are first requested.
 */
class TestTcbEnvironment implements TcbEnvironment {
  private readonly imports = new Map<string, string>();
  private readonly typeCtors = new Map<TcbReferenceKey, string>();
  private readonly typeCtorStatements: TcbExpr[] = [];
  private readonly pipeInsts = new Map<TcbReferenceKey, string>();
  private readonly pipeInstStatements: TcbExpr[] = [];
  private readonly tcbStatements: string[] = [];
  private nextTypeCtorId = 1;
  private nextPipeInstId = 1;

  constructor(readonly config: TypeCheckingConfig) {}

  referenceTcbValue(ref: TcbReferenceMetadata): TcbExpr {
    if (ref.unexportedDiagnostic !== null) {
      throw new Error(`Unable to import symbol ${ref.name}: ${ref.unexportedDiagnostic}`);
    }
    if (ref.isLocal || ref.moduleName === null) {
      return new TcbExpr(ref.name);
    }
    return this.referenceExternalSymbol(ref.moduleName, ref.name);
  }

  referenceExternalSymbol(moduleName: string, name: string): TcbExpr {
    let alias = this.imports.get(moduleName);
    if (alias === undefined) {
      alias = `i${this.imports.size}`;
      this.imports.set(moduleName, alias);
    }
    return new TcbExpr(`${alias}.${name}`);
  }

  typeCtorFor(dir: TcbDirectiveMetadata): TcbExpr {
    const existing = this.typeCtors.get(dir.ref.key);
    if (existing !== undefined) {
      return new TcbExpr(existing);
    }

    if (dir.requiresInlineTypeCtor) {
      // The type constructor is declared inline in the directive class.
      const expr = `${this.referenceTcbValue(dir.ref).print()}.ngTypeCtor`;
      this.typeCtors.set(dir.ref.key, expr);
      return new TcbExpr(expr);
    }

    const fnName = `_ctor${this.nextTypeCtorId++}`;
    const meta: TypeCtorMetadata = {
      fnName,
      body: true,
      fields: {inputs: dir.inputs},
      coercedInputFields: dir.coercedInputFields,
    };
    this.typeCtorStatements.push(
      generateTypeCtorDeclaration(
        this,
        meta,
        this.referenceTcbValue(dir.ref),
        dir.typeParameters ?? undefined,
      ),
    );
    this.typeCtors.set(dir.ref.key, fnName);
    return new TcbExpr(fnName);
  }

  pipeInst(pipe: TcbPipeMetadata): TcbExpr {
    const existing = this.pipeInsts.get(pipe.ref.key);
    if (existing !== undefined) {
      return new TcbExpr(existing);
    }

    const pipeType = this.referenceTcbValue(pipe.ref);
    const id = `_pipe${this.nextPipeInstId++}`;
    this.pipeInsts.set(pipe.ref.key, id);
    this.pipeInstStatements.push(new TcbExpr(`var ${id} = null! as ${pipeType.print()}`));
    return new TcbExpr(id);
  }

  getPreludeStatements(): TcbExpr[] {
    // Like a type-check file, declarations are hoisted to the file level instead.
    return [];
  }

  addTypeCheckBlock(code: string): void {
    this.tcbStatements.push(code);
  }

  render(): string {
    let source = '';
    for (const [moduleName, alias] of this.imports) {
      source += `import * as ${alias} from '${moduleName}';\n`;
    }
    source += '\n';
    for (const expr of [...this.pipeInstStatements, ...this.typeCtorStatements]) {
      source += `${expr.print()};\n`;
    }
    source += '\n';
    for (const stmt of this.tcbStatements) {
      source += stmt + '\n';
    }
    return source + '\nexport const IS_A_MODULE = true;\n';
  }
}

/** Generates a declared (non-inline) type constructor for a directive. */
function generateTypeCtorDeclaration(
  env: TcbEnvironment,
  meta: TypeCtorMetadata,
  nodeTypeRef: TcbExpr,
  typeParams: TcbTypeParameter[] | undefined,
): TcbExpr {
  const typeRef = nodeTypeRef.print();
  const typeRefWithGenerics =
    typeParams === undefined || typeParams.length === 0
      ? typeRef
      : `${typeRef}<${typeParams.map((param) => param.name).join(', ')}>`;
  const typeParamsWithDefaults =
    typeParams === undefined || typeParams.length === 0
      ? ''
      : `<${typeParams.map((param) => param.representationWithDefault).join(', ')}>`;

  const plainKeys: string[] = [];
  const coercedKeys: string[] = [];
  const signalInputKeys: string[] = [];

  for (const {classPropertyName, transformType, isSignal} of meta.fields.inputs) {
    if (isSignal) {
      signalInputKeys.push(TcbExpr.quoteAndEscape(classPropertyName));
    } else if (!meta.coercedInputFields.has(classPropertyName)) {
      plainKeys.push(TcbExpr.quoteAndEscape(classPropertyName));
    } else {
      const propName = `ngAcceptInputType_${classPropertyName}`;
      const isUnsafe = isUnsafeObjectKey(classPropertyName);
      const access = isUnsafe ? `[${TcbExpr.quoteAndEscape(propName)}]` : `.${propName}`;
      const coercionType = transformType ?? `typeof ${typeRef}${access}`;
      const key = isUnsafe ? TcbExpr.quoteAndEscape(classPropertyName) : classPropertyName;
      coercedKeys.push(`${key}: ${coercionType}`);
    }
  }

  let initType: string | null = null;
  if (plainKeys.length > 0) {
    initType = `Pick<${typeRefWithGenerics}, ${plainKeys.join(' | ')}>`;
  }
  if (coercedKeys.length > 0) {
    const coercedLiteral = `{\n${coercedKeys.map((key) => `${key};\n`).join('')}}`;
    initType = initType !== null ? `${initType} & ${coercedLiteral}` : coercedLiteral;
  }
  if (signalInputKeys.length > 0) {
    const unwrapRef = env.referenceExternalSymbol(
      R3Identifiers.UnwrapDirectiveSignalInputs.moduleName,
      R3Identifiers.UnwrapDirectiveSignalInputs.name,
    );
    const unwrapExpr = `${unwrapRef.print()}<${typeRefWithGenerics}, ${signalInputKeys.join(' | ')}>`;
    initType = initType !== null ? `${initType} & ${unwrapExpr}` : unwrapExpr;
  }

  const initParam = `init: ${initType ?? '{}'}`;
  const source = meta.body
    ? `const ${meta.fnName}: ${typeParamsWithDefaults}(${initParam}) => ${typeRefWithGenerics} = null!`
    : `declare function ${meta.fnName}${typeParamsWithDefaults}(${initParam}): ${typeRefWithGenerics}`;
  return new TcbExpr(source);
}

function createReference(name: string): TcbReferenceMetadata {
  return {
    name,
    moduleName: SYNTHETIC_MODULE,
    isLocal: false,
    unexportedDiagnostic: null,
    key: `${SYNTHETIC_FILE}#${name}` as TcbReferenceKey,
    nodeFilePath: SYNTHETIC_FILE,
  };
}

function toTcbTypeParameters(representations: string[]): TcbTypeParameter[] {
  return representations.map((representation) => ({
    name: representation.trim().split(/\s+/)[0],
    representation,
    representationWithDefault: representation.includes('=')
      ? representation
      : `${representation} = any`,
  }));
}

function prepareDeclarations(
  declarations: TestDeclaration[],
  config: TypeCheckingConfig,
  foreignComponentNames: string[],
) {
  const directives: TcbDirectiveMetadata[] = [];
  const hostDirectives = new Map<TcbDirectiveMetadata, TcbDirectiveMetadata[]>();
  const pipes = new Map<string, TcbPipeMetadata>();

  for (const decl of declarations) {
    if (decl.type === 'directive') {
      const meta = toDirectiveMetadata(decl);
      directives.push(meta);
      hostDirectives.set(meta, resolveHostDirectives(decl));
    } else {
      pipes.set(decl.pipeName, {
        name: decl.pipeName,
        ref: createReference(decl.name),
        isExplicitlyDeferred: false,
        deferredBlocks: null,
      });
    }
  }

  const foreignRegistry = new Map<string, ForeignComponentMeta[]>();
  for (const name of foreignComponentNames) {
    foreignRegistry.set(name, [{name}]);
  }
  const foreignMatcher = new SelectorlessMatcher<ForeignComponentMeta>(foreignRegistry);

  const matcher = new SelectorMatcher<TcbDirectiveMetadata[]>();
  for (const meta of directives) {
    matcher.addSelectables(CssSelector.parse(meta.selector || ''), [
      ...hostDirectives.get(meta)!,
      meta,
    ]);
  }
  return {matcher, pipes, foreignMatcher};
}

function toDirectiveMetadata(
  decl: TestDirective,
  matchSource = MatchSource.Selector,
): TcbDirectiveMetadata {
  const inputs: {[fieldName: string]: TcbInputMapping} = {};
  for (const [fieldName, input] of Object.entries(decl.inputs ?? {})) {
    inputs[fieldName] =
      typeof input === 'string'
        ? {
            classPropertyName: fieldName,
            bindingPropertyName: input,
            required: false,
            isSignal: false,
          }
        : {...input};
  }

  return {
    ref: createReference(decl.name),
    name: decl.name,
    selector: decl.selector || null,
    exportAs: decl.exportAs || null,
    isComponent: decl.isComponent ?? false,
    isGeneric: decl.isGeneric ?? false,
    isStructural: decl.isStructural ?? false,
    isStandalone: decl.isStandalone ?? false,
    isExplicitlyDeferred: false,
    deferredBlocks: null,
    preserveWhitespaces: decl.preserveWhitespaces ?? false,
    matchSource,
    typeParameters: toTcbTypeParameters(decl.typeParameters ?? DEFAULT_TYPE_PARAMETERS),
    inputs: ClassPropertyMapping.fromMappedObject<TcbInputMapping>(inputs),
    outputs: ClassPropertyMapping.fromMappedObject(decl.outputs ?? {}),
    requiresInlineTypeCtor: decl.requiresInlineTypeCtor ?? false,
    ngTemplateGuards: decl.ngTemplateGuards ?? [],
    hasNgTemplateContextGuard: decl.hasNgTemplateContextGuard ?? false,
    hasNgFieldDirective: decl.hasNgFieldDirective ?? false,
    coercedInputFields: new Set(decl.coercedInputFields ?? []),
    restrictedInputFields: new Set(decl.restrictedInputFields ?? []),
    stringLiteralInputFields: new Set(decl.stringLiteralInputFields ?? []),
    undeclaredInputFields: new Set(decl.undeclaredInputFields ?? []),
    publicMethods: new Set(decl.publicMethods ?? []),
    ngContentSelectors: decl.ngContentSelectors || null,
    animationTriggerNames: null,
  };
}

/**
 * Flattens the host directives of a directive into the list of matches they contribute, with only
 * the inputs and outputs that the host exposes (under the aliases the host exposes them as).
 */
function resolveHostDirectives(
  decl: TestDirective,
  results: TcbDirectiveMetadata[] = [],
): TcbDirectiveMetadata[] {
  for (const hostDir of decl.hostDirectives ?? []) {
    resolveHostDirectives(hostDir.directive, results);

    const meta = toDirectiveMetadata(hostDir.directive, MatchSource.HostDirective);
    const exposedInputs = parseMappingArray(hostDir.inputs ?? []);
    const exposedOutputs = parseMappingArray(hostDir.outputs ?? []);
    const inputs: {[fieldName: string]: TcbInputMapping} = {};
    const outputs: {[fieldName: string]: string} = {};

    for (const [publicName, alias] of Object.entries(exposedInputs)) {
      for (const input of meta.inputs.getByBindingPropertyName(publicName) ?? []) {
        inputs[input.classPropertyName] = {...input, bindingPropertyName: alias};
      }
    }
    for (const [publicName, alias] of Object.entries(exposedOutputs)) {
      for (const output of meta.outputs.getByBindingPropertyName(publicName) ?? []) {
        outputs[output.classPropertyName] = alias;
      }
    }

    results.push({
      ...meta,
      inputs: ClassPropertyMapping.fromMappedObject<TcbInputMapping>(inputs),
      outputs: ClassPropertyMapping.fromMappedObject(outputs),
    });
  }
  return results;
}

/** Parses `['field', 'field: alias']` style mappings into a `{field: alias}` record. */
function parseMappingArray(values: string[]): {[field: string]: string} {
  const result: {[field: string]: string} = {};
  for (const value of values) {
    const [field, alias] = value.split(':', 2).map((part) => part.trim());
    result[field] = alias || field;
  }
  return result;
}

class NoopSchemaChecker implements DomSchemaChecker<unknown> {
  get diagnostics(): ReadonlyArray<unknown> {
    return [];
  }
  checkElement(): void {}
  checkTemplateElementProperty(): void {}
  checkTemplateElementEvent(): void {}
  checkHostElementProperty(): void {}
}

class NoopOobRecorder implements OutOfBandDiagnosticRecorder<unknown> {
  get diagnostics(): ReadonlyArray<unknown> {
    return [];
  }
  missingReferenceTarget(): void {}
  missingPipe(): void {}
  deferredPipeUsedEagerly(): void {}
  deferredComponentUsedEagerly(): void {}
  duplicateTemplateVar(): void {}
  suboptimalTypeInference(): void {}
  splitTwoWayBinding(): void {}
  missingRequiredInputs(): void {}
  illegalForLoopTrackAccess(): void {}
  inaccessibleDeferredTriggerElement(): void {}
  controlFlowPreventingContentProjection(): void {}
  illegalWriteToLetDeclaration(): void {}
  letUsedBeforeDefinition(): void {}
  conflictingDeclaration(): void {}
  missingNamedTemplateDependency(): void {}
  incorrectTemplateDependencyType(): void {}
  unclaimedDirectiveBinding(): void {}
  deferImplicitTriggerMissingPlaceholder(): void {}
  deferImplicitTriggerInvalidPlaceholder(): void {}
  formFieldUnsupportedBinding(): void {}
  multipleMatchingComponents(): void {}
  conflictingHostDirectiveBinding(): void {}
}
