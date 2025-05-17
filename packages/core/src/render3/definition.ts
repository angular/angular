/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy} from '../change_detection/constants';
import {EnvironmentInjector} from '../di/r3_injector';
import {formatRuntimeError, RuntimeErrorCode} from '../errors';
import {Type, Writable} from '../interface/type';
import {NgModuleDef} from '../metadata/ng_module_def';
import {SchemaMetadata} from '../metadata/schema';
import {ViewEncapsulation} from '../metadata/view';
import {assertNotEqual} from '../util/assert';
import {noSideEffects} from '../util/closure';
import {EMPTY_ARRAY, EMPTY_OBJ} from '../util/empty';
import {initNgDevMode} from '../util/ng_dev_mode';
import {performanceMarkFeature} from '../util/performance';
import {getComponentDef, getDirectiveDef, getPipeDef} from './def_getters';

import type {
  ComponentDef,
  ComponentDefFeature,
  ComponentTemplate,
  ContentQueriesFunction,
  DependencyTypeList,
  DirectiveDef,
  DirectiveDefFeature,
  HostBindingsFunction,
  InputTransformFunction,
  PipeDef,
  TypeOrFactory,
  ViewQueriesFunction,
} from './interfaces/definition';
import {InputFlags} from './interfaces/input_flags';
import type {TAttributes, TConstantsOrFactory} from './interfaces/node';
import {CssSelectorList} from './interfaces/projection';
import {stringifyCSSSelectorList} from './node_selector_matcher';
import {StandaloneService} from './standalone_service';

/**
 * Map of inputs for a given directive/component.
 *
 * Given:
 * ```ts
 * class MyComponent {
 *   @Input()
 *   publicInput1: string;
 *
 *   @Input('publicInput2')
 *   declaredInput2: string;
 *
 *   @Input({transform: (value: boolean) => value ? 1 : 0})
 *   transformedInput3: number;
 *
 *   signalInput = input(3);
 * }
 * ```
 *
 * is described as:
 * ```ts
 * {
 *   publicInput1: 'publicInput1',
 *   declaredInput2: [InputFlags.None, 'declaredInput2', 'publicInput2'],
 *   transformedInput3: [
 *     InputFlags.None,
 *     'transformedInput3',
 *     'transformedInput3',
 *     (value: boolean) => value ? 1 : 0
 *   ],
 *   signalInput: [InputFlags.SignalBased, "signalInput"],
 * }
 * ```
 *
 * Which the minifier may translate to:
 * ```ts
 * {
 *   minifiedPublicInput1: 'publicInput1',
 *   minifiedDeclaredInput2: [InputFlags.None, 'publicInput2', 'declaredInput2'],
 *   minifiedTransformedInput3: [
 *     InputFlags.None,
 *     'transformedInput3',
 *     'transformedInput3',
 *     (value: boolean) => value ? 1 : 0
 *   ],
 *   minifiedSignalInput: [InputFlags.SignalBased, "signalInput"],
 * }
 * ```
 *
 * This allows the render to re-construct the minified, public, and declared names
 * of properties.
 *
 * NOTE:
 *  - Because declared and public name are usually same we only generate the array
 *    `['declared', 'public']` format when they differ, or there is a transform.
 *  - The reason why this API and `outputs` API is not the same is that `NgOnChanges` has
 *    inconsistent behavior in that it uses declared names rather than minified or public.
 */
type DirectiveInputs<T> = {
  [P in keyof T]?:  // Basic case. Mapping minified name to public name.
    | string
    // Complex input when there are flags, or differing public name and declared name, or there
    // is a transform. Such inputs are not as common, so the array form is only generated then.
    | [
        flags: InputFlags,
        publicName: string,
        declaredName?: string,
        transform?: InputTransformFunction,
      ];
};

interface DirectiveDefinition<T> {
  /**
   * Directive type, needed to configure the injector.
   */
  type: Type<T>;

  /** The selectors that will be used to match nodes to this directive. */
  selectors?: CssSelectorList;

  /**
   * A map of input names.
   */
  inputs?: DirectiveInputs<T>;

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
  viewQuery?: ViewQueriesFunction<T> | null;

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

  /**
   * Whether this directive/component is signal-based.
   */
  signals?: boolean;
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
   * ```ts
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
   * Defines template and style encapsulation options available for Component's {@link /api/core/Component Component}.
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
  schemas?: SchemaMetadata[] | null;
}

/**
 * Create a component definition object.
 *
 *
 * # Example
 * ```ts
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
export function ɵɵdefineComponent<T>(
  componentDefinition: ComponentDefinition<T>,
): ComponentDef<any> {
  return noSideEffects(() => {
    // Initialize ngDevMode. This must be the first statement in ɵɵdefineComponent.
    // See the `initNgDevMode` docstring for more information.
    (typeof ngDevMode === 'undefined' || ngDevMode) && initNgDevMode();

    const baseDef = getNgDirectiveDef(componentDefinition as DirectiveDefinition<T>);
    const def: Writable<ComponentDef<T>> = {
      ...baseDef,
      decls: componentDefinition.decls,
      vars: componentDefinition.vars,
      template: componentDefinition.template,
      consts: componentDefinition.consts || null,
      ngContentSelectors: componentDefinition.ngContentSelectors,
      onPush: componentDefinition.changeDetection === ChangeDetectionStrategy.OnPush,
      directiveDefs: null!, // assigned in noSideEffects
      pipeDefs: null!, // assigned in noSideEffects
      dependencies: (baseDef.standalone && componentDefinition.dependencies) || null,
      getStandaloneInjector: baseDef.standalone
        ? (parentInjector: EnvironmentInjector) => {
            return parentInjector.get(StandaloneService).getOrCreateStandaloneInjector(def);
          }
        : null,
      getExternalStyles: null,
      signals: componentDefinition.signals ?? false,
      data: componentDefinition.data || {},
      encapsulation: componentDefinition.encapsulation || ViewEncapsulation.Emulated,
      styles: componentDefinition.styles || EMPTY_ARRAY,
      _: null,
      schemas: componentDefinition.schemas || null,
      tView: null,
      id: '',
    };

    // TODO: Do we still need/want this ?
    if (baseDef.standalone) {
      performanceMarkFeature('NgStandalone');
    }

    initFeatures(def);
    const dependencies = componentDefinition.dependencies;
    def.directiveDefs = extractDefListOrFactory(dependencies, extractDirectiveDef);
    def.pipeDefs = extractDefListOrFactory(dependencies, getPipeDef);
    def.id = getComponentId(def);

    return def;
  });
}

export function extractDirectiveDef(type: Type<any>): DirectiveDef<any> | ComponentDef<any> | null {
  return getComponentDef(type) || getDirectiveDef(type);
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
 * Converts binding objects from the `DirectiveDefinition` into more efficient
 * lookup dictionaries that are optimized for the framework runtime.
 *
 * This function converts inputs or output directive information into new objects
 * where the public name conveniently maps to the minified internal field name.
 *
 * For inputs, the input flags are additionally persisted into the new data structure,
 * so that those can be quickly retrieved when needed.
 *
 * e.g. for
 *
 * ```ts
 * class Comp {
 *   @Input()
 *   propName1: string;
 *
 *   @Input('publicName2')
 *   declaredPropName2: number;
 *
 *   inputSignal = input(3);
 * }
 * ```
 *
 * will be serialized as
 *
 * ```ts
 * {
 *   propName1: 'propName1',
 *   declaredPropName2: ['publicName2', 'declaredPropName2'],
 *   inputSignal: [InputFlags.SignalBased, 'inputSignal'],
 * }
 * ```
 *
 * which is than translated by the minifier as:
 *
 * ```ts
 * {
 *   minifiedPropName1: 'propName1',
 *   minifiedPropName2: ['publicName2', 'declaredPropName2'],
 *   minifiedInputSignal: [InputFlags.SignalBased, 'inputSignal'],
 * }
 * ```
 *
 * becomes: (public name => minifiedName + isSignal if needed)
 *
 * ```ts
 * {
 *  'propName1': 'minifiedPropName1',
 *  'publicName2': 'minifiedPropName2',
 *  'inputSignal': ['minifiedInputSignal', InputFlags.SignalBased],
 * }
 * ```
 *
 * Optionally the function can take `declaredInputs` which will result
 * in: (public name => declared name)
 *
 * ```ts
 * {
 *  'propName1': 'propName1',
 *  'publicName2': 'declaredPropName2',
 *  'inputSignal': 'inputSignal',
 * }
 * ```
 *

 */
function parseAndConvertInputsForDefinition<T>(
  obj: DirectiveDefinition<T>['inputs'],
  declaredInputs: Record<string, string>,
) {
  if (obj == null) return EMPTY_OBJ as any;
  const newLookup: Record<
    string,
    [minifiedName: string, flags: InputFlags, transform: InputTransformFunction | null]
  > = {};
  for (const minifiedKey in obj) {
    if (obj.hasOwnProperty(minifiedKey)) {
      const value = obj[minifiedKey]!;
      let publicName: string;
      let declaredName: string;
      let inputFlags: InputFlags;
      let transform: InputTransformFunction | null;

      if (Array.isArray(value)) {
        inputFlags = value[0];
        publicName = value[1];
        declaredName = value[2] ?? publicName; // declared name might not be set to save bytes.
        transform = value[3] || null;
      } else {
        publicName = value;
        declaredName = value;
        inputFlags = InputFlags.None;
        transform = null;
      }

      newLookup[publicName] = [minifiedKey, inputFlags, transform];
      declaredInputs[publicName] = declaredName as string;
    }
  }
  return newLookup;
}

function parseAndConvertOutputsForDefinition<T>(
  obj: DirectiveDefinition<T>['outputs'],
): Record<keyof T, string> {
  if (obj == null) return EMPTY_OBJ as any;
  const newLookup: any = {};
  for (const minifiedKey in obj) {
    if (obj.hasOwnProperty(minifiedKey)) {
      newLookup[obj[minifiedKey]!] = minifiedKey;
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
export function ɵɵdefineDirective<T>(
  directiveDefinition: DirectiveDefinition<T>,
): DirectiveDef<any> {
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
 * ```ts
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
  return <PipeDef<T>>{
    type: pipeDef.type,
    name: pipeDef.name,
    factory: null,
    pure: pipeDef.pure !== false,
    standalone: pipeDef.standalone ?? true,
    onDestroy: pipeDef.type.prototype.ngOnDestroy || null,
  };
}

function getNgDirectiveDef<T>(directiveDefinition: DirectiveDefinition<T>): DirectiveDef<T> {
  const declaredInputs: Record<string, string> = {};

  return {
    type: directiveDefinition.type,
    providersResolver: null,
    factory: null,
    hostBindings: directiveDefinition.hostBindings || null,
    hostVars: directiveDefinition.hostVars || 0,
    hostAttrs: directiveDefinition.hostAttrs || null,
    contentQueries: directiveDefinition.contentQueries || null,
    declaredInputs: declaredInputs,
    inputConfig: directiveDefinition.inputs || EMPTY_OBJ,
    exportAs: directiveDefinition.exportAs || null,
    standalone: directiveDefinition.standalone ?? true,
    signals: directiveDefinition.signals === true,
    selectors: directiveDefinition.selectors || EMPTY_ARRAY,
    viewQuery: directiveDefinition.viewQuery || null,
    features: directiveDefinition.features || null,
    setInput: null,
    resolveHostDirectives: null,
    hostDirectives: null,
    inputs: parseAndConvertInputsForDefinition(directiveDefinition.inputs, declaredInputs),
    outputs: parseAndConvertOutputsForDefinition(directiveDefinition.outputs),
    debugInfo: null,
  };
}

function initFeatures<T>(definition: DirectiveDef<T> | ComponentDef<T>): void {
  definition.features?.forEach((fn) => fn(definition));
}

export function extractDefListOrFactory<T>(
  dependencies: TypeOrFactory<DependencyTypeList> | undefined,
  defExtractor: (type: Type<unknown>) => T | null,
): (() => T[]) | T[] | null {
  if (!dependencies) {
    return null;
  }

  return () => {
    const resolvedDependencies = typeof dependencies === 'function' ? dependencies() : dependencies;
    const result: T[] = [];

    for (const dep of resolvedDependencies) {
      const definition = defExtractor(dep);
      if (definition !== null) {
        result.push(definition);
      }
    }

    return result;
  };
}

/**
 * A map that contains the generated component IDs and type.
 */
export const GENERATED_COMP_IDS = new Map<string, Type<unknown>>();

/**
 * A method can returns a component ID from the component definition using a variant of DJB2 hash
 * algorithm.
 */
function getComponentId<T>(componentDef: ComponentDef<T>): string {
  let hash = 0;

  // For components with i18n in templates, the `consts` array is generated by the compiler
  // as a function. If client and server bundles were produced with different minification
  // configurations, the serializable contents of the function body would be different on
  // the client and on the server. This might result in different ids generated. To avoid this
  // issue, we do not take the `consts` contents into account if it's a function.
  // See https://github.com/angular/angular/issues/58713.
  const componentDefConsts = typeof componentDef.consts === 'function' ? '' : componentDef.consts;

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
    componentDefConsts,
    componentDef.vars,
    componentDef.decls,
    componentDef.encapsulation,
    componentDef.standalone,
    componentDef.signals,
    componentDef.exportAs,
    JSON.stringify(componentDef.inputs),
    JSON.stringify(componentDef.outputs),
    // We cannot use 'componentDef.type.name' as the name of the symbol will change and will not
    // match in the server and browser bundles.
    Object.getOwnPropertyNames(componentDef.type.prototype),
    !!componentDef.contentQueries,
    !!componentDef.viewQuery,
  ];

  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    // If client and server bundles were produced with different minification configurations,
    // the serializable contents of the function body would be different on the client and on
    // the server. Ensure that we do not accidentally use functions in component id computation.
    for (const item of hashSelectors) {
      assertNotEqual(
        typeof item,
        'function',
        'Internal error: attempting to use a function in component id computation logic.',
      );
    }
  }

  for (const char of hashSelectors.join('|')) {
    hash = (Math.imul(31, hash) + char.charCodeAt(0)) << 0;
  }

  // Force positive number hash.
  // 2147483647 = equivalent of Integer.MAX_VALUE.
  hash += 2147483647 + 1;

  const compId = 'c' + hash;

  if (
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
    // Skip the check on the server since we can't guarantee the same component instance between
    // requests. Note that we can't use DI to check if we're on the server, because the component
    // hasn't been instantiated yet.
    (typeof ngServerMode === 'undefined' || !ngServerMode)
  ) {
    if (GENERATED_COMP_IDS.has(compId)) {
      const previousCompDefType = GENERATED_COMP_IDS.get(compId)!;
      if (previousCompDefType !== componentDef.type) {
        console.warn(
          formatRuntimeError(
            RuntimeErrorCode.COMPONENT_ID_COLLISION,
            `Component ID generation collision detected. Components '${
              previousCompDefType.name
            }' and '${componentDef.type.name}' with selector '${stringifyCSSSelectorList(
              componentDef.selectors,
            )}' generated the same component ID. To fix this, you can change the selector of one of those components or add an extra host attribute to force a different ID.`,
          ),
        );
      }
    } else {
      GENERATED_COMP_IDS.set(compId, componentDef.type);
    }
  }

  return compId;
}
