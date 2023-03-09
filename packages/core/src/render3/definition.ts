/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy} from '../change_detection/constants';
import {Mutable, Type} from '../interface/type';
import {NgModuleDef} from '../metadata/ng_module_def';
import {SchemaMetadata} from '../metadata/schema';
import {ViewEncapsulation} from '../metadata/view';
import {noSideEffects} from '../util/closure';
import {EMPTY_ARRAY, EMPTY_OBJ} from '../util/empty';
import {initNgDevMode} from '../util/ng_dev_mode';
import {stringify} from '../util/stringify';

import {NG_COMP_DEF, NG_DIR_DEF, NG_MOD_DEF, NG_PIPE_DEF} from './fields';
import {ComponentDef, ComponentDefFeature, ComponentTemplate, ComponentType, ContentQueriesFunction, DependencyTypeList, DirectiveDef, DirectiveDefFeature, DirectiveDefListOrFactory, HostBindingsFunction, PipeDef, PipeDefListOrFactory, TypeOrFactory, ViewQueriesFunction} from './interfaces/definition';
import {TAttributes, TConstantsOrFactory} from './interfaces/node';
import {CssSelectorList} from './interfaces/projection';
import {stringifyCSSSelectorList} from './node_selector_matcher';

interface DirectiveDefinition<T> {
  /**
   * Directive type, needed to configure the injector.
   */
  type: Type<T>;

  /** The selectors that will be used to match nodes to this directive. */
  selectors?: CssSelectorList;

  /**
   * A map of input names.
   *
   * The format is in: `{[actualPropertyName: string]:(string|[string, string])}`.
   *
   * Given:
   * ```
   * class MyComponent {
   *   @Input()
   *   publicInput1: string;
   *
   *   @Input('publicInput2')
   *   declaredInput2: string;
   * }
   * ```
   *
   * is described as:
   * ```
   * {
   *   publicInput1: 'publicInput1',
   *   declaredInput2: ['declaredInput2', 'publicInput2'],
   * }
   * ```
   *
   * Which the minifier may translate to:
   * ```
   * {
   *   minifiedPublicInput1: 'publicInput1',
   *   minifiedDeclaredInput2: [ 'publicInput2', 'declaredInput2'],
   * }
   * ```
   *
   * This allows the render to re-construct the minified, public, and declared names
   * of properties.
   *
   * NOTE:
   *  - Because declared and public name are usually same we only generate the array
   *    `['declared', 'public']` format when they differ.
   *  - The reason why this API and `outputs` API is not the same is that `NgOnChanges` has
   *    inconsistent behavior in that it uses declared names rather than minified or public. For
   *    this reason `NgOnChanges` will be deprecated and removed in future version and this
   *    API will be simplified to be consistent with `output`.
   */
  inputs?: {[P in keyof T]?: string|[string, string]};

  /**
   * A map of output names.
   *
   * The format is in: `{[actualPropertyName: string]:string}`.
   *
   * Which the minifier may translate to: `{[minifiedPropertyName: string]:string}`.
   *
   * This allows the render to re-construct the minified and non-minified names
   * of properties.
   */
  outputs?: {[P in keyof T]?: string};

  /**
   * A list of optional features to apply.
   *
   * See: {@link NgOnChangesFeature}, {@link ProvidersFeature}, {@link InheritDefinitionFeature}
   */
  features?: DirectiveDefFeature[];

  /**
   * Function executed by the parent template to allow child directive to apply host bindings.
   */
  hostBindings?: HostBindingsFunction<T>;

  /**
   * The number of bindings in this directive `hostBindings` (including pure fn bindings).
   *
   * Used to calculate the length of the component's LView array, so we
   * can pre-fill the array and set the host binding start index.
   */
  hostVars?: number;

  /**
   * Assign static attribute values to a host element.
   *
   * This property will assign static attribute values as well as class and style
   * values to a host element. Since attribute values can consist of different types of values,
   * the `hostAttrs` array must include the values in the following format:
   *
   * attrs = [
   *   // static attributes (like `title`, `name`, `id`...)
   *   attr1, value1, attr2, value,
   *
   *   // a single namespace value (like `x:id`)
   *   NAMESPACE_MARKER, namespaceUri1, name1, value1,
   *
   *   // another single namespace value (like `x:name`)
   *   NAMESPACE_MARKER, namespaceUri2, name2, value2,
   *
   *   // a series of CSS classes that will be applied to the element (no spaces)
   *   CLASSES_MARKER, class1, class2, class3,
   *
   *   // a series of CSS styles (property + value) that will be applied to the element
   *   STYLES_MARKER, prop1, value1, prop2, value2
   * ]
   *
   * All non-class and non-style attributes must be defined at the start of the list
   * first before all class and style values are set. When there is a change in value
   * type (like when classes and styles are introduced) a marker must be used to separate
   * the entries. The marker values themselves are set via entries found in the
   * [AttributeMarker] enum.
   */
  hostAttrs?: TAttributes;

  /**
   * Function to create instances of content queries associated with a given directive.
   */
  contentQueries?: ContentQueriesFunction<T>;

  /**
   * Additional set of instructions specific to view query processing. This could be seen as a
   * set of instructions to be inserted into the template function.
   */
  viewQuery?: ViewQueriesFunction<T>|null;

  /**
   * Defines the name that can be used in the template to assign this directive to a variable.
   *
   * See: {@link Directive.exportAs}
   */
  exportAs?: string[];

  /**
   * Whether this directive/component is standalone.
   */
  standalone?: boolean;
}

interface ComponentDefinition<T> extends Omit<DirectiveDefinition<T>, 'features'> {
  /**
   * The number of nodes, local refs, and pipes in this component template.
   *
   * Used to calculate the length of this component's LView array, so we
   * can pre-fill the array and set the binding start index.
   */
  decls: number;

  /**
   * The number of bindings in this component template (including pure fn bindings).
   *
   * Used to calculate the length of this component's LView array, so we
   * can pre-fill the array and set the host binding start index.
   */
  vars: number;

  /**
   * Template function use for rendering DOM.
   *
   * This function has following structure.
   *
   * ```
   * function Template<T>(ctx:T, creationMode: boolean) {
   *   if (creationMode) {
   *     // Contains creation mode instructions.
   *   }
   *   // Contains binding update instructions
   * }
   * ```
   *
   * Common instructions are:
   * Creation mode instructions:
   *  - `elementStart`, `elementEnd`
   *  - `text`
   *  - `container`
   *  - `listener`
   *
   * Binding update instructions:
   * - `bind`
   * - `elementAttribute`
   * - `elementProperty`
   * - `elementClass`
   * - `elementStyle`
   *
   */
  template: ComponentTemplate<T>;

  /**
   * Constants for the nodes in the component's view.
   * Includes attribute arrays, local definition arrays etc.
   */
  consts?: TConstantsOrFactory;

  /**
   * An array of `ngContent[selector]` values that were found in the template.
   */
  ngContentSelectors?: string[];
  /**
   * A list of optional features to apply.
   *
   * See: {@link NgOnChangesFeature}, {@link ProvidersFeature}
   */
  features?: ComponentDefFeature[];

  /**
   * Defines template and style encapsulation options available for Component's {@link Component}.
   */
  encapsulation?: ViewEncapsulation;

  /**
   * Defines arbitrary developer-defined data to be stored on a renderer instance.
   * This is useful for renderers that delegate to other renderers.
   *
   * see: animation
   */
  data?: {[kind: string]: any};

  /**
   * A set of styles that the component needs to be present for component to render correctly.
   */
  styles?: string[];

  /**
   * The strategy that the default change detector uses to detect changes.
   * When set, takes effect the next time change detection is triggered.
   */
  changeDetection?: ChangeDetectionStrategy;

  /**
   * Registry of directives, components, and pipes that may be found in this component's view.
   *
   * This property is either an array of types or a function that returns the array of types. This
   * function may be necessary to support forward declarations.
   */
  dependencies?: TypeOrFactory<DependencyTypeList>;

  /**
   * The set of schemas that declare elements to be allowed in the component's template.
   */
  schemas?: SchemaMetadata[]|null;
}

/**
 * Create a component definition object.
 *
 *
 * # Example
 * ```
 * class MyComponent {
 *   // Generated by Angular Template Compiler
 *   // [Symbol] syntax will not be supported by TypeScript until v2.7
 *   static ɵcmp = defineComponent({
 *     ...
 *   });
 * }
 * ```
 * @codeGenApi
 */
export function ɵɵdefineComponent<T>(componentDefinition: ComponentDefinition<T>):
    Mutable<ComponentDef<any>, keyof ComponentDef<any>> {
  return noSideEffects(() => {
    // Initialize ngDevMode. This must be the first statement in ɵɵdefineComponent.
    // See the `initNgDevMode` docstring for more information.
    (typeof ngDevMode === 'undefined' || ngDevMode) && initNgDevMode();

    const baseDef = getNgDirectiveDef(componentDefinition as DirectiveDefinition<T>);
    const def: Mutable<ComponentDef<unknown>, keyof ComponentDef<unknown>> = {
      ...baseDef,
      decls: componentDefinition.decls,
      vars: componentDefinition.vars,
      template: componentDefinition.template,
      consts: componentDefinition.consts || null,
      ngContentSelectors: componentDefinition.ngContentSelectors,
      onPush: componentDefinition.changeDetection === ChangeDetectionStrategy.OnPush,
      directiveDefs: null!,  // assigned in noSideEffects
      pipeDefs: null!,       // assigned in noSideEffects
      dependencies: baseDef.standalone && componentDefinition.dependencies || null,
      getStandaloneInjector: null,
      data: componentDefinition.data || {},
      encapsulation: componentDefinition.encapsulation || ViewEncapsulation.Emulated,
      styles: componentDefinition.styles || EMPTY_ARRAY,
      _: null,
      schemas: componentDefinition.schemas || null,
      tView: null,
      id: '',
    };

    initFeatures(def);
    const dependencies = componentDefinition.dependencies;
    def.directiveDefs = extractDefListOrFactory(dependencies, /* pipeDef */ false);
    def.pipeDefs = extractDefListOrFactory(dependencies, /* pipeDef */ true);
    def.id = getComponentId(def);

    return def;
  });
}

/**
 * Generated next to NgModules to monkey-patch directive and pipe references onto a component's
 * definition, when generating a direct reference in the component file would otherwise create an
 * import cycle.
 *
 * See [this explanation](https://hackmd.io/Odw80D0pR6yfsOjg_7XCJg?view) for more details.
 *
 * @codeGenApi
 */
export function ɵɵsetComponentScope(
    type: ComponentType<any>, directives: Type<any>[]|(() => Type<any>[]),
    pipes: Type<any>[]|(() => Type<any>[])): void {
  const def = type.ɵcmp as ComponentDef<any>;
  def.directiveDefs = extractDefListOrFactory(directives, /* pipeDef */ false);
  def.pipeDefs = extractDefListOrFactory(pipes, /* pipeDef */ true);
}

export function extractDirectiveDef(type: Type<any>): DirectiveDef<any>|ComponentDef<any>|null {
  return getComponentDef(type) || getDirectiveDef(type);
}

function nonNull<T>(value: T|null): value is T {
  return value !== null;
}

/**
 * @codeGenApi
 */
export function ɵɵdefineNgModule<T>(def: {
  /** Token representing the module. Used by DI. */
  type: T;

  /** List of components to bootstrap. */
  bootstrap?: Type<any>[] | (() => Type<any>[]);

  /** List of components, directives, and pipes declared by this module. */
  declarations?: Type<any>[] | (() => Type<any>[]);

  /** List of modules or `ModuleWithProviders` imported by this module. */
  imports?: Type<any>[] | (() => Type<any>[]);

  /**
   * List of modules, `ModuleWithProviders`, components, directives, or pipes exported by this
   * module.
   */
  exports?: Type<any>[] | (() => Type<any>[]);

  /** The set of schemas that declare elements to be allowed in the NgModule. */
  schemas?: SchemaMetadata[] | null;

  /** Unique ID for the module that is used with `getModuleFactory`. */
  id?: string | null;
}): unknown {
  return noSideEffects(() => {
    const res: NgModuleDef<T> = {
      type: def.type,
      bootstrap: def.bootstrap || EMPTY_ARRAY,
      declarations: def.declarations || EMPTY_ARRAY,
      imports: def.imports || EMPTY_ARRAY,
      exports: def.exports || EMPTY_ARRAY,
      transitiveCompileScopes: null,
      schemas: def.schemas || null,
      id: def.id || null,
    };
    return res;
  });
}

/**
 * Adds the module metadata that is necessary to compute the module's transitive scope to an
 * existing module definition.
 *
 * Scope metadata of modules is not used in production builds, so calls to this function can be
 * marked pure to tree-shake it from the bundle, allowing for all referenced declarations
 * to become eligible for tree-shaking as well.
 *
 * @codeGenApi
 */
export function ɵɵsetNgModuleScope(type: any, scope: {
  /** List of components, directives, and pipes declared by this module. */
  declarations?: Type<any>[]|(() => Type<any>[]);

  /** List of modules or `ModuleWithProviders` imported by this module. */
  imports?: Type<any>[] | (() => Type<any>[]);

  /**
   * List of modules, `ModuleWithProviders`, components, directives, or pipes exported by this
   * module.
   */
  exports?: Type<any>[] | (() => Type<any>[]);
}): unknown {
  return noSideEffects(() => {
    const ngModuleDef = getNgModuleDef(type, true);
    ngModuleDef.declarations = scope.declarations || EMPTY_ARRAY;
    ngModuleDef.imports = scope.imports || EMPTY_ARRAY;
    ngModuleDef.exports = scope.exports || EMPTY_ARRAY;
  });
}

/**
 * Inverts an inputs or outputs lookup such that the keys, which were the
 * minified keys, are part of the values, and the values are parsed so that
 * the publicName of the property is the new key
 *
 * e.g. for
 *
 * ```
 * class Comp {
 *   @Input()
 *   propName1: string;
 *
 *   @Input('publicName2')
 *   declaredPropName2: number;
 * }
 * ```
 *
 * will be serialized as
 *
 * ```
 * {
 *   propName1: 'propName1',
 *   declaredPropName2: ['publicName2', 'declaredPropName2'],
 * }
 * ```
 *
 * which is than translated by the minifier as:
 *
 * ```
 * {
 *   minifiedPropName1: 'propName1',
 *   minifiedPropName2: ['publicName2', 'declaredPropName2'],
 * }
 * ```
 *
 * becomes: (public name => minifiedName)
 *
 * ```
 * {
 *  'propName1': 'minifiedPropName1',
 *  'publicName2': 'minifiedPropName2',
 * }
 * ```
 *
 * Optionally the function can take `secondary` which will result in: (public name => declared name)
 *
 * ```
 * {
 *  'propName1': 'propName1',
 *  'publicName2': 'declaredPropName2',
 * }
 * ```
 *

 */
function invertObject<T>(
    obj?: {[P in keyof T]?: string|[string, string]},
    secondary?: {[key: string]: string}): {[P in keyof T]: string} {
  if (obj == null) return EMPTY_OBJ as any;
  const newLookup: any = {};
  for (const minifiedKey in obj) {
    if (obj.hasOwnProperty(minifiedKey)) {
      let publicName: string|[string, string] = obj[minifiedKey]!;
      let declaredName = publicName;
      if (Array.isArray(publicName)) {
        declaredName = publicName[1];
        publicName = publicName[0];
      }
      newLookup[publicName] = minifiedKey;
      if (secondary) {
        (secondary[publicName] = declaredName as string);
      }
    }
  }
  return newLookup;
}

/**
 * Create a directive definition object.
 *
 * # Example
 * ```ts
 * class MyDirective {
 *   // Generated by Angular Template Compiler
 *   // [Symbol] syntax will not be supported by TypeScript until v2.7
 *   static ɵdir = ɵɵdefineDirective({
 *     ...
 *   });
 * }
 * ```
 *
 * @codeGenApi
 */
export function ɵɵdefineDirective<T>(directiveDefinition: DirectiveDefinition<T>):
    Mutable<DirectiveDef<any>, keyof DirectiveDef<any>> {
  return noSideEffects(() => {
    const def = getNgDirectiveDef(directiveDefinition);
    initFeatures(def);

    return def;
  });
}

/**
 * Create a pipe definition object.
 *
 * # Example
 * ```
 * class MyPipe implements PipeTransform {
 *   // Generated by Angular Template Compiler
 *   static ɵpipe = definePipe({
 *     ...
 *   });
 * }
 * ```
 * @param pipeDef Pipe definition generated by the compiler
 *
 * @codeGenApi
 */
export function ɵɵdefinePipe<T>(pipeDef: {
  /** Name of the pipe. Used for matching pipes in template to pipe defs. */
  name: string;

  /** Pipe class reference. Needed to extract pipe lifecycle hooks. */
  type: Type<T>;

  /** Whether the pipe is pure. */
  pure?: boolean;

  /**
   * Whether the pipe is standalone.
   */
  standalone?: boolean;
}): unknown {
  return (<PipeDef<T>>{
    type: pipeDef.type,
    name: pipeDef.name,
    factory: null,
    pure: pipeDef.pure !== false,
    standalone: pipeDef.standalone === true,
    onDestroy: pipeDef.type.prototype.ngOnDestroy || null
  });
}

/**
 * The following getter methods retrieve the definition from the type. Currently the retrieval
 * honors inheritance, but in the future we may change the rule to require that definitions are
 * explicit. This would require some sort of migration strategy.
 */

export function getComponentDef<T>(type: any): ComponentDef<T>|null {
  return type[NG_COMP_DEF] || null;
}

export function getDirectiveDef<T>(type: any): DirectiveDef<T>|null {
  return type[NG_DIR_DEF] || null;
}

export function getPipeDef<T>(type: any): PipeDef<T>|null {
  return type[NG_PIPE_DEF] || null;
}

/**
 * Checks whether a given Component, Directive or Pipe is marked as standalone.
 * This will return false if passed anything other than a Component, Directive, or Pipe class
 * See this guide for additional information: https://angular.io/guide/standalone-components
 *
 * @param type A reference to a Component, Directive or Pipe.
 * @publicApi
 */
export function isStandalone(type: Type<unknown>): boolean {
  const def = getComponentDef(type) || getDirectiveDef(type) || getPipeDef(type);
  return def !== null ? def.standalone : false;
}

export function getNgModuleDef<T>(type: any, throwNotFound: true): NgModuleDef<T>;
export function getNgModuleDef<T>(type: any): NgModuleDef<T>|null;
export function getNgModuleDef<T>(type: any, throwNotFound?: boolean): NgModuleDef<T>|null {
  const ngModuleDef = type[NG_MOD_DEF] || null;
  if (!ngModuleDef && throwNotFound === true) {
    throw new Error(`Type ${stringify(type)} does not have 'ɵmod' property.`);
  }
  return ngModuleDef;
}

function getNgDirectiveDef<T>(directiveDefinition: DirectiveDefinition<T>):
    Mutable<DirectiveDef<unknown>, keyof DirectiveDef<unknown>> {
  const declaredInputs: Record<string, string> = {};

  return {
    type: directiveDefinition.type,
    providersResolver: null,
    factory: null,
    hostBindings: directiveDefinition.hostBindings || null,
    hostVars: directiveDefinition.hostVars || 0,
    hostAttrs: directiveDefinition.hostAttrs || null,
    contentQueries: directiveDefinition.contentQueries || null,
    declaredInputs,
    exportAs: directiveDefinition.exportAs || null,
    standalone: directiveDefinition.standalone === true,
    selectors: directiveDefinition.selectors || EMPTY_ARRAY,
    viewQuery: directiveDefinition.viewQuery || null,
    features: directiveDefinition.features || null,
    setInput: null,
    findHostDirectiveDefs: null,
    hostDirectives: null,
    inputs: invertObject(directiveDefinition.inputs, declaredInputs),
    outputs: invertObject(directiveDefinition.outputs),
  };
}

function initFeatures(definition:|Mutable<DirectiveDef<unknown>, keyof DirectiveDef<unknown>>|
                      Mutable<ComponentDef<unknown>, keyof ComponentDef<unknown>>): void {
  definition.features?.forEach((fn) => fn(definition));
}

function extractDefListOrFactory(
    dependencies: TypeOrFactory<DependencyTypeList>|undefined,
    pipeDef: false): DirectiveDefListOrFactory|null;
function extractDefListOrFactory(
    dependencies: TypeOrFactory<DependencyTypeList>|undefined, pipeDef: true): PipeDefListOrFactory|
    null;
function extractDefListOrFactory(
    dependencies: TypeOrFactory<DependencyTypeList>|undefined, pipeDef: boolean): unknown {
  if (!dependencies) {
    return null;
  }

  const defExtractor = pipeDef ? getPipeDef : extractDirectiveDef;

  return () => (typeof dependencies === 'function' ? dependencies() : dependencies)
                   .map(dep => defExtractor(dep))
                   .filter(nonNull);
}

/**
 * A map that contains the generated component IDs and type.
 */
export const GENERATED_COMP_IDS = new Map<string, Type<unknown>>();

/**
 * A method can returns a component ID from the component definition using a variant of DJB2 hash
 * algorithm.
 */
function getComponentId(componentDef: ComponentDef<unknown>): string {
  let hash = 0;

  // We cannot rely solely on the component selector as the same selector can be used in different
  // modules.
  //
  // `componentDef.style` is not used, due to it causing inconsistencies. Ex: when server
  // component styles has no sourcemaps and browsers do.
  //
  // Example:
  // https://github.com/angular/components/blob/d9f82c8f95309e77a6d82fd574c65871e91354c2/src/material/core/option/option.ts#L248
  // https://github.com/angular/components/blob/285f46dc2b4c5b127d356cb7c4714b221f03ce50/src/material/legacy-core/option/option.ts#L32

  const hashSelectors = [
    componentDef.selectors,
    componentDef.ngContentSelectors,
    componentDef.hostVars,
    componentDef.hostAttrs,
    componentDef.consts,
    componentDef.vars,
    componentDef.decls,
    componentDef.encapsulation,
    componentDef.standalone,
    // We cannot use 'componentDef.type.name' as the name of the symbol will change and will not
    // match in the server and browser bundles.
    Object.getOwnPropertyNames(componentDef.type.prototype),
    !!componentDef.contentQueries,
    !!componentDef.viewQuery,
  ].join('|');

  for (const char of hashSelectors) {
    hash = Math.imul(31, hash) + char.charCodeAt(0) << 0;
  }

  // Force positive number hash.
  // 2147483647 = equivalent of Integer.MAX_VALUE.
  hash += 2147483647 + 1;

  const compId = 'c' + hash;

  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    if (GENERATED_COMP_IDS.has(compId)) {
      const previousCompDefType = GENERATED_COMP_IDS.get(compId)!;
      if (previousCompDefType !== componentDef.type) {
        // TODO: use `formatRuntimeError` to have an error code and we can later on create an error
        // guide to explain this further.
        console.warn(`Component ID generation collision detected. Components '${
            previousCompDefType.name}' and '${componentDef.type.name}' with selector '${
            stringifyCSSSelectorList(
                componentDef
                    .selectors)}' generated the same component ID. To fix this, you can change the selector of one of those components or add an extra host attribute to force a different ID.`);
      }
    } else {
      GENERATED_COMP_IDS.set(compId, componentDef.type);
    }
  }

  return compId;
}
