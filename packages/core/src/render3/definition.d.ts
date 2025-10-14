/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ChangeDetectionStrategy } from '../change_detection/constants';
import { Type } from '../interface/type';
import { SchemaMetadata } from '../metadata/schema';
import { ViewEncapsulation } from '../metadata/view';
import type { ComponentDef, ComponentDefFeature, ComponentTemplate, ContentQueriesFunction, DependencyTypeList, DirectiveDef, DirectiveDefFeature, HostBindingsFunction, InputTransformFunction, TypeOrFactory, ViewQueriesFunction } from './interfaces/definition';
import { InputFlags } from './interfaces/input_flags';
import type { TAttributes, TConstantsOrFactory } from './interfaces/node';
import { CssSelectorList } from './interfaces/projection';
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
    [P in keyof T]?: string | [
        flags: InputFlags,
        publicName: string,
        declaredName?: string,
        transform?: InputTransformFunction
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
    outputs?: {
        [P in keyof T]?: string;
    };
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
    data?: {
        [kind: string]: any;
    };
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
export declare function ɵɵdefineComponent<T>(componentDefinition: ComponentDefinition<T>): ComponentDef<any>;
export declare function extractDirectiveDef(type: Type<any>): DirectiveDef<any> | ComponentDef<any> | null;
/**
 * @codeGenApi
 */
export declare function ɵɵdefineNgModule<T>(def: {
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
}): unknown;
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
export declare function ɵɵdefineDirective<T>(directiveDefinition: DirectiveDefinition<T>): DirectiveDef<any>;
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
export declare function ɵɵdefinePipe<T>(pipeDef: {
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
}): unknown;
export declare function extractDefListOrFactory<T>(dependencies: TypeOrFactory<DependencyTypeList> | undefined, defExtractor: (type: Type<unknown>) => T | null): (() => T[]) | T[] | null;
/**
 * A map that contains the generated component IDs and type.
 */
export declare const GENERATED_COMP_IDS: Map<string, Type<unknown>>;
export {};
