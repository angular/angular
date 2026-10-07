/**
 * @license Angular v22.3.0-next.0+sha-95e8dec
 * (c) 2010-2026 Google LLC. https://angular.dev/
 * License: MIT
 */

import { SIGNAL } from './_formatter-chunk.js';
import { Signal, WritableSignal, OutputRef, Type as Type$1, ModuleWithProviders, EnvironmentProviders, Provider, TypeProvider, ValueProvider, ClassProvider, ConstructorProvider, ExistingProvider, FactoryProvider, StaticClassProvider, ProviderToken, Injector, InjectionToken, ValueSansProvider, ExistingSansProvider, StaticClassSansProvider, ConstructorSansProvider, FactorySansProvider, ClassSansProvider, InjectOptions, InternalInjectFlags, AbstractType, StaticProvider, ValueEqualityFn, EventCallback } from './_chrome_dev_tools_performance-chunk.js';
export { CreateSignalOptions, DestroyRef, DestroyableInjector, OutputRefSubscription, enableProfiling, isSignal, isWritableSignal, signal, InternalEnvironmentProviders as ɵInternalEnvironmentProviders, JSACTION_EVENT_CONTRACT as ɵJSACTION_EVENT_CONTRACT, Writable as ɵWritable, getComponentInstanceDeepLinkId as ɵgetComponentInstanceDeepLinkId, isEnvironmentProviders as ɵisEnvironmentProviders, ɵunwrapWritableSignal } from './_chrome_dev_tools_performance-chunk.js';
import { InputSignalNode, TypeDecorator, ɵɵInjectableDeclaration as __InjectableDeclaration, SchemaMetadata, InputTransformFunction, DirectiveDefFeature, HostBindingsFunction, TAttributes, ContentQueriesFunction, ViewQueriesFunction, ComponentTemplate, ComponentDefFeature, ViewEncapsulation as ViewEncapsulation$1, ChangeDetectionStrategy as ChangeDetectionStrategy$1, TypeOrFactory, DependencyTypeList, ComponentDef, DirectiveDef, PipeDef, EnvironmentInjector, NgModuleRef as NgModuleRef$1, NgModuleFactory as NgModuleFactory$1, InternalNgModuleRef, ɵɵFactoryDeclaration as __FactoryDeclaration, AfterRenderRef, EffectCleanupRegisterFn, ApplicationRef, ɵɵNgModuleDeclaration as __NgModuleDeclaration, ɵɵInjectorDeclaration as __InjectorDeclaration, NgZone, ElementRef, EmbeddedViewRef, ViewRef as ViewRef$1, ErrorDetails, DirectiveWithBindings, Binding, ComponentRef as ComponentRef$1, PlatformRef, DehydratedDeferBlock, DeferBlockConfig, DeferBlockDependencyInterceptor, DeferBlockState, TNode, LContainer, TView, TDeferBlockDetails, LView, RNode, HostDirectiveConfig, ComponentType, NgModuleScopeInfoFromDecorator, ChangeDetectorRef, DependencyResolverFn, TDeferDetailsFlags, SanitizerFn, AnimationClassBindingFn, AnimationFunction, LocalRefExtractor, OpaqueViewState, GlobalTargetResolver, QueryList, RElement, RawScopeInfoFromDecorator, ClassDebugInfo, Component, TrustedHTML, CompilerOptions, PipeType, DirectiveType, Directive, NgModule, Pipe, TrustedScriptURL, TrustedScript } from './_debug_node-chunk.js';
export { APP_BOOTSTRAP_LISTENER, AnimationCallbackEvent, BootstrapOptions, COMPILER_OPTIONS, CUSTOM_ELEMENTS_SCHEMA, Compiler, CompilerFactory, ComponentDecorator, CreateEffectOptions, DebugElement, DebugEventListener, DebugNode, DirectiveDecorator, EffectCleanupFn, EffectRef, ErrorHandler, EventEmitter, HostBinding, HostBindingDecorator, HostListener, HostListenerDecorator, InjectableType, InjectorType, Input, InputDecorator, ListenerOptions, MAX_ANIMATION_TIMEOUT, NO_ERRORS_SCHEMA, NgModuleDecorator, Output, OutputDecorator, PipeDecorator, Predicate, Renderer2, RendererFactory2, RendererStyleFlags2, RendererType2, Sanitizer, SecurityContext, asNativeElements, effect, getDebugNode, inputBinding, outputBinding, provideBrowserGlobalErrorListeners, twoWayBinding, ANIMATIONS_DISABLED as ɵANIMATIONS_DISABLED, AfterRenderManager as ɵAfterRenderManager, AnimationRendererType as ɵAnimationRendererType, AttributeMarker as ɵAttributeMarker, CONTAINER_HEADER_OFFSET as ɵCONTAINER_HEADER_OFFSET, ChangeDetectionScheduler as ɵChangeDetectionScheduler, ControlDirectiveHost as ɵControlDirectiveHost, CssSelectorList as ɵCssSelectorList, DeferBlockBehavior as ɵDeferBlockBehavior, DeferBlockDetails as ɵDeferBlockDetails, EffectScheduler as ɵEffectScheduler, INJECTOR_SCOPE as ɵINJECTOR_SCOPE, INTERNAL_APPLICATION_ERROR_HANDLER as ɵINTERNAL_APPLICATION_ERROR_HANDLER, NG_INJ_DEF as ɵNG_INJ_DEF, NG_PROV_DEF as ɵNG_PROV_DEF, NavigateEvent as ɵNavigateEvent, Navigation as ɵNavigation, NavigationCurrentEntryChangeEvent as ɵNavigationCurrentEntryChangeEvent, NavigationDestination as ɵNavigationDestination, NavigationHistoryEntry as ɵNavigationHistoryEntry, NavigationInterceptOptions as ɵNavigationInterceptOptions, NavigationNavigateOptions as ɵNavigationNavigateOptions, NavigationOptions as ɵNavigationOptions, NavigationReloadOptions as ɵNavigationReloadOptions, NavigationResult as ɵNavigationResult, NavigationTransition as ɵNavigationTransition, NavigationType as ɵNavigationType, NavigationUpdateCurrentEntryOptions as ɵNavigationUpdateCurrentEntryOptions, NoopNgZone as ɵNoopNgZone, NotificationSource as ɵNotificationSource, PROVIDED_ZONELESS as ɵPROVIDED_ZONELESS, R3Injector as ɵR3Injector, RenderFlags as ɵRenderFlags, TracingAction as ɵTracingAction, TracingService as ɵTracingService, TracingSnapshot as ɵTracingSnapshot, ZONELESS_ENABLED as ɵZONELESS_ENABLED, getDeferBlocks as ɵgetDeferBlocks, getInjectableDef as ɵgetInjectableDef, injectChangeDetectorRef as ɵinjectChangeDetectorRef, isInjectable as ɵisInjectable, ɵɵComponentDeclaration, ɵɵDirectiveDeclaration, ɵɵInjectorDef, ɵɵPipeDeclaration, ɵɵdefineInjectable, ɵɵdefineInjector } from './_debug_node-chunk.js';
import { ResourceOptions, ResourceRef, WritableResource, ResourceStatus, ResourceSnapshot, Resource, ResourceParamsContext, ResourceStreamingLoader, ResourceStreamItem, DebounceTimer, DebouncedOptions } from './_api-chunk.js';
export { BaseResourceOptions, OutputEmitterRef, OutputOptions, PromiseResourceOptions, ResourceDependencyError, ResourceLoader, ResourceLoaderParams, ResourceParamsStatus, StreamingResourceOptions, output, getOutputDestroyRef as ɵgetOutputDestroyRef } from './_api-chunk.js';
import './_event_dispatcher-chunk.js';
import { Observable, Subscribable } from 'rxjs';
import * as _angular_core from '@angular/core';
export { setAlternateWeakRefImpl as ɵsetAlternateWeakRefImpl } from './_weak_ref-chunk.js';
import { ReactiveNodeKind } from '@angular/core/primitives/signals';
import { JsonSchemaForInference, InferArgsFromInputSchema } from '../third_party/@mcp-b/webmcp-types/index.js';
export { setCurrentInjector as ɵsetCurrentInjector } from './primitives-di.js';
import './_effect-chunk.js';
import '@angular/core/primitives/di';

/**
 * @publicAPI
 * @see [Input aliases](guide/components/inputs#input-aliases)
 * @see [Input transforms](guide/components/inputs#input-transforms)
 *
 * Options for signal inputs.
 */
interface InputOptions<T, TransformT> {
    /** Optional public name for the input. By default, the class field name is used. */
    alias?: string;
    /**
     * Optional transform that runs whenever a new value is bound. Can be used to
     * transform the input value before the input is updated.
     *
     * The transform function can widen the type of the input. For example, consider
     * an input for `disabled`. In practice, as the component author, you want to only
     * deal with a boolean, but users may want to bind a string if they just use the
     * attribute form to bind to the input via `<my-dir input>`. A transform can then
     * handle such string values and convert them to `boolean`. See: {@link booleanAttribute}.
     */
    transform?: (v: TransformT) => T;
    /**
     * A debug name for the input signal. Used in Angular DevTools to identify the signal.
     */
    debugName?: string;
}
/**
 * Signal input options without the transform option.
 *
 * @publicApi 19.0
 */
type InputOptionsWithoutTransform<T> = Omit<InputOptions<T, T>, 'transform'> & {
    transform?: undefined;
};
/**
 * Signal input options with the transform option required.
 *
 * @publicAPI
 */
type InputOptionsWithTransform<T, TransformT> = Required<Pick<InputOptions<T, TransformT>, 'transform'>> & InputOptions<T, TransformT>;
declare const ɵINPUT_SIGNAL_BRAND_READ_TYPE: unique symbol;
declare const ɵINPUT_SIGNAL_BRAND_WRITE_TYPE: unique symbol;
/**
 * `InputSignalWithTransform` represents a special `Signal` for a
 * directive/component input with a `transform` function.
 *
 * Signal inputs with transforms capture an extra generic for their transform write
 * type. Transforms can expand the accepted bound values for an input while ensuring
 * value retrievals of the signal input are still matching the generic input type.
 *
 * ```ts
 * class MyDir {
 *   disabled = input(false, {
 *     transform: (v: string|boolean) => convertToBoolean(v),
 *   }); // InputSignalWithTransform<boolean, string|boolean>
 *
 *   click() {
 *     this.disabled() // always returns a `boolean`.
 *   }
 * }
 * ```
 *
 * @see {@link InputSignal} for additional information.
 *
 * @publicApi 19.0
 */
interface InputSignalWithTransform<T, TransformT> extends Signal<T> {
    [SIGNAL]: InputSignalNode<T, TransformT>;
    [ɵINPUT_SIGNAL_BRAND_READ_TYPE]: T;
    [ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]: TransformT;
}
/**
 * `InputSignal` represents a special `Signal` for a directive/component input.
 *
 * An input signal is similar to a non-writable signal except that it also
 * carries additional type-information for transforms, and that Angular internally
 * updates the signal whenever a new value is bound.
 *
 * @see {@link InputOptionsWithTransform} for inputs with transforms.
 *
 * @publicApi 19.0
 */
interface InputSignal<T> extends InputSignalWithTransform<T, T> {
}

/**
 * The `input` function allows declaration of inputs in directives and
 * components.
 *
 * The function exposes an API for also declaring required inputs via the
 * `input.required` function.
 *
 * @see [Accepting data with input properties](guide/components/inputs)
 * @see [Required inputs](guide/components/inputs#required-inputs)
 * @see [Input transforms](guide/components/inputs#input-transforms)
 * @publicAPI
 * @docsPrivate Ignored because `input` is the canonical API entry.
 */
interface InputFunction {
    /**
     * Initializes an input of type `T` with an initial value of `undefined`.
     * Angular will implicitly use `undefined` as initial value.
     */
    <T>(): InputSignal<T | undefined>;
    /** Declares an input of type `T` with an explicit initial value. */
    <T>(initialValue: T, opts?: InputOptionsWithoutTransform<T>): InputSignal<T>;
    /** Declares an input of type `T|undefined` without an initial value, but with input options */
    <T>(initialValue: undefined, opts: InputOptionsWithoutTransform<T>): InputSignal<T | undefined>;
    /**
     * Declares an input of type `T` with an initial value and a transform
     * function.
     *
     * The input accepts values of type `TransformT` and the given
     * transform function will transform the value to type `T`.
     */
    <T, TransformT>(initialValue: T, opts: InputOptionsWithTransform<T, TransformT>): InputSignalWithTransform<T, TransformT>;
    /**
     * Declares an input of type `T|undefined` without an initial value and with a transform
     * function.
     *
     * The input accepts values of type `TransformT` and the given
     * transform function will transform the value to type `T|undefined`.
     */ <T, TransformT>(initialValue: undefined, opts: InputOptionsWithTransform<T | undefined, TransformT>): InputSignalWithTransform<T | undefined, TransformT>;
    /**
     * Declares an input of type `T` with an initial value and a transform function
     * that accepts values of type `unknown`.
     */
    <T>(initialValue: T, opts: InputOptionsWithTransform<T, unknown>): InputSignalWithTransform<T, unknown>;
    /**
     * Declares an input of type `T|undefined` without an initial value and with a transform
     * function that accepts values of type `unknown`.
     */
    <T>(initialValue: undefined, opts: InputOptionsWithTransform<T | undefined, unknown>): InputSignalWithTransform<T | undefined, unknown>;
    /**
     * Initializes a required input.
     *
     * Consumers of your directive/component need to bind to this
     * input. If unset, a compile time error will be reported.
     *
     * @publicAPI
     */
    required: {
        /** Declares a required input of type `T`. */
        <T>(opts?: InputOptionsWithoutTransform<T>): InputSignal<T>;
        /**
         * Declares a required input of type `T` with a transform function.
         *
         * The input accepts values of type `TransformT` and the given
         * transform function will transform the value to type `T`.
         */
        <T, TransformT>(opts: InputOptionsWithTransform<T, TransformT>): InputSignalWithTransform<T, TransformT>;
    };
}
/**
 * The `input` function allows declaration of Angular inputs in directives
 * and components.
 *
 * There are two variants of inputs that can be declared:
 *
 *   1. **Optional inputs** with an initial value.
 *   2. **Required inputs** that consumers need to set.
 *
 * By default, the `input` function will declare optional inputs that
 * always have an initial value. Required inputs can be declared
 * using the `input.required()` function.
 *
 * Inputs are signals. The values of an input are exposed as a `Signal`.
 * The signal always holds the latest value of the input that is bound
 * from the parent.
 *
 * @usageNotes
 * To use signal-based inputs, import `input` from `@angular/core`.
 *
 * ```ts
 * import {input} from '@angular/core';
 * ```
 *
 * Inside your component, introduce a new class member and initialize
 * it with a call to `input` or `input.required`.
 *
 * ```ts
 * @Component({
 *   ...
 * })
 * export class UserProfileComponent {
 *   firstName = input<string>();             // Signal<string|undefined>
 *   lastName  = input.required<string>();    // Signal<string>
 *   age       = input(0)                     // Signal<number>
 * }
 * ```
 *
 * Inside your component template, you can display values of the inputs
 * by calling the signal.
 *
 * ```html
 * <span>{{firstName()}}</span>
 * ```
 *
 * @publicAPI
 * @initializerApiFunction
 *
 * @see [Accepting data with input properties](guide/components/inputs)
 */
declare const input: InputFunction;

/** Retrieves the write type of an `InputSignal` and `InputSignalWithTransform`. */
type ɵUnwrapInputSignalWriteType<Field> = Field extends InputSignalWithTransform<any, infer WriteT> ? WriteT : never;
/**
 * Unwraps all `InputSignal`/`InputSignalWithTransform` class fields of
 * the given directive.
 */
type ɵUnwrapDirectiveSignalInputs<Dir, Fields extends keyof Dir> = {
    [P in Fields]: ɵUnwrapInputSignalWriteType<Dir[P]>;
};

/**
 * @publicAPI
 *
 * Options for model signals.
 */
interface ModelOptions {
    /**
     * Optional public name of the input side of the model. The output side will have the same
     * name as the input, but suffixed with `Change`. By default, the class field name is used.
     */
    alias?: string;
    /**
     * A debug name for the model signal. Used in Angular DevTools to identify the signal.
     */
    debugName?: string;
}
/**
 * `ModelSignal` represents a special `Signal` for a directive/component model field.
 *
 * A model signal is a writeable signal that can be exposed as an output.
 * Whenever its value is updated, it emits to the output.
 *
 * @publicAPI
 */
interface ModelSignal<T> extends WritableSignal<T>, InputSignal<T>, OutputRef<T> {
    [SIGNAL]: InputSignalNode<T, T>;
}

/**
 * `model` declares a writeable signal that is exposed as an input/output pair on the containing
 * directive. The input name is taken either from the class member or from the `alias` option.
 * The output name is generated by taking the input name and appending `Change`.
 *
 * The function exposes an API for also declaring required models via the
 * `model.required` function.
 *
 * @see [Two-way binding between components](guide/templates/two-way-binding#two-way-binding-between-components)
 * @see [Model inputs](guide/components/inputs#model-inputs)
 * @see [Customizing model inputs](guide/components/inputs#customizing-model-inputs)
 *
 * @publicAPI
 * @docsPrivate Ignored because `model` is the canonical API entry.
 */
interface ModelFunction {
    /**
     * Initializes a model of type `T` with an initial value of `undefined`.
     * Angular will implicitly use `undefined` as initial value.
     */
    <T>(): ModelSignal<T | undefined>;
    /** Initializes a model of type `T` with the given initial value. */
    <T>(initialValue: T, opts?: ModelOptions): ModelSignal<T>;
    required: {
        /**
         * Initializes a required model.
         *
         * Users of your directive/component need to bind to the input side of the model.
         * If unset, a compile time error will be reported.
         */
        <T>(opts?: ModelOptions): ModelSignal<T>;
    };
}
/**
 * `model` declares a writeable signal that is exposed as an input/output
 * pair on the containing directive.
 *
 * The input name is taken either from the class member or from the `alias` option.
 * The output name is generated by taking the input name and appending `Change`.
 *
 * @usageNotes
 *
 * To use `model()`, import the function from `@angular/core`.
 *
 * ```ts
 * import {model} from '@angular/core';
 * ```
 *
 * Inside your component, introduce a new class member and initialize
 * it with a call to `model` or `model.required`.
 *
 * ```ts
 * @Directive({
 *   ...
 * })
 * export class MyDir {
 *   firstName = model<string>();            // ModelSignal<string|undefined>
 *   lastName  = model.required<string>();   // ModelSignal<string>
 *   age       = model(0);                   // ModelSignal<number>
 * }
 * ```
 *
 * Inside your component template, you can display the value of a `model`
 * by calling the signal.
 *
 * ```html
 * <span>{{firstName()}}</span>
 * ```
 *
 * Updating the `model` is equivalent to updating a writable signal.
 *
 * ```ts
 * updateName(newFirstName: string): void {
 *   this.firstName.set(newFirstName);
 * }
 * ```
 * @see [Two-way binding between components](guide/templates/two-way-binding#two-way-binding-between-components)
 * @see [Model inputs](guide/components/inputs#model-inputs)
 * @see [Customizing model inputs](guide/components/inputs#customizing-model-inputs)
 *
 * @publicApi 19.0
 * @initializerApiFunction
 */
declare const model: ModelFunction;

/**
 * Wrap an array of `Provider`s into `EnvironmentProviders`, preventing them from being accidentally
 * referenced in `@Component` in a component injector.
 *
 * @publicApi
 */
declare function makeEnvironmentProviders(providers: (Provider | EnvironmentProviders)[]): EnvironmentProviders;
/**
 * @description
 * This function is used to provide initialization functions that will be executed upon construction
 * of an environment injector.
 *
 * Note that the provided initializer is run in the injection context.
 *
 * Previously, this was achieved using the `ENVIRONMENT_INITIALIZER` token which is now deprecated.
 *
 * @see {@link ENVIRONMENT_INITIALIZER}
 *
 * @usageNotes
 * The following example illustrates how to configure an initialization function using
 * `provideEnvironmentInitializer()`
 * ```ts
 * createEnvironmentInjector(
 *   [
 *     provideEnvironmentInitializer(() => {
 *       console.log('environment initialized');
 *     }),
 *   ],
 *   parentInjector
 * );
 * ```
 *
 * @publicApi
 */
declare function provideEnvironmentInitializer(initializerFn: () => void): EnvironmentProviders;
/**
 * A source of providers for the `importProvidersFrom` function.
 *
 * @publicApi
 */
type ImportProvidersSource = Type$1<unknown> | ModuleWithProviders<unknown> | Array<ImportProvidersSource>;
/**
 * Collects providers from all NgModules and standalone components, including transitively imported
 * ones.
 *
 * Providers extracted via `importProvidersFrom` are only usable in an application injector or
 * another environment injector (such as a route injector). They should not be used in component
 * providers.
 *
 *
 * @usageNotes
 * The results of the `importProvidersFrom` call can be used in the `bootstrapApplication` call:
 *
 * ```ts
 * await bootstrapApplication(RootComponent, {
 *   providers: [
 *     importProvidersFrom(NgModuleOne, NgModuleTwo)
 *   ]
 * });
 * ```
 *
 * You can also use the `importProvidersFrom` results in the `providers` field of a route, when a
 * standalone component is used:
 *
 * ```ts
 * export const ROUTES: Route[] = [
 *   {
 *     path: 'foo',
 *     providers: [
 *       importProvidersFrom(NgModuleOne, NgModuleTwo)
 *     ],
 *     component: YourStandaloneComponent
 *   }
 * ];
 * ```
 *
 * @returns Collected providers from the specified list of types.
 * @publicApi
 */
declare function importProvidersFrom(...sources: ImportProvidersSource[]): EnvironmentProviders;
/**
 * Internal type for a single provider in a deep provider array.
 */
type SingleProvider = TypeProvider | ValueProvider | ClassProvider | ConstructorProvider | ExistingProvider | FactoryProvider | StaticClassProvider;

/**
 * Type of the `viewChild` function. The viewChild function creates a singular view query.
 *
 * It is a special function that also provides access to required query results via the `.required`
 * property.
 *
 * @publicApi
 * @docsPrivate Ignored because `viewChild` is the canonical API entry.
 */
interface ViewChildFunction {
    /**
     * Initializes a view child query. Consider using `viewChild.required` for queries that should
     * always match.
     *
     * @publicAPI
     */
    <LocatorT, ReadT>(locator: ProviderToken<LocatorT> | string, opts: {
        read: ProviderToken<ReadT>;
        debugName?: string;
    }): Signal<ReadT | undefined>;
    <LocatorT>(locator: ProviderToken<LocatorT> | string, opts?: {
        debugName?: string;
    }): Signal<LocatorT | undefined>;
    /**
     * Initializes a view child query that is expected to always match an element.
     *
     * @publicAPI
     */
    required: {
        <LocatorT>(locator: ProviderToken<LocatorT> | string, opts?: {
            debugName?: string;
        }): Signal<LocatorT>;
        <LocatorT, ReadT>(locator: ProviderToken<LocatorT> | string, opts: {
            read: ProviderToken<ReadT>;
            debugName?: string;
        }): Signal<ReadT>;
    };
}
/**
 * Initializes a view child query.
 *
 * Consider using `viewChild.required` for queries that should always match.
 *
 * @usageNotes
 * Create a child query in your component by declaring a
 * class field and initializing it with the `viewChild()` function.
 *
 * ```angular-ts
 * @Component({template: '<div #el></div><my-component #cmp />'})
 * export class Card {
 *   divEl = viewChild<ElementRef>('el');                   // Signal<ElementRef|undefined>
 *   divElRequired = viewChild.required<ElementRef>('el');  // Signal<ElementRef>
 *   cmp = viewChild(MyComponent);                          // Signal<MyComponent|undefined>
 *   cmpRequired = viewChild.required(MyComponent);         // Signal<MyComponent>
 * }
 * ```
 *
 * @publicApi 19.0
 * @initializerApiFunction
 * @see [Referencing component children with queries](guide/components/queries)
 * @see [Required queries](guide/components/queries#required-queries)
 */
declare const viewChild: ViewChildFunction;
declare function viewChildren<LocatorT>(locator: ProviderToken<LocatorT> | string, opts?: {
    debugName?: string;
}): Signal<ReadonlyArray<LocatorT>>;
declare function viewChildren<LocatorT, ReadT>(locator: ProviderToken<LocatorT> | string, opts: {
    read: ProviderToken<ReadT>;
    debugName?: string;
}): Signal<ReadonlyArray<ReadT>>;
/**
 * Type of the `contentChild` function.
 *
 * The contentChild function creates a singular content query. It is a special function that also
 * provides access to required query results via the `.required` property.
 *
 * @publicApi 19.0
 * @docsPrivate Ignored because `contentChild` is the canonical API entry.
 */
interface ContentChildFunction {
    /**
     * Initializes a content child query.
     *
     * Consider using `contentChild.required` for queries that should always match.
     * @publicAPI
     */
    <LocatorT>(locator: ProviderToken<LocatorT> | string, opts?: {
        descendants?: boolean;
        read?: undefined;
        debugName?: string;
    }): Signal<LocatorT | undefined>;
    <LocatorT, ReadT>(locator: ProviderToken<LocatorT> | string, opts: {
        descendants?: boolean;
        read: ProviderToken<ReadT>;
        debugName?: string;
    }): Signal<ReadT | undefined>;
    /**
     * Initializes a content child query that is always expected to match.
     */
    required: {
        <LocatorT>(locator: ProviderToken<LocatorT> | string, opts?: {
            descendants?: boolean;
            read?: undefined;
            debugName?: string;
        }): Signal<LocatorT>;
        <LocatorT, ReadT>(locator: ProviderToken<LocatorT> | string, opts: {
            descendants?: boolean;
            read: ProviderToken<ReadT>;
            debugName?: string;
        }): Signal<ReadT>;
    };
}
/**
 * Initializes a content child query. Consider using `contentChild.required` for queries that should
 * always match.
 *
 * @usageNotes
 * Create a child query in your component by declaring a
 * class field and initializing it with the `contentChild()` function.
 *
 * ```ts
 * @Component({...})
 * export class Card {
 *   headerEl = contentChild<ElementRef>('h');                    // Signal<ElementRef|undefined>
 *   headerElElRequired = contentChild.required<ElementRef>('h'); // Signal<ElementRef>
 *   header = contentChild(MyHeader);                             // Signal<MyHeader|undefined>
 *   headerRequired = contentChild.required(MyHeader);            // Signal<MyHeader>
 * }
 * ```
 *
 * NOTE: By default `descendants` is `true` which means the query will traverse all descendants in the same template.
 *
 * @initializerApiFunction
 * @publicApi 19.0
 *
 * @See [Content queries](guide/components/queries#content-queries)
 */
declare const contentChild: ContentChildFunction;
declare function contentChildren<LocatorT>(locator: ProviderToken<LocatorT> | string, opts?: {
    descendants?: boolean;
    read?: undefined;
    debugName?: string;
}): Signal<ReadonlyArray<LocatorT>>;
declare function contentChildren<LocatorT, ReadT>(locator: ProviderToken<LocatorT> | string, opts: {
    descendants?: boolean;
    read: ProviderToken<ReadT>;
    debugName?: string;
}): Signal<ReadonlyArray<ReadT>>;

/**
 * Runs the given function in the [context](guide/di/dependency-injection-context) of the given
 * `Injector`.
 *
 * Within the function's stack frame, [`inject`](api/core/inject) can be used to inject dependencies
 * from the given `Injector`. Note that `inject` is only usable synchronously, and cannot be used in
 * any asynchronous callbacks or after any `await` points.
 *
 * @see [Run within an injection context](guide/di/dependency-injection-context#run-within-an-injection-context)
 *
 * @param injector the injector which will satisfy calls to [`inject`](api/core/inject) while `fn`
 *     is executing
 * @param fn the closure to be run in the context of `injector`
 * @returns the return value of the function, if any
 * @publicApi
 */
declare function runInInjectionContext<ReturnT>(injector: Injector, fn: () => ReturnT): ReturnT;
/**
 * Asserts that the current stack frame is within an [injection
 * context](guide/di/dependency-injection-context) and has access to `inject`.
 *
 * @param debugFn a reference to the function making the assertion (used for the error message).
 *
 * @see [Asserts the context](guide/di/dependency-injection-context#asserts-the-context)
 *
 * @publicApi
 */
declare function assertInInjectionContext(debugFn: Function): void;

/**
 * An interface that a function passed into `forwardRef` has to implement.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='forward_ref_fn'}
 * @publicApi
 */
interface ForwardRefFn {
    (): any;
}
/**
 * Allows to refer to references which are not yet defined.
 *
 * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
 * DI is declared, but not yet defined. It is also used when the `token` which we use when creating
 * a query is not yet defined.
 *
 * `forwardRef` is also used to break circularities in standalone components imports.
 *
 * @usageNotes
 * ### Circular dependency example
 * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='forward_ref'}
 *
 * ### Circular standalone reference import example
 * ```angular-ts
 * @Component({
 *   imports: [ChildComponent],
 *   selector: 'app-parent',
 *   template: `<app-child [hideParent]="hideParent()"/>`,
 * })
 * export class ParentComponent {
 *    hideParent = input.required<boolean>();
 * }
 *
 *
 * @Component({
 *   imports: [forwardRef(() => ParentComponent)],
 *   selector: 'app-child',
 *   template: `
 *    @if(!hideParent()) {
 *       <app-parent/>
 *    }
 *  `,
 * })
 * export class ChildComponent {
 *    hideParent = input.required<boolean>();
 * }
 * ```
 * @see [Resolve circular dependencies with a forward reference](guide/di/di-in-action#resolve-circular-dependencies-with-a-forward-reference)
 * @publicApi
 */
declare function forwardRef(forwardRefFn: ForwardRefFn): Type$1<any>;
/**
 * Lazily retrieves the reference value from a forwardRef.
 *
 * Acts as the identity function when given a non-forward-ref value.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='resolve_forward_ref'}
 *
 * @see {@link forwardRef}
 * @publicApi
 */
declare function resolveForwardRef<T>(type: T): T;

/**
 * Creates a token that can be used to inject static attributes of the host node.
 *
 * @usageNotes
 * ### Injecting an attribute that is known to exist
 * ```ts
 * @Directive()
 * class MyDir {
 *   attr: string = inject(new HostAttributeToken('some-attr'));
 * }
 * ```
 *
 * ### Optionally injecting an attribute
 * ```ts
 * @Directive()
 * class MyDir {
 *   attr: string | null = inject(new HostAttributeToken('some-attr'), {optional: true});
 * }
 * ```
 * @see [Injecting host element attributes](guide/components/host-elements#injecting-host-element-attributes)
 * @publicApi
 */
declare class HostAttributeToken {
    private attributeName;
    constructor(attributeName: string);
    toString(): string;
}

/**
 * A token that can be used to inject the tag name of the host node.
 *
 * @usageNotes
 * ### Injecting a tag name that is known to exist
 * ```ts
 * @Directive()
 * class MyDir {
 *   tagName: string = inject(HOST_TAG_NAME);
 * }
 * ```
 *
 * ### Optionally injecting a tag name
 * ```ts
 * @Directive()
 * class MyDir {
 *   tagName: string | null = inject(HOST_TAG_NAME, {optional: true});
 * }
 * ```
 * @publicApi
 *
 * @see [Inject the host element's tag name](guide/di/di-in-action#inject-the-host-elements-tag-name)
 *
 */
declare const HOST_TAG_NAME: InjectionToken<string>;

/**
 * A multi-provider token for initialization functions that will run upon construction of an
 * environment injector.
 *
 * @deprecated from v19.0.0, use provideEnvironmentInitializer instead
 *
 * @see {@link provideEnvironmentInitializer}
 *
 * Note: As opposed to the `APP_INITIALIZER` token, the `ENVIRONMENT_INITIALIZER` functions are not awaited,
 * hence they should not be `async`.
 *
 * @publicApi
 */
declare const ENVIRONMENT_INITIALIZER: InjectionToken<readonly (() => void)[]>;

/**
 * An ES Module object with a default export of the given type.
 *
 * @see {@link injectAsync}
 * @see [Route#loadComponent](/api/router/Route#loadComponent)
 * @see [LoadChildrenCallback](/api/router/LoadChildrenCallback)
 *
 * @publicApi
 */
interface DefaultExport<T> {
    /**
     * Default exports are bound under the name `"default"`, per the ES Module spec:
     * https://tc39.es/ecma262/#table-export-forms-mapping-to-exportentry-records
     */
    default: T;
}
declare function maybeUnwrapDefaultExport<T>(input: T | DefaultExport<T>): T;

/**
 * A helper function that allows to inject dependencies asynchronously,
 * which can be useful in cases when the dependency is not needed immediately and can be loaded lazily.
 *
 * NOTE: To enable lazy loading, the injected service must be auto-provided. This means it should be decorated with either `@Injectable({providedIn: 'root'})` or `@Service()`.
 *
 * @param loader A function that returns a promise resolving to the injectable service
 * @param options Configuration options for the async injection
 *
 * @returns A function that returns a promise resolving to the requested service instance.
 *
 * @usageNotes
 *
 * ```ts
 * class MyCmp {
 *  someSvc = injectAsync(() => import('..'));
 *
 *  async onClick() {
 *    (await this.someSvc()).handleClick();
 *  }
 * }
 *
 * // we can also configure prefetching:
 * injectAsync(.., {prefetch: onIdle})
 * ```
 *
 * @see [Lazy loading services](guide/di/lazy-loading-services)
 * @see [Injection context](guide/di/dependency-injection-context)
 *
 * @publicApi 22.0
 */
declare function injectAsync<T>(loader: () => Promise<ProviderToken<T>>, options?: InjectAsyncOptions): () => Promise<T>;
declare function injectAsync<T>(loader: () => Promise<DefaultExport<ProviderToken<T>>>, options?: InjectAsyncOptions): () => Promise<T>;
/**
 * Interface for `options` argument used within `injectAsync` call.
 *
 * @see [Prefetching the dependency](guide/di/lazy-loading-services#prefetching-the-dependency)
 *
 * @publicApi 22.0
 */
interface InjectAsyncOptions {
    /**
     * A trigger to eagerly prefetch the lazy-loaded dependency before it is requested.
     *
     */
    prefetch?: PrefetchTrigger;
}
/**
 * A function that returns a promise which, when resolved, will trigger the prefetching of
 * the lazy-loaded dependency.
 *
 * @see {@link onIdle}
 * @see [Prefetching the dependency](guide/di/lazy-loading-services#prefetching-the-dependency)
 *
 * @publicApi 22.0
 */
type PrefetchTrigger = () => Promise<void>;
/**
 * A `PrefetchTrigger` helper function to provide the logic of triggering dependency loading
 * when the browser becomes idle.
 *
 * Internally delegates to the configured {@link IdleService}, whose default implementation uses
 * [`requestIdleCallback`](https://developer.mozilla.org/docs/Web/API/Window/requestIdleCallback)
 * when available and falls back to `setTimeout` otherwise. The default behavior can be replaced
 * with `provideIdleServiceWith`.
 *
 * @usageNotes
 *
 * ```ts
 * injectAsync(import(...), {prefetch: onIdle})
 *
 * // or with custom idle options:
 * injectAsync(import(...), {prefetch: () => onIdle({timeout: 100})})
 * ```
 *
 * @see [Prefetching the dependency](guide/di/lazy-loading-services#prefetching-the-dependency)
 *
 * @publicApi 22.0
 */
declare function onIdle(options?: {
    timeout?: number;
}): Promise<void>;

/**
 * Injectable providers used in `@Injectable` decorator.
 *
 * @publicApi
 */
type InjectableProvider = ValueSansProvider | ExistingSansProvider | StaticClassSansProvider | ConstructorSansProvider | FactorySansProvider | ClassSansProvider;
/**
 * Type of the Injectable decorator / constructor function.
 *
 * @publicApi
 */
interface InjectableDecorator {
    /**
     * Decorator that marks a class as available to be
     * provided and injected as a dependency.
     *
     * @see [Introduction to Services and DI](guide/di)
     * @see [Creating and using services](guide/di/creating-and-using-services)
     * @see [Defining dependency providers](guide/di/defining-dependency-providers)
     *
     * @usageNotes
     *
     * Marking a class with `@Injectable` ensures that the compiler
     * will generate the necessary metadata to create the class's
     * dependencies when the class is injected.
     *
     * The following example shows how a service class is properly
     *  marked so that a supporting service can be injected upon creation.
     *
     * {@example core/di/ts/metadata_spec.ts region='Injectable'}
     *
     */
    (): TypeDecorator;
    /**
     * @deprecated The `providedIn: NgModule` or `providedIn:'any'` options are deprecated. Please use the other signatures.
     */
    (options?: {
        providedIn: Type$1<any> | 'any';
    } & InjectableProvider): TypeDecorator;
    (options?: {
        providedIn: 'root' | 'platform' | null;
    } & InjectableProvider): TypeDecorator;
    new (): Injectable;
    new (options?: {
        providedIn: Type$1<any> | 'root' | 'platform' | 'any' | null;
    } & InjectableProvider): Injectable;
}
/**
 * Type of the Injectable metadata.
 *
 *
 * @publicApi
 */
interface Injectable {
    /**
     * Determines which injectors will provide the injectable.
     *
     * - `Type<any>` - associates the injectable with an `@NgModule` or other `InjectorType`. This
     * option is DEPRECATED.
     * - 'null' : Equivalent to `undefined`. The injectable is not provided in any scope automatically
     * and must be added to a `providers` array.
     *
     * The following options specify that this injectable should be provided in one of the following
     * injectors:
     * - 'root' : The application-level injector in most apps.
     * - 'platform' : A special singleton platform injector shared by all
     * applications on the page.
     * - 'any' : Provides a unique instance in each lazy loaded module while all eagerly loaded
     * modules share one instance. This option is DEPRECATED.
     *
     */
    providedIn?: Type$1<any> | 'root' | 'platform' | 'any' | null;
}
/**
 * Injectable decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
declare const Injectable: InjectableDecorator;

/**
 * Generated instruction: injects a token from the currently active injector.
 *
 * (Additional documentation moved to `inject`, as it is the public API, and an alias for this
 * instruction)
 *
 * @see inject
 * @codeGenApi
 * @publicApi This instruction has been emitted by ViewEngine for some time and is deployed to npm.
 */
declare function ɵɵinject<T>(token: ProviderToken<T>): T;
declare function ɵɵinject<T>(token: ProviderToken<T>, flags?: InternalInjectFlags): T | null;
declare function ɵɵinject(token: HostAttributeToken): string;
declare function ɵɵinject(token: HostAttributeToken, flags?: InternalInjectFlags): string | null;
declare function ɵɵinject<T>(token: ProviderToken<T> | HostAttributeToken, flags?: InternalInjectFlags): string | null;
/**
 * Throws an error indicating that a factory function could not be generated by the compiler for a
 * particular class.
 *
 * The name of the class is not mentioned here, but will be in the generated factory function name
 * and thus in the stack trace.
 *
 * @codeGenApi
 */
declare function ɵɵinvalidFactoryDep(index: number): never;
/**
 * @param token A token that represents a dependency that should be injected.
 * @returns the injected value if operation is successful, `null` otherwise.
 * @throws if called outside of a supported context.
 *
 * @publicApi
 */
declare function inject<T>(token: ProviderToken<T>): T;
/**
 * @param token A token that represents a dependency that should be injected.
 * @param options Control how injection is executed. Options correspond to injection strategies
 *     that can be specified with parameter decorators `@Host`, `@Self`, `@SkipSelf`, and
 *     `@Optional`.
 * @returns the injected value if operation is successful.
 * @throws if called outside of a supported context, or if the token is not found.
 *
 * @publicApi
 */
declare function inject<T>(token: ProviderToken<T>, options: InjectOptions & {
    optional?: false;
}): T;
/**
 * @param token A token that represents a dependency that should be injected.
 * @param options Control how injection is executed. Options correspond to injection strategies
 *     that can be specified with parameter decorators `@Host`, `@Self`, `@SkipSelf`, and
 *     `@Optional`.
 * @returns the injected value if operation is successful,  `null` if the token is not
 *     found and optional injection has been requested.
 * @throws if called outside of a supported context, or if the token is not found and optional
 *     injection was not requested.
 *
 * @publicApi
 */
declare function inject<T>(token: ProviderToken<T>, options: InjectOptions): T | null;
/**
 * @param token A token that represents a static attribute on the host node that should be injected.
 * @returns Value of the attribute if it exists.
 * @throws If called outside of a supported context or the attribute does not exist.
 *
 * @publicApi
 */
declare function inject(token: HostAttributeToken): string;
/**
 * @param token A token that represents a static attribute on the host node that should be injected.
 * @returns Value of the attribute if it exists, otherwise `null`.
 * @throws If called outside of a supported context.
 *
 * @publicApi
 */
declare function inject(token: HostAttributeToken, options: {
    optional: true;
}): string | null;
/**
 * @param token A token that represents a static attribute on the host node that should be injected.
 * @returns Value of the attribute if it exists.
 * @throws If called outside of a supported context or the attribute does not exist.
 *
 * @publicApi
 */
declare function inject(token: HostAttributeToken, options: {
    optional: false;
}): string;
declare function convertToBitFlags(flags: InjectOptions | InternalInjectFlags | undefined): InternalInjectFlags | undefined;

/**
 * An InjectionToken that gets the current `Injector` for `createInjector()`-style injectors.
 *
 * Requesting this token instead of `Injector` allows `StaticInjector` to be tree-shaken from a
 * project.
 *
 * @publicApi
 */
declare const INJECTOR: InjectionToken<Injector>;

/**
 * Construct a definition which defines how a service will be constructed by the DI system.
 *
 * This should be assigned to a static `ɵprov` field on a type.
 *
 * Options:
 * * `autoProvided` determines whether the service should be provided automatically or whether
 *   the user should be responsible for providing it.
 * * `factory` gives the zero argument function which will create an instance of the injectable.
 *
 * @codeGenApi
 * @publicApi
 */
declare function ɵɵdefineService<T>(opts: {
    token: unknown;
    autoProvided?: boolean;
    factory: (parent?: Type$1<unknown>) => T;
}): __InjectableDeclaration<T>;

/**
 * Type of the Inject decorator / constructor function.
 *
 * @publicApi
 */
interface InjectDecorator {
    /**
     * Warning: String tokens are not recommended.
     *
     * Use an InjectionToken or a class as a token instead.
     */
    (token: string): any;
    new (token: string): Inject;
    /**
     * Parameter decorator on a dependency parameter of a class constructor
     * that specifies a custom provider of the dependency.
     *
     * @usageNotes
     * The following example shows a class constructor that specifies a
     * custom provider of a dependency using the parameter decorator.
     *
     * When `@Inject()` is not present, the injector uses the type annotation of the
     * parameter as the provider.
     *
     * {@example core/di/ts/metadata_spec.ts region='InjectWithoutDecorator'}
     *
     * @see [Dependency Injection Guide](guide/di)
     *
     */
    (token: any): any;
    new (token: any): Inject;
}
/**
 * Type of the Inject metadata.
 *
 * @publicApi
 */
interface Inject {
    /**
     * A DI token that maps to the dependency to be injected.
     */
    token: any;
}
/**
 * Inject decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
declare const Inject: InjectDecorator;
/**
 * Type of the Optional decorator / constructor function.
 *
 * @publicApi
 */
interface OptionalDecorator {
    /**
     * Parameter decorator to be used on constructor parameters,
     * which marks the parameter as being an optional dependency.
     * The DI framework provides `null` if the dependency is not found.
     *
     * Can be used together with other parameter decorators
     * that modify how dependency injection operates.
     *
     * @usageNotes
     *
     * The following code allows the possibility of a `null` result:
     *
     * {@example core/di/ts/metadata_spec.ts region='Optional'}
     *
     * @see [Dependency Injection Guide](guide/di)
     */
    (): any;
    new (): Optional;
}
/**
 * Type of the Optional metadata.
 *
 * @publicApi
 */
interface Optional {
}
/**
 * Optional decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
declare const Optional: OptionalDecorator;
/**
 * Type of the Self decorator / constructor function.
 *
 * @publicApi
 */
interface SelfDecorator {
    /**
     * Parameter decorator to be used on constructor parameters,
     * which tells the DI framework to start dependency resolution from the local injector.
     *
     * Resolution works upward through the injector hierarchy, so the children
     * of this class must configure their own providers or be prepared for a `null` result.
     *
     * @usageNotes
     *
     * In the following example, the dependency can be resolved
     * by the local injector when instantiating the class itself, but not
     * when instantiating a child.
     *
     * {@example core/di/ts/metadata_spec.ts region='Self'}
     *
     * @see {@link SkipSelf}
     * @see {@link Optional}
     *
     */
    (): any;
    new (): Self;
}
/**
 * Type of the Self metadata.
 *
 * @publicApi
 */
interface Self {
}
/**
 * Self decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
declare const Self: SelfDecorator;
/**
 * Type of the `SkipSelf` decorator / constructor function.
 *
 * @publicApi
 */
interface SkipSelfDecorator {
    /**
     * Parameter decorator to be used on constructor parameters,
     * which tells the DI framework to start dependency resolution from the parent injector.
     * Resolution works upward through the injector hierarchy, so the local injector
     * is not checked for a provider.
     *
     * @usageNotes
     *
     * In the following example, the dependency can be resolved when
     * instantiating a child, but not when instantiating the class itself.
     *
     * {@example core/di/ts/metadata_spec.ts region='SkipSelf'}
     *
     * @see [Dependency Injection guide](guide/di/hierarchical-dependency-injection#skipself).
     * @see {@link Self}
     * @see {@link Optional}
     *
     */
    (): any;
    new (): SkipSelf;
}
/**
 * Type of the `SkipSelf` metadata.
 *
 * @publicApi
 */
interface SkipSelf {
}
/**
 * `SkipSelf` decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
declare const SkipSelf: SkipSelfDecorator;
/**
 * Type of the `Host` decorator / constructor function.
 *
 * @publicApi
 */
interface HostDecorator {
    /**
     * Parameter decorator on a view-provider parameter of a class constructor
     * that tells the DI framework to resolve the view by checking injectors of child
     * elements, and stop when reaching the host element of the current component.
     *
     * @usageNotes
     *
     * The following shows use with the `@Optional` decorator, and allows for a `null` result.
     *
     * {@example core/di/ts/metadata_spec.ts region='Host'}
     *
     * For an extended example, see ["Dependency Injection
     * Guide"](guide/di/hierarchical-dependency-injection#optional).
     */
    (): any;
    new (): Host;
}
/**
 * Type of the Host metadata.
 *
 * @publicApi
 */
interface Host {
}
/**
 * Host decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
declare const Host: HostDecorator;

/**
 * Type of the Service decorator / constructor function.
 *
 * @publicApi
 */
interface ServiceDecorator {
    /**
     * Decorator that marks a class as a service and makes it automatically available
     * in the dependency injection system.
     *
     * @see [Introduction to Services and DI](guide/di)
     * @see [Creating and using services](guide/di/creating-and-using-services)
     * @see [Defining dependency providers](guide/di/defining-dependency-providers)
     */
    (): TypeDecorator;
    /**
     * When `autoProvided` is set to `false`, the service won't be exposed to the dependency
     * injection system automatically. It is up to the user to expose it in a providers list.
     */
    (options: {
        autoProvided: false;
    }): TypeDecorator;
    /**
     * Creates a service that is automatically provided and uses
     * the value returned from the `factory` function.
     */
    <T>(options: {
        autoProvided?: true;
        factory: () => T;
    }): <C extends Type$1<unknown> | AbstractType<unknown>>(target: C) => C extends Type$1<unknown> ? Type$1<T> : abstract new (...args: any[]) => T;
    /**
     * Creates a service that is automatically provided.
     */
    (options?: {
        autoProvided?: true;
    }): TypeDecorator;
}
/**
 * Type of the Service metadata.
 *
 * @publicApi
 */
interface Service {
    /**
     * Determines whether the service should be provided automatically or by the user.
     * Defaults to `true`.
     */
    autoProvided?: boolean;
    /**
     * A function to invoke to create a value for this service.
     */
    factory?: () => unknown;
}
/**
 * Service decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
declare const Service: ServiceDecorator;

/**
 * Set of config options available during the application bootstrap operation.
 *
 * @publicApi
 */
interface ApplicationConfig {
    /**
     * List of providers that should be available to the root component and all its children.
     */
    providers: Array<Provider | EnvironmentProviders>;
}
/**
 * Merge multiple application configurations from left to right.
 *
 * @param configs Two or more configurations to be merged.
 * @returns A merged [ApplicationConfig](api/core/ApplicationConfig).
 *
 * @publicApi
 */
declare function mergeApplicationConfig(...configs: ApplicationConfig[]): ApplicationConfig;

interface NgModuleType<T = any> extends Type$1<T> {
    ɵmod: NgModuleDef<T>;
}
/**
 * Represents the expansion of an `NgModule` into its scopes.
 *
 * A scope is a set of directives and pipes that are visible in a particular context. Each
 * `NgModule` has two scopes. The `compilation` scope is the set of directives and pipes that will
 * be recognized in the templates of components declared by the module. The `exported` scope is the
 * set of directives and pipes exported by a module (that is, module B's exported scope gets added
 * to module A's compilation scope when module A imports B).
 */
interface NgModuleTransitiveScopes {
    compilation: {
        directives: Set<any>;
        pipes: Set<any>;
    };
    exported: {
        directives: Set<any>;
        pipes: Set<any>;
    };
    schemas: SchemaMetadata[] | null;
}
/**
 * Runtime link information for NgModules.
 *
 * This is the internal data structure used by the runtime to assemble components, directives,
 * pipes, and injectors.
 *
 * NOTE: Always use `ɵɵdefineNgModule` function to create this object,
 * never create the object directly since the shape of this object
 * can change between versions.
 */
interface NgModuleDef<T> {
    /** Token representing the module. Used by DI. */
    type: T;
    /**
     * List of components to bootstrap.
     *
     * @see {NgModuleScopeInfoFromDecorator} This field is only used in global compilation mode. In local compilation mode the bootstrap info is computed and added in runtime.
     */
    bootstrap: Type$1<any>[] | (() => Type$1<any>[]);
    /** List of components, directives, and pipes declared by this module. */
    declarations: Type$1<any>[] | (() => Type$1<any>[]);
    /** List of modules or `ModuleWithProviders` imported by this module. */
    imports: Type$1<any>[] | (() => Type$1<any>[]);
    /**
     * List of modules, `ModuleWithProviders`, components, directives, or pipes exported by this
     * module.
     */
    exports: Type$1<any>[] | (() => Type$1<any>[]);
    /**
     * Cached value of computed `transitiveCompileScopes` for this module.
     *
     * This should never be read directly, but accessed via `transitiveScopesFor`.
     */
    transitiveCompileScopes: NgModuleTransitiveScopes | null;
    /** The set of schemas that declare elements to be allowed in the NgModule. */
    schemas: SchemaMetadata[] | null;
    /** Unique ID for the module with which it should be registered.  */
    id: string | null;
}

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
type DirectiveInputs = Record<string, string | [flags: number, publicName: string, declaredName?: string, transform?: InputTransformFunction] | undefined>;
interface DirectiveDefinition<T> {
    /**
     * Directive type, needed to configure the injector.
     */
    type: Type$1<T> | AbstractType<T>;
    /** The selectors that will be used to match nodes to this directive. */
    selectors?: (string | number)[][];
    /**
     * A map of input names.
     */
    inputs?: DirectiveInputs;
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
    outputs?: Record<string, string | undefined>;
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
    consts?: any[] | (() => any[]);
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
    encapsulation?: ViewEncapsulation$1;
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
    changeDetection?: ChangeDetectionStrategy$1;
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
declare function ɵɵdefineComponent<T>(componentDefinition: ComponentDefinition<T>): ComponentDef<any>;
/**
 * @codeGenApi
 */
declare function ɵɵdefineNgModule<T>(def: {
    /** Token representing the module. Used by DI. */
    type: T;
    /** List of components to bootstrap. */
    bootstrap?: Type$1<any>[] | (() => Type$1<any>[]);
    /** List of components, directives, and pipes declared by this module. */
    declarations?: Type$1<any>[] | (() => Type$1<any>[]);
    /** List of modules or `ModuleWithProviders` imported by this module. */
    imports?: Type$1<any>[] | (() => Type$1<any>[]);
    /**
     * List of modules, `ModuleWithProviders`, components, directives, or pipes exported by this
     * module.
     */
    exports?: Type$1<any>[] | (() => Type$1<any>[]);
    /** The set of schemas that declare elements to be allowed in the NgModule. */
    schemas?: SchemaMetadata[] | null;
    /** Unique ID for the module that is used with `getModuleFactory`. */
    id?: string | null;
}): NgModuleDef<T>;
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
declare function ɵɵdefineDirective<T>(directiveDefinition: DirectiveDefinition<T>): DirectiveDef<any>;
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
declare function ɵɵdefinePipe<T>(pipeDef: {
    /** Name of the pipe. Used for matching pipes in template to pipe defs. */
    name: string;
    /** Pipe class reference. Needed to extract pipe lifecycle hooks. */
    type: Type$1<T>;
    /** Whether the pipe is pure. */
    pure?: boolean;
    /**
     * Whether the pipe is standalone.
     */
    standalone?: boolean;
}): PipeDef<T>;

/**
 * If a given component has unresolved async metadata - returns a reference
 * to a function that applies component metadata after resolving defer-loadable
 * dependencies. Otherwise - this function returns `null`.
 */
declare function getAsyncClassMetadataFn(type: Type$1<unknown>): (() => Promise<Array<Type$1<unknown>>>) | null;
/**
 * Handles the process of applying metadata info to a component class in case
 * component template has defer blocks (thus some dependencies became deferrable).
 *
 * @param type Component class where metadata should be added
 * @param dependencyLoaderFn Function that loads dependencies
 * @param metadataSetterFn Function that forms a scope in which the `setClassMetadata` is invoked
 */
declare function setClassMetadataAsync(type: Type$1<any> | AbstractType<any>, dependencyLoaderFn: () => Array<Promise<Type$1<unknown> | AbstractType<unknown>>>, metadataSetterFn: (...types: (Type$1<unknown> | AbstractType<unknown>)[]) => void): () => Promise<Array<Type$1<unknown> | AbstractType<unknown>>>;
/**
 * Adds decorator, constructor, and property metadata to a given type via static metadata fields
 * on the type.
 *
 * These metadata fields can later be read with Angular's `ReflectionCapabilities` API.
 *
 * Calls to `setClassMetadata` can be guarded by ngDevMode, resulting in the metadata assignments
 * being tree-shaken away during production builds.
 */
declare function setClassMetadata(type: any, decorators: readonly any[] | null, ctorParameters: (() => any[]) | null, propDecorators: {
    [field: string]: any;
} | null): void;

/**
 * Returns a new NgModuleRef instance based on the NgModule class and parent injector provided.
 *
 * @param ngModule NgModule class.
 * @param parentInjector Optional injector instance to use as a parent for the module injector. If
 *     not provided, `NullInjector` will be used instead.
 * @returns NgModuleRef that represents an NgModule instance.
 *
 * @publicApi
 */
declare function createNgModule<T>(ngModule: Type$1<T>, parentInjector?: Injector): NgModuleRef$1<T>;
declare class NgModuleRef<T> extends NgModuleRef$1<T> implements InternalNgModuleRef<T> {
    private readonly ngModuleType;
    _parent: Injector | null;
    _bootstrapComponents: Type$1<any>[];
    private readonly _r3Injector;
    instance: T;
    destroyCbs: (() => void)[] | null;
    constructor(ngModuleType: Type$1<T>, _parent: Injector | null, additionalProviders: Array<Provider | EnvironmentProviders>, runInjectorInitializers?: boolean);
    resolveInjectorInitializers(): void;
    get injector(): EnvironmentInjector;
    destroy(): void;
    onDestroy(callback: () => void): void;
}
declare class NgModuleFactory<T> extends NgModuleFactory$1<T> {
    moduleType: Type$1<T>;
    constructor(moduleType: Type$1<T>);
    create(parentInjector: Injector | null): NgModuleRef$1<T>;
}
/**
 * Create a new environment injector.
 *
 * @param providers An array of providers.
 * @param parent A parent environment injector.
 * @param debugName An optional name for this injector instance, which will be used in error
 *     messages.
 *
 * @publicApi
 */
declare function createEnvironmentInjector(providers: Array<Provider | EnvironmentProviders>, parent: EnvironmentInjector, debugName?: string | null): EnvironmentInjector;

/**
 * Convince closure compiler that the wrapped function has no side-effects.
 *
 * Closure compiler always assumes that `toString` has no side-effects. We use this quirk to
 * allow us to execute a function but have closure compiler mark the call as no-side-effects.
 * It is important that the return value for the `noSideEffects` function be assigned
 * to something which is retained otherwise the call to `noSideEffects` will be removed by closure
 * compiler.
 */
declare function noSideEffects<T>(fn: () => T): T;

/**
 * A DI token that you can use to provide
 * one or more initialization functions.
 *
 * The provided functions are injected at application startup and executed during
 * app initialization. If any of these functions returns a Promise or an Observable, initialization
 * does not complete until the Promise is resolved or the Observable is completed.
 *
 * You can, for example, create a factory function that loads language data
 * or an external configuration, and provide that function to the `APP_INITIALIZER` token.
 * The function is executed during the application bootstrap process,
 * and the needed data is available on startup.
 *
 * Note that the provided initializer is run in the injection context.
 *
 * @deprecated from v19.0.0, use provideAppInitializer instead
 *
 * @see {@link ApplicationInitStatus}
 * @see {@link provideAppInitializer}
 *
 * @usageNotes
 *
 * The following example illustrates how to configure a multi-provider using `APP_INITIALIZER` token
 * and a function returning a promise.
 * ### Example with NgModule-based application
 * ```ts
 *  function initializeApp(): Promise<any> {
 *    const http = inject(HttpClient);
 *    return firstValueFrom(
 *      http
 *        .get("https://someUrl.com/api/user")
 *        .pipe(tap(user => { ... }))
 *    );
 *  }
 *
 *  @NgModule({
 *   imports: [BrowserModule],
 *   declarations: [AppComponent],
 *   bootstrap: [AppComponent],
 *   providers: [{
 *     provide: APP_INITIALIZER,
 *     useValue: initializeApp,
 *     multi: true,
 *    }]
 *   })
 *  export class AppModule {}
 * ```
 *
 * ### Example with standalone application
 * ```ts
 * function initializeApp() {
 *   const http = inject(HttpClient);
 *   return firstValueFrom(
 *     http
 *       .get("https://someUrl.com/api/user")
 *       .pipe(tap(user => { ... }))
 *   );
 * }
 *
 * bootstrapApplication(App, {
 *   providers: [
 *     provideHttpClient(),
 *     {
 *       provide: APP_INITIALIZER,
 *       useValue: initializeApp,
 *       multi: true,
 *     },
 *   ],
 * });

 * ```
 *
 *
 * It's also possible to configure a multi-provider using `APP_INITIALIZER` token and a function
 * returning an observable, see an example below. Note: the `HttpClient` in this example is used for
 * demo purposes to illustrate how the factory function can work with other providers available
 * through DI.
 *
 * ### Example with NgModule-based application
 * ```ts
 * function initializeApp() {
 *   const http = inject(HttpClient);
 *   return firstValueFrom(
 *     http
 *       .get("https://someUrl.com/api/user")
 *       .pipe(tap(user => { ... }))
 *   );
 * }
 *
 * @NgModule({
 *   imports: [BrowserModule, HttpClientModule],
 *   declarations: [AppComponent],
 *   bootstrap: [AppComponent],
 *   providers: [{
 *     provide: APP_INITIALIZER,
 *     useValue: initializeApp,
 *     multi: true,
 *   }]
 * })
 * export class AppModule {}
 * ```
 *
 * ### Example with standalone application
 * ```ts
 * function initializeApp() {
 *   const http = inject(HttpClient);
 *   return firstValueFrom(
 *     http
 *       .get("https://someUrl.com/api/user")
 *       .pipe(tap(user => { ... }))
 *   );
 * }
 *
 * bootstrapApplication(App, {
 *   providers: [
 *     provideHttpClient(),
 *     {
 *       provide: APP_INITIALIZER,
 *       useValue: initializeApp,
 *       multi: true,
 *     },
 *   ],
 * });
 * ```
 *
 * @publicApi
 */
declare const APP_INITIALIZER: InjectionToken<readonly (() => Observable<unknown> | Promise<unknown> | void)[]>;
/**
 * @description
 * The provided function is injected at application startup and executed during
 * app initialization. If the function returns a Promise or an Observable, initialization
 * does not complete until the Promise is resolved or the Observable is completed.
 *
 * You can, for example, create a function that loads language data
 * or an external configuration, and provide that function using `provideAppInitializer()`.
 * The function is executed during the application bootstrap process,
 * and the needed data is available on startup.
 *
 * Note that the provided initializer is run in the injection context.
 *
 * Previously, this was achieved using the `APP_INITIALIZER` token which is now deprecated.
 *
 * @see {@link APP_INITIALIZER}
 *
 * @usageNotes
 * The following example illustrates how to configure an initialization function using
 * `provideAppInitializer()`
 * ```ts
 * bootstrapApplication(App, {
 *   providers: [
 *     provideAppInitializer(() => {
 *       const http = inject(HttpClient);
 *       return firstValueFrom(
 *         http
 *           .get("https://someUrl.com/api/user")
 *           .pipe(tap(user => { ... }))
 *       );
 *     }),
 *     provideHttpClient(),
 *   ],
 * });
 * ```
 *
 * @publicApi
 */
declare function provideAppInitializer(initializerFn: () => Observable<unknown> | Promise<unknown> | void): EnvironmentProviders;
/**
 * A class that reflects the state of running {@link APP_INITIALIZER} functions.
 *
 * @publicApi
 */
declare class ApplicationInitStatus {
    private resolve;
    private reject;
    private initialized;
    readonly done = false;
    readonly donePromise: Promise<any>;
    private readonly appInits;
    private readonly injector;
    constructor();
    static ɵfac: __FactoryDeclaration<ApplicationInitStatus, never>;
    static ɵprov: __InjectableDeclaration<any>;
}

/**
 * A type describing supported iterable types.
 *
 * @publicApi
 */
type NgIterable<T> = Array<T> | Iterable<T>;
/**
 * A strategy for tracking changes over time to an iterable. Used by {@link /api/common/NgForOf NgForOf} to
 * respond to changes in an iterable by effecting equivalent changes in the DOM.
 *
 * @publicApi
 */
interface IterableDiffer<V> {
    /**
     * Compute a difference between the previous state and the new `object` state.
     *
     * @param object containing the new value.
     * @returns an object describing the difference. The return value is only valid until the next
     * `diff()` invocation.
     */
    diff(object: NgIterable<V> | undefined | null): IterableChanges<V> | null;
}
/**
 * An object describing the changes in the `Iterable` collection since last time
 * `IterableDiffer#diff()` was invoked.
 *
 * @publicApi
 */
interface IterableChanges<V> {
    /**
     * Iterate over all changes. `IterableChangeRecord` will contain information about changes
     * to each item.
     */
    forEachItem(fn: (record: IterableChangeRecord<V>) => void): void;
    /**
     * Iterate over a set of operations which when applied to the original `Iterable` will produce the
     * new `Iterable`.
     *
     * NOTE: These are not necessarily the actual operations which were applied to the original
     * `Iterable`, rather these are a set of computed operations which may not be the same as the
     * ones applied.
     *
     * @param record A change which needs to be applied
     * @param previousIndex The `IterableChangeRecord#previousIndex` of the `record` refers to the
     *        original `Iterable` location, where as `previousIndex` refers to the transient location
     *        of the item, after applying the operations up to this point.
     * @param currentIndex The `IterableChangeRecord#currentIndex` of the `record` refers to the
     *        original `Iterable` location, where as `currentIndex` refers to the transient location
     *        of the item, after applying the operations up to this point.
     */
    forEachOperation(fn: (record: IterableChangeRecord<V>, previousIndex: number | null, currentIndex: number | null) => void): void;
    /**
     * Iterate over changes in the order of original `Iterable` showing where the original items
     * have moved.
     */
    forEachPreviousItem(fn: (record: IterableChangeRecord<V>) => void): void;
    /** Iterate over all added items. */
    forEachAddedItem(fn: (record: IterableChangeRecord<V>) => void): void;
    /** Iterate over all moved items. */
    forEachMovedItem(fn: (record: IterableChangeRecord<V>) => void): void;
    /** Iterate over all removed items. */
    forEachRemovedItem(fn: (record: IterableChangeRecord<V>) => void): void;
    /**
     * Iterate over all items which had their identity (as computed by the `TrackByFunction`)
     * changed.
     */
    forEachIdentityChange(fn: (record: IterableChangeRecord<V>) => void): void;
}
/**
 * Record representing the item change information.
 *
 * @publicApi
 */
interface IterableChangeRecord<V> {
    /** Current index of the item in `Iterable` or null if removed. */
    readonly currentIndex: number | null;
    /** Previous index of the item in `Iterable` or null if added. */
    readonly previousIndex: number | null;
    /** The item. */
    readonly item: V;
    /** Track by identity as computed by the `TrackByFunction`. */
    readonly trackById: any;
}
/**
 * A function optionally passed into the `NgForOf` directive to customize how `NgForOf` uniquely
 * identifies items in an iterable.
 *
 * `NgForOf` needs to uniquely identify items in the iterable to correctly perform DOM updates
 * when items in the iterable are reordered, new items are added, or existing items are removed.
 *
 *
 * In all of these scenarios it is usually desirable to only update the DOM elements associated
 * with the items affected by the change. This behavior is important to:
 *
 * - preserve any DOM-specific UI state (like cursor position, focus, text selection) when the
 *   iterable is modified
 * - enable animation of item addition, removal, and iterable reordering
 * - preserve the value of the `<select>` element when nested `<option>` elements are dynamically
 *   populated using `NgForOf` and the bound iterable is updated
 *
 * A common use for custom `trackBy` functions is when the model that `NgForOf` iterates over
 * contains a property with a unique identifier. For example, given a model:
 *
 * ```ts
 * class User {
 *   id: number;
 *   name: string;
 *   ...
 * }
 * ```
 * a custom `trackBy` function could look like the following:
 * ```ts
 * function userTrackBy(index, user) {
 *   return user.id;
 * }
 * ```
 *
 * A custom `trackBy` function must have several properties:
 *
 * - be [idempotent](https://en.wikipedia.org/wiki/Idempotence) (be without side effects, and always
 * return the same value for a given input)
 * - return unique value for all unique inputs
 * - be fast
 *
 * @see [`NgForOf#ngForTrackBy`](api/common/NgForOf#ngForTrackBy)
 * @publicApi
 */
interface TrackByFunction<T> {
    /**
     * @param index The index of the item within the iterable.
     * @param item The item in the iterable.
     */
    <U extends T>(index: number, item: T & U): any;
}
/**
 * Provides a factory for {@link IterableDiffer}.
 *
 * @publicApi
 */
interface IterableDifferFactory {
    supports(objects: any): boolean;
    create<V>(trackByFn?: TrackByFunction<V>): IterableDiffer<V>;
}
/**
 * A repository of different iterable diffing strategies used by NgFor, NgClass, and others.
 *
 * @publicApi
 */
declare class IterableDiffers {
    private factories;
    /** @nocollapse */
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<IterableDiffers>;
    constructor(factories: IterableDifferFactory[]);
    static create(factories: IterableDifferFactory[], parent?: IterableDiffers): IterableDiffers;
    /**
     * Takes an array of {@link IterableDifferFactory} and returns a provider used to extend the
     * inherited {@link IterableDiffers} instance with the provided factories and return a new
     * {@link IterableDiffers} instance.
     *
     * @usageNotes
     * ### Example
     *
     * The following example shows how to extend an existing list of factories,
     * which will only be applied to the injector for this component and its children.
     * This step is all that's required to make a new {@link IterableDiffer} available.
     *
     * ```ts
     * @Component({
     *   viewProviders: [
     *     IterableDiffers.extend([new ImmutableListDiffer()])
     *   ]
     * })
     * ```
     */
    static extend(factories: IterableDifferFactory[]): StaticProvider;
    find(iterable: any): IterableDifferFactory;
}

/**
 * A differ that tracks changes made to an object over time.
 *
 * @publicApi
 */
interface KeyValueDiffer<K, V> {
    /**
     * Compute a difference between the previous state and the new `object` state.
     *
     * @param object containing the new value.
     * @returns an object describing the difference. The return value is only valid until the next
     * `diff()` invocation.
     */
    diff(object: Map<K, V>): KeyValueChanges<K, V> | null;
    /**
     * Compute a difference between the previous state and the new `object` state.
     *
     * @param object containing the new value.
     * @returns an object describing the difference. The return value is only valid until the next
     * `diff()` invocation.
     */
    diff(object: {
        [key: string]: V;
    }): KeyValueChanges<string, V> | null;
}
/**
 * An object describing the changes in the `Map` or `{[k:string]: string}` since last time
 * `KeyValueDiffer#diff()` was invoked.
 *
 * @publicApi
 */
interface KeyValueChanges<K, V> {
    /**
     * Iterate over all changes. `KeyValueChangeRecord` will contain information about changes
     * to each item.
     */
    forEachItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    /**
     * Iterate over changes in the order of original Map showing where the original items
     * have moved.
     */
    forEachPreviousItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    /**
     * Iterate over all keys for which values have changed.
     */
    forEachChangedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    /**
     * Iterate over all added items.
     */
    forEachAddedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
    /**
     * Iterate over all removed items.
     */
    forEachRemovedItem(fn: (r: KeyValueChangeRecord<K, V>) => void): void;
}
/**
 * Record representing the item change information.
 *
 * @publicApi
 */
interface KeyValueChangeRecord<K, V> {
    /**
     * Current key in the Map.
     */
    readonly key: K;
    /**
     * Current value for the key or `null` if removed.
     */
    readonly currentValue: V | null;
    /**
     * Previous value for the key or `null` if added.
     */
    readonly previousValue: V | null;
}
/**
 * Provides a factory for {@link KeyValueDiffer}.
 *
 * @publicApi
 */
interface KeyValueDifferFactory {
    /**
     * Test to see if the differ knows how to diff this kind of object.
     */
    supports(objects: any): boolean;
    /**
     * Create a `KeyValueDiffer`.
     */
    create<K, V>(): KeyValueDiffer<K, V>;
}
/**
 * A repository of different Map diffing strategies used by NgClass, NgStyle, and others.
 *
 * @publicApi
 */
declare class KeyValueDiffers {
    /** @nocollapse */
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<KeyValueDiffers>;
    private readonly factories;
    constructor(factories: KeyValueDifferFactory[]);
    static create(factories: KeyValueDifferFactory[], parent?: KeyValueDiffers): KeyValueDiffers;
    /**
     * Takes an array of {@link KeyValueDifferFactory} and returns a provider used to extend the
     * inherited {@link KeyValueDiffers} instance with the provided factories and return a new
     * {@link KeyValueDiffers} instance.
     *
     * @usageNotes
     * ### Example
     *
     * The following example shows how to extend an existing list of factories,
     * which will only be applied to the injector for this component and its children.
     * This step is all that's required to make a new {@link KeyValueDiffer} available.
     *
     * ```ts
     * @Component({
     *   viewProviders: [
     *     KeyValueDiffers.extend([new ImmutableMapDiffer()])
     *   ]
     * })
     * ```
     */
    static extend(factories: KeyValueDifferFactory[]): StaticProvider;
    find(kv: any): KeyValueDifferFactory;
}

/**
 * Represents a basic change from a previous to a new value for a single
 * property on a directive instance. Passed as a value in a
 * {@link SimpleChanges} object to the `ngOnChanges` hook.
 *
 * @see {@link OnChanges}
 *
 * @publicApi
 */
declare class SimpleChange<T = any> {
    previousValue: T;
    currentValue: T;
    firstChange: boolean;
    constructor(previousValue: T, currentValue: T, firstChange: boolean);
    /**
     * Check whether the new value is the first value assigned.
     */
    isFirstChange(): boolean;
}
/**
 * A hashtable of changes represented by {@link SimpleChange} objects stored
 * at the declared property name they belong to on a Directive or Component. This is
 * the type passed to the `ngOnChanges` hook. Pass the current class or `this` as the
 * first generic argument for stronger type checking (e.g. `SimpleChanges<YourComponent>`).
 *
 * @see {@link OnChanges}
 *
 * @see [Inspecting changes](guide/components/lifecycle#inspecting-changes)
 *
 * @publicApi
 */
type SimpleChanges<T = unknown> = T extends object ? {
    [Key in keyof T]?: SimpleChange<T[Key] extends {
        [ɵINPUT_SIGNAL_BRAND_READ_TYPE]: infer V;
    } ? V : T[Key]>;
} : {
    [propName: string]: SimpleChange;
};

declare function devModeEqual(a: any, b: any): boolean;

/**
 * @deprecated v4.0.0 - Should not be part of public API.
 * @publicApi
 */
declare class DefaultIterableDiffer<V> implements IterableDiffer<V>, IterableChanges<V> {
    readonly length: number;
    readonly collection: V[] | Iterable<V> | null;
    private _linkedRecords;
    private _unlinkedRecords;
    private _previousItHead;
    private _itHead;
    private _itTail;
    private _additionsHead;
    private _additionsTail;
    private _movesHead;
    private _movesTail;
    private _removalsHead;
    private _removalsTail;
    private _identityChangesHead;
    private _identityChangesTail;
    private _trackByFn;
    constructor(trackByFn?: TrackByFunction<V>);
    forEachItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachOperation(fn: (item: IterableChangeRecord<V>, previousIndex: number | null, currentIndex: number | null) => void): void;
    forEachPreviousItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachAddedItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachMovedItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachRemovedItem(fn: (record: IterableChangeRecord_<V>) => void): void;
    forEachIdentityChange(fn: (record: IterableChangeRecord_<V>) => void): void;
    diff(collection: NgIterable<V> | null | undefined): DefaultIterableDiffer<V> | null;
    onDestroy(): void;
    check(collection: NgIterable<V>): boolean;
    get isDirty(): boolean;
    private _addToRemovals;
}
declare class IterableChangeRecord_<V> implements IterableChangeRecord<V> {
    item: V;
    trackById: any;
    currentIndex: number | null;
    previousIndex: number | null;
    constructor(item: V, trackById: any);
}

/**
 * An interface that is implemented by pipes in order to perform a transformation.
 * Angular invokes the `transform` method with the value of a binding
 * as the first argument, and any parameters as the second argument in list form.
 *
 * @usageNotes
 *
 * In the following example, `TruncatePipe` returns the shortened value with an added ellipses.
 *
 * {@example core/ts/pipes/simple_truncate.ts region='simple-truncate'}
 *
 * Invoking `{{ 'It was the best of times' | truncate }}` in a template will produce `It was...`.
 *
 * In the following example, `TruncatePipe` takes parameters that sets the truncated length and the
 * string to append with.
 *
 * {@example core/ts/pipes/truncate.ts region='truncate'}
 *
 * Invoking `{{ 'It was the best of times' | truncate:4:'....' }}` in a template will produce `It
 * was the best....`.
 *
 * @publicApi
 */
interface PipeTransform {
    transform(value: any, ...args: any[]): any;
}

declare const defaultIterableDiffers: IterableDiffers;
declare const defaultKeyValueDiffers: KeyValueDiffers;

/**
 * Options passed to the `computed` creation function.
 */
interface CreateComputedOptions<T> {
    /**
     * A comparison function which defines equality for computed values.
     */
    equal?: ValueEqualityFn<T>;
    /**
     * A debug name for the computed signal. Used in Angular DevTools to identify the signal.
     */
    debugName?: string;
}
/**
 * Create a computed `Signal` which derives a reactive value from an expression.
 * @see [Computed signals](guide/signals#computed-signals)
 */
declare function computed<T>(computation: () => T, options?: CreateComputedOptions<T>): Signal<T>;

/**
 * Creates a writable signal whose value is initialized and reset by the linked, reactive computation.
 *
 * @publicApi 20.0
 */
declare function linkedSignal<D>(computation: () => D, options?: {
    equal?: ValueEqualityFn<NoInfer<D>>;
    debugName?: string;
    set?: (value: NoInfer<D>, rawSet: (value: NoInfer<D>) => void) => void;
}): WritableSignal<D>;
/**
 * Creates a writable signal whose value is initialized and reset by the linked, reactive computation.
 * This is an advanced API form where the computation has access to the previous value of the signal and the computation result.
 *
 * Note: The computation is reactive, meaning the linked signal will automatically update whenever any of the signals used within the computation change.
 *
 * @publicApi 20.0
 * @see [Dependent state with linkedSignal](guide/signals/linked-signal)
 */
declare function linkedSignal<S, D>(options: {
    source: () => S;
    computation: (source: NoInfer<S>, previous?: {
        source: NoInfer<S>;
        value: NoInfer<D>;
    }) => D;
    equal?: ValueEqualityFn<NoInfer<D>>;
    debugName?: string;
    set?: (value: NoInfer<D>, rawSet: (value: NoInfer<D>) => void) => void;
}): WritableSignal<D>;

/**
 * Execute an arbitrary function in a non-reactive (non-tracking) context. The executed function
 * can, optionally, return a value.
 * @see [Reading without tracking dependencies](guide/signals#reading-without-tracking-dependencies)
 */
declare function untracked<T>(nonReactiveReadsFn: () => T): T;

/**
 * An argument list containing the first non-never type in the given type array, or an empty
 * argument list if there are no non-never types in the type array.
 */
type ɵFirstAvailable<T extends unknown[]> = T extends [infer H, ...infer R] ? [H] extends [never] ? ɵFirstAvailable<R> : [H] : [];
/**
 * Options passed to `afterEveryRender` and `afterNextRender`.
 *
 * @publicApi 20.0
 */
interface AfterRenderOptions {
    /**
     * The `Injector` to use during creation.
     *
     * If this is not provided, the current injection context will be used instead (via `inject`).
     */
    injector?: Injector;
    /**
     * Whether the hook should require manual cleanup.
     *
     * If this is `false` (the default) the hook will automatically register itself to be cleaned up
     * with the current `DestroyRef`.
     */
    manualCleanup?: boolean;
}
/**
 * Register callbacks to be invoked each time the application finishes rendering, during the
 * specified phases. The available phases are:
 * - `earlyRead`
 *   Use this phase to **read** from the DOM before a subsequent `write` callback, for example to
 *   perform custom layout that the browser doesn't natively support. Prefer the `read` phase if
 *   reading can wait until after the write phase. **Never** write to the DOM in this phase.
 * - `write`
 *    Use this phase to **write** to the DOM. **Never** read from the DOM in this phase.
 * - `mixedReadWrite`
 *    Use this phase to read from and write to the DOM simultaneously. **Never** use this phase if
 *    it is possible to divide the work among the other phases instead.
 * - `read`
 *    Use this phase to **read** from the DOM. **Never** write to the DOM in this phase.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * You should prefer using the `read` and `write` phases over the `earlyRead` and `mixedReadWrite`
 * phases when possible, to avoid performance degradation.
 *
 * </div>
 *
 * Note that:
 * - Callbacks run in the following phase order *after each render*:
 *   1. `earlyRead`
 *   2. `write`
 *   3. `mixedReadWrite`
 *   4. `read`
 * - Callbacks in the same phase run in the order they are registered.
 * - Callbacks run on browser platforms only, they will not run on the server.
 *
 * The first phase callback to run as part of this spec will receive no parameters. Each
 * subsequent phase callback in this spec will receive the return value of the previously run
 * phase callback as a parameter. This can be used to coordinate work across multiple phases.
 *
 * Angular is unable to verify or enforce that phases are used correctly, and instead
 * relies on each developer to follow the guidelines documented for each value and
 * carefully choose the appropriate one, refactoring their code if necessary. By doing
 * so, Angular is better able to minimize the performance degradation associated with
 * manual DOM access, ensuring the best experience for the end users of your application
 * or library.
 *
 * <div class="docs-alert docs-alert-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param spec The callback functions to register
 * @param options Options to control the behavior of the callback
 *
 * @usageNotes
 *
 * Use `afterEveryRender` to read or write the DOM after each render.
 *
 * ### Example
 * ```angular-ts
 * @Component({
 *   selector: 'my-cmp',
 *   template: `<span #content>{{ ... }}</span>`,
 * })
 * export class MyComponent {
 *   contentRef = viewChild.required<ElementRef>('content');
 *
 *   constructor() {
 *     afterEveryRender({
 *       read: () => {
 *         console.log('content height: ' + this.contentRef().nativeElement.scrollHeight);
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @see [afterEveryRender and afterNextRender](guide/components/lifecycle#aftereveryrender-and-afternextrender)
 *
 * @publicApi 20.0
 */
declare function afterEveryRender<E = never, W = never, M = never>(spec: {
    earlyRead?: () => E;
    write?: (...args: ɵFirstAvailable<[E]>) => W;
    mixedReadWrite?: (...args: ɵFirstAvailable<[W, E]>) => M;
    read?: (...args: ɵFirstAvailable<[M, W, E]>) => void;
}, options?: AfterRenderOptions): AfterRenderRef;
/**
 * Register a callback to be invoked each time the application finishes rendering, during the
 * `mixedReadWrite` phase.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * You should prefer specifying an explicit phase for the callback instead, or you risk significant
 * performance degradation.
 *
 * </div>
 *
 * Note that the callback will run
 * - in the order it was registered
 * - once per render
 * - on browser platforms only
 * - during the `mixedReadWrite` phase
 *
 * <div class="docs-alert docs-alert-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param callback A callback function to register
 * @param options Options to control the behavior of the callback
 *
 * @usageNotes
 *
 * Use `afterEveryRender` to read or write the DOM after each render.
 *
 * ### Example
 * ```angular-ts
 * @Component({
 *   selector: 'my-cmp',
 *   template: `<span #content>{{ ... }}</span>`,
 * })
 * export class MyComponent {
 *   contentRef = viewChild.required<ElementRef>('content');
 *
 *   constructor() {
 *     afterEveryRender({
 *       read: () => {
 *         console.log('content height: ' + this.contentRef().nativeElement.scrollHeight);
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @publicApi 20.0
 */
declare function afterEveryRender(callback: VoidFunction, options?: AfterRenderOptions): AfterRenderRef;
/**
 * Register callbacks to be invoked the next time the application finishes rendering, during the
 * specified phases. The available phases are:
 * - `earlyRead`
 *   Use this phase to **read** from the DOM before a subsequent `write` callback, for example to
 *   perform custom layout that the browser doesn't natively support. Prefer the `read` phase if
 *   reading can wait until after the write phase. **Never** write to the DOM in this phase.
 * - `write`
 *    Use this phase to **write** to the DOM. **Never** read from the DOM in this phase.
 * - `mixedReadWrite`
 *    Use this phase to read from and write to the DOM simultaneously. **Never** use this phase if
 *    it is possible to divide the work among the other phases instead.
 * - `read`
 *    Use this phase to **read** from the DOM. **Never** write to the DOM in this phase.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * You should prefer using the `read` and `write` phases over the `earlyRead` and `mixedReadWrite`
 * phases when possible, to avoid performance degradation.
 *
 * </div>
 *
 * Note that:
 * - Callbacks run in the following phase order *once, after the next render*:
 *   1. `earlyRead`
 *   2. `write`
 *   3. `mixedReadWrite`
 *   4. `read`
 * - Callbacks in the same phase run in the order they are registered.
 * - Callbacks run on browser platforms only, they will not run on the server.
 *
 * The first phase callback to run as part of this spec will receive no parameters. Each
 * subsequent phase callback in this spec will receive the return value of the previously run
 * phase callback as a parameter. This can be used to coordinate work across multiple phases.
 *
 * Angular is unable to verify or enforce that phases are used correctly, and instead
 * relies on each developer to follow the guidelines documented for each value and
 * carefully choose the appropriate one, refactoring their code if necessary. By doing
 * so, Angular is better able to minimize the performance degradation associated with
 * manual DOM access, ensuring the best experience for the end users of your application
 * or library.
 *
 * <div class="docs-alert docs-alert-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param spec The callback functions to register
 * @param options Options to control the behavior of the callback
 *
 * @usageNotes
 *
 * Use `afterNextRender` to read or write the DOM once,
 * for example to initialize a non-Angular library.
 *
 * ### Example
 * ```angular-ts
 * @Component({
 *   selector: 'my-chart-cmp',
 *   template: `<div #chart>{{ ... }}</div>`,
 * })
 * export class MyChartCmp {
 *   chartRef = viewChild.required<ElementRef>('chart');
 *   chart: MyChart|null;
 *
 *   constructor() {
 *     afterNextRender({
 *       write: () => {
 *         this.chart = new MyChart(this.chartRef().nativeElement);
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @publicApi 20.0
 * @see [afterEveryRender and afterNextRender](guide/components/lifecycle#aftereveryrender-and-afternextrender)
 */
declare function afterNextRender<E = never, W = never, M = never>(spec: {
    earlyRead?: () => E;
    write?: (...args: ɵFirstAvailable<[E]>) => W;
    mixedReadWrite?: (...args: ɵFirstAvailable<[W, E]>) => M;
    read?: (...args: ɵFirstAvailable<[M, W, E]>) => void;
}, options?: AfterRenderOptions): AfterRenderRef;
/**
 * Register a callback to be invoked the next time the application finishes rendering, during the
 * `mixedReadWrite` phase.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * You should prefer specifying an explicit phase for the callback instead, or you risk significant
 * performance degradation.
 *
 * </div>
 *
 * Note that the callback will run
 * - in the order it was registered
 * - on browser platforms only
 * - during the `mixedReadWrite` phase
 *
 * <div class="docs-alert docs-alert-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param callback A callback function to register
 * @param options Options to control the behavior of the callback
 *
 * @usageNotes
 *
 * Use `afterNextRender` to read or write the DOM once,
 * for example to initialize a non-Angular library.
 *
 * ### Example
 * ```angular-ts
 * @Component({
 *   selector: 'my-chart-cmp',
 *   template: `<div #chart>{{ ... }}</div>`,
 * })
 * export class MyChartCmp {
 *   chartRef = viewChild.required<ElementRef>('chart');
 *   chart: MyChart|null;
 *
 *   constructor() {
 *     afterNextRender({
 *       write: () => {
 *         this.chart = new MyChart(this.chartRef().nativeElement);
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @publicApi 20.0
 */
declare function afterNextRender(callback: VoidFunction, options?: AfterRenderOptions): AfterRenderRef;

/**
 * An argument list containing the first non-never type in the given type array, or an empty
 * argument list if there are no non-never types in the type array.
 */
type ɵFirstAvailableSignal<T extends unknown[]> = T extends [infer H, ...infer R] ? [H] extends [never] ? ɵFirstAvailableSignal<R> : [Signal<H>] : [];
/**
 * Register an effect that, when triggered, is invoked when the application finishes rendering, during the
 * `mixedReadWrite` phase.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * You should prefer specifying an explicit phase for the effect instead, or you risk significant
 * performance degradation.
 *
 * </div>
 *
 * Note that callback-based `afterRenderEffect`s will run
 * - in the order it they are registered
 * - only when dirty
 * - on browser platforms only
 * - during the `mixedReadWrite` phase
 *
 * <div class="docs-alert docs-alert-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param callback An effect callback function to register
 * @param options Options to control the behavior of the callback
 *
 * @publicApi
 */
declare function afterRenderEffect(callback: (onCleanup: EffectCleanupRegisterFn) => void, options?: AfterRenderOptions): AfterRenderRef;
/**
 * Register effects that, when triggered, are invoked when the application finishes rendering,
 * during the specified phases. The available phases are:
 * - `earlyRead`
 *   Use this phase to **read** from the DOM before a subsequent `write` callback, for example to
 *   perform custom layout that the browser doesn't natively support. Prefer the `read` phase if
 *   reading can wait until after the write phase. **Never** write to the DOM in this phase.
 * - `write`
 *    Use this phase to **write** to the DOM. **Never** read from the DOM in this phase.
 * - `mixedReadWrite`
 *    Use this phase to read from and write to the DOM simultaneously. **Never** use this phase if
 *    it is possible to divide the work among the other phases instead.
 * - `read`
 *    Use this phase to **read** from the DOM. **Never** write to the DOM in this phase.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * You should prefer using the `read` and `write` phases over the `earlyRead` and `mixedReadWrite`
 * phases when possible, to avoid performance degradation.
 *
 * </div>
 *
 * Note that:
 * - Effects run in the following phase order, only when dirty through signal dependencies:
 *   1. `earlyRead`
 *   2. `write`
 *   3. `mixedReadWrite`
 *   4. `read`
 * - `afterRenderEffect`s in the same phase run in the order they are registered.
 * - `afterRenderEffect`s run on browser platforms only, they will not run on the server.
 * - `afterRenderEffect`s will run at least once.
 *
 * The first phase callback to run as part of this spec will receive no parameters. Each
 * subsequent phase callback in this spec will receive the return value of the previously run
 * phase callback as a `Signal`. This can be used to coordinate work across multiple phases.
 *
 * Angular is unable to verify or enforce that phases are used correctly, and instead
 * relies on each developer to follow the guidelines documented for each value and
 * carefully choose the appropriate one, refactoring their code if necessary. By doing
 * so, Angular is better able to minimize the performance degradation associated with
 * manual DOM access, ensuring the best experience for the end users of your application
 * or library.
 *
 * <div class="docs-alert docs-alert-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param spec The effect functions to register
 * @param options Options to control the behavior of the effects
 *
 * @usageNotes
 *
 * Use `afterRenderEffect` to create effects that will read or write from the DOM and thus should
 * run after rendering.
 *
 * @publicApi
 */
declare function afterRenderEffect<E = never, W = never, M = never>(spec: {
    earlyRead?: (onCleanup: EffectCleanupRegisterFn) => E;
    write?: (...args: [...ɵFirstAvailableSignal<[E]>, EffectCleanupRegisterFn]) => W;
    mixedReadWrite?: (...args: [...ɵFirstAvailableSignal<[W, E]>, EffectCleanupRegisterFn]) => M;
    read?: (...args: [...ɵFirstAvailableSignal<[M, W, E]>, EffectCleanupRegisterFn]) => void;
}, options?: AfterRenderOptions): AfterRenderRef;

/**
 * Asserts that the current stack frame is not within a reactive context. Useful
 * to disallow certain code from running inside a reactive context (see {@link /api/core/rxjs-interop/toSignal toSignal})
 *
 * @param debugFn a reference to the function making the assertion (used for the error message).
 * @see [Asserts the reactive context](guide/signals#asserts-the-reactive-context)
 *
 * @publicApi
 */
declare function assertNotInReactiveContext(debugFn: Function, extraContext?: string): void;

/**
 * Re-exported by `BrowserModule`, which is included automatically in the root
 * `AppModule` when you create a new app with the CLI `new` command. Eagerly injects
 * `ApplicationRef` to instantiate it.
 *
 * @publicApi
 */
declare class ApplicationModule {
    constructor(appRef: ApplicationRef);
    static ɵfac: __FactoryDeclaration<ApplicationModule, never>;
    static ɵmod: __NgModuleDeclaration<ApplicationModule, never, never, never>;
    static ɵinj: __InjectorDeclaration<ApplicationModule>;
}

/**
 * A DI token representing a string ID, used
 * primarily for prefixing application attributes and CSS styles when
 * {@link ViewEncapsulation#Emulated} is being used.
 *
 * The token is needed in cases when multiple applications are bootstrapped on a page
 * (for example, using `bootstrapApplication` calls). In this case, ensure that those applications
 * have different `APP_ID` value setup. For example:
 *
 * ```ts
 * bootstrapApplication(ComponentA, {
 *   providers: [
 *     { provide: APP_ID, useValue: 'app-a' },
 *     // ... other providers ...
 *   ]
 * });
 *
 * bootstrapApplication(ComponentB, {
 *   providers: [
 *     { provide: APP_ID, useValue: 'app-b' },
 *     // ... other providers ...
 *   ]
 * });
 * ```
 *
 * By default, when there is only one application bootstrapped, you don't need to provide the
 * `APP_ID` token (the `ng` will be used as an app ID).
 *
 * @publicApi
 */
declare const APP_ID: InjectionToken<string>;
/**
 * A function that is executed when a platform is initialized.
 *
 * @deprecated from v19.0.0, use providePlatformInitializer instead
 *
 * @see {@link providePlatformInitializer}
 *
 * @publicApi
 */
declare const PLATFORM_INITIALIZER: InjectionToken<readonly (() => void)[]>;
/**
 * A token that indicates an opaque platform ID.
 * @publicApi
 */
declare const PLATFORM_ID: InjectionToken<Object>;
/**
 * A [DI token](api/core/InjectionToken) that indicates which animations
 * module has been loaded.
 * @publicApi
 */
declare const ANIMATION_MODULE_TYPE: InjectionToken<"BrowserAnimations" | "NoopAnimations">;
/**
 * Token used to configure the [Content Security Policy](https://web.dev/strict-csp/) nonce that
 * Angular will apply when inserting inline styles. If not provided, Angular will look up its value
 * from the `ngCspNonce` attribute of the application root node.
 *
 * @see [Content security policy](best-practices/security#content-security-policy)
 *
 * @publicApi
 */
declare const CSP_NONCE: InjectionToken<string | null>;
/**
 * A configuration object for the image-related options. Contains:
 * - breakpoints: An array of integer breakpoints used to generate
 *      srcsets for responsive images.
 * - disableImageSizeWarning: A boolean value. Setting this to true will
 *      disable console warnings about oversized images.
 * - disableImageLazyLoadWarning: A boolean value. Setting this to true will
 *      disable console warnings about LCP images configured with `loading="lazy"`.
 * Learn more about the responsive image configuration in [the NgOptimizedImage
 * guide](guide/image-optimization).
 * Learn more about image warning options in [the related error page](errors/NG0913).
 * @publicApi
 */
type ImageConfig = {
    breakpoints?: number[];
    placeholderResolution?: number;
    disableImageSizeWarning?: boolean;
    disableImageLazyLoadWarning?: boolean;
};
declare const IMAGE_CONFIG_DEFAULTS: ImageConfig;
/**
 * Injection token that configures the image optimized image functionality.
 * See {@link ImageConfig} for additional information about parameters that
 * can be used.
 *
 * @see {@link NgOptimizedImage}
 * @see {@link ImageConfig}
 * @see [Responsive images](guide/image-optimization#responsive-images)
 * @see [Using placeholders](guide/image-optimization#using-placeholders)
 * @publicApi
 */
declare const IMAGE_CONFIG: InjectionToken<ImageConfig>;

/**
 * Injection token representing the current HTTP request object.
 *
 * Use this token to access the current request when handling server-side
 * rendering (SSR).
 *
 * @remarks
 * This token may be `null` in the following scenarios:
 *
 * * During the build processes.
 * * When the application is rendered in the browser (client-side rendering).
 * * When performing static site generation (SSG).
 * * During route extraction in development (at the time of the request).
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request `Request` on MDN}
 *
 * @see [Accessing Request and Response via DI](guide/ssr#accessing-request-and-response-via-di)
 *
 * @publicApi
 */
declare const REQUEST: InjectionToken<Request | null>;
/**
 * Type that represents the initialization options for a response.
 *
 * @publicApi
 */
type ResponseInit = {
    -readonly [P in keyof globalThis.ResponseInit]: globalThis.ResponseInit[P];
};
/**
 * Injection token for response initialization options.
 *
 * Use this token to provide response options for configuring or initializing
 * HTTP responses in server-side rendering or API endpoints.
 *
 * @remarks
 * This token may be `null` in the following scenarios:
 *
 * * During the build processes.
 * * When the application is rendered in the browser (client-side rendering).
 * * When performing static site generation (SSG).
 * * During route extraction in development (at the time of the request).
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response/Response `ResponseInit` on MDN}
 *
 * @publicApi
 * @see [Accessing Request and Response via DI](guide/ssr#accessing-request-and-response-via-di)
 */
declare const RESPONSE_INIT: InjectionToken<ResponseInit | null>;
/**
 * Injection token for additional request context.
 *
 * Use this token to pass custom metadata or context related to the current request in server-side rendering.
 *
 * @remarks
 * This token is only available during server-side rendering and will be `null` in other contexts.
 *
 * @publicApi
 * @see [Accessing Request and Response via DI](guide/ssr#accessing-request-and-response-via-di)
 */
declare const REQUEST_CONTEXT: InjectionToken<unknown>;

/**
 * Provides an application initializer that will log information about what tasks are keeping
 * the application from stabilizing if the application does not stabilize within 9 seconds.
 *
 * The logged information includes the stack of the tasks preventing stability. This stack can be traced
 * back to the source in the application code.
 *
 * If you are using Zone.js, it is recommended that you also temporarily import "zone.js/plugins/task-tracking".
 * This Zone.js plugin provides additional information about which macrotasks are scheduled in the Angular Zone
 * and keeping the Zone from stabilizing.
 *
 * @usageNotes
 *
 * ```ts
 * import 'zone.js/plugins/task-tracking';
 *
 * bootstrapApplication(AppComponent, {providers: [provideStabilityDebugging()]});
 * ```
 *
 * IMPORTANT: Neither the zone.js task tracking plugin nor this utility are removed from production bundles.
 * They are intended for temporary use while debugging stability issues during development, including for
 * optimized production builds.
 *
 * @publicApi 21.1
 */
declare function provideStabilityDebugging(): EnvironmentProviders;

/**
 * Used to disable exhaustive checks when verifying no expressions changed after they were checked.
 *
 * This means that `OnPush` components that are not marked for check will not be checked.
 * This behavior is the current default behavior in Angular. When running change detection
 * on a view tree, views marked for check are refreshed and the flag to check it is removed.
 * When Angular checks views a second time to ensure nothing has changed, `OnPush` components
 * will no longer be marked and not be checked.
 *
 * @developerPreview 20.0
 */
declare function provideCheckNoChangesConfig(options: {
    exhaustive: false;
}): EnvironmentProviders;
/**
 * - `interval` will periodically run `checkNoChanges` on application views. This can be useful
 *   in zoneless applications to periodically ensure no changes have been made without notifying
 *   Angular that templates need to be refreshed.
 * - The exhaustive option will treat all application views as if they were `ChangeDetectionStrategy.Eager`/`Default` when verifying
 *   no expressions have changed. All views attached to `ApplicationRef` and all the descendants of
 *   those views will be checked for changes (excluding those subtrees which are detached via `ChangeDetectorRef.detach()`).
 *   This is useful because the check that runs after regular change detection does not work for components using `ChangeDetectionStrategy.OnPush`.
 *   This check is will surface any existing errors hidden by `OnPush` components.
 *
 * @developerPreview 20.0
 */
declare function provideCheckNoChangesConfig(options: {
    interval?: number;
    exhaustive: true;
}): EnvironmentProviders;

/**
 * @description
 * A lifecycle hook that is called when the value of one or more component or directive inputs
 * change. This includes both signal-based and decorator-based inputs.
 * Define an `ngOnChanges()` method to handle the changes.
 *
 * @see {@link DoCheck}
 * @see {@link OnInit}
 * @see [Lifecycle hooks guide](guide/components/lifecycle)
 *
 * @usageNotes
 * The following snippet shows how a component can implement this interface to
 * define an on-changes handler for an input property. While you should prefer
 * `computed` and `effect` when working with signal-based inputs, the `ngOnChanges`
 * method does include value changes for signal-based inputs.
 *
 * ```ts
 * @Component({ ... })
 * export class UserProfile implements OnChanges {
 *   userId = input<number>(0);
 *   ngOnChanges(changes: SimpleChanges<UserProfile>) {
 *     // changes.userId contains the old and new value.
 *   }
 * }
 * ```
 *
 * @publicApi
 */
interface OnChanges {
    /**
     * A callback method that is invoked immediately after the
     * default change detector has checked data-bound properties
     * if at least one has changed, and before the view and content
     * children are checked.
     * @param changes The changed properties.
     */
    ngOnChanges(changes: SimpleChanges): void;
}
/**
 * @description
 * A lifecycle hook that is called after Angular has initialized
 * all data-bound properties of a directive.
 * Define an `ngOnInit()` method to handle any additional initialization tasks.
 *
 * @see {@link AfterContentInit}
 * @see [Lifecycle hooks guide](guide/components/lifecycle)
 *
 * @usageNotes
 * The following snippet shows how a component can implement this interface to
 * define its own initialization method.
 *
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='OnInit'}
 *
 * @publicApi
 */
interface OnInit {
    /**
     * A callback method that is invoked immediately after the
     * default change detector has checked the directive's
     * data-bound properties for the first time,
     * and before any of the view or content children have been checked.
     * It is invoked only once when the directive is instantiated.
     */
    ngOnInit(): void;
}
/**
 * A lifecycle hook that invokes a custom change-detection function for a directive,
 * in addition to the check performed by the default change-detector on the input
 * bindings for this directive usage in the parent template. Note that this hook is
 * invoked even when the directive's own change detection is skipped (e.g., with
 * the `OnPush` change detection strategy). Developers might use this hook to
 * implement a custom change detection strategy for some of the inputs.
 *
 * The default change-detection algorithm looks for differences by comparing
 * bound-property values by reference across change detection runs. You can use this
 * hook to check for and respond to changes by some other means.
 *
 * When the default change detector detects changes to the directive's input bindings,
 * it invokes `ngOnChanges()` if supplied, regardless of whether you perform
 * additional change detection.
 * Typically, you should not use both `DoCheck` and `OnChanges` to respond to
 * changes on the same input.
 *
 * @see {@link OnChanges}
 * @see [Lifecycle hooks guide](guide/components/lifecycle)
 *
 * @usageNotes
 * The following snippet shows how a component can implement this interface
 * to invoke it own change-detection cycle.
 *
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='DoCheck'}
 *
 * @publicApi
 */
interface DoCheck {
    /**
     * A callback method that performs change-detection, invoked
     * after the default change-detector has checked the directive's input
     * bindings in the parent template.
     * See `KeyValueDiffers` and `IterableDiffers` for implementing
     * custom change checking for collections.
     *
     */
    ngDoCheck(): void;
}
/**
 * A lifecycle hook that is called when a directive, pipe, or service is destroyed.
 * Use for any custom cleanup that needs to occur when the
 * instance is destroyed.
 * @see [Lifecycle hooks guide](guide/components/lifecycle)
 *
 * @usageNotes
 * The following snippet shows how a component can implement this interface
 * to define its own custom clean-up method.
 *
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='OnDestroy'}
 *
 * @publicApi
 */
interface OnDestroy {
    /**
     * A callback method that performs custom clean-up, invoked immediately
     * before a directive, pipe, or service instance is destroyed.
     */
    ngOnDestroy(): void;
}
/**
 * @description
 * A lifecycle hook that is called after Angular has fully initialized
 * all content of a directive. It will run only once when the projected content is initialized.
 * Define an `ngAfterContentInit()` method to handle any additional initialization tasks.
 *
 * @see {@link OnInit}
 * @see {@link AfterViewInit}
 * @see [Lifecycle hooks guide](guide/components/lifecycle)
 *
 * @usageNotes
 * The following snippet shows how a component can implement this interface to
 * define its own content initialization method.
 *
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterContentInit'}
 *
 * @publicApi
 */
interface AfterContentInit {
    /**
     * A callback method that is invoked immediately after
     * Angular has completed initialization of all of the directive's
     * content.
     * It is invoked only once when the directive is instantiated.
     */
    ngAfterContentInit(): void;
}
/**
 * @description
 * A lifecycle hook that is called after the default change detector has
 * completed checking all content of a directive. It will run after the content
 * has been checked and most of the time it's during a change detection cycle.
 *
 * @see {@link AfterViewChecked}
 * @see [Lifecycle hooks guide](guide/components/lifecycle)
 *
 * @usageNotes
 * The following snippet shows how a component can implement this interface to
 * define its own after-check functionality.
 *
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterContentChecked'}
 *
 * @publicApi
 */
interface AfterContentChecked {
    /**
     * A callback method that is invoked immediately after the
     * default change detector has completed checking all of the directive's
     * content.
     */
    ngAfterContentChecked(): void;
}
/**
 * @description
 * A lifecycle hook that is called after Angular has fully initialized
 * a component's view.
 * Define an `ngAfterViewInit()` method to handle any additional initialization tasks.
 *
 * @see {@link OnInit}
 * @see {@link AfterContentInit}
 * @see [Lifecycle hooks guide](guide/components/lifecycle)
 *
 * @usageNotes
 * The following snippet shows how a component can implement this interface to
 * define its own view initialization method.
 *
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterViewInit'}
 *
 * @publicApi
 */
interface AfterViewInit {
    /**
     * A callback method that is invoked immediately after
     * Angular has completed initialization of a component's view.
     * It is invoked only once when the view is instantiated.
     *
     */
    ngAfterViewInit(): void;
}
/**
 * @description
 * A lifecycle hook that is called after the default change detector has
 * completed checking a component's view for changes.
 *
 * @see {@link AfterContentChecked}
 * @see [Lifecycle hooks guide](guide/components/lifecycle)
 *
 * @usageNotes
 * The following snippet shows how a component can implement this interface to
 * define its own after-check functionality.
 *
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterViewChecked'}
 *
 * @publicApi
 */
interface AfterViewChecked {
    /**
     * A callback method that is invoked immediately after the
     * default change detector has completed one change-check cycle
     * for a component's view.
     */
    ngAfterViewChecked(): void;
}

/**
 * Internal token used to verify that `provideZoneChangeDetection` is not used
 * with the bootstrapModule API.
 */
declare const PROVIDED_NG_ZONE: InjectionToken<boolean>;
declare function internalProvideZoneChangeDetection({ ngZoneFactory, scheduleInRootZone, }: {
    ngZoneFactory?: () => NgZone;
    scheduleInRootZone?: boolean;
}): StaticProvider[];
/**
 * Provides `NgZone`-based change detection for the application bootstrapped using
 * `bootstrapApplication`.
 *
 * Add this provider to use `NgZone`/ZoneJS-based change detection and configure options like
 * `eventCoalescing` in the `NgZone`.
 *
 * If you need this provider function in an NgModule-based application, pass it as `applicationProviders` to `bootstrapModule()`.
 *
 * @usageNotes
 * ```ts
 * bootstrapApplication(MyApp, {providers: [
 *   provideZoneChangeDetection({eventCoalescing: true}),
 * ]});
 * ```
 *
 * @publicApi
 * @see {@link /api/platform-browser/bootstrapApplication bootstrapApplication}
 * @see {@link NgZoneOptions}
 */
declare function provideZoneChangeDetection(options?: NgZoneOptions): EnvironmentProviders;
/**
 * Used to configure event and run coalescing with `provideZoneChangeDetection`.
 *
 * @publicApi
 *
 * @see {@link provideZoneChangeDetection}
 */
interface NgZoneOptions {
    /**
     * Optionally specify coalescing event change detections or not.
     * Consider the following case.
     *
     * ```html
     * <div (click)="doSomething()">
     *   <button (click)="doSomethingElse()"></button>
     * </div>
     * ```
     *
     * When button is clicked, because of the event bubbling, both
     * event handlers will be called and 2 change detections will be
     * triggered. We can coalesce such kind of events to trigger
     * change detection only once.
     *
     * By default, this option is set to false, meaning events will
     * not be coalesced, and change detection will be triggered multiple times.
     * If this option is set to true, change detection will be triggered
     * once in the scenario described above.
     */
    eventCoalescing?: boolean;
    /**
     * Optionally specify if `NgZone#run()` method invocations should be coalesced
     * into a single change detection.
     *
     * Consider the following case.
     * ```ts
     * for (let i = 0; i < 10; i ++) {
     *   ngZone.run(() => {
     *     // do something
     *   });
     * }
     * ```
     *
     * This case triggers the change detection multiple times.
     * With ngZoneRunCoalescing options, all change detections in an event loop trigger only once.
     * In addition, the change detection executes in requestAnimation.
     *
     */
    runCoalescing?: boolean;
}

/**
 * Provides change detection without ZoneJS for the application bootstrapped using
 * `bootstrapApplication`.
 *
 * NOTE: Zoneless is enabled by default in Angular v21+. Ensure `provideZoneChangeDetection` is not used to override this default.
 *
 * This function allows you to configure the application to not use the state/state changes of
 * ZoneJS to schedule change detection in the application. This will work when ZoneJS is not present
 * on the page at all or if it exists because something else is using it (either another Angular
 * application which uses ZoneJS for scheduling or some other library that relies on ZoneJS).
 *
 * This can also be added to the `TestBed` providers to configure the test environment to more
 * closely match production behavior. This will help give higher confidence that components are
 * compatible with zoneless change detection.
 *
 * ZoneJS uses browser events to trigger change detection. When using this provider, Angular will
 * instead use Angular APIs to schedule change detection. These APIs include:
 *
 * - `ChangeDetectorRef.markForCheck`
 * - `ComponentRef.setInput`
 * - updating a signal that is read in a template
 * - when bound host or template listeners are triggered
 * - attaching a view that was marked dirty by one of the above
 * - removing a view
 * - registering a render hook (templates are only refreshed if render hooks do one of the above)
 *
 * @usageNotes
 * ```ts
 * bootstrapApplication(MyApp, {providers: [
 *   provideZonelessChangeDetection(),
 * ]});
 * ```
 *
 * @publicApi 20.2
 *
 * @see {@link /api/platform-browser/bootstrapApplication bootstrapApplication}
 * @see [Angular without ZoneJS (Zoneless)](guide/zoneless)
 */
declare function provideZonelessChangeDetection(): EnvironmentProviders;
declare function provideZonelessChangeDetectionInternal(): Provider[];

/** Tracks the IDs of LViews with leaving animations. */
declare const allLeavingAnimations: Set<number>;

/**
 * Returns the NgModuleFactory with the given id (specified using [@NgModule.id
 * field](api/core/NgModule#id)), if it exists and has been loaded. Factories for NgModules that do
 * not specify an `id` cannot be retrieved. Throws if an NgModule cannot be found.
 * @publicApi
 * @deprecated Use `getNgModuleById` instead.
 */
declare function getModuleFactory(id: string): NgModuleFactory$1<any>;
/**
 * Returns the NgModule class with the given id (specified using [@NgModule.id
 * field](api/core/NgModule#id)), if it exists and has been loaded. Classes for NgModules that do
 * not specify an `id` cannot be retrieved. Throws if an NgModule cannot be found.
 * @publicApi
 */
declare function getNgModuleById<T>(id: string): Type$1<T>;

/**
 * Represents an embedded template that can be used to instantiate embedded views.
 * To instantiate embedded views based on a template, use the `ViewContainerRef`
 * method `createEmbeddedView()`.
 *
 * Access a `TemplateRef` instance by placing a directive on an `<ng-template>`
 * element (or directive prefixed with `*`). The `TemplateRef` for the embedded view
 * is injected into the constructor of the directive,
 * using the `TemplateRef` token.
 *
 * You can also use a `Query` to find a `TemplateRef` associated with
 * a component or a directive.
 *
 * @see {@link ViewContainerRef}
 *
 * @see [Getting a reference to a template fragment](guide/templates/ng-template#getting-a-reference-to-a-template-fragment)
 *
 * @publicApi
 */
declare class TemplateRef<C> {
    private _declarationLView;
    private _declarationTContainer;
    /**
     * The anchor element in the parent view for this embedded view.
     *
     * The data-binding and [injection contexts](guide/di/dependency-injection-context) of embedded
     * views created from this `TemplateRef` inherit from the contexts of this location.
     *
     * Typically new embedded views are attached to the view container of this location, but in
     * advanced use-cases, the view can be attached to a different container while keeping the
     * data-binding and injection context from the original location.
     *
     */
    readonly elementRef: ElementRef;
    /**
     * Instantiates an unattached embedded view based on this template.
     * @param context The data-binding context of the embedded view, as declared
     * in the `<ng-template>` usage.
     * @param injector Injector to be used within the embedded view.
     * @returns The new embedded view object.
     */
    createEmbeddedView(context: C, injector?: Injector): EmbeddedViewRef<C>;
}

/**
 * Represents a container where one or more views can be attached to a component.
 *
 * Can contain *host views* (created by instantiating a
 * component with the `createComponent()` method), and *embedded views*
 * (created by instantiating a `TemplateRef` with the `createEmbeddedView()` method).
 *
 * A view container instance can contain other view containers,
 * creating a view hierarchy.
 *
 * @usageNotes
 *
 * The example below demonstrates how the `createComponent` function can be used
 * to create an instance of a ComponentRef dynamically and attach it to an ApplicationRef,
 * so that it gets included into change detection cycles.
 *
 * Note: the example uses standalone components, but the function can also be used for
 * non-standalone components (declared in an NgModule) as well.
 *
 * ```angular-ts
 * @Component({
 *   selector: 'dynamic',
 *   template: `<span>This is a content of a dynamic component.</span>`,
 * })
 * class DynamicComponent {
 *   vcr = inject(ViewContainerRef);
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `<main>Hi! This is the main content.</main>`,
 * })
 * class AppComponent {
 *   vcr = inject(ViewContainerRef);
 *
 *   ngAfterViewInit() {
 *     const compRef = this.vcr.createComponent(DynamicComponent);
 *     compRef.changeDetectorRef.detectChanges();
 *   }
 * }
 * ```
 *
 * @see {@link ComponentRef}
 * @see {@link EmbeddedViewRef}
 * @see [Using ViewContainerRef](guide/components/programmatic-rendering#using-viewcontainerref)
 *
 * @publicApi
 */
declare abstract class ViewContainerRef {
    /**
     * Anchor element that specifies the location of this container in the containing view.
     * Each view container can have only one anchor element, and each anchor element
     * can have only a single view container.
     *
     * Root elements of views attached to this container become siblings of the anchor element in
     * the rendered view.
     *
     * Access the `ViewContainerRef` of an element by placing a `Directive` injected
     * with `ViewContainerRef` on the element, or use a `ViewChild` query.
     *
     * <!-- TODO: rename to anchorElement -->
     */
    abstract get element(): ElementRef;
    /**
     * The dependency injector for this view container.
     */
    abstract get injector(): Injector;
    /** @deprecated No replacement */
    abstract get parentInjector(): Injector;
    /**
     * Destroys all views in this container.
     */
    abstract clear(): void;
    /**
     * Retrieves a view from this container.
     * @param index The 0-based index of the view to retrieve.
     * @returns The `ViewRef` instance, or null if the index is out of range.
     */
    abstract get(index: number): ViewRef$1 | null;
    /**
     * Reports how many views are currently attached to this container.
     * @returns The number of views.
     */
    abstract get length(): number;
    /**
     * Instantiates an embedded view and inserts it
     * into this container.
     * @param templateRef The HTML template that defines the view.
     * @param context The data-binding context of the embedded view, as declared
     * in the `<ng-template>` usage.
     * @param options Extra configuration for the created view. Includes:
     *  * index: The 0-based index at which to insert the new view into this container.
     *           If not specified, appends the new view as the last entry.
     *  * injector: Injector to be used within the embedded view.
     *  * onError: A callback that will be invoked when an error occurs during the view's change detection or lifecycle hooks.
     *             Note that this will not catch errors thrown during the view's creation.
     *
     * @returns The `ViewRef` instance for the newly created view.
     */
    abstract createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, options?: {
        index?: number;
        injector?: Injector;
        onError?: (error: Error, details: ErrorDetails) => void;
    }): EmbeddedViewRef<C>;
    /**
     * Instantiates an embedded view and inserts it
     * into this container.
     * @param templateRef The HTML template that defines the view.
     * @param context The data-binding context of the embedded view, as declared
     * in the `<ng-template>` usage.
     * @param index The 0-based index at which to insert the new view into this container.
     * If not specified, appends the new view as the last entry.
     *
     * @returns The `ViewRef` instance for the newly created view.
     */
    abstract createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number): EmbeddedViewRef<C>;
    /**
     * Instantiates a component and inserts its host view into this view container.
     *
     * @param componentType Component Type to use.
     * @param options An object that contains extra parameters:
     *  * index: the index at which to insert the new component's host view into this container.
     *           If not specified, appends the new view as the last entry.
     *  * injector: the injector to use as the parent for the new component.
     *  * ngModuleRef: an NgModuleRef of the component's NgModule, you should almost always provide
     *                 this to ensure that all expected providers are available for the component
     *                 instantiation.
     *  * environmentInjector: an EnvironmentInjector which will provide the component's environment.
     *                 you should almost always provide this to ensure that all expected providers
     *                 are available for the component instantiation. This option is intended to
     *                 replace the `ngModuleRef` parameter.
     *  * projectableNodes: list of DOM nodes that should be projected through
     *                      [`<ng-content>`](api/core/ng-content) of the new component instance.
     *  * directives: Directives that should be applied to the component.
     *  * bindings: Bindings that should be applied to the component.
     *  * onError: A callback that will be invoked when an error occurs during the component's change detection or lifecycle hooks.
     *             Note that this will not catch errors thrown during the component's construction.
     *
     * @returns The new `ComponentRef` which contains the component instance and the host view.
     */
    abstract createComponent<C>(componentType: Type$1<C>, options?: {
        index?: number;
        injector?: Injector;
        ngModuleRef?: NgModuleRef$1<unknown>;
        environmentInjector?: EnvironmentInjector | NgModuleRef$1<unknown>;
        projectableNodes?: Node[][];
        directives?: (Type$1<unknown> | DirectiveWithBindings<unknown>)[];
        bindings?: Binding[];
        onError?: (error: Error, context: ErrorDetails) => void;
    }): ComponentRef$1<C>;
    /**
     * Inserts a view into this container.
     * @param viewRef The view to insert.
     * @param index The 0-based index at which to insert the view.
     * If not specified, appends the new view as the last entry.
     * @returns The inserted `ViewRef` instance.
     *
     */
    abstract insert(viewRef: ViewRef$1, index?: number): ViewRef$1;
    /**
     * Moves a view to a new location in this container.
     * @param viewRef The view to move.
     * @param index The 0-based index of the new location.
     * @returns The moved `ViewRef` instance.
     */
    abstract move(viewRef: ViewRef$1, currentIndex: number): ViewRef$1;
    /**
     * Returns the index of a view within the current container.
     * @param viewRef The view to query.
     * @returns The 0-based index of the view's position in this container,
     * or `-1` if this container doesn't contain the view.
     */
    abstract indexOf(viewRef: ViewRef$1): number;
    /**
     * Destroys a view attached to this container
     * @param index The 0-based index of the view to destroy.
     * If not specified, the last view in the container is removed.
     */
    abstract remove(index?: number): void;
    /**
     * Detaches a view from this container without destroying it.
     * Use along with `insert()` to move a view within the current container.
     * @param index The 0-based index of the view to detach.
     * If not specified, the last view in the container is detached.
     */
    abstract detach(index?: number): ViewRef$1 | null;
}

/**
 * Internal create application API that implements the core application creation logic and optional
 * bootstrap logic.
 *
 * Platforms (such as `platform-browser`) may require different set of application and platform
 * providers for an application to function correctly. As a result, platforms may use this function
 * internally and supply the necessary providers during the bootstrap, while exposing
 * platform-specific APIs as a part of their public API.
 *
 * @returns A promise that returns an `ApplicationRef` instance once resolved.
 */
declare function internalCreateApplication(config: {
    rootComponent?: Type$1<unknown>;
    appProviders?: Array<Provider | EnvironmentProviders>;
    platformProviders?: Provider[];
    platformRef?: PlatformRef;
}): Promise<ApplicationRef>;

declare class Console {
    log(message: string): void;
    warn(message: string): void;
    static ɵfac: __FactoryDeclaration<Console, never>;
    static ɵprov: __InjectableDeclaration<any>;
}

/**
 * TODO(incremental-hydration): Remove this file entirely once PromiseWithResolvers lands in stable
 * node / TS.
 */
interface PromiseWithResolvers<T> {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
}
/**
 * Replace with `Promise.withResolvers()` once it's available.
 * NET September 2026
 *
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers.
 */
declare function promiseWithResolvers<T>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
};

/**
 * An internal injection token to reference `DehydratedBlockRegistry` implementation
 * in a tree-shakable way.
 */
declare const DEHYDRATED_BLOCK_REGISTRY: InjectionToken<DehydratedBlockRegistry>;
/**
 * The DehydratedBlockRegistry is used for incremental hydration purposes. It keeps
 * track of the Defer Blocks that need hydration so we can effectively
 * navigate up to the top dehydrated defer block and fire appropriate cleanup
 * functions post hydration.
 */
declare class DehydratedBlockRegistry {
    private registry;
    private cleanupFns;
    private jsActionMap;
    private contract;
    add(blockId: string, info: DehydratedDeferBlock): void;
    get(blockId: string): DehydratedDeferBlock | null;
    has(blockId: string): boolean;
    cleanup(hydratedBlocks: string[]): void;
    get size(): number;
    addCleanupFn(blockId: string, fn: Function): void;
    invokeTriggerCleanupFns(blockId: string): void;
    hydrating: Map<string, PromiseWithResolvers<void>>;
    private awaitingCallbacks;
    awaitParentBlock(topmostParentBlock: string, callback: Function): void;
    /** @nocollapse */
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<DehydratedBlockRegistry>;
}

/**
 * **INTERNAL**, avoid referencing it in application code.
 * *
 * Injector token that allows to provide `DeferBlockDependencyInterceptor` class
 * implementation.
 *
 * This token is only injected in devMode
 */
declare const DEFER_BLOCK_DEPENDENCY_INTERCEPTOR: InjectionToken<DeferBlockDependencyInterceptor>;
/**
 * **INTERNAL**, token used for configuring defer block behavior.
 */
declare const DEFER_BLOCK_CONFIG: InjectionToken<DeferBlockConfig>;
/** Rendering Helpers */
/**
 * Transitions a defer block to the new state. Updates the  necessary
 * data structures and renders corresponding block.
 *
 * @param newState New state that should be applied to the defer block.
 * @param tNode TNode that represents a defer block.
 * @param lContainer Represents an instance of a defer block.
 * @param skipTimerScheduling Indicates that `@loading` and `@placeholder` block
 *   should be rendered immediately, even if they have `after` or `minimum` config
 *   options setup. This flag to needed for testing APIs to transition defer block
 *   between states via `DeferFixture.render` method.
 */
declare function renderDeferBlockState(newState: DeferBlockState, tNode: TNode, lContainer: LContainer, skipTimerScheduling?: boolean): void;
/**
 * Enables timer-related scheduling if `after` or `minimum` parameters are setup
 * on the `@loading` or `@placeholder` blocks.
 */
declare function ɵɵdeferEnableTimerScheduling(tView: TView, tDetails: TDeferBlockDetails, placeholderConfigIndex?: number | null, loadingConfigIndex?: number | null): void;

/**
 * Helper service to schedule `setTimeout`s for batches of defer blocks,
 * to avoid calling `setTimeout` for each defer block (e.g. if defer blocks
 * are created inside a for loop).
 */
declare class TimerScheduler implements OnDestroy {
    executingCallbacks: boolean;
    timeoutId: number | null;
    invokeTimerAt: number | null;
    current: Array<number | VoidFunction>;
    deferred: Array<number | VoidFunction>;
    add(delay: number, callback: VoidFunction, ngZone: NgZone): void;
    remove(callback: VoidFunction): void;
    private addToQueue;
    private removeFromQueue;
    private scheduleTimer;
    private clearTimeout;
    ngOnDestroy(): void;
    /** @nocollapse */
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<TimerScheduler>;
}

/**
 * Trigger loading of defer block dependencies if the process hasn't started yet.
 *
 * @param tDetails Static information about this defer block.
 * @param lView LView of a host view.
 */
declare function triggerResourceLoading(tDetails: TDeferBlockDetails, lView: LView, tNode: TNode): Promise<unknown>;

/**
 * URL for the XSS security documentation.
 */
declare const XSS_SECURITY_URL = "https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss";

/**
 * The list of error codes used in runtime code of the `core` package.
 * Reserved error code range: 100-999.
 *
 * Note: the minus sign denotes the fact that a particular code has a detailed guide on
 * angular.io. This extra annotation is needed to avoid introducing a separate set to store
 * error codes which have guides, which might leak into runtime code.
 *
 * Full list of available error guides can be found at https://angular.dev/errors.
 *
 * Error code ranges per package:
 *  - core (this package): 100-999
 *  - forms: 1000-1999
 *  - common: 2000-2999
 *  - animations: 3000-3999
 *  - router: 4000-4999
 *  - platform-browser: 5000-5500
 *  - service-worker: 5600-5699
 *  - platform-server: 5700-5800
 */
declare const enum RuntimeErrorCode {
    EXPRESSION_CHANGED_AFTER_CHECKED = -100,
    RECURSIVE_APPLICATION_REF_TICK = 101,
    INFINITE_CHANGE_DETECTION = 103,
    CYCLIC_DI_DEPENDENCY = -200,
    PROVIDER_NOT_FOUND = -201,
    INVALID_FACTORY_DEPENDENCY = 202,
    MISSING_INJECTION_CONTEXT = -203,
    INVALID_INJECTION_TOKEN = -204,
    INJECTOR_ALREADY_DESTROYED = -205,
    PROVIDER_IN_WRONG_CONTEXT = -207,
    MISSING_INJECTION_TOKEN = 208,
    INVALID_MULTI_PROVIDER = -209,
    MISSING_DOCUMENT = 210,
    INVALID_APP_ID = 211,
    MULTIPLE_COMPONENTS_MATCH = -300,
    EXPORT_NOT_FOUND = -301,
    PIPE_NOT_FOUND = -302,
    UNKNOWN_BINDING = 303,
    UNKNOWN_ELEMENT = 304,
    TEMPLATE_STRUCTURE_ERROR = 305,
    INVALID_EVENT_BINDING = 306,
    HOST_DIRECTIVE_UNRESOLVABLE = 307,
    HOST_DIRECTIVE_NOT_STANDALONE = 308,
    DUPLICATE_DIRECTIVE = 309,
    HOST_DIRECTIVE_COMPONENT = 310,
    HOST_DIRECTIVE_UNDEFINED_BINDING = 311,
    HOST_DIRECTIVE_CONFLICTING_ALIAS = 312,
    MULTIPLE_MATCHING_PIPES = 313,
    UNINITIALIZED_LET_ACCESS = 314,
    NO_BINDING_TARGET = 315,
    INVALID_BINDING_TARGET = 316,
    INVALID_SET_INPUT_CALL = 317,
    INVALID_STYLE_PROP_VALUE = -318,
    MULTIPLE_PLATFORMS = 400,
    PLATFORM_NOT_FOUND = -401,
    MISSING_REQUIRED_INJECTABLE_IN_BOOTSTRAP = 402,
    BOOTSTRAP_COMPONENTS_NOT_FOUND = -403,
    PLATFORM_ALREADY_DESTROYED = 404,
    ASYNC_INITIALIZERS_STILL_RUNNING = 405,
    APPLICATION_REF_ALREADY_DESTROYED = 406,
    RENDERER_NOT_FOUND = 407,
    PROVIDED_BOTH_ZONE_AND_ZONELESS = 408,
    HYDRATION_NODE_MISMATCH = -500,
    HYDRATION_MISSING_SIBLINGS = -501,
    HYDRATION_MISSING_NODE = -502,
    UNSUPPORTED_PROJECTION_DOM_NODES = -503,
    INVALID_SKIP_HYDRATION_HOST = -504,
    MISSING_HYDRATION_ANNOTATIONS = -505,
    HYDRATION_STABLE_TIMEDOUT = -506,
    MISSING_SSR_CONTENT_INTEGRITY_MARKER = -507,
    MISCONFIGURED_INCREMENTAL_HYDRATION = 508,
    HYDRATION_MISSING_NODE_ON_PATH = 509,
    PARENT_NODE_NOT_FOUND = 510,
    SIGNAL_WRITE_FROM_ILLEGAL_CONTEXT = -600,
    REQUIRE_SYNC_WITHOUT_SYNC_EMIT = 601,
    ASSERTION_NOT_INSIDE_REACTIVE_CONTEXT = -602,
    ANIMATE_INVALID_VALUE = 650,
    INVALID_I18N_STRUCTURE = 700,
    MISSING_LOCALE_DATA = 701,
    DEFER_LOADING_FAILED = -750,
    DEFER_IN_HMR_MODE = -751,
    IMPORT_PROVIDERS_FROM_STANDALONE = 800,
    INVALID_DIFFER_INPUT = 900,
    NO_SUPPORTING_DIFFER_FACTORY = 901,
    VIEW_ALREADY_ATTACHED = 902,
    INVALID_INHERITANCE = 903,
    UNSAFE_VALUE_IN_RESOURCE_URL = 904,
    UNSAFE_VALUE_IN_SCRIPT = 905,
    MISSING_GENERATED_DEF = 906,
    TYPE_IS_NOT_STANDALONE = 907,
    MISSING_ZONEJS = 908,
    UNEXPECTED_ZONE_STATE = 909,
    UNSAFE_ATTRIBUTE_BINDING = -910,
    VIEW_ALREADY_DESTROYED = 911,
    COMPONENT_ID_COLLISION = -912,
    IMAGE_PERFORMANCE_WARNING = -913,
    UNEXPECTED_ZONEJS_PRESENT_IN_ZONELESS_MODE = 914,
    MISSING_NG_MODULE_DEFINITION = 915,
    MISSING_DIRECTIVE_DEFINITION = 916,
    EXTERNAL_RESOURCE_LOADING_FAILED = 918,
    DEF_TYPE_UNDEFINED = -919,
    NG_MODULE_ID_NOT_FOUND = 920,
    DUPLICATE_NG_MODULE_ID = 921,
    VIEW_DESTROYED_INSERT_ERROR = 922,
    VIEW_DESTROYED_MOVE_ERROR = 923,
    REQUIRED_INPUT_NO_VALUE = -950,
    REQUIRED_QUERY_NO_VALUE = -951,
    REQUIRED_MODEL_NO_VALUE = 952,
    OUTPUT_REF_DESTROYED = 953,
    LOOP_TRACK_DUPLICATE_KEYS = -955,
    LOOP_TRACK_RECREATE = -956,
    RUNTIME_DEPS_INVALID_IMPORTED_TYPE = 980,
    RUNTIME_DEPS_ORPHAN_COMPONENT = 981,
    MUST_PROVIDE_STREAM_OPTION = 990,
    RESOURCE_COMPLETED_BEFORE_PRODUCING_VALUE = -991,
    INVALID_RESOURCE_CREATION_IN_PARAMS = 992
}
/**
 * Class that represents a runtime error.
 * Formats and outputs the error message in a consistent way.
 *
 * Example:
 * ```ts
 *  throw new RuntimeError(
 *    RuntimeErrorCode.INJECTOR_ALREADY_DESTROYED,
 *    ngDevMode && 'Injector has already been destroyed.');
 * ```
 *
 * Note: the `message` argument contains a descriptive error message as a string in development
 * mode (when the `ngDevMode` is defined). In production mode (after tree-shaking pass), the
 * `message` argument becomes `false`, thus we account for it in the typings and the runtime
 * logic.
 */
declare class RuntimeError<T extends number = RuntimeErrorCode> extends Error {
    code: T;
    constructor(code: T, message: null | false | string);
}
/**
 * Called to format a runtime error.
 * See additional info on the `message` argument type in the `RuntimeError` class description.
 */
declare function formatRuntimeError<T extends number = RuntimeErrorCode>(code: T, message: null | false | string): string;

/**
 * A type-safe key to use with `TransferState`.
 *
 * Example:
 *
 * ```ts
 * const COUNTER_KEY = makeStateKey<number>('counter');
 * let value = 10;
 *
 * transferState.set(COUNTER_KEY, value);
 * ```
 *
 * @publicApi
 */
type StateKey<T> = string & {
    __not_a_string: never;
    __value_type?: T;
};
/**
 * Create a `StateKey<T>` that can be used to store value of type T with `TransferState`.
 *
 * Example:
 *
 * ```ts
 * const COUNTER_KEY = makeStateKey<number>('counter');
 * let value = 10;
 *
 * transferState.set(COUNTER_KEY, value);
 * ```
 *
 * @publicApi
 */
declare function makeStateKey<T = void>(key: string): StateKey<T>;
/**
 * A key value store that is transferred from the application on the server side to the application
 * on the client side.
 *
 * The `TransferState` is available as an injectable token.
 * On the client, just inject this token using DI and use it, it will be lazily initialized.
 * On the server it's already included if `renderApplication` function is used. Otherwise, import
 * the `ServerTransferStateModule` module to make the `TransferState` available.
 *
 * The values in the store are serialized/deserialized using JSON.stringify/JSON.parse. So only
 * boolean, number, string, null and non-class objects will be serialized and deserialized in a
 * non-lossy manner.
 *
 * @publicApi
 */
declare class TransferState {
    /** @nocollapse */
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<TransferState>;
    private onSerializeCallbacks;
    /**
     * Get the value corresponding to a key. Return `defaultValue` if key is not found.
     */
    get<T>(key: StateKey<T>, defaultValue: T): T;
    /**
     * Set the value corresponding to a key.
     */
    set<T>(key: StateKey<T>, value: T): void;
    /**
     * Remove a key from the store.
     */
    remove<T>(key: StateKey<T>): void;
    /**
     * Test whether a key exists in the store.
     */
    hasKey<T>(key: StateKey<T>): boolean;
    /**
     * Indicates whether the state is empty.
     */
    get isEmpty(): boolean;
    /**
     * Register a callback to provide the value for a key when `toJson` is called.
     */
    onSerialize<T>(key: StateKey<T>, callback: () => T): void;
    /**
     * Serialize the current state of the store to JSON.
     */
    toJson(): string;
}

/**
 * Marker used in a comment node to ensure hydration content integrity
 */
declare const SSR_CONTENT_INTEGRITY_MARKER = "nghm";
/**
 * Internal type that represents a claimed node.
 * Only used in dev mode.
 */
declare enum HydrationStatus {
    Hydrated = "hydrated",
    Skipped = "skipped",
    Mismatched = "mismatched"
}
type HydrationInfo = {
    status: HydrationStatus.Hydrated | HydrationStatus.Skipped;
} | {
    status: HydrationStatus.Mismatched;
    actualNodeDetails: string | null;
    expectedNodeDetails: string | null;
};
declare const HYDRATION_INFO_KEY = "__ngDebugHydrationInfo__";
type HydratedNode = {
    [HYDRATION_INFO_KEY]?: HydrationInfo;
} & Element;
declare function readHydrationInfo(node: RNode): HydrationInfo | null;
declare function resetIncrementalHydrationEnabledWarnedForTests(): void;

/**
 * Annotates all components bootstrapped in a given ApplicationRef
 * with info needed for hydration.
 *
 * @param appRef An instance of an ApplicationRef.
 * @param doc A reference to the current Document instance.
 * @return event types that need to be replayed
 */
declare function annotateForHydration(appRef: ApplicationRef, doc: Document): {
    regular: Set<string>;
    capture: Set<string>;
};

/**
 * Defines a name of an attribute that is added to the <body> tag
 * in the `index.html` file in case a given route was configured
 * with `RenderMode.Client`. 'cm' is an abbreviation for "Client Mode".
 */
declare const CLIENT_RENDER_MODE_FLAG = "ngcm";
/**
 * Returns a set of providers required to setup hydration support
 * for an application that is server side rendered. This function is
 * included into the `provideClientHydration` public API function from
 * the `platform-browser` package.
 *
 * The function sets up an internal flag that would be recognized during
 * the server side rendering time as well, so there is no need to
 * configure or change anything in NgUniversal to enable the feature.
 */
declare function withDomHydration(): EnvironmentProviders;
/**
 * Returns a set of providers required to setup support for i18n hydration.
 * Requires hydration to be enabled separately.
 * @see [I18N](guide/hydration#i18n)
 */
declare function withI18nSupport(): Provider[];
/**
 * Returns a set of providers required to setup support for incremental hydration.
 * Requires hydration to be enabled separately.
 * Enabling incremental hydration also enables event replay for the entire app.
 * @see [Incremental Hydration](guide/incremental-hydration#how-do-you-enable-incremental-hydration-in-angular)
 *
 * @deprecated Since v22.0.0, incremental hydration is enabled by default with `provideClientHydration`.
 * Intent to remove in v24.
 */
declare function withIncrementalHydration(): Provider[];

/**
 * Token used to the determine if the transfer cache should be used, for example for resources.
 */
declare const CACHE_ACTIVE: InjectionToken<{
    isActive: boolean;
}>;

/**
 * Cheap, production-safe description of a DOM node for error messages: its `nodeName`, plus a
 * truncated snippet of its `textContent` if it has any. Unlike `shorten()` above, this is meant
 * to be called from code paths that also run in production, so it skips the newline-stripping
 * and ellipsis formatting that `shorten()` does.
 */
declare function describeDomNode(node: Node): string;

/**
 * Returns a set of providers required to setup support for event replay.
 * Requires hydration to be enabled separately.
 *
 * @see [Capturing and replaying event](guide/hydration#capturing-and-replaying-events)
 *
 */
declare function withEventReplay(): Provider[];

/**
 * Activates the incremental-hydration runtime.
 *
 * Emitted by the Angular compiler before the first hydrating `@defer` block in
 * a creation block. The first call swaps in the real implementations. Every
 * client call also notifies the current application that the runtime is
 * available.
 *
 * @codeGenApi
 */
declare function ɵɵenableIncrementalHydrationRuntime(): void;
/**
 * Resets module-level runtime activation for tests that run SSR and client hydration in the same
 * process. This is not a full hydration reset and should only be used when cold client activation
 * is part of the behavior under test.
 */
declare function resetIncrementalHydrationRuntimeForTests(): void;

/**
 * Internal token that specifies whether DOM reuse logic
 * during hydration is enabled.
 */
declare const IS_HYDRATION_DOM_REUSE_ENABLED: InjectionToken<boolean>;
/**
 * A type of the queue that stores events occurring during the hydration process.
 */
type EventReplayQueue = {
    event: Event;
    currentTarget: Element;
}[];
declare const EVENT_REPLAY_QUEUE: InjectionToken<EventReplayQueue>;
/**
 * Internal token that indicates whether incremental hydration support
 * is enabled.
 */
declare const IS_INCREMENTAL_HYDRATION_ENABLED: InjectionToken<boolean>;
/**
 * A map of DOM elements with `jsaction` attributes grouped by action names.
 */
declare const JSACTION_BLOCK_ELEMENT_MAP: InjectionToken<Map<string, Set<Element>>>;
/**
 * Internal token that indicates whether the initial navigation is blocking in the application.
 */
declare const IS_ENABLED_BLOCKING_INITIAL_NAVIGATION: InjectionToken<boolean>;

/**
 * Register locale data to be used internally by Angular. See the
 * ["I18n guide"](guide/i18n/format-data-locale) to know how to import additional locale
 * data.
 *
 * The signature `registerLocaleData(data: any, extraData?: any)` is deprecated since v5.1
 */
declare function registerLocaleData(data: any, localeId?: string | any, extraData?: any): void;
/**
 * Finds the locale data for a given locale.
 *
 * @param locale The locale code.
 * @returns The locale data.
 * @see [Internationalization (i18n) Guide](guide/i18n)
 */
declare function findLocaleData(locale: string): any;
/**
 * Retrieves the default currency code for the given locale.
 *
 * The default is defined as the first currency which is still in use.
 *
 * @param locale The code of the locale whose currency code we want.
 * @returns The code of the default currency for the given locale.
 *
 */
declare function getLocaleCurrencyCode(locale: string): string | null;
/**
 * Retrieves the plural function used by ICU expressions to determine the plural case to use
 * for a given locale.
 * @param locale A locale code for the locale format rules to use.
 * @returns The plural function for the locale.
 * @see {@link NgPlural}
 * @see [Internationalization (i18n) Guide](guide/i18n)
 */
declare function getLocalePluralCase(locale: string): (value: number) => number;
/**
 * Helper function to remove all the locale data from `LOCALE_DATA`.
 */
declare function unregisterAllLocaleData(): void;
/**
 * Index of each type of locale data from the locale data array.
 * Not an enum: TS enums compile to IIFE side-effects and are not tree-shakable,
 * even when unused. Using a plain const object with 'as const' instead.
 */
declare const LocaleDataIndex: {
    readonly LocaleId: 0;
    readonly DayPeriodsFormat: 1;
    readonly DayPeriodsStandalone: 2;
    readonly DaysFormat: 3;
    readonly DaysStandalone: 4;
    readonly MonthsFormat: 5;
    readonly MonthsStandalone: 6;
    readonly Eras: 7;
    readonly FirstDayOfWeek: 8;
    readonly WeekendRange: 9;
    readonly DateFormat: 10;
    readonly TimeFormat: 11;
    readonly DateTimeFormat: 12;
    readonly NumberSymbols: 13;
    readonly NumberFormats: 14;
    readonly CurrencyCode: 15;
    readonly CurrencySymbol: 16;
    readonly CurrencyName: 17;
    readonly Currencies: 18;
    readonly Directionality: 19;
    readonly PluralCase: 20;
    readonly ExtraData: 21;
};
/**
 * Index of each type of locale data from the extra locale data array
 */
declare const enum ExtraLocaleDataIndex {
    ExtraDayPeriodFormats = 0,
    ExtraDayPeriodStandalone = 1,
    ExtraDayPeriodsRules = 2
}
/**
 * Index of each value in currency data (used to describe CURRENCIES_EN in currencies.ts)
 */
declare const enum CurrencyIndex {
    Symbol = 0,
    SymbolNarrow = 1,
    NbOfDigits = 2
}

/**
 * The locale id that the application is using by default (for translations and ICU expressions).
 */
declare const DEFAULT_LOCALE_ID = "en-US";

declare function ɵɵControlFeature(passThroughInput: string | null): (definition: DirectiveDef<unknown>) => void;

/**
 * This feature adds the host directives behavior to a directive definition by patching a
 * function onto it. The expectation is that the runtime will invoke the function during
 * directive matching.
 *
 * For example:
 * ```ts
 * class ComponentWithHostDirective {
 *   static ɵcmp = defineComponent({
 *    type: ComponentWithHostDirective,
 *    features: [ɵɵHostDirectivesFeature([
 *      SimpleHostDirective,
 *      {directive: AdvancedHostDirective, inputs: ['foo: alias'], outputs: ['bar']},
 *    ])]
 *  });
 * }
 * ```
 *
 * @codeGenApi
 */
declare function ɵɵHostDirectivesFeature(rawHostDirectives: HostDirectiveConfig[] | (() => HostDirectiveConfig[])): DirectiveDefFeature;

/**
 * Merges the definition from a super class to a sub class.
 * @param definition The definition that is a SubClass of another directive of component
 *
 * @codeGenApi
 */
declare function ɵɵInheritDefinitionFeature(definition: DirectiveDef<any> | ComponentDef<any>): void;

/**
 * The NgOnChangesFeature decorates a component with support for the ngOnChanges
 * lifecycle hook, so it should be included in any component that implements
 * that hook.
 *
 * If the component or directive uses inheritance, the NgOnChangesFeature MUST
 * be included as a feature AFTER {@link InheritDefinitionFeature}, otherwise
 * inherited properties will not be propagated to the ngOnChanges lifecycle
 * hook.
 *
 * Example usage:
 *
 * ```ts
 * static ɵcmp = defineComponent({
 *   ...
 *   inputs: {name: 'publicName'},
 *   features: [NgOnChangesFeature]
 * });
 * ```
 *
 * @codeGenApi
 */
declare const ɵɵNgOnChangesFeature: () => DirectiveDefFeature;

/**
 * This feature resolves the providers of a directive (or component),
 * and publish them into the DI system, making it visible to others for injection.
 *
 * For example:
 * ```ts
 * class ComponentWithProviders {
 *   constructor(private greeter: GreeterDE) {}
 *
 *   static ɵcmp = defineComponent({
 *     type: ComponentWithProviders,
 *     selectors: [['component-with-providers']],
 *    factory: () => new ComponentWithProviders(directiveInject(GreeterDE as any)),
 *    decls: 1,
 *    vars: 1,
 *    template: function(fs: RenderFlags, ctx: ComponentWithProviders) {
 *      if (fs & RenderFlags.Create) {
 *        ɵɵtext(0);
 *      }
 *      if (fs & RenderFlags.Update) {
 *        ɵɵtextInterpolate(ctx.greeter.greet());
 *      }
 *    },
 *    features: [ɵɵProvidersFeature([GreeterDE])]
 *  });
 * }
 * ```
 *
 * @param definition
 *
 * @codeGenApi
 */
declare function ɵɵProvidersFeature<T>(providers: Provider[], viewProviders?: Provider[]): (definition: DirectiveDef<T>) => void;

/**
 * A feature that adds support for external runtime styles for a component.
 * An external runtime style is a URL to a CSS stylesheet that contains the styles
 * for a given component. For browsers, this URL will be used in an appended `link` element
 * when the component is rendered. This feature is typically used for Hot Module Replacement
 * (HMR) of component stylesheets by leveraging preexisting global stylesheet HMR available
 * in most development servers.
 *
 * @codeGenApi
 */
declare function ɵɵExternalStylesFeature(styleUrls: string[]): ComponentDefFeature;

/**
 * Generated next to NgModules to monkey-patch directive and pipe references onto a component's
 * definition, when generating a direct reference in the component file would otherwise create an
 * import cycle.
 *
 * See [this explanation](https://hackmd.io/Odw80D0pR6yfsOjg_7XCJg?view) for more details.
 *
 * @codeGenApi
 */
declare function ɵɵsetComponentScope(type: ComponentType<any>, directives: Type$1<any>[] | (() => Type$1<any>[]), pipes: Type$1<any>[] | (() => Type$1<any>[])): void;
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
declare function ɵɵsetNgModuleScope(type: any, scope: NgModuleScopeInfoFromDecorator): unknown;

/**
 * Profiler events is an enum used by the profiler to distinguish between different calls of user
 * code invoked throughout the application lifecycle.
 */
declare enum ProfilerEvent {
    /**
     * Corresponds to the point in time before the runtime has called the template function of a
     * component with `RenderFlags.Create`.
     */
    TemplateCreateStart = 0,
    /**
     * Corresponds to the point in time after the runtime has called the template function of a
     * component with `RenderFlags.Create`.
     */
    TemplateCreateEnd = 1,
    /**
     * Corresponds to the point in time before the runtime has called the template function of a
     * component with `RenderFlags.Update`.
     */
    TemplateUpdateStart = 2,
    /**
     * Corresponds to the point in time after the runtime has called the template function of a
     * component with `RenderFlags.Update`.
     */
    TemplateUpdateEnd = 3,
    /**
     * Corresponds to the point in time before the runtime has called a lifecycle hook of a component
     * or directive.
     */
    LifecycleHookStart = 4,
    /**
     * Corresponds to the point in time after the runtime has called a lifecycle hook of a component
     * or directive.
     */
    LifecycleHookEnd = 5,
    /**
     * Corresponds to the point in time before the runtime has evaluated an expression associated with
     * an event or an output.
     */
    OutputStart = 6,
    /**
     * Corresponds to the point in time after the runtime has evaluated an expression associated with
     * an event or an output.
     */
    OutputEnd = 7,
    /**
     * Corresponds to the point in time just before application bootstrap.
     */
    BootstrapApplicationStart = 8,
    /**
     * Corresponds to the point in time after application bootstrap.
     */
    BootstrapApplicationEnd = 9,
    /**
     * Corresponds to the point in time just before root component bootstrap.
     */
    BootstrapComponentStart = 10,
    /**
     * Corresponds to the point in time after root component bootstrap.
     */
    BootstrapComponentEnd = 11,
    /**
     * Corresponds to the point in time just before Angular starts a change detection tick.
     */
    ChangeDetectionStart = 12,
    /**
     * Corresponds to the point in time after Angular ended a change detection tick.
     */
    ChangeDetectionEnd = 13,
    /**
     * Corresponds to the point in time just before Angular starts a new synchronization pass of change detection tick.
     */
    ChangeDetectionSyncStart = 14,
    /**
     * Corresponds to the point in time after Angular ended a synchronization pass.
     */
    ChangeDetectionSyncEnd = 15,
    /**
     * Corresponds to the point in time just before Angular executes after render hooks.
     */
    AfterRenderHooksStart = 16,
    /**
     * Corresponds to the point in time after Angular executed after render hooks.
     */
    AfterRenderHooksEnd = 17,
    /**
     * Corresponds to the point in time just before Angular starts processing a component (create or update).
     */
    ComponentStart = 18,
    /**
     * Corresponds to the point in time after Angular finished processing a component.
     */
    ComponentEnd = 19,
    /**
     * Corresponds to the point in time just before a defer block transitions between states.
     */
    DeferBlockStateStart = 20,
    /**
     * Corresponds to the point in time after a defer block transitioned between states.
     */
    DeferBlockStateEnd = 21,
    /**
     * Corresponds to the point in time just before a component instance is created dynamically.
     */
    DynamicComponentStart = 22,
    /**
     * Corresponds to the point in time after a a component instance is created dynamically.
     */
    DynamicComponentEnd = 23,
    /**
     * Corresponds to the point in time before the runtime has called the host bindings function
     * of a directive.
     */
    HostBindingsUpdateStart = 24,
    /**
     * Corresponds to the point in time after the runtime has called the host bindings function
     * of a directive.
     */
    HostBindingsUpdateEnd = 25
}
/**
 * Profiler function which the runtime will invoke before and after user code.
 */
interface Profiler {
    (event: ProfilerEvent, instance?: {} | null, eventFn?: Function): void;
}

/** The framework used to author a particular application or component. */
declare enum Framework {
    Angular = "angular",
    ACX = "acx",
    Wiz = "wiz"
}

interface DebugSignalGraphNode {
    kind: ReactiveNodeKind;
    id: string;
    epoch: number;
    label?: string;
    value?: unknown;
    debuggableFn?: () => unknown;
    watched?: boolean;
}
interface DebugSignalGraphEdge {
    /**
     * Index of a signal node in the `nodes` array that is a consumer of the signal produced by the producer node.
     */
    consumer: number;
    /**
     * Index of a signal node in the `nodes` array that is a producer of the signal consumed by the consumer node.
     */
    producer: number;
}
/**
 * A debug representation of the signal graph.
 */
interface DebugSignalGraph {
    nodes: DebugSignalGraphNode[];
    edges: DebugSignalGraphEdge[];
}

/**
 * Retrieves directive instances associated with a given DOM node. Does not include
 * component instances.
 *
 * @usageNotes
 * Given the following DOM structure:
 *
 * ```html
 * <app-root>
 *   <button my-button></button>
 *   <my-comp></my-comp>
 * </app-root>
 * ```
 *
 * Calling `getDirectives` on `<button>` will return an array with an instance of the `MyButton`
 * directive that is associated with the DOM node.
 *
 * Calling `getDirectives` on `<my-comp>` will return an empty array.
 *
 * @param node DOM node for which to get the directives.
 * @returns Array of directives associated with the node.
 *
 * @publicApi
 */
declare function getDirectives(node: Node): {}[];
/** Metadata common to directives from all frameworks.  */
interface BaseDirectiveDebugMetadata {
    name?: string;
    framework?: Framework;
}
/**
 * Partial metadata for a given Angular directive instance.
 *
 * @publicApi
 */
interface AngularDirectiveDebugMetadata extends BaseDirectiveDebugMetadata {
    framework?: Framework.Angular;
    inputs: Record<string, string>;
    outputs: Record<string, string>;
}
/**
 * Partial metadata for a given Angular component instance.
 *
 * @publicApi
 */
interface AngularComponentDebugMetadata extends AngularDirectiveDebugMetadata {
    encapsulation: ViewEncapsulation$1;
    changeDetection: ChangeDetectionStrategy$1;
}
/** ACX change detection strategies. */
declare enum AcxChangeDetectionStrategy {
    Default = 0,
    OnPush = 1
}
/** ACX view encapsulation modes. */
declare enum AcxViewEncapsulation {
    Emulated = 0,
    None = 1
}
/** Partial metadata for a given ACX directive instance. */
interface AcxDirectiveDebugMetadata extends BaseDirectiveDebugMetadata {
    framework: Framework.ACX;
    inputs: Record<string, string>;
    outputs: Record<string, string>;
}
/** Partial metadata for a given ACX component instance. */
interface AcxComponentDebugMetadata extends AcxDirectiveDebugMetadata {
    changeDetection: AcxChangeDetectionStrategy;
    encapsulation: AcxViewEncapsulation;
}
/** Partial metadata for a given Wiz component instance. */
interface WizComponentDebugMetadata extends BaseDirectiveDebugMetadata {
    framework: Framework.Wiz;
    props: Record<string, string>;
}
/** All potential debug metadata types across all frameworks. */
type DirectiveDebugMetadata = AngularDirectiveDebugMetadata | AcxDirectiveDebugMetadata | AngularComponentDebugMetadata | AcxComponentDebugMetadata | WizComponentDebugMetadata;
/**
 * Retrieves the host element of a component or directive instance.
 * The host element is the DOM element that matched the selector of the directive.
 *
 * @param componentOrDirective Component or directive instance for which the host
 *     element should be retrieved.
 * @returns Host element of the target.
 *
 * @publicApi
 */
declare function getHostElement(componentOrDirective: {}): Element;
/**
 * Event listener configuration returned from `getListeners`.
 * @publicApi
 */
interface Listener {
    /** Name of the event listener. */
    name: string;
    /** Element that the listener is bound to. */
    element: Element;
    /** Callback that is invoked when the event is triggered. */
    callback: (value: any) => any;
    /** Whether the listener is using event capturing. */
    useCapture: boolean;
    /**
     * Type of the listener (e.g. a native DOM event or a custom @Output).
     */
    type: 'dom' | 'output';
}

declare class ViewRef<T> implements EmbeddedViewRef<T>, ChangeDetectorRef {
    /**
     * This represents the `LView` associated with the point where `ChangeDetectorRef` was
     * requested.
     *
     * This may be different from `_lView` if the `_cdRefInjectingView` is an embedded view.
     */
    private _cdRefInjectingView?;
    private _appRef;
    private _attachedToViewContainer;
    private exhaustive?;
    get rootNodes(): any[];
    constructor(
    /**
     * This represents `LView` associated with the component when ViewRef is a ChangeDetectorRef.
     *
     * When ViewRef is created for a dynamic component, this also represents the `LView` for the
     * component.
     *
     * For a "regular" ViewRef created for an embedded view, this is the `LView` for the embedded
     * view.
     *
     * @internal
     */
    _lView: LView, 
    /**
     * This represents the `LView` associated with the point where `ChangeDetectorRef` was
     * requested.
     *
     * This may be different from `_lView` if the `_cdRefInjectingView` is an embedded view.
     */
    _cdRefInjectingView?: LView | undefined);
    get context(): T;
    /**
     * @deprecated Replacing the full context object is not supported. Modify the context
     *   directly, or consider using a `Proxy` if you need to replace the full object.
     * // TODO(devversion): Remove this.
     */
    set context(value: T);
    get destroyed(): boolean;
    destroy(): void;
    onDestroy(callback: Function): void;
    /**
     * Marks a view and all of its ancestors dirty.
     *
     * This can be used to ensure an {@link ChangeDetectionStrategy#OnPush} component is
     * checked when it needs to be re-rendered but the two normal triggers haven't marked it
     * dirty (i.e. inputs haven't changed and events haven't fired in the view).
     *
     * <!-- TODO: Add a link to a chapter on OnPush components -->
     *
     * @usageNotes
     * ### Example
     *
     * ```ts
     * @Component({
     *   selector: 'app-root',
     *   template: `Number of ticks: {{numberOfTicks}}`
     * })
     * class AppComponent {
     *   numberOfTicks = 0;
     *
     *   constructor(private ref: ChangeDetectorRef) {
     *     setInterval(() => {
     *       this.numberOfTicks++;
     *       // the following is required, otherwise the view will not be updated
     *       this.ref.markForCheck();
     *     }, 1000);
     *   }
     * }
     * ```
     */
    markForCheck(): void;
    /**
     * Detaches the view from the change detection tree.
     *
     * Detached views will not be checked during change detection runs until they are
     * re-attached, even if they are dirty. `detach` can be used in combination with
     * {@link ChangeDetectorRef#detectChanges} to implement local change
     * detection checks.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
     *
     * @usageNotes
     * ### Example
     *
     * The following example defines a component with a large list of readonly data.
     * Imagine the data changes constantly, many times per second. For performance reasons,
     * we want to check and update the list every five seconds. We can do that by detaching
     * the component's change detector and doing a local check every five seconds.
     *
     * ```ts
     * class DataProvider {
     *   // in a real application the returned data will be different every time
     *   get data() {
     *     return [1,2,3,4,5];
     *   }
     * }
     *
     * @Component({
     *   selector: 'giant-list',
     *   template: `
     *     @for(d of dataProvider.data; track $index) {
     *        <li>Data {{d}}</li>
     *     }
     *   `,
     * })
     * class GiantList {
     *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {
     *     ref.detach();
     *     setInterval(() => {
     *       this.ref.detectChanges();
     *     }, 5000);
     *   }
     * }
     *
     * @Component({
     *   selector: 'app',
     *   providers: [DataProvider],
     *   template: `
     *     <giant-list><giant-list>
     *   `,
     * })
     * class App {
     * }
     * ```
     */
    detach(): void;
    /**
     * Re-attaches a view to the change detection tree.
     *
     * This can be used to re-attach views that were previously detached from the tree
     * using {@link ChangeDetectorRef#detach}. Views are attached to the tree by default.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     *
     * @usageNotes
     * ### Example
     *
     * The following example creates a component displaying `live` data. The component will detach
     * its change detector from the main change detector tree when the component's live property
     * is set to false.
     *
     * ```ts
     * class DataProvider {
     *   data = 1;
     *
     *   constructor() {
     *     setInterval(() => {
     *       this.data = this.data * 2;
     *     }, 500);
     *   }
     * }
     *
     * @Component({
     *   selector: 'live-data',
     *   inputs: ['live'],
     *   template: 'Data: {{dataProvider.data}}'
     * })
     * class LiveData {
     *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {}
     *
     *   set live(value) {
     *     if (value) {
     *       this.ref.reattach();
     *     } else {
     *       this.ref.detach();
     *     }
     *   }
     * }
     *
     * @Component({
     *   selector: 'app-root',
     *   providers: [DataProvider],
     *   template: `
     *     Live Update: <input type="checkbox" [(ngModel)]="live">
     *     <live-data [live]="live"><live-data>
     *   `,
     * })
     * class AppComponent {
     *   live = true;
     * }
     * ```
     */
    reattach(): void;
    /**
     * Checks the view and its children.
     *
     * This can also be used in combination with {@link ChangeDetectorRef#detach} to implement
     * local change detection checks.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
     *
     * @usageNotes
     * ### Example
     *
     * The following example defines a component with a large list of readonly data.
     * Imagine, the data changes constantly, many times per second. For performance reasons,
     * we want to check and update the list every five seconds.
     *
     * We can do that by detaching the component's change detector and doing a local change detection
     * check every five seconds.
     *
     * See {@link ChangeDetectorRef#detach} for more information.
     */
    detectChanges(): void;
    /**
     * Checks the change detector and its children, and throws if any changes are detected.
     *
     * This is used in development mode to verify that running change detection doesn't
     * introduce other changes.
     */
    checkNoChanges(): void;
    attachToViewContainerRef(): void;
    detachFromAppRef(): void;
    attachToAppRef(appRef: ApplicationRef): void;
}
/**
 * Reports whether the given view is considered dirty according to the different marking mechanisms.
 */
declare function isViewDirty(view: ViewRef<unknown>): boolean;
declare function markForRefresh(view: ViewRef<unknown>): void;

/**
 * Infers the tag name that should be used for a component based on its definition.
 * @param componentDef Definition for which to resolve the tag name.
 */
declare function inferTagNameFromDefinition(componentDef: ComponentDef<unknown>): string;
/**
 * ComponentFactory interface implementation.
 */
declare class ComponentFactory<T> {
    private componentDef;
    private ngModule?;
    selector: string;
    componentType: Type$1<any>;
    ngContentSelectors: string[];
    isBoundToModule: boolean;
    private cachedInputs;
    private cachedOutputs;
    get inputs(): {
        propName: string;
        templateName: string;
        isSignal: boolean;
        transform?: (value: any) => any;
    }[];
    get outputs(): {
        propName: string;
        templateName: string;
    }[];
    /**
     * @param componentDef The component definition.
     * @param ngModule The NgModuleRef to which the factory is bound.
     */
    constructor(componentDef: ComponentDef<any>, ngModule?: NgModuleRef$1<any> | undefined);
    create(injector: Injector, projectableNodes?: any[][] | undefined, rootSelectorOrNode?: any, environmentInjector?: NgModuleRef$1<any> | EnvironmentInjector | undefined, directives?: (Type$1<unknown> | DirectiveWithBindings<unknown>)[], componentBindings?: Binding[], hostElementNamespace?: string | null, allowNonStandaloneDirectives?: boolean): ComponentRef$1<T>;
    private createComponentRef;
}
/**
 * Represents an instance of a Component created via a {@link ComponentFactory}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
 * method.
 *
 */
declare class ComponentRef<T> extends ComponentRef$1<T> {
    private readonly _rootLView;
    private readonly _hasInputBindings;
    instance: T;
    hostView: ViewRef<T>;
    changeDetectorRef: ChangeDetectorRef;
    componentType: Type$1<T>;
    location: ElementRef;
    private previousInputValues;
    private _tNode;
    constructor(componentType: Type$1<T>, _rootLView: LView, _hasInputBindings: boolean);
    setInput(name: string, value: unknown): void;
    get injector(): Injector;
    destroy(): void;
    onDestroy(callback: () => void): void;
}

/**
 * @codeGenApi
 */
declare function ɵɵgetInheritedFactory<T>(type: Type$1<any> | AbstractType<any>): (type: Type$1<T>) => T;

/**
 * Sets the locale id that will be used for translations and ICU expressions.
 * This is the ivy version of `LOCALE_ID` that was defined as an injection token for the view engine
 * but is now defined as a global value.
 *
 * @param localeId
 */
declare function setLocaleId(localeId: string): void;

/**
 * Creates runtime data structures for defer blocks.
 *
 * @param index Index of the `defer` instruction.
 * @param primaryTmplIndex Index of the template with the primary block content.
 * @param dependencyResolverFn Function that contains dependencies for this defer block.
 * @param loadingTmplIndex Index of the template with the loading block content.
 * @param placeholderTmplIndex Index of the template with the placeholder block content.
 * @param errorTmplIndex Index of the template with the error block content.
 * @param loadingConfigIndex Index in the constants array of the configuration of the loading.
 *     block.
 * @param placeholderConfigIndex Index in the constants array of the configuration of the
 *     placeholder block.
 * @param enableTimerScheduling Function that enables timer-related scheduling if `after`
 *     or `minimum` parameters are setup on the `@loading` or `@placeholder` blocks.
 * @param flags A set of flags to define a particular behavior (e.g. to indicate that
 *              hydrate triggers are present and regular triggers should be deactivated
 *              in certain scenarios).
 *
 * @codeGenApi
 */
declare function ɵɵdefer(index: number, primaryTmplIndex: number, dependencyResolverFn?: DependencyResolverFn | null, loadingTmplIndex?: number | null, placeholderTmplIndex?: number | null, errorTmplIndex?: number | null, loadingConfigIndex?: number | null, placeholderConfigIndex?: number | null, enableTimerScheduling?: typeof ɵɵdeferEnableTimerScheduling | null, flags?: TDeferDetailsFlags | null): void;
/**
 * Loads defer block dependencies when a trigger value becomes truthy.
 * @codeGenApi
 */
declare function ɵɵdeferWhen(rawValue: unknown): void;
/**
 * Prefetches the deferred content when a value becomes truthy.
 * @codeGenApi
 */
declare function ɵɵdeferPrefetchWhen(rawValue: unknown): void;
/**
 * Hydrates the deferred content when a value becomes truthy.
 * @codeGenApi
 */
declare function ɵɵdeferHydrateWhen(rawValue: unknown): void;
/**
 * Specifies that hydration never occurs.
 * @codeGenApi
 */
declare function ɵɵdeferHydrateNever(): void;
/**
 * Sets up logic to handle the `on idle` deferred trigger.
 * @codeGenApi
 */
declare function ɵɵdeferOnIdle(timeout?: number): void;
/**
 * Sets up logic to handle the `prefetch on idle` deferred trigger.
 * @codeGenApi
 */
declare function ɵɵdeferPrefetchOnIdle(timeout?: number): void;
/**
 * Sets up logic to handle the `on idle` deferred trigger.
 * @codeGenApi
 */
declare function ɵɵdeferHydrateOnIdle(timeout?: number): void;
/**
 * Sets up logic to handle the `on immediate` deferred trigger.
 * @codeGenApi
 */
declare function ɵɵdeferOnImmediate(): void;
/**
 * Sets up logic to handle the `prefetch on immediate` deferred trigger.
 * @codeGenApi
 */
declare function ɵɵdeferPrefetchOnImmediate(): void;
/**
 * Sets up logic to handle the `on immediate` hydrate trigger.
 * @codeGenApi
 */
declare function ɵɵdeferHydrateOnImmediate(): void;
/**
 * Creates runtime data structures for the `on timer` deferred trigger.
 * @param delay Amount of time to wait before loading the content.
 * @codeGenApi
 */
declare function ɵɵdeferOnTimer(delay: number): void;
/**
 * Creates runtime data structures for the `prefetch on timer` deferred trigger.
 * @param delay Amount of time to wait before prefetching the content.
 * @codeGenApi
 */
declare function ɵɵdeferPrefetchOnTimer(delay: number): void;
/**
 * Creates runtime data structures for the `on timer` hydrate trigger.
 * @param delay Amount of time to wait before loading the content.
 * @codeGenApi
 */
declare function ɵɵdeferHydrateOnTimer(delay: number): void;
/**
 * Creates runtime data structures for the `on hover` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
declare function ɵɵdeferOnHover(triggerIndex: number, walkUpTimes?: number): void;
/**
 * Creates runtime data structures for the `prefetch on hover` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
declare function ɵɵdeferPrefetchOnHover(triggerIndex: number, walkUpTimes?: number): void;
/**
 * Creates runtime data structures for the `on hover` hydrate trigger.
 * @codeGenApi
 */
declare function ɵɵdeferHydrateOnHover(): void;
/**
 * Creates runtime data structures for the `on interaction` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
declare function ɵɵdeferOnInteraction(triggerIndex: number, walkUpTimes?: number): void;
/**
 * Creates runtime data structures for the `prefetch on interaction` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
declare function ɵɵdeferPrefetchOnInteraction(triggerIndex: number, walkUpTimes?: number): void;
/**
 * Creates runtime data structures for the `on interaction` hydrate trigger.
 * @codeGenApi
 */
declare function ɵɵdeferHydrateOnInteraction(): void;
/**
 * Creates runtime data structures for the `on viewport` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
declare function ɵɵdeferOnViewport(triggerIndex: number, walkUpTimes?: number | null, options?: IntersectionObserverInit): void;
/**
 * Creates runtime data structures for the `prefetch on viewport` deferred trigger.
 * @param triggerIndex Index at which to find the trigger element.
 * @param walkUpTimes Number of times to walk up/down the tree hierarchy to find the trigger.
 * @codeGenApi
 */
declare function ɵɵdeferPrefetchOnViewport(triggerIndex: number, walkUpTimes?: number | null, options?: IntersectionObserverInit): void;
/**
 * Creates runtime data structures for the `on viewport` hydrate trigger.
 * @codeGenApi
 */
declare function ɵɵdeferHydrateOnViewport(options?: IntersectionObserverInit): void;

/**
 * Advances to an element for later binding instructions.
 *
 * Used in conjunction with instructions like {@link property} to act on elements with specified
 * indices, for example those created with {@link element} or {@link elementStart}.
 *
 * ```ts
 * (rf: RenderFlags, ctx: any) => {
 *   if (rf & 1) {
 *     text(0, 'Hello');
 *     text(1, 'Goodbye')
 *     element(2, 'div');
 *   }
 *   if (rf & 2) {
 *     advance(2); // Advance twice to the <div>.
 *     property('title', 'test');
 *   }
 *  }
 * ```
 * @param delta Number of elements to advance forwards by.
 *
 * @codeGenApi
 */
declare function ɵɵadvance(delta?: number): void;

/**
 * Update an ARIA attribute on a selected element.
 *
 * If the attribute name also exists as an input property on any of the element's directives, those
 * inputs will be set instead of the element attribute.
 *
 * @param name Name of the ARIA attribute (beginning with `aria-`).
 * @param value New value to write.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵariaProperty<T>(name: string, value: T): typeof ɵɵariaProperty;

/**
 * Updates the value of or removes a bound attribute on an Element.
 *
 * Used in the case of `[attr.title]="value"`
 *
 * @param name name The name of the attribute.
 * @param value value The attribute is removed when value is `null` or `undefined`.
 *                  Otherwise the attribute value is set to the stringified value.
 * @param sanitizer An optional function used to sanitize the value.
 * @param namespace Optional namespace to use when setting the attribute.
 *
 * @codeGenApi
 */
declare function ɵɵattribute(name: string, value: any, sanitizer?: SanitizerFn | null, namespace?: string): typeof ɵɵattribute;

/**
 * Instruction to handle the `animate.enter` behavior for class bindings.
 *
 * @param value The value bound to `animate.enter`, which is a string or a function.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵanimateEnter(value: string | AnimationClassBindingFn): typeof ɵɵanimateEnter;
/**
 * Instruction to handle the `(animate.enter)` behavior for event bindings, aka when
 * a user wants to use a custom animation function rather than a class.
 *
 * @param value The value bound to `(animate.enter)`, an AnimationFunction.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵanimateEnterListener(value: AnimationFunction): typeof ɵɵanimateEnterListener;
/**
 * Instruction to handle the `animate.leave` behavior for class animations.
 * It creates a leave animation function that's tracked in the LView to
 * be run before DOM node removal and cleanup.
 *
 * @param value The value bound to `animate.leave`, which can be a string or a function.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵanimateLeave(value: string | AnimationClassBindingFn): typeof ɵɵanimateLeave;
/**
 * Instruction to handle the `(animate.leave)` behavior for event bindings, aka when
 * a user wants to use a custom animation function rather than a class. It registers
 * a leave animation function in the LView to be run at right before removal from the
 * DOM.
 *
 * @param value The value bound to `(animate.leave)`, an AnimationFunction.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵanimateLeaveListener(value: AnimationFunction): typeof ɵɵanimateLeaveListener;

/**
 * Instruction that returns the component instance in which the current instruction is executing.
 * This is a constant-time version of `nextContent` for the case where we know that we need the
 * component instance specifically, rather than the context of a particular template.
 *
 * @codeGenApi
 */
declare function ɵɵcomponentInstance(): any;

/**
 * Possibly sets up a {@link ɵFormFieldDirective} to manage a native or custom form control.
 *
 * Setup occurs if a `field` input is bound to a {@link ɵFormFieldDirective} on the current node,
 * but not to a component. If a `field` input is bound to a component, we assume the component
 * will manage the field in its own template.
 *
 * @codeGenApi
 */
declare function ɵɵcontrolCreate(): void;
/**
 * Calls the update function of the control directive at the given index.
 *
 * @codeGenApi
 */
declare function ɵɵcontrol(): void;

/**
 * Creates an LContainer for an ng-template representing a root node
 * of control flow (@if, @switch). We use this to explicitly set
 * flags on the TNode created to identify which nodes are in control
 * flow or starting control flow for hydration identification and
 * cleanup timing.
 *
 * @param index The index of the container in the data array
 * @param templateFn Inline template
 * @param decls The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param localRefs Index of the local references in the `consts` array.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 * @codeGenApi
 */
declare function ɵɵconditionalCreate(index: number, templateFn: ComponentTemplate<any> | null, decls: number, vars: number, tagName?: string | null, attrsIndex?: number | null, localRefsIndex?: number | null, localRefExtractor?: LocalRefExtractor): typeof ɵɵconditionalBranchCreate;
/**
 * Creates an LContainer for an ng-template representing a branch
 * of control flow (@else, @case, @default). We use this to explicitly
 * set flags on the TNode created to identify which nodes are in
 * control flow or starting control flow for hydration identification
 * and cleanup timing.
 *
 * @param index The index of the container in the data array
 * @param templateFn Inline template
 * @param decls The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param localRefs Index of the local references in the `consts` array.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 * @codeGenApi
 */
declare function ɵɵconditionalBranchCreate(index: number, templateFn: ComponentTemplate<any> | null, decls: number, vars: number, tagName?: string | null, attrsIndex?: number | null, localRefsIndex?: number | null, localRefExtractor?: LocalRefExtractor): typeof ɵɵconditionalBranchCreate;
/**
 * The conditional instruction represents the basic building block on the runtime side to support
 * built-in "if" and "switch". On the high level this instruction is responsible for adding and
 * removing views selected by a conditional expression.
 *
 * @param matchingTemplateIndex Index of a template TNode representing a conditional view to be
 *     inserted; -1 represents a special case when there is no view to insert.
 * @param contextValue Value that should be exposed as the context of the conditional.
 * @codeGenApi
 */
declare function ɵɵconditional<T>(matchingTemplateIndex: number, contextValue?: T): void;
/**
 * A built-in trackBy function used for situations where users specified collection index as a
 * tracking expression. Having this function body in the runtime avoids unnecessary code generation.
 *
 * @param index
 * @returns
 */
declare function ɵɵrepeaterTrackByIndex(index: number): number;
/**
 * A built-in trackBy function used for situations where users specified collection item reference
 * as a tracking expression. Having this function body in the runtime avoids unnecessary code
 * generation.
 *
 * @param index
 * @returns
 */
declare function ɵɵrepeaterTrackByIdentity<T>(_: number, value: T): T;
/**
 * The repeaterCreate instruction runs in the creation part of the template pass and initializes
 * internal data structures required by the update pass of the built-in repeater logic. Repeater
 * metadata are allocated in the data part of LView with the following layout:
 * - LView[HEADER_OFFSET + index] - metadata
 * - LView[HEADER_OFFSET + index + 1] - reference to a template function rendering an item
 * - LView[HEADER_OFFSET + index + 2] - optional reference to a template function rendering an empty
 * block
 *
 * @param index Index at which to store the metadata of the repeater.
 * @param templateFn Reference to the template of the main repeater block.
 * @param decls The number of nodes, local refs, and pipes for the main block.
 * @param vars The number of bindings for the main block.
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param trackByFn Reference to the tracking function.
 * @param trackByUsesComponentInstance Whether the tracking function has any references to the
 *  component instance. If it doesn't, we can avoid rebinding it.
 * @param emptyTemplateFn Reference to the template function of the empty block.
 * @param emptyDecls The number of nodes, local refs, and pipes for the empty block.
 * @param emptyVars The number of bindings for the empty block.
 * @param emptyTagName The name of the empty block container element, if applicable
 * @param emptyAttrsIndex Index of the empty block template attributes in the `consts` array.
 *
 * @codeGenApi
 */
declare function ɵɵrepeaterCreate(index: number, templateFn: ComponentTemplate<unknown>, decls: number, vars: number, tagName: string | null, attrsIndex: number | null, trackByFn: TrackByFunction<unknown>, trackByUsesComponentInstance?: boolean, emptyTemplateFn?: ComponentTemplate<unknown>, emptyDecls?: number, emptyVars?: number, emptyTagName?: string | null, emptyAttrsIndex?: number | null): void;
/**
 * The repeater instruction does update-time diffing of a provided collection (against the
 * collection seen previously) and maps changes in the collection to views structure (by adding,
 * removing or moving views as needed).
 * @param collection - the collection instance to be checked for changes
 * @codeGenApi
 */
declare function ɵɵrepeater(collection: Iterable<unknown> | undefined | null): void;

/**
 * State object representing an @boundary block, allocated in the LView data array.
 */
declare class LBoundary {
    private hostLView;
    error: any;
    constructor(hostLView: LView);
    reset(): void;
}
/**
 * Creates an LBoundary state object in the current LView.
 */
declare function ɵɵboundaryCreate(index: number): void;
/**
 * Retrieves the LBoundary state object from the current LView.
 */
declare function ɵɵgetBoundary(index: number): LBoundary;
/**
 * The boundary update instruction performs conditional view switching and attaches
 * an ON_ERROR interceptor if it is rendering the primary block.
 *
 * TODO: This instruction shares a lot of view switching logic with `ɵɵconditional`.
 * We should investigate extracting the common container management and view reconciliation
 * logic into a shared utility function to reduce duplication.
 */
declare function ɵɵboundaryUpdate(slotIndex: number, matchingTemplateIndex: number, primaryTemplateIndex: number): void;

/**
 * Returns the value associated to the given token from the injectors.
 *
 * `directiveInject` is intended to be used for directive, component and pipe factories.
 *  All other injection use `inject` which does not walk the node injector tree.
 *
 * Usage example (in factory function):
 *
 * ```ts
 * class SomeDirective {
 *   constructor(directive: DirectiveA) {}
 *
 *   static ɵdir = ɵɵdefineDirective({
 *     type: SomeDirective,
 *     factory: () => new SomeDirective(ɵɵdirectiveInject(DirectiveA))
 *   });
 * }
 * ```
 * @param token the type or token to inject
 * @param flags Injection flags
 * @returns the value from the injector or `null` when not found
 *
 * @codeGenApi
 */
declare function ɵɵdirectiveInject<T>(token: ProviderToken<T>): T;
declare function ɵɵdirectiveInject<T>(token: ProviderToken<T>, flags: number): T;
/**
 * Throws an error indicating that a factory function could not be generated by the compiler for a
 * particular class.
 *
 * This instruction allows the actual error message to be optimized away when ngDevMode is turned
 * off, saving bytes of generated code while still providing a good experience in dev mode.
 *
 * The name of the class is not mentioned here, but will be in the generated factory function name
 * and thus in the stack trace.
 *
 * @codeGenApi
 */
declare function ɵɵinvalidFactory(): never;

/**
 * Facade for the attribute injection from DI.
 *
 * @codeGenApi
 */
declare function ɵɵinjectAttribute(attrNameToInject: string): string | null;

/**
 * Create DOM element. The instruction must later be followed by `elementEnd()` call.
 *
 * @param index Index of the element in the LView array
 * @param name Name of the DOM Node
 * @param attrsIndex Index of the element's attributes in the `consts` array.
 * @param localRefsIndex Index of the element's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * Attributes and localRefs are passed as an array of strings where elements with an even index
 * hold an attribute name and elements with an odd index hold an attribute value, ex.:
 * ['id', 'warning5', 'class', 'alert']
 *
 * @codeGenApi
 */
declare function ɵɵelementStart(index: number, name: string, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵelementStart;
/**
 * Mark the end of the element.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵelementEnd(): typeof ɵɵelementEnd;
/**
 * Creates an empty element using {@link elementStart} and {@link elementEnd}
 *
 * @param index Index of the element in the data array
 * @param name Name of the DOM Node
 * @param attrsIndex Index of the element's attributes in the `consts` array.
 * @param localRefsIndex Index of the element's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵelement(index: number, name: string, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵelement;
/**
 * Create DOM element that cannot have any directives.
 *
 * @param index Index of the element in the LView array
 * @param name Name of the DOM Node
 * @param attrsIndex Index of the element's attributes in the `consts` array.
 * @param localRefsIndex Index of the element's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵdomElementStart(index: number, name: string, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵdomElementStart;
/**
 * Mark the end of the directiveless element.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵdomElementEnd(): typeof ɵɵdomElementEnd;
/**
 * Creates an empty element using {@link domElementStart} and {@link domElementEnd}
 *
 * @param index Index of the element in the data array
 * @param name Name of the DOM Node
 * @param attrsIndex Index of the element's attributes in the `consts` array.
 * @param localRefsIndex Index of the element's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵdomElement(index: number, name: string, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵdomElement;

/**
 * Creates a logical container for other nodes (<ng-container>) backed by a comment node in the DOM.
 * The instruction must later be followed by `elementContainerEnd()` call.
 *
 * @param index Index of the element in the LView array
 * @param attrsIndex Index of the container attributes in the `consts` array.
 * @param localRefsIndex Index of the container's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * Even if this instruction accepts a set of attributes no actual attribute values are propagated to
 * the DOM (as a comment node can't have attributes). Attributes are here only for directive
 * matching purposes and setting initial inputs of directives.
 *
 * @codeGenApi
 */
declare function ɵɵelementContainerStart(index: number, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵelementContainerStart;
/**
 * Mark the end of the <ng-container>.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵelementContainerEnd(): typeof ɵɵelementContainerEnd;
/**
 * Creates an empty logical container using {@link elementContainerStart}
 * and {@link elementContainerEnd}
 *
 * @param index Index of the element in the LView array
 * @param attrsIndex Index of the container attributes in the `consts` array.
 * @param localRefsIndex Index of the container's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵelementContainer(index: number, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵelementContainer;
/**
 * Creates a DOM-only logical container for other nodes (<ng-container>) backed by a comment node
 * in the DOM. The host node will *not* match any directives.
 *
 * @param index Index of the element in the LView array
 * @param attrsIndex Index of the container attributes in the `consts` array.
 * @param localRefsIndex Index of the container's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵdomElementContainerStart(index: number, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵdomElementContainerStart;
/**
 * Mark the end of a directiveless <ng-container>.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵdomElementContainerEnd(): typeof ɵɵelementContainerEnd;
/**
 * Creates an empty logical container using {@link domElementContainerStart}
 * and {@link domElementContainerEnd}
 *
 * @param index Index of the element in the LView array
 * @param attrsIndex Index of the container attributes in the `consts` array.
 * @param localRefsIndex Index of the container's local references in the `consts` array.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
declare function ɵɵdomElementContainer(index: number, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵdomElementContainer;

/**
 * Creation phase instruction to render a foreign component.
 *
 * @param index The index of the container in the data array.
 * @param foreignComponentIndex The index of the matched foreign component in the constant pool.
 * @param props A factory function returning aggregate properties/static attributes.
 * @codeGenApi
 */
declare function ɵɵforeignComponent(index: number, foreignComponentIndex: number, props?: (() => any) | null): void;
/**
 * Creation phase instruction to render foreign content (children of a foreign component)
 * and extract its root DOM nodes.
 *
 * @param index The index of the container in the data array.
 * @param foreignComponentConstIndex The index of the matched foreign component in the constant pool.
 * @codeGenApi
 */
declare function ɵɵforeignContent(index: number, foreignComponentConstIndex: number): any;
/**
 * Creation phase instruction to return a function for rendering foreign content dynamically
 * with arguments.
 *
 * @param index The index of the container in the data array.
 * @param foreignComponentConstIndex The index of the matched foreign component in the constant pool.
 * @codeGenApi
 */
declare function ɵɵforeignContentFn(index: number, foreignComponentConstIndex: number): (...args: any[]) => any;

/**
 * Sets a strict mode for JIT-compiled components to throw an error on unknown elements,
 * instead of just logging the error.
 * (for AOT-compiled ones this check happens at build time).
 */
declare function ɵsetUnknownElementStrictMode(shouldThrow: boolean): void;
/**
 * Gets the current value of the strict mode.
 */
declare function ɵgetUnknownElementStrictMode(): boolean;
/**
 * Sets a strict mode for JIT-compiled components to throw an error on unknown properties,
 * instead of just logging the error.
 * (for AOT-compiled ones this check happens at build time).
 */
declare function ɵsetUnknownPropertyStrictMode(shouldThrow: boolean): void;
/**
 * Gets the current value of the strict mode.
 */
declare function ɵgetUnknownPropertyStrictMode(): boolean;

/**
 * Returns the current OpaqueViewState instance.
 *
 * Used in conjunction with the restoreView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 *
 * @codeGenApi
 */
declare function ɵɵgetCurrentView(): OpaqueViewState;

interface NO_CHANGE {
    __brand__: 'NO_CHANGE';
}
/** A special value which designates that a value has not changed. */
declare const NO_CHANGE: NO_CHANGE;

/**
 * Update a DOM property on an element.
 *
 * @param propName Name of property..
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 * @returns This function returns itself so that it may be chained
 *  (e.g. `domProperty('name', ctx.name)('title', ctx.title)`)
 *
 * @codeGenApi
 */
declare function ɵɵdomProperty<T>(propName: string, value: T, sanitizer?: SanitizerFn | null): typeof ɵɵdomProperty;
/**
 * Updates a synthetic host binding (e.g. `[@foo]`) on a component or directive.
 *
 * This instruction is for compatibility purposes and is designed to ensure that a
 * synthetic host binding (e.g. `@HostBinding('@foo')`) properly gets rendered in
 * the component's renderer. Normally all host bindings are evaluated with the parent
 * component's renderer, but, in the case of animation @triggers, they need to be
 * evaluated with the sub component's renderer (because that's where the animation
 * triggers are defined).
 *
 * Do not use this instruction as a replacement for `elementProperty`. This instruction
 * only exists to ensure compatibility with the ViewEngine's host binding behavior.
 *
 * @param index The index of the element to update in the data array
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 *
 * @codeGenApi
 */
declare function ɵɵsyntheticHostProperty<T>(propName: string, value: T | NO_CHANGE, sanitizer?: SanitizerFn | null): typeof ɵɵsyntheticHostProperty;

/**
 * Marks a block of text as translatable.
 *
 * The instructions `i18nStart` and `i18nEnd` mark the translation block in the template.
 * The translation `message` is the value which is locale specific. The translation string may
 * contain placeholders which associate inner elements and sub-templates within the translation.
 *
 * The translation `message` placeholders are:
 * - `�{index}(:{block})�`: *Binding Placeholder*: Marks a location where an expression will be
 *   interpolated into. The placeholder `index` points to the expression binding index. An optional
 *   `block` that matches the sub-template in which it was declared.
 * - `�#{index}(:{block})�`/`�/#{index}(:{block})�`: *Element Placeholder*:  Marks the beginning
 *   and end of DOM element that were embedded in the original translation block. The placeholder
 *   `index` points to the element index in the template instructions set. An optional `block` that
 *   matches the sub-template in which it was declared.
 * - `�*{index}:{block}�`/`�/*{index}:{block}�`: *Sub-template Placeholder*: Sub-templates must be
 *   split up and translated separately in each angular template function. The `index` points to the
 *   `template` instruction index. A `block` that matches the sub-template in which it was declared.
 *
 * @param index A unique index of the translation in the static block.
 * @param messageIndex An index of the translation message from the `def.consts` array.
 * @param subTemplateIndex Optional sub-template index in the `message`.
 *
 * @codeGenApi
 */
declare function ɵɵi18nStart(index: number, messageIndex: number, subTemplateIndex?: number): void;
/**
 * Translates a translation block marked by `i18nStart` and `i18nEnd`. It inserts the text/ICU nodes
 * into the render tree, moves the placeholder nodes and removes the deleted nodes.
 *
 * @codeGenApi
 */
declare function ɵɵi18nEnd(): void;
/**
 *
 * Use this instruction to create a translation block that doesn't contain any placeholder.
 * It calls both {@link i18nStart} and {@link i18nEnd} in one instruction.
 *
 * The translation `message` is the value which is locale specific. The translation string may
 * contain placeholders which associate inner elements and sub-templates within the translation.
 *
 * The translation `message` placeholders are:
 * - `�{index}(:{block})�`: *Binding Placeholder*: Marks a location where an expression will be
 *   interpolated into. The placeholder `index` points to the expression binding index. An optional
 *   `block` that matches the sub-template in which it was declared.
 * - `�#{index}(:{block})�`/`�/#{index}(:{block})�`: *Element Placeholder*:  Marks the beginning
 *   and end of DOM element that were embedded in the original translation block. The placeholder
 *   `index` points to the element index in the template instructions set. An optional `block` that
 *   matches the sub-template in which it was declared.
 * - `�*{index}:{block}�`/`�/*{index}:{block}�`: *Sub-template Placeholder*: Sub-templates must be
 *   split up and translated separately in each angular template function. The `index` points to the
 *   `template` instruction index. A `block` that matches the sub-template in which it was declared.
 *
 * @param index A unique index of the translation in the static block.
 * @param messageIndex An index of the translation message from the `def.consts` array.
 * @param subTemplateIndex Optional sub-template index in the `message`.
 *
 * @codeGenApi
 */
declare function ɵɵi18n(index: number, messageIndex: number, subTemplateIndex?: number): void;
/**
 * Marks a list of attributes as translatable.
 *
 * @param index A unique index in the static block
 * @param values
 *
 * @codeGenApi
 */
declare function ɵɵi18nAttributes(index: number, attrsIndex: number): void;
/**
 * Stores the values of the bindings during each update cycle in order to determine if we need to
 * update the translated nodes.
 *
 * @param value The binding's value
 * @returns This function returns itself so that it may be chained
 * (e.g. `i18nExp(ctx.name)(ctx.title)`)
 *
 * @codeGenApi
 */
declare function ɵɵi18nExp<T>(value: T): typeof ɵɵi18nExp;
/**
 * Updates a translation block or an i18n attribute when the bindings have changed.
 *
 * @param index Index of either {@link i18nStart} (translation block) or {@link i18nAttributes}
 * (i18n attribute) on which it should update the content.
 *
 * @codeGenApi
 */
declare function ɵɵi18nApply(index: number): void;
/**
 * Handles message string post-processing for internationalization.
 *
 * Handles message string post-processing by transforming it from intermediate
 * format (that might contain some markers that we need to replace) to the final
 * form, consumable by i18nStart instruction. Post processing steps include:
 *
 * 1. Resolve all multi-value cases (like [�*1:1��#2:1�|�#4:1�|�5�])
 * 2. Replace all ICU vars (like "VAR_PLURAL")
 * 3. Replace all placeholders used inside ICUs in a form of {PLACEHOLDER}
 * 4. Replace all ICU references with corresponding values (like �ICU_EXP_ICU_1�)
 *    in case multiple ICUs have the same placeholder name
 *
 * @param message Raw translation string for post processing
 * @param replacements Set of replacements that should be applied
 *
 * @returns Transformed string that can be consumed by i18nStart instruction
 *
 * @codeGenApi
 */
declare function ɵɵi18nPostprocess(message: string, replacements?: {
    [key: string]: string | string[];
}): string;

/**
 * Adds an event listener to the current node.
 *
 * If an output exists on one of the node's directives, it also subscribes to the output
 * and saves the subscription for later cleanup.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 *
 * @codeGenApi
 */
declare function ɵɵlistener(eventName: string, listenerFn: EventCallback, eventTargetResolver?: GlobalTargetResolver): typeof ɵɵlistener;
/**
 * Registers a synthetic host listener (e.g. `(@foo.start)`) on a component or directive.
 *
 * This instruction is for compatibility purposes and is designed to ensure that a
 * synthetic host listener (e.g. `@HostListener('@foo.start')`) properly gets rendered
 * in the component's renderer. Normally all host listeners are evaluated with the
 * parent component's renderer, but, in the case of animation @triggers, they need
 * to be evaluated with the sub component's renderer (because that's where the
 * animation triggers are defined).
 *
 * Do not use this instruction as a replacement for `listener`. This instruction
 * only exists to ensure compatibility with the ViewEngine's host binding behavior.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param useCapture Whether or not to use capture in event listener
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 *
 * @codeGenApi
 */
declare function ɵɵsyntheticHostListener(eventName: string, listenerFn: EventCallback): typeof ɵɵsyntheticHostListener;
/**
 * Adds a listener for a DOM event on the current node.
 *
 * @param eventName Name of the event
 * @param listenerFn The function to be called when event emits
 * @param eventTargetResolver Function that returns global target information in case this listener
 * should be attached to a global object like window, document or body
 *
 * @codeGenApi
 */
declare function ɵɵdomListener(eventName: string, listenerFn: EventCallback, eventTargetResolver?: GlobalTargetResolver): typeof ɵɵdomListener;

/**
 * Enables directive matching on elements.
 *
 *  * Example:
 * ```html
 * <my-comp my-directive>
 *   Should match component / directive.
 * </my-comp>
 * <div ngNonBindable>
 *   <!-- ɵɵdisableBindings() -->
 *   <my-comp my-directive>
 *     Should not match component / directive because we are in ngNonBindable.
 *   </my-comp>
 *   <!-- ɵɵenableBindings() -->
 * </div>
 * ```
 *
 * @codeGenApi
 */
declare function ɵɵenableBindings(): void;
/**
 * Disables directive matching on element.
 *
 *  * Example:
 * ```html
 * <my-comp my-directive>
 *   Should match component / directive.
 * </my-comp>
 * <div ngNonBindable>
 *   <!-- ɵɵdisableBindings() -->
 *   <my-comp my-directive>
 *     Should not match component / directive because we are in ngNonBindable.
 *   </my-comp>
 *   <!-- ɵɵenableBindings() -->
 * </div>
 * ```
 *
 * @codeGenApi
 */
declare function ɵɵdisableBindings(): void;
/**
 * Restores `contextViewData` to the given OpaqueViewState instance.
 *
 * Used in conjunction with the getCurrentView() instruction to save a snapshot
 * of the current view and restore it when listeners are invoked. This allows
 * walking the declaration view tree in listeners to get vars from parent views.
 *
 * @param viewToRestore The OpaqueViewState instance to restore.
 * @returns Context of the restored OpaqueViewState instance.
 *
 * @codeGenApi
 */
declare function ɵɵrestoreView<T = any>(viewToRestore: OpaqueViewState): T;
/**
 * Clears the view set in `ɵɵrestoreView` from memory. Returns the passed in
 * value so that it can be used as a return value of an instruction.
 *
 * @codeGenApi
 */
declare function ɵɵresetView<T>(value?: T): T | undefined;
/**
 * Sets the namespace used to create elements to `'http://www.w3.org/2000/svg'` in global state.
 *
 * @codeGenApi
 */
declare function ɵɵnamespaceSVG(): void;
/**
 * Sets the namespace used to create elements to `'http://www.w3.org/1998/MathML/'` in global state.
 *
 * @codeGenApi
 */
declare function ɵɵnamespaceMathML(): void;
/**
 * Sets the namespace used to create elements to `null`, which forces element creation to use
 * `createElement` rather than `createElementNS`.
 *
 * @codeGenApi
 */
declare function ɵɵnamespaceHTML(): void;

/**
 * Retrieves a context at the level specified and saves it as the global, contextViewData.
 * Will get the next level up if level is not specified.
 *
 * This is used to save contexts of parent views so they can be bound in embedded views, or
 * in conjunction with reference() to bind a ref from a parent view.
 *
 * @param level The relative level of the view from which to grab context compared to contextVewData
 * @returns context
 *
 * @codeGenApi
 */
declare function ɵɵnextContext<T = any>(level?: number): T;

/**
 * Instruction to distribute projectable nodes among <ng-content> occurrences in a given template.
 * It takes all the selectors from the entire component's template and decides where
 * each projected node belongs (it re-distributes nodes among "buckets" where each "bucket" is
 * backed by a selector).
 *
 * This function requires CSS selectors to be provided in 2 forms: parsed (by a compiler) and text,
 * un-parsed form.
 *
 * The parsed form is needed for efficient matching of a node against a given CSS selector.
 * The un-parsed, textual form is needed for support of the ngProjectAs attribute.
 *
 * Having a CSS selector in 2 different formats is not ideal, but alternatives have even more
 * drawbacks:
 * - having only a textual form would require runtime parsing of CSS selectors;
 * - we can't have only a parsed as we can't re-construct textual form from it (as entered by a
 * template author).
 *
 * @param projectionSlots? A collection of projection slots. A projection slot can be based
 *        on a parsed CSS selectors or set to the wildcard selector ("*") in order to match
 *        all nodes which do not match any selector. If not specified, a single wildcard
 *        selector projection slot will be defined.
 *
 * @codeGenApi
 */
declare function ɵɵprojectionDef(projectionSlots?: (string | (string | number)[][])[]): void;
/**
 * Inserts previously re-distributed projected nodes. This instruction must be preceded by a call
 * to the projectionDef instruction.
 *
 * @param nodeIndex Index of the projection node.
 * @param selectorIndex Index of the slot selector.
 *  - 0 when the selector is `*` (or unspecified as this is the default value),
 *  - 1 based index of the selector from the {@link projectionDef}
 * @param attrs Static attributes set on the `ng-content` node.
 * @param fallbackTemplateFn Template function with fallback content.
 *   Will be rendered if the slot is empty at runtime.
 * @param fallbackDecls Number of declarations in the fallback template.
 * @param fallbackVars Number of variables in the fallback template.
 *
 * @codeGenApi
 */
declare function ɵɵprojection(nodeIndex: number, selectorIndex?: number, attrs?: TAttributes | null, fallbackTemplateFn?: ComponentTemplate<unknown>, fallbackDecls?: number, fallbackVars?: number): void;

/**
 * Update a property on a selected element.
 *
 * Operates on the element selected by index via the {@link select} instruction.
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled
 *
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 * @returns This function returns itself so that it may be chained
 * (e.g. `property('name', ctx.name)('title', ctx.title)`)
 *
 * @codeGenApi
 */
declare function ɵɵproperty<T>(propName: string, value: T, sanitizer?: SanitizerFn | null): typeof ɵɵproperty;

/**
 * Registers a QueryList, associated with a content query, for later refresh (part of a view
 * refresh).
 *
 * @param directiveIndex Current directive index
 * @param predicate The type for which the query will search
 * @param flags Flags associated with the query
 * @param read What to save in the query
 * @returns QueryList<T>
 *
 * @codeGenApi
 */
declare function ɵɵcontentQuery<T>(directiveIndex: number, predicate: ProviderToken<unknown> | string | string[], flags: number, read?: any): typeof ɵɵcontentQuery;
/**
 * Creates a new view query by initializing internal data structures.
 *
 * @param predicate The type for which the query will search
 * @param flags Flags associated with the query
 * @param read What to save in the query
 *
 * @codeGenApi
 */
declare function ɵɵviewQuery<T>(predicate: ProviderToken<unknown> | string | string[], flags: number, read?: any): typeof ɵɵviewQuery;
/**
 * Refreshes a query by combining matches from all active views and removing matches from deleted
 * views.
 *
 * @returns `true` if a query got dirty during change detection or if this is a static query
 * resolving in creation mode, `false` otherwise.
 *
 * @codeGenApi
 */
declare function ɵɵqueryRefresh(queryList: QueryList<any>): boolean;
/**
 * Loads a QueryList corresponding to the current view or content query.
 *
 * @codeGenApi
 */
declare function ɵɵloadQuery<T>(): QueryList<T>;

/**
 * Creates a new content query and binds it to a signal created by an authoring function.
 *
 * @param directiveIndex Current directive index
 * @param target The target signal to which the query should be bound
 * @param predicate The type for which the query will search
 * @param flags Flags associated with the query
 * @param read What to save in the query
 *
 * @codeGenApi
 */
declare function ɵɵcontentQuerySignal<T>(directiveIndex: number, target: Signal<T>, predicate: ProviderToken<unknown> | string[] | string, flags: number, read?: any): typeof ɵɵcontentQuerySignal;
/**
 * Creates a new view query by initializing internal data structures and binding a new query to the
 * target signal.
 *
 * @param target The target signal to assign the query results to.
 * @param predicate The type or label that should match a given query
 * @param flags Flags associated with the query
 * @param read What to save in the query
 *
 * @codeGenApi
 */
declare function ɵɵviewQuerySignal(target: Signal<unknown>, predicate: ProviderToken<unknown> | string[] | string, flags: number, read?: ProviderToken<unknown>): typeof ɵɵviewQuerySignal;
/**
 * Advances the current query index by a specified offset.
 *
 * Adjusting the current query index is necessary in cases where a given directive has a mix of
 * zone-based and signal-based queries. The signal-based queries don't require tracking of the
 * current index (those are refreshed on demand and not during change detection) so this instruction
 * is only necessary for backward-compatibility.
 *
 * @param index offset to apply to the current query index (defaults to 1)
 *
 * @codeGenApi
 */
declare function ɵɵqueryAdvance(indexOffset?: number): void;

/**
 * Retrieves a local reference from the current contextViewData.
 *
 * If the reference to retrieve is in a parent view, this instruction is used in conjunction
 * with a nextContext() call, which walks up the tree and updates the contextViewData instance.
 *
 * @param index The index of the local ref in contextViewData.
 *
 * @codeGenApi
 */
declare function ɵɵreference<T>(index: number): T;

declare const enum BypassType {
    Url = "URL",
    Html = "HTML",
    ResourceUrl = "ResourceURL",
    Script = "Script",
    Style = "Style"
}
/**
 * Marker interface for a value that's safe to use in a particular context.
 *
 * @publicApi
 */
interface SafeValue {
}
/**
 * Marker interface for a value that's safe to use as HTML.
 *
 * @publicApi
 */
interface SafeHtml extends SafeValue {
}
/**
 * Marker interface for a value that's safe to use as style (CSS).
 *
 * @publicApi
 */
interface SafeStyle extends SafeValue {
}
/**
 * Marker interface for a value that's safe to use as JavaScript.
 *
 * @publicApi
 */
interface SafeScript extends SafeValue {
}
/**
 * Marker interface for a value that's safe to use as a URL linking to a document.
 *
 * @publicApi
 */
interface SafeUrl extends SafeValue {
}
/**
 * Marker interface for a value that's safe to use as a URL to load executable code from.
 *
 * @publicApi
 */
interface SafeResourceUrl extends SafeValue {
}
declare function unwrapSafeValue(value: SafeValue): string;
declare function unwrapSafeValue<T>(value: T): T;
declare function allowSanitizationBypassAndThrow(value: any, type: BypassType.Html): value is SafeHtml;
declare function allowSanitizationBypassAndThrow(value: any, type: BypassType.ResourceUrl): value is SafeResourceUrl;
declare function allowSanitizationBypassAndThrow(value: any, type: BypassType.Script): value is SafeScript;
declare function allowSanitizationBypassAndThrow(value: any, type: BypassType.Style): value is SafeStyle;
declare function allowSanitizationBypassAndThrow(value: any, type: BypassType.Url): value is SafeUrl;
declare function allowSanitizationBypassAndThrow(value: any, type: BypassType): boolean;
declare function getSanitizationBypassType(value: any): BypassType | null;
/**
 * Mark `html` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link htmlSanitizer} to be trusted implicitly.
 *
 * @param trustedHtml `html` string which needs to be implicitly trusted.
 * @returns a `html` which has been branded to be implicitly trusted.
 */
declare function bypassSanitizationTrustHtml(trustedHtml: string): SafeHtml;
/**
 * Mark `style` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link styleSanitizer} to be trusted implicitly.
 *
 * @param trustedStyle `style` string which needs to be implicitly trusted.
 * @returns a `style` hich has been branded to be implicitly trusted.
 */
declare function bypassSanitizationTrustStyle(trustedStyle: string): SafeStyle;
/**
 * Mark `script` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link scriptSanitizer} to be trusted implicitly.
 *
 * @param trustedScript `script` string which needs to be implicitly trusted.
 * @returns a `script` which has been branded to be implicitly trusted.
 */
declare function bypassSanitizationTrustScript(trustedScript: string): SafeScript;
/**
 * Mark `url` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link urlSanitizer} to be trusted implicitly.
 *
 * @param trustedUrl `url` string which needs to be implicitly trusted.
 * @returns a `url`  which has been branded to be implicitly trusted.
 */
declare function bypassSanitizationTrustUrl(trustedUrl: string): SafeUrl;
/**
 * Mark `url` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link resourceUrlSanitizer} to be trusted implicitly.
 *
 * @param trustedResourceUrl `url` string which needs to be implicitly trusted.
 * @returns a `url` which has been branded to be implicitly trusted.
 */
declare function bypassSanitizationTrustResourceUrl(trustedResourceUrl: string): SafeResourceUrl;

/**
 * Update a style binding on an element with the provided value.
 *
 * If the style value is falsy then it will be removed from the element
 * (or assigned a different value depending if there are any styles placed
 * on the element with `styleMap` or any static styles that are
 * present from when the element was created with `styling`).
 *
 * Note that the styling element is updated as part of `stylingApply`.
 *
 * @param prop A valid CSS property.
 * @param value New value to write (`null` or an empty string to remove).
 * @param suffix Optional suffix. Used with scalar values to add unit such as `px`.
 *
 * Note that this will apply the provided style value to the host element if this function is called
 * within a host binding function.
 *
 * @codeGenApi
 */
declare function ɵɵstyleProp(prop: string, value: string | number | SafeValue | undefined | null, suffix?: string | null): typeof ɵɵstyleProp;
/**
 * Update a class binding on an element with the provided value.
 *
 * This instruction is meant to handle the `[class.foo]="exp"` case and,
 * therefore, the class binding itself must already be allocated using
 * `styling` within the creation block.
 *
 * @param prop A valid CSS class (only one).
 * @param value A true/false value which will turn the class on or off.
 *
 * Note that this will apply the provided class value to the host element if this function
 * is called within a host binding function.
 *
 * @codeGenApi
 */
declare function ɵɵclassProp(className: string, value: any): typeof ɵɵclassProp;
/**
 * Update style bindings using an object literal on an element.
 *
 * This instruction is meant to apply styling via the `[style]="exp"` template bindings.
 * When styles are applied to the element they will then be updated with respect to
 * any styles/classes set via `styleProp`. If any styles are set to falsy
 * then they will be removed from the element.
 *
 * Note that the styling instruction will not be applied until `stylingApply` is called.
 *
 * @param styles A key/value style map of the styles that will be applied to the given element.
 *        Any missing styles (that have already been applied to the element beforehand) will be
 *        removed (unset) from the element's styling.
 *
 * Note that this will apply the provided styleMap value to the host element if this function
 * is called within a host binding.
 *
 * @codeGenApi
 */
declare function ɵɵstyleMap(styles: {
    [styleName: string]: any;
} | string | undefined | null | NO_CHANGE): void;
/**
 * Update class bindings using an object literal or class-string on an element.
 *
 * This instruction is meant to apply styling via the `[class]="exp"` template bindings.
 * When classes are applied to the element they will then be updated with
 * respect to any styles/classes set via `classProp`. If any
 * classes are set to falsy then they will be removed from the element.
 *
 * Note that the styling instruction will not be applied until `stylingApply` is called.
 * Note that this will the provided classMap value to the host element if this function is called
 * within a host binding.
 *
 * @param classes A key/value map or string of CSS classes that will be added to the
 *        given element. Any missing classes (that have already been applied to the element
 *        beforehand) will be removed (unset) from the element's list of CSS classes.
 *
 * @codeGenApi
 */
declare function ɵɵclassMap(classes: {
    [className: string]: boolean | undefined | null;
} | string | string[] | Set<string> | undefined | null | NO_CHANGE): void;

/**
 * Creates an LContainer for an ng-template (dynamically-inserted view), e.g.
 *
 * <ng-template #foo>
 *    <div></div>
 * </ng-template>
 *
 * @param index The index of the container in the data array
 * @param templateFn Inline template
 * @param decls The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param localRefs Index of the local references in the `consts` array.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 *
 * @codeGenApi
 */
declare function ɵɵtemplate(index: number, templateFn: ComponentTemplate<any> | null, decls: number, vars: number, tagName?: string | null, attrsIndex?: number | null, localRefsIndex?: number | null, localRefExtractor?: LocalRefExtractor): typeof ɵɵtemplate;
/**
 * Creates an LContainer for an ng-template that cannot have directives.
 *
 * @param index The index of the container in the data array
 * @param templateFn Inline template
 * @param decls The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param localRefs Index of the local references in the `consts` array.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 *
 * @codeGenApi
 */
declare function ɵɵdomTemplate(index: number, templateFn: ComponentTemplate<any> | null, decls: number, vars: number, tagName?: string | null, attrsIndex?: number | null, localRefsIndex?: number | null, localRefExtractor?: LocalRefExtractor): typeof ɵɵdomTemplate;

/**
 * Create static text node
 *
 * @param index Index of the node in the data array
 * @param value Static string value to write.
 *
 * @codeGenApi
 */
declare function ɵɵtext(index: number, value?: string): void;

/**
 *
 * Update text content with a lone bound value
 *
 * Used when a text node has 1 interpolated value in it, an no additional text
 * surrounds that interpolated value:
 *
 * ```html
 * <div>{{v0}}</div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵtextInterpolate(v0);
 * ```
 * @returns itself, so that it may be chained.
 * @see textInterpolateV
 * @codeGenApi
 */
declare function ɵɵtextInterpolate(v0: any): typeof ɵɵtextInterpolate;
/**
 *
 * Update text content with single bound value surrounded by other text.
 *
 * Used when a text node has 1 interpolated value in it:
 *
 * ```html
 * <div>prefix{{v0}}suffix</div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵtextInterpolate1('prefix', v0, 'suffix');
 * ```
 * @returns itself, so that it may be chained.
 * @see textInterpolateV
 * @codeGenApi
 */
declare function ɵɵtextInterpolate1(prefix: string, v0: any, suffix?: string): typeof ɵɵtextInterpolate1;
/**
 *
 * Update text content with 2 bound values surrounded by other text.
 *
 * Used when a text node has 2 interpolated values in it:
 *
 * ```html
 * <div>prefix{{v0}}-{{v1}}suffix</div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵtextInterpolate2('prefix', v0, '-', v1, 'suffix');
 * ```
 * @returns itself, so that it may be chained.
 * @see textInterpolateV
 * @codeGenApi
 */
declare function ɵɵtextInterpolate2(prefix: string, v0: any, i0: string, v1: any, suffix?: string): typeof ɵɵtextInterpolate2;
/**
 *
 * Update text content with 3 bound values surrounded by other text.
 *
 * Used when a text node has 3 interpolated values in it:
 *
 * ```html
 * <div>prefix{{v0}}-{{v1}}-{{v2}}suffix</div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵtextInterpolate3(
 * 'prefix', v0, '-', v1, '-', v2, 'suffix');
 * ```
 * @returns itself, so that it may be chained.
 * @see textInterpolateV
 * @codeGenApi
 */
declare function ɵɵtextInterpolate3(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix?: string): typeof ɵɵtextInterpolate3;
/**
 *
 * Update text content with 4 bound values surrounded by other text.
 *
 * Used when a text node has 4 interpolated values in it:
 *
 * ```html
 * <div>prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}suffix</div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵtextInterpolate4(
 * 'prefix', v0, '-', v1, '-', v2, '-', v3, 'suffix');
 * ```
 * @returns itself, so that it may be chained.
 * @see ɵɵtextInterpolateV
 * @codeGenApi
 */
declare function ɵɵtextInterpolate4(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix?: string): typeof ɵɵtextInterpolate4;
/**
 *
 * Update text content with 5 bound values surrounded by other text.
 *
 * Used when a text node has 5 interpolated values in it:
 *
 * ```html
 * <div>prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}suffix</div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵtextInterpolate5(
 * 'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, 'suffix');
 * ```
 * @returns itself, so that it may be chained.
 * @see textInterpolateV
 * @codeGenApi
 */
declare function ɵɵtextInterpolate5(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix?: string): typeof ɵɵtextInterpolate5;
/**
 *
 * Update text content with 6 bound values surrounded by other text.
 *
 * Used when a text node has 6 interpolated values in it:
 *
 * ```html
 * <div>prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}suffix</div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵtextInterpolate6(
 *    'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, 'suffix');
 * ```
 *
 * @param i4 Static value used for concatenation only.
 * @param v5 Value checked for change. @returns itself, so that it may be chained.
 * @see textInterpolateV
 * @codeGenApi
 */
declare function ɵɵtextInterpolate6(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix?: string): typeof ɵɵtextInterpolate6;
/**
 *
 * Update text content with 7 bound values surrounded by other text.
 *
 * Used when a text node has 7 interpolated values in it:
 *
 * ```html
 * <div>prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}-{{v6}}suffix</div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵtextInterpolate7(
 *    'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, '-', v6, 'suffix');
 * ```
 * @returns itself, so that it may be chained.
 * @see textInterpolateV
 * @codeGenApi
 */
declare function ɵɵtextInterpolate7(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix?: string): typeof ɵɵtextInterpolate7;
/**
 *
 * Update text content with 8 bound values surrounded by other text.
 *
 * Used when a text node has 8 interpolated values in it:
 *
 * ```html
 * <div>prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}-{{v6}}-{{v7}}suffix</div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵtextInterpolate8(
 *  'prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, '-', v6, '-', v7, 'suffix');
 * ```
 * @returns itself, so that it may be chained.
 * @see textInterpolateV
 * @codeGenApi
 */
declare function ɵɵtextInterpolate8(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix?: string): typeof ɵɵtextInterpolate8;
/**
 * Update text content with 9 or more bound values other surrounded by text.
 *
 * Used when the number of interpolated values exceeds 8.
 *
 * ```html
 * <div>prefix{{v0}}-{{v1}}-{{v2}}-{{v3}}-{{v4}}-{{v5}}-{{v6}}-{{v7}}-{{v8}}-{{v9}}suffix</div>
 * ```
 *
 * Its compiled representation is:
 *
 * ```ts
 * ɵɵtextInterpolateV(
 *  ['prefix', v0, '-', v1, '-', v2, '-', v3, '-', v4, '-', v5, '-', v6, '-', v7, '-', v9,
 *  'suffix']);
 * ```
 *.
 * @param values The collection of values and the strings in between those values, beginning with
 * a string prefix and ending with a string suffix.
 * (e.g. `['prefix', value0, '-', value1, '-', value2, ..., value99, 'suffix']`)
 *
 * @returns itself, so that it may be chained.
 * @codeGenApi
 */
declare function ɵɵtextInterpolateV(values: any[]): typeof ɵɵtextInterpolateV;

/**
 * Update a two-way bound property on a selected element.
 *
 * Operates on the element selected by index via the {@link select} instruction.
 *
 * @param propName Name of property.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 * @returns This function returns itself so that it may be chained
 * (e.g. `twoWayProperty('name', ctx.name)('title', ctx.title)`)
 *
 * @codeGenApi
 */
declare function ɵɵtwoWayProperty<T>(propName: string, value: T | WritableSignal<T>, sanitizer?: SanitizerFn | null): typeof ɵɵtwoWayProperty;
/**
 * Function used inside two-way listeners to conditionally set the value of the bound expression.
 *
 * @param target Field on which to set the value.
 * @param value Value to be set to the field.
 *
 * @codeGenApi
 */
declare function ɵɵtwoWayBindingSet<T>(target: unknown, value: T): boolean;
/**
 * Adds an event listener that updates a two-way binding to the current node.
 *
 * @param eventName Name of the event.
 * @param listenerFn The function to be called when event emits.
 *
 * @codeGenApi
 */
declare function ɵɵtwoWayListener(eventName: string, listenerFn: EventCallback): typeof ɵɵtwoWayListener;

/**
 * Declares an `@let` at a specific data slot. Returns itself to allow chaining.
 *
 * @param index Index at which to declare the `@let`.
 *
 * @codeGenApi
 */
declare function ɵɵdeclareLet(index: number): typeof ɵɵdeclareLet;
/**
 * Instruction that stores the value of a `@let` declaration on the current view.
 * Returns the value to allow usage inside variable initializers.
 *
 * @codeGenApi
 */
declare function ɵɵstoreLet<T>(value: T): T;
/**
 * Retrieves the value of a `@let` declaration defined in a parent view.
 *
 * @param index Index of the declaration within the view.
 *
 * @codeGenApi
 */
declare function ɵɵreadContextLet<T>(index: number): T;

/**
 * Sets the location within the source template at which
 * each element in the current view was defined.
 *
 * @param index Index at which the DOM node was created.
 * @param templatePath Path to the template at which the node was defined.
 * @param locations Element locations to which to attach the source location.
 *
 * @codeGenApi
 */
declare function ɵɵattachSourceLocations(templatePath: string, locations: [index: number, offset: number, line: number, column: number][]): void;

/**
 * Interpolate a value with a single bound value and no prefixes or suffixes.
 *
 * @param v0 Value checked for change.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
declare function ɵɵinterpolate(v0: any): string | NO_CHANGE;
/**
 * Interpolate a value with a single bound value.
 *
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
declare function ɵɵinterpolate1(prefix: string, v0: any, suffix?: string): string | NO_CHANGE;
/**
 * Interpolate a value with two bound values.
 *
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
declare function ɵɵinterpolate2(prefix: string, v0: any, i0: string, v1: any, suffix?: string): string | NO_CHANGE;
/**
 * Interpolate a value with three bound values.
 *
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
declare function ɵɵinterpolate3(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, suffix?: string): string | NO_CHANGE;
/**
 * Interpolate a value with four bound values.
 *
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
declare function ɵɵinterpolate4(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, suffix?: string): string | NO_CHANGE;
/**
 * Interpolate a value with five bound values.
 *
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param i3 Static value used for concatenation only.
 * @param v4 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
declare function ɵɵinterpolate5(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, suffix?: string): string | NO_CHANGE;
/**
 * Interpolate a value with six bound values.
 *
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param i3 Static value used for concatenation only.
 * @param v4 Value checked for change.
 * @param i4 Static value used for concatenation only.
 * @param v5 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
declare function ɵɵinterpolate6(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, suffix?: string): string | NO_CHANGE;
/**
 * Interpolate a value with seven bound values.
 *
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param i3 Static value used for concatenation only.
 * @param v4 Value checked for change.
 * @param i4 Static value used for concatenation only.
 * @param v5 Value checked for change.
 * @param i5 Static value used for concatenation only.
 * @param v6 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
declare function ɵɵinterpolate7(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, suffix?: string): string | NO_CHANGE;
/**
 * Interpolate a value with eight bound values.
 *
 * @param prefix Static value used for concatenation only.
 * @param v0 Value checked for change.
 * @param i0 Static value used for concatenation only.
 * @param v1 Value checked for change.
 * @param i1 Static value used for concatenation only.
 * @param v2 Value checked for change.
 * @param i2 Static value used for concatenation only.
 * @param v3 Value checked for change.
 * @param i3 Static value used for concatenation only.
 * @param v4 Value checked for change.
 * @param i4 Static value used for concatenation only.
 * @param v5 Value checked for change.
 * @param i5 Static value used for concatenation only.
 * @param v6 Value checked for change.
 * @param i6 Static value used for concatenation only.
 * @param v7 Value checked for change.
 * @param suffix Static value used for concatenation only.
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
declare function ɵɵinterpolate8(prefix: string, v0: any, i0: string, v1: any, i1: string, v2: any, i2: string, v3: any, i3: string, v4: any, i4: string, v5: any, i5: string, v6: any, i6: string, v7: any, suffix?: string): string | NO_CHANGE;
/**
 * Interpolate a value with nine or more bound values.
 *
 * @param values The collection of values and the strings in-between those values, beginning with
 * a string prefix and ending with a string suffix.
 * (e.g. `['prefix', value0, '-', value1, '-', value2, ..., value99, 'suffix']`)
 * @returns Interpolated string or NO_CHANGE if none of the bound values have changed.
 * @codeGenApi
 */
declare function ɵɵinterpolateV(values: unknown[]): string | NO_CHANGE;

/**
 * Create, store and retrieve an arrow function that was defined in the template.
 *
 * @param slotOffset Offset from binding root to the reserved slot
 * @param factory Function used to create new instances of the function.
 * @param context Context that the template function is executing in.
 *
 * @codeGenApi
 */
declare function ɵɵarrowFunction<T>(slotOffset: number, factory: (context: T, view: LView) => (...args: unknown[]) => unknown, context: T): any;

/**
 * Create a pipe.
 *
 * @param index Pipe index where the pipe will be stored.
 * @param pipeName The name of the pipe
 * @returns T the instance of the pipe.
 *
 * @codeGenApi
 */
declare function ɵɵpipe(index: number, pipeName: string): any;
/**
 * Invokes a pipe with 1 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param offset the binding offset
 * @param v1 1st argument to {@link PipeTransform#transform}.
 *
 * @codeGenApi
 */
declare function ɵɵpipeBind1(index: number, offset: number, v1: any): any;
/**
 * Invokes a pipe with 2 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param slotOffset the offset in the reserved slot space
 * @param v1 1st argument to {@link PipeTransform#transform}.
 * @param v2 2nd argument to {@link PipeTransform#transform}.
 *
 * @codeGenApi
 */
declare function ɵɵpipeBind2(index: number, slotOffset: number, v1: any, v2: any): any;
/**
 * Invokes a pipe with 3 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param slotOffset the offset in the reserved slot space
 * @param v1 1st argument to {@link PipeTransform#transform}.
 * @param v2 2nd argument to {@link PipeTransform#transform}.
 * @param v3 4rd argument to {@link PipeTransform#transform}.
 *
 * @codeGenApi
 */
declare function ɵɵpipeBind3(index: number, slotOffset: number, v1: any, v2: any, v3: any): any;
/**
 * Invokes a pipe with 4 arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param slotOffset the offset in the reserved slot space
 * @param v1 1st argument to {@link PipeTransform#transform}.
 * @param v2 2nd argument to {@link PipeTransform#transform}.
 * @param v3 3rd argument to {@link PipeTransform#transform}.
 * @param v4 4th argument to {@link PipeTransform#transform}.
 *
 * @codeGenApi
 */
declare function ɵɵpipeBind4(index: number, slotOffset: number, v1: any, v2: any, v3: any, v4: any): any;
/**
 * Invokes a pipe with variable number of arguments.
 *
 * This instruction acts as a guard to {@link PipeTransform#transform} invoking
 * the pipe only when an input to the pipe changes.
 *
 * @param index Pipe index where the pipe was stored on creation.
 * @param slotOffset the offset in the reserved slot space
 * @param values Array of arguments to pass to {@link PipeTransform#transform} method.
 *
 * @codeGenApi
 */
declare function ɵɵpipeBindV(index: number, slotOffset: number, values: [any, ...any[]]): any;

/**
 * Bindings for pure functions are stored after regular bindings.
 *
 * |-------decls------|---------vars---------|                 |----- hostVars (dir1) ------|
 * ------------------------------------------------------------------------------------------
 * | nodes/refs/pipes | bindings | fn slots  | injector | dir1 | host bindings | host slots |
 * ------------------------------------------------------------------------------------------
 *                    ^                      ^
 *      TView.bindingStartIndex      TView.expandoStartIndex
 *
 * Pure function instructions are given an offset from the binding root. Adding the offset to the
 * binding root gives the first index where the bindings are stored. In component views, the binding
 * root is the bindingStartIndex. In host bindings, the binding root is the expandoStartIndex +
 * any directive instances + any hostVars in directives evaluated before it.
 *
 * See VIEW_DATA.md for more information about host binding resolution.
 */
/**
 * If the value hasn't been saved, calls the pure function to store and return the
 * value. If it has been saved, returns the saved value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn Function that returns a value
 * @returns value
 *
 * @codeGenApi
 */
declare function ɵɵpureFunction0<T>(slotOffset: number, pureFn: () => T): T;
/**
 * If the value of the provided exp has changed, calls the pure function to return
 * an updated value. Or if the value has not changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn Function that returns an updated value
 * @param exp Updated expression value
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
declare function ɵɵpureFunction1(slotOffset: number, pureFn: (v: any) => any, exp: any): any;
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
declare function ɵɵpureFunction2(slotOffset: number, pureFn: (v1: any, v2: any) => any, exp1: any, exp2: any): any;
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
declare function ɵɵpureFunction3(slotOffset: number, pureFn: (v1: any, v2: any, v3: any) => any, exp1: any, exp2: any, exp3: any): any;
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
declare function ɵɵpureFunction4(slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any) => any, exp1: any, exp2: any, exp3: any, exp4: any, thisArg?: any): any;
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
declare function ɵɵpureFunction5(slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any) => any, exp1: any, exp2: any, exp3: any, exp4: any, exp5: any): any;
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @param exp6
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
declare function ɵɵpureFunction6(slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any) => any, exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, exp6: any): any;
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @param exp6
 * @param exp7
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
declare function ɵɵpureFunction7(slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any) => any, exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any): any;
/**
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn
 * @param exp1
 * @param exp2
 * @param exp3
 * @param exp4
 * @param exp5
 * @param exp6
 * @param exp7
 * @param exp8
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
declare function ɵɵpureFunction8(slotOffset: number, pureFn: (v1: any, v2: any, v3: any, v4: any, v5: any, v6: any, v7: any, v8: any) => any, exp1: any, exp2: any, exp3: any, exp4: any, exp5: any, exp6: any, exp7: any, exp8: any): any;
/**
 * pureFunction instruction that can support any number of bindings.
 *
 * If the value of any provided exp has changed, calls the pure function to return
 * an updated value. Or if no values have changed, returns cached value.
 *
 * @param slotOffset the offset from binding root to the reserved slot
 * @param pureFn A pure function that takes binding values and builds an object or array
 * containing those values.
 * @param exps An array of binding values
 * @returns Updated or cached value
 *
 * @codeGenApi
 */
declare function ɵɵpureFunctionV(slotOffset: number, pureFn: (...v: any[]) => any, exps: any[]): any;

/**
 *
 * @codeGenApi
 */
declare function ɵɵresolveWindow(element: RElement & {
    ownerDocument: Document;
}): EventTarget;
/**
 *
 * @codeGenApi
 */
declare function ɵɵresolveDocument(element: RElement & {
    ownerDocument: Document;
}): EventTarget;
/**
 *
 * @codeGenApi
 */
declare function ɵɵresolveBody(element: RElement & {
    ownerDocument: Document;
}): EventTarget;

/**
 * Retrieves `TemplateRef` instance from `Injector` when a local reference is placed on the
 * `<ng-template>` element.
 *
 * @codeGenApi
 */
declare function ɵɵtemplateRefExtractor(tNode: TNode, lView: LView): TemplateRef<any> | null;

declare function ɵɵgetComponentDepsFactory(type: ComponentType<any>, rawImports?: RawScopeInfoFromDecorator[]): () => DependencyTypeList;

/**
 * Sets the debug info for an Angular class.
 *
 * This runtime is guarded by ngDevMode flag.
 */
declare function ɵsetClassDebugInfo(type: Type$1<any> | AbstractType<any>, debugInfo: ClassDebugInfo): void;

/** Represents `import.meta` plus some information that's not in the built-in types. */
type ImportMetaExtended = ImportMeta & {
    hot?: {
        send?: (name: string, payload: unknown) => void;
    };
};
/**
 * Gets the URL from which the client will fetch a new version of a component's metadata so it
 * can be replaced during hot module reloading.
 * @param id Unique ID for the component, generated during compile time.
 * @param timestamp Time at which the request happened.
 * @param base Base URL against which to resolve relative paths.
 * @codeGenApi
 */
declare function ɵɵgetReplaceMetadataURL(id: string, timestamp: string, base: string): string;
/**
 * Replaces the metadata of a component type and re-renders all live instances of the component.
 * @param type Class whose metadata will be replaced.
 * @param applyMetadata Callback that will apply a new set of metadata on the `type` when invoked.
 * @param environment Synthetic namespace imports that need to be passed along to the callback.
 * @param locals Local symbols from the source location that have to be exposed to the callback.
 * @param importMeta `import.meta` from the call site of the replacement function. Optional since
 *   it isn't used internally.
 * @param id ID to the class being replaced. **Not** the same as the component definition ID.
 *   Optional since the ID might not be available internally.
 * @codeGenApi
 */
declare function ɵɵreplaceMetadata(type: Type$1<unknown>, applyMetadata: (...args: [Type$1<unknown>, unknown[], ...unknown[]]) => void, namespaces: unknown[], locals: unknown[], importMeta?: ImportMetaExtended | null, id?: string | null): void;

/** Store a value in the `data` at a given `index`. */
declare function store<T>(tView: TView, lView: LView, index: number, value: T): void;

/**
 * Gets the class name of the closest component to a node.
 * Warning! this function will return minified names if the name of the component is minified. The
 * consumer of the function is responsible for resolving the minified name to its original name.
 * @param node Node from which to start the search.
 * @param predicate Predicate function that can be used to decide which nodes should be skipped over
 *   during the search. Return true if the search should stop or false to keep going up the tree.
 */
declare function getClosestComponentName(node: Node, predicate?: (current: HTMLElement, componentName: string) => boolean): string | null;

/**
 * Starts a traversal from the current view, going upwards in the hierarchy until a component
 * instance matches the specified predicate function. Returns the matching component instance.
 * @param predicate Function that decides if the component instance matches the criteria.
 */
declare function getCurrentClosestComponentInstance<T>(predicate: (value: unknown) => value is T): T | null;

/**
 * Used to resolve resource URLs on `@Component` when used with JIT compilation.
 *
 * Example:
 * ```ts
 * @Component({
 *   selector: 'my-comp',
 *   templateUrl: 'my-comp.html', // This requires asynchronous resolution
 * })
 * class MyComponent { }
 *
 * // Calling `renderComponent` will fail because `renderComponent` is a synchronous process
 * // and `MyComponent`'s `@Component.templateUrl` needs to be resolved asynchronously.
 *
 * // Calling `resolveComponentResources()` will resolve `@Component.templateUrl` into
 * // `@Component.template`, which allows `renderComponent` to proceed in a synchronous manner.
 *
 * // Use browser's `fetch()` function as the default resource resolution strategy.
 * resolveComponentResources(fetch).then(() => {
 * // After resolution all URLs have been converted into `template` strings.
 * renderComponent(MyComponent);
 * });
 *
 * ```
 *
 * @remarks In AOT the resolution happens during compilation, and so there should be no need
 * to call this method outside JIT mode.
 *
 * @param resourceResolver a function which is responsible for returning a `Promise` to the
 * contents of the resolved URL. Browser's `fetch()` method is a good default implementation.
 */
declare function resolveComponentResources(resourceResolver: (url: string) => Promise<string | {
    text(): Promise<string>;
    status?: number;
}>): Promise<void>;
declare function isComponentDefPendingResolution(type: Type$1<any>): boolean;
declare function clearResolutionOfComponentResourcesQueue(): Map<Type$1<any>, Component>;
declare function restoreComponentResolutionQueue(queue: Map<Type$1<any>, Component>): void;

/**
 * Internal implementation of the pending tasks service.
 */
declare class PendingTasksInternal implements OnDestroy {
    private taskId;
    private pendingTasks;
    private destroyed;
    private pendingTask;
    private debugTaskTracker;
    get hasPendingTasks(): boolean;
    /**
     * In case the service is about to be destroyed, return a self-completing observable.
     * Otherwise, return the observable that emits the current state of pending tasks.
     */
    get hasPendingTasksObservable(): Observable<boolean>;
    add(): number;
    has(taskId: number): boolean;
    remove(taskId: number): void;
    ngOnDestroy(): void;
    /** @nocollapse */
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<PendingTasksInternal>;
}

/**
 * InjectionToken to control root component bootstrap behavior.
 *
 * This token is primarily used in Angular's server-side rendering (SSR) scenarios,
 * particularly by the `@angular/ssr` package, to manage whether the root component
 * should be bootstrapped during the application initialization process.
 *
 * ## Purpose:
 * During SSR route extraction, setting this token to `false` prevents Angular from
 * bootstrapping the root component. This avoids unnecessary component rendering,
 * enabling route extraction without requiring additional APIs or triggering
 * component logic.
 *
 * ## Behavior:
 * - **`false`**: Prevents the root component from being bootstrapped.
 * - **`true`** (default): Proceeds with the normal root component bootstrap process.
 *
 * This mechanism ensures SSR can efficiently separate route extraction logic
 * from component rendering.
 */
declare const ENABLE_ROOT_COMPONENT_BOOTSTRAP: InjectionToken<boolean>;

declare const PERFORMANCE_MARK_PREFIX = "\uD83C\uDD70\uFE0F";
/**
 * Function that will start measuring against the performance API
 * Should be used in pair with stopMeasuring
 */
declare function startMeasuring(label: string): void;
/**
 * Function that will stop measuring against the performance API
 * Should be used in pair with startMeasuring
 */
declare function stopMeasuring(label: string): void;
/**
 * This enables an internal performance profiler
 *
 * It should not be imported in application code
 */
declare function enableProfiling(): void;
declare function disableProfiling(): void;

interface PlatformReflectionCapabilities {
    factory(type: Type$1<any>): Function;
    hasLifecycleHook(type: any, lcProperty: string): boolean;
    /**
     * Return a list of annotations/types for constructor parameters
     */
    parameters(type: Type$1<any>): any[][];
    /**
     * Return a list of annotations declared on the class
     */
    annotations(type: Type$1<any>): any[];
    /**
     * Return a object literal which describes the annotations on Class fields/properties.
     */
    propMetadata(typeOrFunc: Type$1<any>): {
        [key: string]: any[];
    };
}

declare class ReflectionCapabilities implements PlatformReflectionCapabilities {
    private _reflect;
    constructor(reflect?: any);
    factory<T>(t: Type$1<T>): (args: any[]) => T;
    private _ownParameters;
    parameters(type: Type$1<any>): any[][];
    private _ownAnnotations;
    annotations(typeOrFunc: Type$1<any>): any[];
    private _ownPropMetadata;
    propMetadata(typeOrFunc: any): {
        [key: string]: any[];
    };
    ownPropMetadata(typeOrFunc: any): {
        [key: string]: any[];
    };
    hasLifecycleHook(type: any, lcProperty: string): boolean;
}

/**
 * An object that defines an injection context for the injector profiler.
 */
interface InjectorProfilerContext {
    /**
     *  The Injector that service is being injected into.
     *      - Example: if ModuleA --provides--> ServiceA --injects--> ServiceB
     *                 then inject(ServiceB) in ServiceA has ModuleA as an injector context
     */
    injector: Injector;
    /**
     *  The class where the constructor that is calling `inject` is located
     *      - Example: if ModuleA --provides--> ServiceA --injects--> ServiceB
     *                 then inject(ServiceB) in ServiceA has ServiceA as a construction context
     */
    token: Type$1<unknown> | AbstractType<unknown> | null;
}
/**
 * An object that contains information about a provider that has been configured
 *
 * TODO: rename to indicate that it is a debug structure eg. ProviderDebugInfo.
 */
interface ProviderRecord {
    /**
     * DI token that this provider is configuring
     */
    token: Type$1<unknown> | InjectionToken<unknown>;
    /**
     * Determines if provider is configured as view provider.
     */
    isViewProvider: boolean;
    /**
     * The raw provider associated with this ProviderRecord.
     */
    provider: SingleProvider;
    /**
     * The path of DI containers that were followed to import this provider
     */
    importPath?: (Type$1<unknown> | AbstractType<unknown>)[];
}
/**
 * An object that contains information a service that has been injected within an
 * InjectorProfilerContext
 */
interface InjectedService {
    /**
     * DI token of the Service that is injected
     */
    token?: Type$1<unknown> | InjectionToken<unknown>;
    /**
     * Value of the injected service
     */
    value: unknown;
    /**
     * Flags that this service was injected with
     */
    flags?: InternalInjectFlags | InjectOptions;
    /**
     * Injector that this service was provided in.
     */
    providedIn?: Injector;
    /**
     * In NodeInjectors, the LView and TNode that serviced this injection.
     */
    injectedIn?: {
        lView: LView;
        tNode: TNode;
    };
}
declare function setInjectorProfilerContext(context: InjectorProfilerContext): InjectorProfilerContext;

/**
 * The following getter methods retrieve the definition from the type. Currently the retrieval
 * honors inheritance, but in the future we may change the rule to require that definitions are
 * explicit. This would require some sort of migration strategy.
 */
declare function getComponentDef<T>(type: any): ComponentDef<T> | null;
declare function getDirectiveDef<T>(type: any): DirectiveDef<T> | null;
/**
 * Checks whether a given Component, Directive or Pipe is marked as standalone.
 * This will return false if passed anything other than a Component, Directive, or Pipe class
 *
 * @param type A reference to a Component, Directive or Pipe.
 * @publicApi
 */
declare function isStandalone(type: Type$1<unknown>): boolean;

/**
 * Tell ivy what the `document` is for this platform.
 *
 * It is only necessary to call this if the current platform is not a browser.
 *
 * @param document The object representing the global `document` in this environment.
 */
declare function setDocument(document: Document | undefined): void;
/**
 * Access the object that represents the `document` for this platform.
 *
 * Ivy calls this whenever it needs to access the `document` object.
 * For example to create the renderer or to do sanitization.
 */
declare function getDocument(): Document;

/** Token used to retrieve the `SharedStylesHost`. */
declare const SHARED_STYLES_HOST: InjectionToken<SharedStylesHost>;
/** Manages stylesheets for components in the application. */
interface SharedStylesHost {
    /**
     * Adds embedded styles to the DOM via HTML `style` elements.
     * @param styles An array of style content strings.
     * @param urls An array of URLs to be added as link tags.
     */
    addStyles(styles: string[], urls?: string[]): void;
    /**
     * Removes embedded styles from the DOM that were added as HTML `style` elements.
     * @param styles An array of style content strings.
     * @param urls An array of URLs to be removed as link tags.
     */
    removeStyles(styles: string[], urls?: string[]): void;
    /**
     * Adds a host node to contain styles added to the DOM and adds all existing style usage to
     * the newly added host node.
     *
     * @param hostNode The node to contain styles added to the DOM.
     */
    addHost(hostNode: Node): void;
    /**
     * Removes a host node from the set of style hosts and removes all existing style usage from
     * the removed host node.
     *
     * @param hostNode The node to remove from the set of style hosts.
     */
    removeHost(hostNode: Node): void;
}

/**
 * Constructs a `Resource` that projects a reactive request to an asynchronous operation defined by
 * a loader function, which exposes the result of the loading operation via signals.
 *
 * Note that `resource` is intended for _read_ operations, not operations which perform mutations.
 * `resource` will cancel in-progress loads via the `AbortSignal` when destroyed or when a new
 * request object becomes available, which could prematurely abort mutations.
 *
 * @see [Async reactivity with resources](guide/signals/resource)
 *
 * @publicApi 22.0
 */
declare function resource<T, R>(options: ResourceOptions<T, R> & {
    defaultValue: NoInfer<T>;
}): ResourceRef<T>;
/**
 * Constructs a `Resource` that projects a reactive request to an asynchronous operation defined by
 * a loader function, which exposes the result of the loading operation via signals.
 *
 * Note that `resource` is intended for _read_ operations, not operations which perform mutations.
 * `resource` will cancel in-progress loads via the `AbortSignal` when destroyed or when a new
 * request object becomes available, which could prematurely abort mutations.
 *
 * @publicApi 22.0
 * @see [Async reactivity with resources](guide/signals/resource)
 */
declare function resource<T, R>(options: ResourceOptions<T, R>): ResourceRef<T | undefined>;
type ResourceInternalStatus = 'idle' | 'loading' | 'resolved' | 'local';
type WrappedRequest = {
    request?: unknown;
    reload: number;
    status?: ResourceInternalStatus;
    error?: Error;
};
/**
 * Base class which implements `.value` as a `WritableSignal` by delegating `.set` and `.update`.
 */
declare abstract class BaseWritableResource<T> implements WritableResource<T> {
    readonly value: WritableSignal<T>;
    abstract readonly status: Signal<ResourceStatus>;
    abstract readonly error: Signal<Error | undefined>;
    abstract reload(): boolean;
    readonly isLoading: Signal<boolean>;
    constructor(value: Signal<T>, debugName: string | undefined);
    abstract set(value: T): void;
    private readonly isError;
    update(updateFn: (value: T) => T): void;
    private readonly isValueDefined;
    private _snapshot;
    get snapshot(): Signal<ResourceSnapshot<T>>;
    hasValue(): this is ResourceRef<Exclude<T, undefined>>;
    asReadonly(): Resource<T>;
}
/**
 * Implementation for `resource()` which uses a `linkedSignal` to manage the resource's state.
 */
declare class ResourceImpl<T, R> extends BaseWritableResource<T> implements ResourceRef<T> {
    private readonly loaderFn;
    private readonly equal;
    private readonly debugName;
    private transferCacheKey;
    private readonly pendingTasks;
    /**
     * The current state of the resource. Status, value, and error are derived from this.
     */
    private readonly state;
    /**
     * Combines the current request with a reload counter which allows the resource to be reloaded on
     * imperative command.
     */
    protected readonly extRequest: WritableSignal<WrappedRequest>;
    private readonly effectRef;
    private pendingController;
    private resolvePendingTask;
    private destroyed;
    private unregisterOnDestroy;
    readonly status: Signal<ResourceStatus>;
    readonly error: Signal<Error | undefined>;
    private readonly transferState;
    constructor(request: (ctx: ResourceParamsContext) => R, loaderFn: ResourceStreamingLoader<T, R>, defaultValue: T, equal: ValueEqualityFn<T> | undefined, debugName: string | undefined, injector: Injector, transferCacheKey: StateKey<T> | undefined, getInitialStream?: (request: R) => Signal<ResourceStreamItem<T>> | undefined);
    /**
     * Called either directly via `WritableResource.set` or via `.value.set()`.
     */
    set(value: T): void;
    reload(): boolean;
    destroy(): void;
    private loadEffect;
    private abortInProgressLoad;
}
declare function encapsulateResourceError(error: unknown): Error;
/**
 * Chains the current params off of the value of another resource, returning the value
 * of the other resource only when its status is `resolved` or `local`, or propagating status to
 * the current resource by throwing the appropriate status code when the value is not available.
 */
declare function chain<T>(resource: Resource<T>): T;
declare function isInParamsFunction(): boolean;
declare function setInParamsFunction(value: boolean): void;

/**
 * Sanitizes the given unsafe, untrusted HTML fragment, and returns HTML text that is safe to add to
 * the DOM in a browser environment.
 */
declare function _sanitizeHtml(defaultDoc: any, unsafeHtmlInput: string): TrustedHTML | string;

declare function _sanitizeUrl(url: string): string;

/**
 * Testability API.
 * `declare` keyword causes tsickle to generate externs, so these methods are
 * not renamed by Closure Compiler.
 * @publicApi
 */
declare interface PublicTestability {
    isStable(): boolean;
    whenStable(callback: Function, timeout?: number, updateCallback?: Function): void;
    findProviders(using: any, provider: string, exactMatch: boolean): any[];
}
/**
 * Internal injection token that can used to access an instance of a Testability class.
 *
 * This token acts as a bridge between the core bootstrap code and the `Testability` class. This is
 * needed to ensure that there are no direct references to the `Testability` class, so it can be
 * tree-shaken away (if not referenced). For the environments/setups when the `Testability` class
 * should be available, this token is used to add a provider that references the `Testability`
 * class. Otherwise, only this token is retained in a bundle, but the `Testability` class is not.
 */
declare const TESTABILITY: InjectionToken<Testability>;
/**
 * Internal injection token to retrieve Testability getter class instance.
 */
declare const TESTABILITY_GETTER: InjectionToken<GetTestability>;
/**
 * Internal injection token to signal whether to use pending tasks for stability.
 */
declare const USE_PENDING_TASKS: InjectionToken<boolean>;
/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser.
 *
 * Angular applications bootstrapped using an NgModule (via `@NgModule.bootstrap` field) will also
 * instantiate Testability by default (in both development and production modes).
 *
 * For applications bootstrapped using the `bootstrapApplication` function, Testability is not
 * included by default. You can include it into your applications by getting the list of necessary
 * providers using the `provideProtractorTestingSupport()` function and adding them into the
 * `options.providers` array. Example:
 *
 * ```ts
 * import {provideProtractorTestingSupport} from '@angular/platform-browser';
 *
 * await bootstrapApplication(RootComponent, providers: [provideProtractorTestingSupport()]);
 * ```
 *
 * @publicApi
 */
declare class Testability implements PublicTestability {
    private _ngZone;
    private registry;
    private _isZoneStable;
    private _callbacks;
    private _taskTrackingZone;
    private _destroyRef?;
    private readonly pendingTasksInternal;
    private readonly _usePendingTasks;
    constructor(_ngZone: NgZone, registry: TestabilityRegistry, testabilityGetter: GetTestability);
    private _watchAngularEvents;
    /**
     * Whether an associated application is stable
     */
    isStable(): boolean;
    private _runCallbacksIfReady;
    private getPendingTasks;
    private addCallback;
    /**
     * Wait for the application to be stable with a timeout. If the timeout is reached before that
     * happens, the callback receives a list of the macro tasks that were pending, otherwise null.
     *
     * @param doneCb The callback to invoke when Angular is stable or the timeout expires
     *    whichever comes first.
     * @param timeout Optional. The maximum time to wait for Angular to become stable. If not
     *    specified, whenStable() will wait forever.
     * @param updateCb Optional. If specified, this callback will be invoked whenever the set of
     *    pending macrotasks changes. If this callback returns true doneCb will not be invoked
     *    and no further updates will be issued.
     */
    whenStable(doneCb: Function, timeout?: number, updateCb?: Function): void;
    /**
     * Find providers by name
     * @param using The root element to search from
     * @param provider The name of binding variable
     * @param exactMatch Whether using exactMatch
     */
    findProviders(using: any, provider: string, exactMatch: boolean): any[];
    static ɵfac: __FactoryDeclaration<Testability, never>;
    static ɵprov: __InjectableDeclaration<any>;
}
/**
 * A global registry of {@link Testability} instances for specific elements.
 * @publicApi
 */
declare class TestabilityRegistry {
    /**
     * Registers an application with a testability hook so that it can be tracked
     * @param token token of application, root element
     * @param testability Testability hook
     */
    registerApplication(token: any, testability: Testability): void;
    /**
     * Unregisters an application.
     * @param token token of application, root element
     */
    unregisterApplication(token: any): void;
    /**
     * Unregisters all applications
     */
    unregisterAllApplications(): void;
    /**
     * Get a testability hook associated with the application
     * @param elem root element
     */
    getTestability(elem: any): Testability | null;
    /**
     * Get all registered testabilities
     */
    getAllTestabilities(): Testability[];
    /**
     * Get all registered applications(root elements)
     */
    getAllRootElements(): any[];
    /**
     * Find testability of a node in the Tree
     * @param elem node
     * @param findInAncestors whether finding testability in ancestors if testability was not found in
     * current node
     */
    findTestabilityInTree(elem: Node, findInAncestors?: boolean): Testability | null;
    static ɵfac: __FactoryDeclaration<TestabilityRegistry, never>;
    static ɵprov: __InjectableDeclaration<any>;
}
/**
 * Adapter interface for retrieving the `Testability` service associated for a
 * particular context.
 *
 * @publicApi
 */
interface GetTestability {
    addToWindow(registry: TestabilityRegistry): void;
    findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean): Testability | null;
}
/**
 * Set the {@link GetTestability} implementation used by the Angular testing framework.
 * @publicApi
 */
declare function setTestabilityGetter(getter: GetTestability): void;

/**
 * Utility function used during template type checking to assert that a value is of a certain type.
 * @codeGenApi
 */
declare function ɵassertType<T>(value: unknown): asserts value is T;

/**
 * Transforms a value (typically a string) to a boolean.
 * Intended to be used as a transform function of an input.
 *
 *  @usageNotes
 *  ```ts
 *  status = input({ transform: booleanAttribute });
 *  ```
 * @param value Value to be transformed.
 *
 * @see [Built-in transformations](guide/components/inputs#built-in-transformations)
 *
 * @publicApi
 */
declare function booleanAttribute(value: unknown): boolean;
/**
 * Transforms a value (typically a string) to a number.
 * Intended to be used as a transform function of an input.
 * @param value Value to be transformed.
 * @param fallbackValue Value to use if the provided value can't be parsed as a number.
 *
 *  @usageNotes
 *  ```ts
 *  status = input({ transform: numberAttribute });
 *  ```
 *
 * @publicApi
 * @see [Built-in transformations](guide/components/inputs#built-in-transformations)
 */
declare function numberAttribute(value: unknown, fallbackValue?: number): number;

declare const _global: any;

/**
 * Determine if the argument is shaped like a Promise
 */
declare function isPromise<T = any>(obj: any): obj is Promise<T>;
/**
 * Determine if the argument is a Subscribable
 */
declare function isSubscribable<T>(obj: any | Subscribable<T>): obj is Subscribable<T>;

/**
 * A guarded `performance.mark` for feature marking.
 *
 * This method exists because while all supported browser and node.js version supported by Angular
 * support performance.mark API. This is not the case for other environments such as JSDOM and
 * Cloudflare workers.
 */
declare function performanceMarkFeature(feature: string): void;

declare function stringify(token: any): string;
/**
 * Ellipses the string in the middle when longer than the max length
 *
 * @param string
 * @param maxLength of the output string
 * @returns ellipsed string with ... in the middle
 */
declare function truncateMiddle(str: string, maxLength?: number): string;

declare const NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR: {};

declare function compileNgModuleFactory<M>(injector: Injector, options: CompilerOptions, moduleType: Type$1<M>): Promise<NgModuleFactory$1<M>>;

/**
 * Create a new `Injector` which is configured using a `defType` of `InjectorType<any>`s.
 */
declare function createInjector(defType: any, parent?: Injector | null, additionalProviders?: Array<Provider | StaticProvider> | null, name?: string): Injector;

/**
 * Adds the given NgModule type to Angular's NgModule registry.
 *
 * This is generated as a side-effect of NgModule compilation. Note that the `id` is passed in
 * explicitly and not read from the NgModule definition. This is for two reasons: it avoids a
 * megamorphic read, and in JIT there's a chicken-and-egg problem where the NgModule may not be
 * fully resolved when it's registered.
 *
 * @codeGenApi
 */
declare function registerNgModuleType(ngModuleType: Type$1<any>, id: string): void;
/**
 * Control whether the NgModule registration system enforces that each NgModule type registered has
 * a unique id.
 *
 * This is useful for testing as the NgModule registry cannot be properly reset between tests with
 * Angular's current API.
 */
declare function setAllowDuplicateNgModuleIdsForTest(allowDuplicates: boolean): void;

/**
 * The internal view context which is specific to a given DOM element, directive or
 * component instance. Each value in here (besides the LView and element node details)
 * can be present, null or undefined. If undefined then it implies the value has not been
 * looked up yet, otherwise, if null, then a lookup was executed and nothing was found.
 *
 * Each value will get filled when the respective value is examined within the getContext
 * function. The component, element and each directive instance will share the same instance
 * of the context.
 */
declare class LContext {
    /**
     * ID of the component's parent view data.
     */
    private lViewId;
    /**
     * The index instance of the node.
     */
    nodeIndex: number;
    /**
     * The instance of the DOM node that is attached to the lNode.
     */
    native: RNode;
    /**
     * The instance of the Component node.
     */
    component: {} | null | undefined;
    /**
     * The list of active directives that exist on this element.
     */
    directives: any[] | null | undefined;
    /**
     * The map of local references (local reference name => element or directive instance) that
     * exist on this element.
     */
    localRefs: {
        [key: string]: any;
    } | null | undefined;
    /** Component's parent view data. */
    get lView(): LView | null;
    constructor(
    /**
     * ID of the component's parent view data.
     */
    lViewId: number, 
    /**
     * The index instance of the node.
     */
    nodeIndex: number, 
    /**
     * The instance of the DOM node that is attached to the lNode.
     */
    native: RNode);
}

/**
 * Returns the matching `LContext` data for a given DOM node, directive or component instance.
 *
 * This function will examine the provided DOM element, component, or directive instance\'s
 * monkey-patched property to derive the `LContext` data. Once called then the monkey-patched
 * value will be that of the newly created `LContext`.
 *
 * If the monkey-patched value is the `LView` instance then the context value for that
 * target will be created and the monkey-patch reference will be updated. Therefore when this
 * function is called it may mutate the provided element\'s, component\'s or any of the associated
 * directive\'s monkey-patch values.
 *
 * If the monkey-patch value is not detected then the code will walk up the DOM until an element
 * is found which contains a monkey-patch reference. When that occurs then the provided element
 * will be updated with a new context (which is then returned). If the monkey-patch value is not
 * detected for a component/directive instance then it will throw an error (all components and
 * directives should be automatically monkey-patched by ivy).
 *
 * @param target Component, Directive or DOM Node.
 */
declare function getLContext(target: any): LContext | null;

/**
 * Represents the set of dependencies of a type in a certain context.
 */
interface ScopeData {
    pipes: Set<PipeType<any>>;
    directives: Set<DirectiveType<any> | ComponentType<any> | Type$1<any>>;
    /**
     * If true it indicates that calculating this scope somehow was not successful. The consumers
     * should interpret this as empty dependencies. The application of this flag is when calculating
     * scope recursively, the presence of this flag in a scope dependency implies that the scope is
     * also poisoned and thus we can return immediately without having to continue the recursion. The
     * reason for this error is displayed as an error message in the console as per JIT behavior
     * today. In addition to that, in local compilation the other build/compilations run in parallel
     * with local compilation may or may not reveal some details about the error as well.
     */
    isPoisoned?: boolean;
}
/**
 * Represents scope data for standalone components as calculated during runtime by the deps
 * tracker.
 */
interface StandaloneCompScopeData extends ScopeData {
    ngModules: Set<NgModuleType<any>>;
}
/** Represents scope data for NgModule as calculated during runtime by the deps tracker. */
interface NgModuleScope {
    compilation: ScopeData;
    exported: ScopeData;
}
/**
 * Represents scope data for standalone component as calculated during runtime by the deps tracker.
 */
interface StandaloneComponentScope {
    compilation: StandaloneCompScopeData;
}
/** Component dependencies info as calculated during runtime by the deps tracker. */
interface ComponentDependencies {
    dependencies: DependencyTypeList;
}
/**
 * Public API for runtime deps tracker (RDT).
 *
 * All downstream tools should only use these methods.
 */
interface DepsTrackerApi {
    /**
     * Computes the component dependencies, i.e., a set of components/directive/pipes that could be
     * present in the component's template (This set might contain directives/components/pipes not
     * necessarily used in the component's template depending on the implementation).
     *
     * Standalone components should specify `rawImports` as this information is not available from
     * their type. The consumer (e.g., {@link getStandaloneDefFunctions}) is expected to pass this
     * parameter.
     *
     * The implementation is expected to use some caching mechanism in order to optimize the resources
     * needed to do this computation.
     */
    getComponentDependencies(cmp: ComponentType<any>, rawImports?: (Type$1<any> | (() => Type$1<any>))[]): ComponentDependencies;
    /**
     * Registers an NgModule into the tracker with the given scope info.
     *
     * This method should be called for every NgModule whether it is compiled in local mode or not.
     * This is needed in order to compute component's dependencies as some dependencies might be in
     * different compilation units with different compilation mode.
     */
    registerNgModule(type: Type$1<any>, scopeInfo: NgModuleScopeInfoFromDecorator): void;
    /**
     * Clears the scope cache for NgModule or standalone component. This will force re-calculation of
     * the scope, which could be an expensive operation as it involves aggregating transitive closure.
     *
     * The main application of this method is for test beds where we want to clear the cache to
     * enforce scope update after overriding.
     */
    clearScopeCacheFor(type: Type$1<any>): void;
    /**
     * Returns the scope of NgModule. Mainly to be used by JIT and test bed.
     *
     * The scope value here is memoized. To enforce a new calculation bust the cache by using
     * `clearScopeCacheFor` method.
     */
    getNgModuleScope(type: NgModuleType<any>): NgModuleScope;
    /**
     * Returns the scope of standalone component. Mainly to be used by JIT. This method should be
     * called lazily after the initial parsing so that all the forward refs can be resolved.
     *
     * @param rawImports the imports statement as appears on the component decorate which consists of
     *     Type as well as forward refs.
     *
     * The scope value here is memoized. To enforce a new calculation bust the cache by using
     * `clearScopeCacheFor` method.
     */
    getStandaloneComponentScope(type: ComponentType<any>, rawImports: (Type$1<any> | (() => Type$1<any>))[]): StandaloneComponentScope;
    /**
     * Checks if the NgModule declaring the component is not loaded into the browser yet. Always
     * returns false for standalone components.
     */
    isOrphanComponent(cmp: ComponentType<any>): boolean;
}

/**
 * An implementation of DepsTrackerApi which will be used for JIT and local compilation.
 */
declare class DepsTracker implements DepsTrackerApi {
    private ownerNgModule;
    private ngModulesWithSomeUnresolvedDecls;
    private ngModulesScopeCache;
    private standaloneComponentsScopeCache;
    /**
     * Attempts to resolve ng module's forward ref declarations as much as possible and add them to
     * the `ownerNgModule` map. This method normally should be called after the initial parsing when
     * all the forward refs are resolved (e.g., when trying to render a component)
     */
    private resolveNgModulesDecls;
    /** @override */
    getComponentDependencies(type: ComponentType<any>, rawImports?: RawScopeInfoFromDecorator[]): ComponentDependencies;
    /**
     * @override
     * This implementation does not make use of param scopeInfo since it assumes the scope info is
     * already added to the type itself through methods like {@link ɵɵsetNgModuleScope}
     */
    registerNgModule(type: Type$1<any>, scopeInfo: NgModuleScopeInfoFromDecorator): void;
    /** @override */
    clearScopeCacheFor(type: Type$1<any>): void;
    /** @override */
    getNgModuleScope(type: NgModuleType<any>): NgModuleScope;
    /** Compute NgModule scope afresh. */
    private computeNgModuleScope;
    /** @override */
    getStandaloneComponentScope(type: ComponentType<any>, rawImports?: RawScopeInfoFromDecorator[]): StandaloneComponentScope;
    private computeStandaloneComponentScope;
    /** @override */
    isOrphanComponent(cmp: Type$1<any>): boolean;
}
/** The deps tracker to be used in the current Angular app in dev mode. */
declare const depsTracker: DepsTracker;

declare const NG_COMP_DEF: string;
declare const NG_DIR_DEF: string;
declare const NG_PIPE_DEF: string;
declare const NG_MOD_DEF: string;
/**
 * If a directive is diPublic, bloomAdd sets a property on the type with this constant as
 * the key and the directive's unique ID as the value. This allows us to map directives to their
 * bloom filter bit for DI.
 */
declare const NG_ELEMENT_ID: string;

type Type = Function;
type OpaqueValue = unknown;
declare enum FactoryTarget {
    Directive = 0,
    Component = 1,
    Injectable = 2,
    Pipe = 3,
    NgModule = 4,
    Service = 5
}
interface R3DeclareDependencyMetadataFacade {
    token: OpaqueValue;
    attribute?: boolean;
    host?: boolean;
    optional?: boolean;
    self?: boolean;
    skipSelf?: boolean;
}
interface R3HostDirectiveMetadataFacade {
    directive: Type;
    inputs?: string[];
    outputs?: string[];
}
type LegacyInputPartialMapping = string | [bindingPropertyName: string, classPropertyName: string, transformFunction?: Function];
interface R3DeclareDirectiveFacade {
    selector?: string;
    type: Type;
    version: string;
    inputs?: {
        [fieldName: string]: {
            classPropertyName: string;
            publicName: string;
            isSignal: boolean;
            isRequired: boolean;
            transformFunction: Function | null;
        } | LegacyInputPartialMapping;
    };
    outputs?: {
        [classPropertyName: string]: string;
    };
    host?: {
        attributes?: {
            [key: string]: OpaqueValue;
        };
        listeners?: {
            [key: string]: string;
        };
        properties?: {
            [key: string]: string;
        };
        classAttribute?: string;
        styleAttribute?: string;
    };
    queries?: R3DeclareQueryMetadataFacade[];
    viewQueries?: R3DeclareQueryMetadataFacade[];
    providers?: OpaqueValue;
    exportAs?: string[];
    usesInheritance?: boolean;
    usesOnChanges?: boolean;
    controlCreate?: {
        passThroughInput: string | null;
    };
    isStandalone?: boolean;
    isSignal?: boolean;
    hostDirectives?: R3HostDirectiveMetadataFacade[] | null;
    legacyOptionalChaining?: boolean;
}
interface R3DeclareComponentFacade extends R3DeclareDirectiveFacade {
    template: string;
    isInline?: boolean;
    styles?: string[];
    dependencies?: R3DeclareTemplateDependencyFacade[];
    components?: R3DeclareDirectiveDependencyFacade[];
    directives?: R3DeclareDirectiveDependencyFacade[];
    pipes?: {
        [pipeName: string]: OpaqueValue | (() => OpaqueValue);
    };
    deferBlockDependencies?: (() => Promise<Type> | null)[];
    viewProviders?: OpaqueValue;
    animations?: OpaqueValue;
    changeDetection?: ChangeDetectionStrategy;
    encapsulation?: ViewEncapsulation;
    preserveWhitespaces?: boolean;
}
type R3DeclareTemplateDependencyFacade = {
    kind: string;
} & (R3DeclareDirectiveDependencyFacade | R3DeclarePipeDependencyFacade | R3DeclareNgModuleDependencyFacade);
interface R3DeclareDirectiveDependencyFacade {
    kind?: 'directive' | 'component';
    selector: string;
    type: OpaqueValue | (() => OpaqueValue);
    inputs?: string[];
    outputs?: string[];
    exportAs?: string[];
}
interface R3DeclarePipeDependencyFacade {
    kind?: 'pipe';
    name: string;
    type: OpaqueValue | (() => OpaqueValue);
}
interface R3DeclareNgModuleDependencyFacade {
    kind: 'ngmodule';
    type: OpaqueValue | (() => OpaqueValue);
}
interface R3DeclareFactoryFacade {
    type: Type;
    deps: R3DeclareDependencyMetadataFacade[] | 'invalid' | null;
    target: FactoryTarget;
}
interface R3DeclareInjectableFacade {
    type: Type;
    providedIn?: Type | 'root' | 'platform' | 'any' | null;
    useClass?: OpaqueValue;
    useFactory?: OpaqueValue;
    useExisting?: OpaqueValue;
    useValue?: OpaqueValue;
    deps?: R3DeclareDependencyMetadataFacade[];
}
interface R3DeclareServiceFacade {
    type: Type;
    autoProvided?: boolean;
    factory?: OpaqueValue;
}
declare enum ViewEncapsulation {
    Emulated = 0,
    None = 2,
    ShadowDom = 3,
    ExperimentalIsolatedShadowDom = 4
}
type ChangeDetectionStrategy = number;
interface R3DeclareQueryMetadataFacade {
    propertyName: string;
    first?: boolean;
    predicate: OpaqueValue | string[];
    descendants?: boolean;
    read?: OpaqueValue;
    static?: boolean;
    emitDistinctChangesOnly?: boolean;
    isSignal?: boolean;
}
interface R3DeclareInjectorFacade {
    type: Type;
    imports?: OpaqueValue[];
    providers?: OpaqueValue[];
}
interface R3DeclareNgModuleFacade {
    type: Type;
    bootstrap?: OpaqueValue[] | (() => OpaqueValue[]);
    declarations?: OpaqueValue[] | (() => OpaqueValue[]);
    imports?: OpaqueValue[] | (() => OpaqueValue[]);
    exports?: OpaqueValue[] | (() => OpaqueValue[]);
    schemas?: OpaqueValue[];
    id?: OpaqueValue;
}
interface R3DeclarePipeFacade {
    type: Type;
    version: string;
    name: string;
    pure?: boolean;
    isStandalone?: boolean;
}

/**
 * Type of the Query metadata.
 *
 * @publicApi
 */
interface Query {
    descendants: boolean;
    emitDistinctChangesOnly: boolean;
    first: boolean;
    read: any;
    isViewQuery: boolean;
    selector: any;
    static?: boolean;
}
/**
 * Base class for query metadata.
 *
 * @see {@link ContentChildren}
 * @see {@link ContentChild}
 * @see {@link ViewChildren}
 * @see {@link ViewChild}
 *
 * @publicApi
 */
declare abstract class Query {
}
/**
 * Type of the ContentChildren decorator / constructor function.
 *
 * @see {@link ContentChildren}
 * @publicApi
 */
interface ContentChildrenDecorator {
    /**
     * @description
     * Property decorator that configures a content query.
     *
     * Use to get the `QueryList` of elements or directives from the content DOM.
     * Any time a child element is added, removed, or moved, the query list will be
     * updated, and the changes observable of the query list will emit a new value.
     *
     * Content queries are set before the `ngAfterContentInit` callback is called.
     *
     * Does not retrieve elements or directives that are in other components' templates,
     * since a component's template is always a black box to its ancestors.
     *
     * **Metadata Properties**:
     *
     * * **selector** - The directive type or the name used for querying.
     * * **descendants** - If `true` include all descendants of the element. If `false` then only
     * query direct children of the element.
     * * **emitDistinctChangesOnly** - The ` QueryList#changes` observable will emit new values only
     *   if the QueryList result has changed. When `false` the `changes` observable might emit even
     *   if the QueryList has not changed.
     *   **Note:** This config option is **deprecated**, it will be permanently set to `true` and
     *   removed in future versions of Angular.
     * * **read** - Used to read a different token from the queried elements.
     *
     * The following selectors are supported.
     *   * Any class with the `@Component` or `@Directive` decorator
     *   * A template reference variable as a string (e.g. query `<my-component #cmp></my-component>`
     * with `@ContentChildren('cmp')`)
     *   * Any provider defined in the child component tree of the current component (e.g.
     * `@ContentChildren(SomeService) someService: SomeService`)
     *   * Any provider defined through a string token (e.g. `@ContentChildren('someToken')
     * someTokenVal: any`)
     *   * A `TemplateRef` (e.g. query `<ng-template></ng-template>` with
     * `@ContentChildren(TemplateRef) template;`)
     *
     * In addition, multiple string selectors can be separated with a comma (e.g.
     * `@ContentChildren('cmp1,cmp2')`)
     *
     * The following values are supported by `read`:
     *   * Any class with the `@Component` or `@Directive` decorator
     *   * Any provider defined on the injector of the component that is matched by the `selector` of
     * this query
     *   * Any provider defined through a string token (e.g. `{provide: 'token', useValue: 'val'}`)
     *   * `TemplateRef`, `ElementRef`, `ViewContainerRef`, and `Injector`
     *
     * @usageNotes
     *
     * Here is a simple demonstration of how the `ContentChildren` decorator can be used.
     *
     * {@example core/di/ts/contentChildren/content_children_howto.ts region='HowTo'}
     *
     * ### Tab-pane example
     *
     * Here is a slightly more realistic example that shows how `ContentChildren` decorators
     * can be used to implement a tab pane component.
     *
     * {@example core/di/ts/contentChildren/content_children_example.ts region='Component'}
     *
     * @Annotation
     * @see [Content queries](guide/components/queries#decorator-content-queries)
     */
    (selector: ProviderToken<unknown> | Function | string, opts?: {
        descendants?: boolean;
        emitDistinctChangesOnly?: boolean;
        read?: any;
    }): any;
    new (selector: ProviderToken<unknown> | Function | string, opts?: {
        descendants?: boolean;
        emitDistinctChangesOnly?: boolean;
        read?: any;
    }): Query;
}
/**
 * Type of the ContentChildren metadata.
 *
 *
 * @Annotation
 * @publicApi
 */
type ContentChildren = Query;
/**
 * ContentChildren decorator and metadata.
 *
 *
 * @Annotation
 * @publicApi
 */
declare const ContentChildren: ContentChildrenDecorator;
/**
 * Type of the ContentChild decorator / constructor function.
 *
 * @publicApi
 */
interface ContentChildDecorator {
    /**
     * @description
     * Property decorator that configures a content query.
     *
     * Use to get the first element or the directive matching the selector from the content DOM.
     * If the content DOM changes, and a new child matches the selector,
     * the property will be updated.
     *
     * Does not retrieve elements or directives that are in other components' templates,
     * since a component's template is always a black box to its ancestors.
     *
     * **Metadata Properties**:
     *
     * * **selector** - The directive type or the name used for querying.
     * * **descendants** - If `true` (default) include all descendants of the element. If `false` then
     * only query direct children of the element.
     * * **read** - Used to read a different token from the queried element.
     * * **static** - True to resolve query results before change detection runs,
     * false to resolve after change detection. Defaults to false.
     *
     * The following selectors are supported.
     *   * Any class with the `@Component` or `@Directive` decorator
     *   * A template reference variable as a string (e.g. query `<my-component #cmp></my-component>`
     * with `@ContentChild('cmp')`)
     *   * Any provider defined in the child component tree of the current component (e.g.
     * `@ContentChild(SomeService) someService: SomeService`)
     *   * Any provider defined through a string token (e.g. `@ContentChild('someToken') someTokenVal:
     * any`)
     *   * A `TemplateRef` (e.g. query `<ng-template></ng-template>` with `@ContentChild(TemplateRef)
     * template;`)
     *
     * The following values are supported by `read`:
     *   * Any class with the `@Component` or `@Directive` decorator
     *   * Any provider defined on the injector of the component that is matched by the `selector` of
     * this query
     *   * Any provider defined through a string token (e.g. `{provide: 'token', useValue: 'val'}`)
     *   * `TemplateRef`, `ElementRef`, `ViewContainerRef`, and `Injector`
     *
     * Difference between dynamic and static queries:
     *
     * | Queries                             | Details |
     * |:---                                 |:---     |
     * | Dynamic queries \(`static: false`\) | The query resolves before the `ngAfterContentInit()`
     * callback is called. The result will be updated for changes to your view, such as changes to
     * `ngIf` and `ngFor` blocks. | | Static queries \(`static: true`\)   | The query resolves once
     * the view has been created, but before change detection runs (before the `ngOnInit()` callback
     * is called). The result, though, will never be updated to reflect changes to your view, such as
     * changes to `ngIf` and `ngFor` blocks.  |
     *
     * @usageNotes
     *
     * {@example core/di/ts/contentChild/content_child_howto.ts region='HowTo'}
     *
     * ### Example
     *
     * {@example core/di/ts/contentChild/content_child_example.ts region='Component'}
     *
     * @Annotation
     * @see [Content queries](guide/components/queries#decorator-content-queries)
     */
    (selector: ProviderToken<unknown> | Function | string, opts?: {
        descendants?: boolean;
        read?: any;
        static?: boolean;
    }): any;
    new (selector: ProviderToken<unknown> | Function | string, opts?: {
        descendants?: boolean;
        read?: any;
        static?: boolean;
    }): ContentChild;
}
/**
 * Type of the ContentChild metadata.
 *
 * @publicApi
 */
type ContentChild = Query;
/**
 * ContentChild decorator and metadata.
 *
 *
 * @Annotation
 *
 * @publicApi
 */
declare const ContentChild: ContentChildDecorator;
/**
 * Type of the ViewChildren decorator / constructor function.
 *
 * @see {@link ViewChildren}
 *
 * @publicApi
 */
interface ViewChildrenDecorator {
    /**
     * @description
     * Property decorator that configures a view query.
     *
     * Use to get the `QueryList` of elements or directives from the view DOM.
     * Any time a child element is added, removed, or moved, the query list will be updated,
     * and the changes observable of the query list will emit a new value.
     *
     * View queries are set before the `ngAfterViewInit` callback is called.
     *
     * **Metadata Properties**:
     *
     * * **selector** - The directive type or the name used for querying.
     * * **read** - Used to read a different token from the queried elements.
     * * **emitDistinctChangesOnly** - The ` QueryList#changes` observable will emit new values only
     *   if the QueryList result has changed. When `false` the `changes` observable might emit even
     *   if the QueryList has not changed.
     *   **Note:** This config option is **deprecated**, it will be permanently set to `true` and
     * removed in future versions of Angular.
     *
     * The following selectors are supported.
     *   * Any class with the `@Component` or `@Directive` decorator
     *   * A template reference variable as a string (e.g. query `<my-component #cmp></my-component>`
     * with `@ViewChildren('cmp')`)
     *   * Any provider defined in the child component tree of the current component (e.g.
     * `@ViewChildren(SomeService) someService!: SomeService`)
     *   * Any provider defined through a string token (e.g. `@ViewChildren('someToken')
     * someTokenVal!: any`)
     *   * A `TemplateRef` (e.g. query `<ng-template></ng-template>` with `@ViewChildren(TemplateRef)
     * template;`)
     *
     * In addition, multiple string selectors can be separated with a comma (e.g.
     * `@ViewChildren('cmp1,cmp2')`)
     *
     * The following values are supported by `read`:
     *   * Any class with the `@Component` or `@Directive` decorator
     *   * Any provider defined on the injector of the component that is matched by the `selector` of
     * this query
     *   * Any provider defined through a string token (e.g. `{provide: 'token', useValue: 'val'}`)
     *   * `TemplateRef`, `ElementRef`, `ViewContainerRef`, and `Injector`
     *
     * @usageNotes
     *
     * {@example core/di/ts/viewChildren/view_children_howto.ts region='HowTo'}
     *
     * ### Another example
     *
     * {@example core/di/ts/viewChildren/view_children_example.ts region='Component'}
     *
     * @Annotation
     * @see [View queries](guide/components/queries#decorator-view-queries)
     */
    (selector: ProviderToken<unknown> | Function | string, opts?: {
        read?: any;
        emitDistinctChangesOnly?: boolean;
    }): any;
    new (selector: ProviderToken<unknown> | Function | string, opts?: {
        read?: any;
        emitDistinctChangesOnly?: boolean;
    }): ViewChildren;
}
/**
 * Type of the ViewChildren metadata.
 *
 * @publicApi
 */
type ViewChildren = Query;
/**
 * ViewChildren decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
declare const ViewChildren: ViewChildrenDecorator;
/**
 * Type of the ViewChild decorator / constructor function.
 *
 * @see {@link ViewChild}
 * @publicApi
 */
interface ViewChildDecorator {
    /**
     * @description
     * Property decorator that configures a view query.
     * The change detector looks for the first element or the directive matching the selector
     * in the view DOM. If the view DOM changes, and a new child matches the selector,
     * the property is updated.
     *
     * **Metadata Properties**:
     *
     * * **selector** - The directive type or the name used for querying.
     * * **read** - Used to read a different token from the queried elements.
     * * **static** - `true` to resolve query results before change detection runs,
     * `false` to resolve after change detection. Defaults to `false`.
     *
     *
     * The following selectors are supported.
     *   * Any class with the `@Component` or `@Directive` decorator
     *   * A template reference variable as a string (e.g. query `<my-component #cmp></my-component>`
     * with `@ViewChild('cmp')`)
     *   * Any provider defined in the child component tree of the current component (e.g.
     * `@ViewChild(SomeService) someService: SomeService`)
     *   * Any provider defined through a string token (e.g. `@ViewChild('someToken') someTokenVal:
     * any`)
     *   * A `TemplateRef` (e.g. query `<ng-template></ng-template>` with `@ViewChild(TemplateRef)
     * template;`)
     *
     * The following values are supported by `read`:
     *   * Any class with the `@Component` or `@Directive` decorator
     *   * Any provider defined on the injector of the component that is matched by the `selector` of
     * this query
     *   * Any provider defined through a string token (e.g. `{provide: 'token', useValue: 'val'}`)
     *   * `TemplateRef`, `ElementRef`, `ViewContainerRef`, and `Injector`
     *
     * Difference between dynamic and static queries:
     *   * Dynamic queries \(`static: false`\) - The query resolves before the `ngAfterViewInit()`
     * callback is called. The result will be updated for changes to your view, such as changes to
     * `ngIf` and `ngFor` blocks.
     *   * Static queries \(`static: true`\) - The query resolves once
     * the view has been created, but before change detection runs (before the `ngOnInit()` callback
     * is called). The result, though, will never be updated to reflect changes to your view, such as
     * changes to `ngIf` and `ngFor` blocks.
     *
     * @usageNotes
     *
     * ### Example 1
     *
     * {@example core/di/ts/viewChild/view_child_example.ts region='Component'}
     *
     * ### Example 2
     *
     * {@example core/di/ts/viewChild/view_child_howto.ts region='HowTo'}
     *
     * @Annotation
     * @see [View queries](guide/components/queries#decorator-view-queries)
     */
    (selector: ProviderToken<unknown> | Function | string, opts?: {
        read?: any;
        static?: boolean;
    }): any;
    new (selector: ProviderToken<unknown> | Function | string, opts?: {
        read?: any;
        static?: boolean;
    }): ViewChild;
}
/**
 * Type of the ViewChild metadata.
 *
 * @publicApi
 */
type ViewChild = Query;
/**
 * ViewChild decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
declare const ViewChild: ViewChildDecorator;

/**
 * Compile an Angular component according to its decorator metadata, and patch the resulting
 * component def (ɵcmp) onto the component type.
 *
 * Compilation may be asynchronous (due to the need to resolve URLs for the component template or
 * other resources, for example). In the event that compilation is not immediate, `compileComponent`
 * will enqueue resource resolution into a global queue and will fail to return the `ɵcmp`
 * until the global queue has been resolved with a call to `resolveComponentResources`.
 */
declare function compileComponent(type: Type$1<any>, metadata: Component): void;
/**
 * Compile an Angular directive according to its decorator metadata, and patch the resulting
 * directive def onto the component type.
 *
 * In the event that compilation is not immediate, `compileDirective` will return a `Promise` which
 * will resolve when compilation completes and the directive becomes usable.
 */
declare function compileDirective(type: Type$1<any>, directive: Directive | null): void;

declare function resetJitOptions(): void;

/**
 * Loops over queued module definitions, if a given module definition has all of its
 * declarations resolved, it dequeues that module definition and sets the scope on
 * its declarations.
 */
declare function flushModuleScopingQueueAsMuchAsPossible(): void;
/**
 * Compiles a module in JIT mode.
 *
 * This function automatically gets called when a class has a `@NgModule` decorator.
 */
declare function compileNgModule(moduleType: Type$1<any>, ngModule?: NgModule): void;
/**
 * Compiles and adds the `ɵmod`, `ɵfac` and `ɵinj` properties to the module class.
 *
 * It's possible to compile a module via this API which will allow duplicate declarations in its
 * root.
 */
declare function compileNgModuleDefs(moduleType: NgModuleType, ngModule: NgModule, allowDuplicateDeclarationsInRoot?: boolean): void;
declare function generateStandaloneInDeclarationsError(type: Type$1<any>, location: string): string;
declare function resetCompiledComponents(): void;
/**
 * Patch the definition of a component with directives and pipes from the compilation scope of
 * a given module.
 */
declare function patchComponentDefWithScope<C>(componentDef: ComponentDef<C>, transitiveScopes: NgModuleTransitiveScopes): void;
/**
 * Compute the pair of transitive scopes (compilation scope and exported scope) for a given type
 * (either a NgModule or a standalone component / directive / pipe).
 */
declare function transitiveScopesFor<T>(type: Type$1<T>): NgModuleTransitiveScopes;

/**
 * Compiles a partial directive declaration object into a full directive definition object.
 *
 * @codeGenApi
 */
declare function ɵɵngDeclareDirective(decl: R3DeclareDirectiveFacade): unknown;
/**
 * Evaluates the class metadata declaration.
 *
 * @codeGenApi
 */
declare function ɵɵngDeclareClassMetadata(decl: {
    type: Type$1<any>;
    decorators: any[];
    ctorParameters?: () => any[];
    propDecorators?: {
        [field: string]: any;
    };
}): void;
/**
 * Evaluates the class metadata of a component that contains deferred blocks.
 *
 * @codeGenApi
 */
declare function ɵɵngDeclareClassMetadataAsync(decl: {
    type: Type$1<any>;
    resolveDeferredDeps: () => Promise<Type$1<unknown>>[];
    resolveMetadata: (...types: Type$1<unknown>[]) => {
        decorators: any[];
        ctorParameters: (() => any[]) | null;
        propDecorators: {
            [field: string]: any;
        } | null;
    };
}): void;
/**
 * Compiles a partial component declaration object into a full component definition object.
 *
 * @codeGenApi
 */
declare function ɵɵngDeclareComponent(decl: R3DeclareComponentFacade): unknown;
/**
 * Compiles a partial pipe declaration object into a full pipe definition object.
 *
 * @codeGenApi
 */
declare function ɵɵngDeclareFactory(decl: R3DeclareFactoryFacade): unknown;
/**
 * Compiles a partial injectable declaration object into a full injectable definition object.
 *
 * @codeGenApi
 */
declare function ɵɵngDeclareInjectable(decl: R3DeclareInjectableFacade): unknown;

/**
 * Compiles a partial injector declaration object into a full injector definition object.
 *
 * @codeGenApi
 */
declare function ɵɵngDeclareInjector(decl: R3DeclareInjectorFacade): unknown;
/**
 * Compiles a partial NgModule declaration object into a full NgModule definition object.
 *
 * @codeGenApi
 */
declare function ɵɵngDeclareNgModule(decl: R3DeclareNgModuleFacade): unknown;
/**
 * Compiles a partial pipe declaration object into a full pipe definition object.
 *
 * @codeGenApi
 */
declare function ɵɵngDeclarePipe(decl: R3DeclarePipeFacade): unknown;
/**
 * Compiles a partial service declaration object into a full service definition object.
 *
 * @codeGenApi
 */
declare function ɵɵngDeclareService(decl: R3DeclareServiceFacade): unknown;

declare function compilePipe(type: Type$1<any>, meta: Pipe): void;

declare function isNgModule<T>(value: Type$1<T>): value is Type$1<T> & {
    ɵmod: NgModuleDef<T>;
};

declare enum ControlFlowBlockType {
    Defer = 0,
    For = 1
}
interface ControlFlowBlockDataBase {
    /** The comment host/container node next to which all of the root nodes are rendered. */
    hostNode: Node;
    /** Element root nodes that are currently being shown in the block. */
    rootNodes: Node[];
}
/** Retrieved information about a `@defer` block. */
interface DeferBlockData extends ControlFlowBlockDataBase {
    type: ControlFlowBlockType.Defer;
    /** Current state of the block. */
    state: 'placeholder' | 'loading' | 'complete' | 'error' | 'initial';
    /** Hydration state of the block. */
    incrementalHydrationState: 'not-configured' | 'hydrated' | 'dehydrated';
    /** Wherther the block has a connected `@error` block. */
    hasErrorBlock: boolean;
    /** Information about the connected `@loading` block. */
    loadingBlock: {
        /** Whether the block is defined. */
        exists: boolean;
        /** Minimum amount of milliseconds that the block should be shown. */
        minimumTime: number | null;
        /** Amount of time after which the block should be shown. */
        afterTime: number | null;
    };
    /** Information about the connected `@placeholder` block. */
    placeholderBlock: {
        /** Whether the block is defined. */
        exists: boolean;
        /** Minimum amount of time that block should be shown. */
        minimumTime: number | null;
    };
    /** Stringified version of the block's triggers. */
    triggers: string[];
}
/** Retrieved information about a `@for` block. */
interface ForLoopBlockData extends ControlFlowBlockDataBase {
    type: ControlFlowBlockType.For;
    /** A list of items managed by the for loop. */
    items: unknown[];
    /** Whether the block has an `@empty` block. */
    hasEmptyBlock: boolean;
    /** String representation of the trackBy expression. */
    trackExpression: string;
}
/**
 * A control flow block information object.
 */
type ControlFlowBlock = DeferBlockData | ForLoopBlockData;

interface NonCoreGlobalUtils {
    ɵgetLoadedRoutes(route: any): any;
    ɵnavigateByUrl(router: any, url: string): any;
    ɵgetRouterInstance(injector: any): any;
}
/**
 * A type of the internal (meaning inside google3) global utils. This definition needs to exist
 * in a place where it can be used by DevTools and also synced into google3 and consumed internally.
 *
 * Since versioning in google3 works differently, we do not have the same constraint as
 * {@link ExternalCoreGlobalUtils}. We can change these definitions more or less as much as we want
 * without fear of breaking applications on older framework versions (note that http://go/build-horizon
 * does technically apply). The trade-off is that external Angular developers cannot use such APIs,
 * as they would be broken whenever the APIs changed.
 *
 * `InternalCoreGlobalUtils` serves as a "beta" channel for new APIs which can be implemented and supported
 * in DevTools. We can then iterate and change these APIs, landing whatever breaking changes necessary,
 * and update DevTools accordingly without actually breaking any users. Once a given function's design
 * fully validated, we can move it to {@link ExternalCoreGlobalUtils} and ship the function externally in
 * Angular. This allows fast iteration on new global utils and only applies Angular's long-lived
 * versioning constraint when we are ready to accept it.
 */
interface InternalCoreGlobalUtils {
    toggleWatchSignal(id: string): void;
}
/**
 * The set of external (meaning outside google3) global utils implemented by `@angular/core`.
 * Other packages may provided their own global utilities with their own types. Any functions
 * which have *ever* been in this set exist in long-lived public Angular versions which DevTools
 * needs to support.
 */
interface ExternalCoreGlobalUtils {
    ɵgetDependenciesFromInjectable<T>(injector: Injector, token: Type$1<T> | InjectionToken<T>): {
        instance: T;
        dependencies: Omit<InjectedService, 'injectedIn'>[];
    } | undefined;
    ɵgetInjectorProviders(injector: Injector): ProviderRecord[];
    ɵgetInjectorResolutionPath(injector: Injector): Injector[];
    ɵgetInjectorMetadata(injector: Injector): {
        type: 'element';
        source: RElement;
    } | {
        type: 'environment';
        source: string | null;
    } | {
        type: 'null';
        source: null;
    } | null;
    ɵsetProfiler(profiler: Profiler | null): () => void;
    ɵgetSignalGraph(injector: Injector): DebugSignalGraph;
    ɵgetControlFlowBlocks(node: Node): ControlFlowBlock[];
    ɵgetTransferState(injector: Injector): Record<string, unknown>;
    ɵgetComponentInstanceDeepLinkId(instance: unknown): number | undefined;
    getDirectiveMetadata(directiveOrComponentInstance: any): DirectiveDebugMetadata | null;
    getComponent<T>(element: Element): T | null;
    getContext<T extends {}>(element: Element): T | null;
    getListeners(element: Element): Listener[];
    getOwningComponent<T>(elementOrDir: Element | {}): T | null;
    getHostElement(componentOrDirective: {}): Element;
    getInjector(elementOrDir: Element | {}): Injector;
    getRootComponents(elementOrDir: Element | {}): {}[];
    getDirectives(node: Node): {}[];
    applyChanges(component: {}): void;
    isSignal(value: unknown): value is Signal<unknown>;
    enableProfiling(): void;
}
/**
 * Defines the framework-agnostic `ng` global type, not just the `@angular/core` implementation.
 *
 * ExternalCoreGlobalUtils is specifically the `@angular/core` implementation, so we
 * overwrite some properties to make them more framework-agnostic.
 */
type FrameworkAgnosticGlobalUtils = ExternalCoreGlobalUtils & InternalCoreGlobalUtils & NonCoreGlobalUtils;
/**
 * Publishes the given function to `window.ng` from package other than @angular/core
 * So that it can be used from the browser console when an application is not in production.
 */
declare function publishNonCoreGlobalUtil<K extends keyof NonCoreGlobalUtils>(name: K, fn: NonCoreGlobalUtils[K]): void;

/**
 * Retrieves transfer state data from the DOM using the provided injector to get APP_ID.
 * This approach works by getting the APP_ID from the injector and then finding the
 * corresponding transfer state script tag. Internal framework keys used for hydration
 * are stripped from the result.
 *
 * @param injector - The injector to use for getting APP_ID
 * @returns The transfer state data as an object, or empty object if not available
 */
declare function getTransferState(injector: Injector): Record<string, unknown>;

/**
 * An `html` sanitizer which converts untrusted `html` **string** into trusted string by removing
 * dangerous content.
 *
 * This method parses the `html` and locates potentially dangerous content (such as urls and
 * javascript) and removes it.
 *
 * It is possible to mark a string as trusted by calling {@link bypassSanitizationTrustHtml}.
 *
 * @param unsafeHtml untrusted `html`, typically from the user.
 * @returns `html` string which is safe to display to user, because all of the dangerous javascript
 * and urls have been removed.
 *
 * @codeGenApi
 */
declare function ɵɵsanitizeHtml(unsafeHtml: any, tagName?: string, propName?: string): TrustedHTML | string;
/**
 * A `style` sanitizer which converts untrusted `style` **string** into trusted string by removing
 * dangerous content.
 *
 * It is possible to mark a string as trusted by calling {@link bypassSanitizationTrustStyle}.
 *
 * @param unsafeStyle untrusted `style`, typically from the user.
 * @returns `style` string which is safe to bind to the `style` properties.
 *
 * @codeGenApi
 */
declare function ɵɵsanitizeStyle(unsafeStyle: any): string;
/**
 * A `url` sanitizer which converts untrusted `url` **string** into trusted string by removing
 * dangerous
 * content.
 *
 * This method parses the `url` and locates potentially dangerous content (such as javascript) and
 * removes it.
 *
 * It is possible to mark a string as trusted by calling {@link bypassSanitizationTrustUrl}.
 *
 * @param unsafeUrl untrusted `url`, typically from the user.
 * @returns `url` string which is safe to bind to the `src` properties such as `<img src>`, because
 * all of the dangerous javascript has been removed.
 *
 * @codeGenApi
 */
declare function ɵɵsanitizeUrl(unsafeUrl: any): string;
/**
 * A `url` sanitizer which only lets trusted `url`s through.
 *
 * This passes only `url`s marked trusted by calling {@link bypassSanitizationTrustResourceUrl}.
 *
 * @param unsafeResourceUrl untrusted `url`, typically from the user.
 * @returns `url` string which is safe to bind to the `src` properties such as `<img src>`, because
 * only trusted `url`s have been allowed to pass.
 *
 * @codeGenApi
 */
declare function ɵɵsanitizeResourceUrl(unsafeResourceUrl: any): TrustedScriptURL | string;
/**
 * A `script` sanitizer which only lets trusted javascript through.
 *
 * This passes only `script`s marked trusted by calling {@link
 * bypassSanitizationTrustScript}.
 *
 * @param unsafeScript untrusted `script`, typically from the user.
 * @returns `url` string which is safe to bind to the `<script>` element such as `<img src>`,
 * because only trusted `scripts` have been allowed to pass.
 *
 * @codeGenApi
 */
declare function ɵɵsanitizeScript(unsafeScript: any): TrustedScript | string;
/**
 * A template tag function for promoting the associated constant literal to a
 * TrustedHTML. Interpolation is explicitly not allowed.
 *
 * @param html constant template literal containing trusted HTML.
 * @returns TrustedHTML wrapping `html`.
 *
 * @security This is a security-sensitive function and should only be used to
 * convert constant values of attributes and properties found in
 * application-provided Angular templates to TrustedHTML.
 *
 * @codeGenApi
 */
declare function ɵɵtrustConstantHtml(html: TemplateStringsArray): TrustedHTML | string;
/**
 * A template tag function for promoting the associated constant literal to a
 * TrustedScriptURL. Interpolation is explicitly not allowed.
 *
 * @param url constant template literal containing a trusted script URL.
 * @returns TrustedScriptURL wrapping `url`.
 *
 * @security This is a security-sensitive function and should only be used to
 * convert constant values of attributes and properties found in
 * application-provided Angular templates to TrustedScriptURL.
 *
 * @codeGenApi
 */
declare function ɵɵtrustConstantResourceUrl(url: TemplateStringsArray): TrustedScriptURL | string;
/**
 * Sanitizes URL, selecting sanitizer function based on tag and property names.
 *
 * This function is used in case we can't define security context at compile time, when only prop
 * name is available. This happens when we generate host bindings for Directives/Components. The
 * host element is unknown at compile time, so we defer calculation of specific sanitizer to
 * runtime.
 *
 * @param unsafeUrl untrusted `url`, typically from the user.
 * @param tag target element tag name.
 * @param prop name of the property that contains the value.
 * @returns `url` string which is safe to bind.
 *
 * @codeGenApi
 */
declare function ɵɵsanitizeUrlOrResourceUrl(unsafeUrl: any, tag: string, prop: string): any;
/**
 * Validates that the attribute binding is safe to use.
 *
 * @param value The value of the attribute.
 * @param tagName The name of the tag.
 * @param attributeName The name of the attribute.
 */
declare function ɵɵvalidateAttribute<T = any>(value: T, tagName: string, attributeName: string): T;

/**
 * Service which configures custom 'on idle' behavior for Angular features like `@defer`.
 *
 * @publicApi
 *
 * @see [Customizing `idle` behavior](guide/templates/defer#customizing-idle-behavior)
 *
 */
interface IdleService {
    /**
     * Schedule `callback` to be executed when the current application or browser is considered idle.
     *
     * @returns an id which allows the scheduled callback to be cancelled before it executes.
     */
    requestOnIdle(callback: (deadline?: IdleDeadline) => void, options?: IdleRequestOptions): number;
    /**
     * Cancel a previously scheduled callback using the id associated with it.
     */
    cancelOnIdle(id: number): void;
}
/**
 * Configures Angular to use the given DI token as its `IdleService`.
 *
 * The given token must be available for injection from the root injector, and the injected value
 * must implement the `IdleService` interface.
 *
 * @publicApi
 *
 * @see [Customizing `idle` behavior](guide/templates/defer#customizing-idle-behavior)
 */
declare function provideIdleServiceWith(useExisting: AbstractType<IdleService> | InjectionToken<IdleService>): EnvironmentProviders;

/**
 * A DI Token representing the main rendering context.
 * In a browser and SSR this is the DOM Document.
 * When using SSR, that document is created by [Domino](https://github.com/angular/domino).
 *
 * @see [Accessing Document via DI](guide/ssr#accessing-document-via-di)
 *
 * @publicApi
 */
declare const DOCUMENT: InjectionToken<Document>;

/**
 * Provide this token to set the locale of your application.
 * It is used for i18n extraction, by i18n pipes (DatePipe, I18nPluralPipe, CurrencyPipe,
 * DecimalPipe and PercentPipe) and by ICU expressions.
 *
 * See the [i18n guide](guide/i18n/locale-id) for more information.
 *
 * @usageNotes
 * ### Example
 * In standalone apps:
 * ```ts
 * import { LOCALE_ID, ApplicationConfig } from '@angular/core';
 * import { AppModule } from './app/app.module';
 *
 * const appConfig: ApplicationConfig = {
 *   providers: [{provide: LOCALE_ID, useValue: 'en-US' }]
 * };
 * ```
 *
 * In module based apps:
 * ```ts
 * import { LOCALE_ID } from '@angular/core';
 * import { platformBrowser } from '@angular/platform-browser';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowser().bootstrapModule(AppModule, {
 *   providers: [{provide: LOCALE_ID, useValue: 'en-US' }]
 * });
 * ```
 *
 * @publicApi
 * @see [Import global variants of the locale data](guide/i18n/import-global-variants)
 */
declare const LOCALE_ID: InjectionToken<string>;
/**
 * Provide this token to set the default currency code your application uses for
 * CurrencyPipe when there is no currency code passed into it. This is only used by
 * CurrencyPipe and has no relation to locale currency. Defaults to USD if not configured.
 *
 * See the [i18n guide](guide/i18n/locale-id) for more information.
 *
 * <div class="docs-alert docs-alert-helpful">
 *
 * The default currency code is currently always `USD`.
 *
 * If you need the previous behavior then set it by creating a `DEFAULT_CURRENCY_CODE` provider in
 * your application `NgModule`:
 *
 * ```ts
 * {provide: DEFAULT_CURRENCY_CODE, useValue: 'USD'}
 * ```
 *
 * </div>
 *
 * @usageNotes
 * ### Example
 * In standalone apps:
 * ```ts
 * import { LOCALE_ID, ApplicationConfig } from '@angular/core';
 *
 * const appConfig: ApplicationConfig = {
 *   providers: [{provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }]
 * };
 * ```
 *
 * In module based apps:
 * ```ts
 * import { platformBrowser } from '@angular/platform-browser';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowser().bootstrapModule(AppModule, {
 *   providers: [{provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }]
 * });
 * ```
 *
 * @publicApi
 */
declare const DEFAULT_CURRENCY_CODE: InjectionToken<string>;
/**
 * Use this token at bootstrap to provide the content of your translation file (`xtb`,
 * `xlf` or `xlf2`) when you want to translate your application in another language.
 *
 * See the [i18n guide](guide/i18n/merge) for more information.
 *
 * @usageNotes
 * ### Example
 * In standalone apps:
 * ```ts
 * import { LOCALE_ID, ApplicationConfig } from '@angular/core';
 *
 * const appConfig: ApplicationConfig = {
 *   providers: [{provide: TRANSLATIONS, useValue: translations }]
 * };
 * ```
 *
 * In module based apps:
 * ```ts
 * import { TRANSLATIONS } from '@angular/core';
 * import { platformBrowser } from '@angular/platform-browser';
 * import { AppModule } from './app/app.module';
 *
 * // content of your translation file
 * const translations = '....';
 *
 * platformBrowser().bootstrapModule(AppModule, {
 *   providers: [{provide: TRANSLATIONS, useValue: translations }]
 * });
 * ```
 *
 * @publicApi
 */
declare const TRANSLATIONS: InjectionToken<string>;
/**
 * Provide this token at bootstrap to set the format of your {@link TRANSLATIONS}: `xtb`,
 * `xlf` or `xlf2`.
 *
 * See the [i18n guide](guide/i18n/merge) for more information.
 *
 * @usageNotes
 * ### Example
 * In standalone apps:
 * ```ts
 * import { LOCALE_ID, ApplicationConfig } from '@angular/core';
 *
 * const appConfig: ApplicationConfig = {
 *   providers: [{provide: TRANSLATIONS_FORMAT, useValue: 'xlf' }]
 * };
 * ```
 *
 * In module based apps: *
 * ```ts
 * import { TRANSLATIONS_FORMAT } from '@angular/core';
 * import { platformBrowser } from '@angular/platform-browser';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowser().bootstrapModule(AppModule, {
 *   providers: [{provide: TRANSLATIONS_FORMAT, useValue: 'xlf' }]
 * });
 * ```
 *
 * @publicApi
 */
declare const TRANSLATIONS_FORMAT: InjectionToken<string>;
/**
 * Use this enum at bootstrap as an option of `bootstrapModule` to define the strategy
 * that the compiler should use in case of missing translations:
 * - Error: throw if you have missing translations.
 * - Warning (default): show a warning in the console and/or shell.
 * - Ignore: do nothing.
 *
 * See the [i18n guide](guide/i18n/merge#report-missing-translations) for more information.
 *
 * @usageNotes
 * ### Example
 * ```ts
 * import { MissingTranslationStrategy } from '@angular/core';
 * import { platformBrowser } from '@angular/platform-browser';
 * import { AppModule } from './app/app.module';
 *
 * platformBrowser().bootstrapModule(AppModule, {
 *   missingTranslation: MissingTranslationStrategy.Error
 * });
 * ```
 *
 * @publicApi
 */
declare enum MissingTranslationStrategy {
    Error = 0,
    Warning = 1,
    Ignore = 2
}

/**
 * Type of the Attribute decorator / constructor function.
 *
 * @publicApi
 */
interface AttributeDecorator {
    /**
     * Parameter decorator for a directive constructor that designates
     * a host-element attribute whose value is injected as a constant string literal.
     *
     * @usageNotes
     *
     * Suppose we have an `<input>` element and want to know its `type`.
     *
     * ```html
     * <input type="text">
     * ```
     *
     * The following example uses the decorator to inject the string literal `text` in a directive.
     *
     * {@example core/ts/metadata/metadata.ts region='attributeMetadata'}
     *
     * The following example uses the decorator in a component constructor.
     *
     * {@example core/ts/metadata/metadata.ts region='attributeFactory'}
     *
     */
    (name: string): any;
    new (name: string): Attribute;
}
/**
 * Type of the Attribute metadata.
 *
 * @publicApi
 */
interface Attribute {
    /**
     * The name of the attribute whose value can be injected.
     */
    attributeName: string;
}
/**
 * Attribute decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
declare const Attribute: AttributeDecorator;

/**
 * @description
 * Hook for manual bootstrapping of the application instead of using `bootstrap` array in @NgModule
 * annotation. This hook is invoked only when the `bootstrap` array is empty or not provided.
 *
 * Reference to the current application is provided as a parameter.
 *
 * See ["Bootstrapping"](/guide/ngmodules/overview#bootstrapping-an-application).
 *
 * @usageNotes
 * The example below uses `ApplicationRef.bootstrap()` to render the
 * `AppComponent` on the page.
 *
 * ```ts
 * class AppModule implements DoBootstrap {
 *   ngDoBootstrap(appRef: ApplicationRef) {
 *     appRef.bootstrap(AppComponent); // Or some other component
 *   }
 * }
 * ```
 *
 * @publicApi
 */
interface DoBootstrap {
    ngDoBootstrap(appRef: ApplicationRef): void;
}

/**
 * Enables the logic to produce `ng-reflect-*` attributes on elements with bindings.
 *
 * Note: this is a dev-mode only setting and it will have no effect in production mode.
 * In production mode, the `ng-reflect-*` attributes are *never* produced by Angular.
 *
 * Important: using and relying on the `ng-reflect-*` attributes is not recommended,
 * they are deprecated and only present for backwards compatibility. Angular will stop
 * producing them in one of the future versions.
 *
 * @publicApi
 */
declare function provideNgReflectAttributes(): EnvironmentProviders;

/**
 * Service that keeps track of pending tasks contributing to the stableness of Angular
 * application. While several existing Angular services (ex.: `HttpClient`) will internally manage
 * tasks influencing stability, this API gives control over stability to library and application
 * developers for specific cases not covered by Angular internals.
 *
 * The concept of stability comes into play in several important scenarios:
 * - SSR process needs to wait for the application stability before serializing and sending rendered
 * HTML;
 * - tests might want to delay assertions until the application becomes stable;
 *
 * @usageNotes
 * ```ts
 * const pendingTasks = inject(PendingTasks);
 * const taskCleanup = pendingTasks.add();
 * // do work that should block application's stability and then:
 * taskCleanup();
 * ```
 *
 *
 * @see [PendingTasks for Server Side Rendering (SSR)](guide/zoneless#pendingtasks-for-server-side-rendering-ssr)
 *
 * @publicApi 20.0
 */
declare class PendingTasks {
    private readonly internalPendingTasks;
    private readonly scheduler;
    private readonly errorHandler;
    /**
     * Adds a new task that should block application's stability.
     * @returns A cleanup function that removes a task when called.
     */
    add(): () => void;
    /**
     * Runs an asynchronous function and blocks the application's stability until the function completes.
     *
     * ```ts
     * pendingTasks.run(async () => {
     *   const userData = await fetch('/api/user');
     *   this.userData.set(userData);
     * });
     * ```
     *
     * @param fn The asynchronous function to execute
     * @developerPreview 19.0
     */
    run(fn: () => Promise<unknown>): void;
    /** @nocollapse */
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<PendingTasks>;
}

/**
 * Creates a platform.
 * Platforms must be created on launch using this function.
 *
 * @publicApi
 */
declare function createPlatform(injector: Injector): PlatformRef;
/**
 * Creates a factory for a platform. Can be used to provide or override `Providers` specific to
 * your application's runtime needs, such as `PLATFORM_INITIALIZER` and `PLATFORM_ID`.
 * @param parentPlatformFactory Another platform factory to modify. Allows you to compose factories
 * to build up configurations that might be required by different libraries or parts of the
 * application.
 * @param name Identifies the new platform factory.
 * @param providers A set of dependency providers for platforms created with the new factory.
 *
 * @publicApi
 */
declare function createPlatformFactory(parentPlatformFactory: ((extraProviders?: StaticProvider[]) => PlatformRef) | null, name: string, providers?: StaticProvider[]): (extraProviders?: StaticProvider[]) => PlatformRef;
/**
 * Checks that there is currently a platform that contains the given token as a provider.
 *
 * @publicApi
 */
declare function assertPlatform(requiredToken: any): PlatformRef;
/**
 * Returns the current platform in the browser environment. In the server environment,
 * returns `null`. If you need access to the platform information, inject `PlatformRef` in your application.
 *
 * @publicApi
 */
declare function getPlatform(): PlatformRef | null;
/**
 * Destroys the current Angular platform and all Angular applications on the page.
 * Destroys all modules and listeners registered with the platform.
 *
 * This function should not be used in a server environment, as it will be a no-op.
 *
 * @publicApi
 */
declare function destroyPlatform(): void;
/**
 * The goal of this function is to bootstrap a platform injector,
 * but avoid referencing `PlatformRef` class.
 * This function is needed for bootstrapping a Standalone Component.
 */
declare function createOrReusePlatformInjector(providers?: StaticProvider[]): Injector;
/**
 * @description
 * This function is used to provide initialization functions that will be executed upon
 * initialization of the platform injector.
 *
 * Note that the provided initializer is run in the injection context.
 *
 * @usageNotes
 * The platform initializer should be provided during platform creation:
 *
 * ```ts
 * const platformRef = platformBrowser([ providePlatformInitializer(() =>  ...) ]);
 *
 * bootstrapApplication(App, appConfig, { platformRef })
 * ```
 *
 * @publicApi
 */
declare function providePlatformInitializer(initializerFn: () => void): StaticProvider;

/**
 * This platform has to be included in any other platform
 *
 * @publicApi
 */
declare const platformCore: (extraProviders?: StaticProvider[] | undefined) => PlatformRef;

/**
 * Creates a `ComponentRef` instance based on provided component type and a set of options.
 *
 * @usageNotes
 *
 * The example below demonstrates how the `createComponent` function can be used
 * to create an instance of a ComponentRef dynamically and attach it to an ApplicationRef,
 * so that it gets included into change detection cycles.
 *
 * Note: the example uses standalone components, but the function can also be used for
 * non-standalone components (declared in an NgModule) as well.
 *
 * ```angular-ts
 * @Component({
 *   template: `Hello {{ name }}!`
 * })
 * class HelloComponent {
 *   name = 'Angular';
 * }
 *
 * @Component({
 *   template: `<div id="hello-component-host"></div>`
 * })
 * class RootComponent {}
 *
 * // Bootstrap an application.
 * const applicationRef = await bootstrapApplication(RootComponent);
 *
 * // Locate a DOM node that would be used as a host.
 * const hostElement = document.getElementById('hello-component-host');
 *
 * // Get an `EnvironmentInjector` instance from the `ApplicationRef`.
 * const environmentInjector = applicationRef.injector;
 *
 * // We can now create a `ComponentRef` instance.
 * const componentRef = createComponent(HelloComponent, {hostElement, environmentInjector});
 *
 * // Last step is to register the newly created ref using the `ApplicationRef` instance
 * // to include the component view into change detection cycles.
 * applicationRef.attachView(componentRef.hostView);
 * componentRef.changeDetectorRef.detectChanges();
 * ```
 *
 * @param component Component class reference.
 * @param options Set of options to use:
 *  * `environmentInjector`: An `EnvironmentInjector` instance to be used for the component.
 *  * `hostElement` (optional): A DOM node that should act as a host node for the component. If not
 * provided, Angular creates one based on the tag name used in the component selector (and falls
 * back to using `div` if selector doesn't have tag name info).
 *  * `elementInjector` (optional): An `ElementInjector` instance, see additional info about it
 * [here](guide/di/hierarchical-dependency-injection#elementinjector).
 *  * `projectableNodes` (optional): A list of DOM nodes that should be projected through
 * [`<ng-content>`](api/core/ng-content) of the new component instance, e.g.,
 * `[[element1, element2]]`: projects `element1` and `element2` into the same `<ng-content>`.
 * `[[element1, element2], [element3]]`: projects `element1` and `element2` into one `<ng-content>`,
 * and `element3` into a separate `<ng-content>`.
 *  * `directives` (optional): Directives that should be applied to the component.
 *  * `bindings` (optional): Bindings to apply to the root component.
 *  * `onError` (optional): A callback that will be invoked when an error occurs during the component's change detection or lifecycle hooks.
 *                        Note that this will not catch errors thrown during the component's construction.
 * @returns ComponentRef instance that represents a given Component.
 *
 * @see [Host view using `ViewContainerRef.createComponent`](guide/components/programmatic-rendering#host-view-using-viewcontainerrefcreatecomponent)
 * @see [Popup attached to `document.body` with `createComponent` + `hostElement`](guide/components/programmatic-rendering#popup-attached-to-documentbody-with-createcomponent--hostelement)
 *
 * @publicApi
 */
declare function createComponent<C>(component: Type$1<C>, options: {
    environmentInjector: EnvironmentInjector;
    hostElement?: Element;
    elementInjector?: Injector;
    projectableNodes?: Node[][];
    directives?: (Type$1<unknown> | DirectiveWithBindings<unknown>)[];
    bindings?: Binding[];
    onError?: (error: Error, details: ErrorDetails) => void;
}): ComponentRef$1<C>;
/**
 * An interface that describes the subset of component metadata
 * that can be retrieved using the `reflectComponentType` function.
 *
 * @publicApi
 */
interface ComponentMirror<C> {
    /**
     * The component's HTML selector.
     */
    get selector(): string;
    /**
     * The type of component the factory will create.
     */
    get type(): Type$1<C>;
    /**
     * The inputs of the component.
     */
    get inputs(): ReadonlyArray<{
        readonly propName: string;
        readonly templateName: string;
        readonly transform?: (value: any) => any;
        readonly isSignal: boolean;
    }>;
    /**
     * The outputs of the component.
     */
    get outputs(): ReadonlyArray<{
        readonly propName: string;
        readonly templateName: string;
    }>;
    /**
     * Selector for all <ng-content> elements in the component.
     */
    get ngContentSelectors(): ReadonlyArray<string>;
    /**
     * Whether this component is marked as standalone.
     * Note: an extra flag, not present in `ComponentFactory`.
     */
    get isStandalone(): boolean;
}
/**
 * Creates an object that allows to retrieve component metadata.
 *
 * @usageNotes
 *
 * The example below demonstrates how to use the function and how the fields
 * of the returned object map to the component metadata.
 *
 * ```angular-ts
 * @Component({
 *   selector: 'foo-component',
 *   template: `
 *     <ng-content></ng-content>
 *     <ng-content select="content-selector-a"></ng-content>
 *   `,
 * })
 * class FooComponent {
 *   @Input('inputName') inputPropName: string;
 *   @Output('outputName') outputPropName = new EventEmitter<void>();
 * }
 *
 * const mirror = reflectComponentType(FooComponent);
 * expect(mirror.type).toBe(FooComponent);
 * expect(mirror.selector).toBe('foo-component');
 * expect(mirror.isStandalone).toBe(true);
 * expect(mirror.inputs).toEqual([{propName: 'inputName', templateName: 'inputPropName'}]);
 * expect(mirror.outputs).toEqual([{propName: 'outputName', templateName: 'outputPropName'}]);
 * expect(mirror.ngContentSelectors).toEqual([
 *   '*',                 // first `<ng-content>` in a template, the selector defaults to `*`
 *   'content-selector-a' // second `<ng-content>` in a template
 * ]);
 * ```
 *
 * @param component Component class reference.
 * @returns An object that allows to retrieve component metadata.
 *
 * @publicApi
 */
declare function reflectComponentType<C>(component: Type$1<C>): ComponentMirror<C> | null;

/**
 * Creates a resource representing a debounced version of the source signal.
 *
 * @param source The source signal to debounce.
 * @param wait The amount of time to wait before calling the source signal, or a function that
 *   returns a promise that resolves when the debounced value should be updated.
 * @param options The options to use for the debounced signal.
 * @returns A resource representing the debounced signal.
 * @experimental 22.0
 *
 * @see [Debouncing signals with `debounced`](guide/signals/debounced)
 */
declare function debounced<T>(source: () => T, wait: NoInfer<DebounceTimer<T>>, options?: NoInfer<DebouncedOptions<T>>): Resource<T>;

/**
 * Creates a `Resource` driven by a source of `ResourceSnapshot`s.
 *
 * @see [Resource composition with snapshots](guide/signals/resource#resource-composition-with-snapshots)
 *
 * @experimental
 */
declare function resourceFromSnapshots<T>(source: () => ResourceSnapshot<T>): Resource<T>;

/**
 * Returns whether Angular is in development mode.
 *
 * By default, this is true, unless `enableProdMode` is invoked prior to calling this method or the
 * application is built using the Angular CLI with the `optimization` option.
 * @see {@link /cli/build ng build}
 *
 * @publicApi
 */
declare function isDevMode(): boolean;
/**
 * Disable Angular's development mode, which turns off assertions and other
 * checks within the framework.
 *
 * One important assertion this disables verifies that a change detection pass
 * does not result in additional changes to any bindings (also known as
 * unidirectional data flow).
 *
 * Using this method is discouraged as the Angular CLI will set production mode when using the
 * `optimization` option.
 * @see {@link /cli/build ng build}
 *
 * @publicApi
 */
declare function enableProdMode(): void;

/**
 * @description Represents the version of Angular
 *
 * @publicApi
 */
declare class Version {
    full: string;
    readonly major: string;
    readonly minor: string;
    readonly patch: string;
    constructor(full: string);
}
/**
 * @publicApi
 */
declare const VERSION: Version;

/**
 * The client context of a given WebMCP tool execution.
 *
 * @experimental 22.0
 */
interface Client {
    /**
     * A signal which notifies the tool when the operation is aborted. When triggered, the
     * current operation should be canceled and all allocated resources should be cleaned up.
     */
    signal: AbortSignal;
}
/**
 * The execute function of a WebMCP tool. Takes in arguments matching the associated
 * `inputSchema` and returns content for the agent. The returned result is typically a
 * `string`.
 *
 * @param args The arguments of the tool provided by the agent.
 * @param client The client context invoking the tool.
 * @returns The result of executing the tool which will be serialized and provided back
 *     to the connected agent. This is typically just a raw `string`.
 * @experimental 22.0
 */
type Execute<InputSchema extends JsonSchemaForInference> = (args: InferArgsFromInputSchema<InputSchema>, client: Client) => unknown;
/**
 * Annotations for a WebMCP tool which describe its behavior.
 *
 * @experimental 22.2
 */
interface Annotations {
    /**
     * A hint that the tool will not modify user-visible state (e.g. it will not trigger
     * a navigation, mutate the DOM, or alter data stored on a backend). Agents may be
     * more likely to use tools which are explicitly declared read-only as they are
     * safer against potential misuse.
     */
    readOnlyHint?: boolean;
    /**
     * A hint that the tool will return untrusted content from the perspective of the
     * author of the tool.
     */
    untrustedContentHint?: boolean;
    /**
     * A hint that the tool will have consequential effects like mutating state or interacting
     * with the external world.
     */
    consequentialHint?: boolean;
}
/**
 * Describes and implements a specific WebMCP tool for an agent to invoke.
 *
 * @experimental 22.0
 */
interface ToolDescriptor<InputSchema extends JsonSchemaForInference> {
    /** The unique name of this tool. */
    name: string;
    /** A description of what the tool does and how the agent should consider using it. */
    description: string;
    /**
     * A schema which describes the input arguments expected by the {@link execute} function
     * which the agent must provide.
     */
    inputSchema: InputSchema;
    /** The callback function which implements this tool. */
    execute: Execute<InputSchema>;
    /** Optional annotations describing the tool's behavior and safety properties. */
    annotations?: Annotations;
}

/**
 * Declares a WebMCP tool.
 *
 * The tool is immediately registered and automatically unregistered when
 * the associated injection context is destroyed.
 *
 * The `tool.execute` function is invoked in the injection context of the provided
 * {@link Injector}, or the injection context of `declareExperimentalWebMcpTool` itself.
 *
 * @param tool The tool to register and execute when invoked by an AI agent.
 * @param injector Optional {@link Injector} which will automatically
 *     unregister the tool when destroyed. Defaults to the current injection
 *     context if not provided.
 * @throws NG0203 when called outside an injection context and with no
 *     `injector` argument provided.
 * @experimental
 */
declare function declareExperimentalWebMcpTool<const InputSchema extends JsonSchemaForInference>(tool: ToolDescriptor<InputSchema>, injector?: Injector): Promise<void>;

/**
 * Provides a list of WebMCP tools tied to the lifecycle of the associated `Injector`.
 *
 * The tools are automatically registered when the environment is initialized
 * and unregistered when the associated injector is destroyed.
 *
 * The `tools[number].execute` function is invoked in the injection context of the
 * associated `Injector`.
 *
 * @param tools The tools to register and execute when invoked by an AI agent.
 * @returns An {@link EnvironmentProviders} that can be used in `bootstrapApplication`
 *     or route providers.
 * @experimental
 */
declare function provideExperimentalWebMcpTools<const InputSchema extends JsonSchemaForInference>(tools: ToolDescriptor<InputSchema>[]): EnvironmentProviders;

export { ANIMATION_MODULE_TYPE, APP_ID, APP_INITIALIZER, AbstractType, AfterRenderRef, AnimationFunction, ApplicationInitStatus, ApplicationModule, ApplicationRef, Attribute, Binding, CSP_NONCE, ChangeDetectionStrategy$1 as ChangeDetectionStrategy, ChangeDetectorRef, ClassProvider, ClassSansProvider, CompilerOptions, Component, ComponentRef$1 as ComponentRef, ConstructorProvider, ConstructorSansProvider, ContentChild, ContentChildren, DEFAULT_CURRENCY_CODE, DOCUMENT, DebounceTimer, DebouncedOptions, DefaultIterableDiffer, Directive, DirectiveWithBindings, ENVIRONMENT_INITIALIZER, EffectCleanupRegisterFn, ElementRef, EmbeddedViewRef, EnvironmentInjector, EnvironmentProviders, ErrorDetails, ExistingProvider, ExistingSansProvider, FactoryProvider, FactorySansProvider, HOST_TAG_NAME, Host, HostAttributeToken, INJECTOR, Inject, InjectOptions, Injectable, InjectionToken, Injector, IterableDiffers, KeyValueDiffers, LOCALE_ID, MissingTranslationStrategy, ModuleWithProviders, NgModule, NgModuleFactory$1 as NgModuleFactory, NgModuleRef$1 as NgModuleRef, NgZone, Optional, OutputRef, PLATFORM_ID, PLATFORM_INITIALIZER, PendingTasks, Pipe, PlatformRef, Provider, ProviderToken, Query, QueryList, REQUEST, REQUEST_CONTEXT, RESPONSE_INIT, Resource, ResourceOptions, ResourceParamsContext, ResourceRef, ResourceSnapshot, ResourceStatus, ResourceStreamItem, ResourceStreamingLoader, SchemaMetadata, Self, Service, Signal, SimpleChange, SkipSelf, StaticClassProvider, StaticClassSansProvider, StaticProvider, TRANSLATIONS, TRANSLATIONS_FORMAT, TemplateRef, Testability, TestabilityRegistry, TransferState, Type$1 as Type, TypeDecorator, TypeProvider, VERSION, ValueEqualityFn, ValueProvider, ValueSansProvider, Version, ViewChild, ViewChildren, ViewContainerRef, ViewEncapsulation$1 as ViewEncapsulation, ViewRef$1 as ViewRef, WritableResource, WritableSignal, afterEveryRender, afterNextRender, afterRenderEffect, assertInInjectionContext, assertNotInReactiveContext, assertPlatform, booleanAttribute, computed, contentChild, contentChildren, createComponent, createEnvironmentInjector, createNgModule, createPlatform, createPlatformFactory, debounced, declareExperimentalWebMcpTool, destroyPlatform, enableProdMode, forwardRef, getModuleFactory, getNgModuleById, getPlatform, importProvidersFrom, inject, injectAsync, input, isDevMode, isStandalone, linkedSignal, makeEnvironmentProviders, makeStateKey, mergeApplicationConfig, model, numberAttribute, onIdle, platformCore, provideAppInitializer, provideCheckNoChangesConfig, provideEnvironmentInitializer, provideExperimentalWebMcpTools, provideIdleServiceWith, provideNgReflectAttributes, providePlatformInitializer, provideStabilityDebugging, provideZoneChangeDetection, provideZonelessChangeDetection, reflectComponentType, resolveForwardRef, resource, resourceFromSnapshots, runInInjectionContext, setTestabilityGetter, untracked, viewChild, viewChildren, AcxChangeDetectionStrategy as ɵAcxChangeDetectionStrategy, AcxViewEncapsulation as ɵAcxViewEncapsulation, BypassType as ɵBypassType, CACHE_ACTIVE as ɵCACHE_ACTIVE, CLIENT_RENDER_MODE_FLAG as ɵCLIENT_RENDER_MODE_FLAG, ComponentDef as ɵComponentDef, ComponentType as ɵComponentType, Console as ɵConsole, ControlFlowBlockType as ɵControlFlowBlockType, CurrencyIndex as ɵCurrencyIndex, DEFAULT_LOCALE_ID as ɵDEFAULT_LOCALE_ID, DEFER_BLOCK_CONFIG as ɵDEFER_BLOCK_CONFIG, DEFER_BLOCK_DEPENDENCY_INTERCEPTOR as ɵDEFER_BLOCK_DEPENDENCY_INTERCEPTOR, DEHYDRATED_BLOCK_REGISTRY as ɵDEHYDRATED_BLOCK_REGISTRY, DeferBlockConfig as ɵDeferBlockConfig, DeferBlockDependencyInterceptor as ɵDeferBlockDependencyInterceptor, DeferBlockState as ɵDeferBlockState, DirectiveDef as ɵDirectiveDef, DirectiveType as ɵDirectiveType, ENABLE_ROOT_COMPONENT_BOOTSTRAP as ɵENABLE_ROOT_COMPONENT_BOOTSTRAP, EVENT_REPLAY_QUEUE as ɵEVENT_REPLAY_QUEUE, ExtraLocaleDataIndex as ɵExtraLocaleDataIndex, Framework as ɵFramework, HydrationStatus as ɵHydrationStatus, IMAGE_CONFIG as ɵIMAGE_CONFIG, IMAGE_CONFIG_DEFAULTS as ɵIMAGE_CONFIG_DEFAULTS, ɵINPUT_SIGNAL_BRAND_WRITE_TYPE, IS_ENABLED_BLOCKING_INITIAL_NAVIGATION as ɵIS_ENABLED_BLOCKING_INITIAL_NAVIGATION, IS_HYDRATION_DOM_REUSE_ENABLED as ɵIS_HYDRATION_DOM_REUSE_ENABLED, IS_INCREMENTAL_HYDRATION_ENABLED as ɵIS_INCREMENTAL_HYDRATION_ENABLED, InputSignalNode as ɵInputSignalNode, JSACTION_BLOCK_ELEMENT_MAP as ɵJSACTION_BLOCK_ELEMENT_MAP, LContext as ɵLContext, LocaleDataIndex as ɵLocaleDataIndex, NG_COMP_DEF as ɵNG_COMP_DEF, NG_DIR_DEF as ɵNG_DIR_DEF, NG_ELEMENT_ID as ɵNG_ELEMENT_ID, NG_MOD_DEF as ɵNG_MOD_DEF, NG_PIPE_DEF as ɵNG_PIPE_DEF, NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR as ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR, NO_CHANGE as ɵNO_CHANGE, NgModuleFactory as ɵNgModuleFactory, PERFORMANCE_MARK_PREFIX as ɵPERFORMANCE_MARK_PREFIX, PROVIDED_NG_ZONE as ɵPROVIDED_NG_ZONE, PendingTasksInternal as ɵPendingTasksInternal, PipeDef as ɵPipeDef, ProfilerEvent as ɵProfilerEvent, ReflectionCapabilities as ɵReflectionCapabilities, ComponentFactory as ɵRender3ComponentFactory, ComponentRef as ɵRender3ComponentRef, NgModuleRef as ɵRender3NgModuleRef, ResourceImpl as ɵResourceImpl, RuntimeError as ɵRuntimeError, RuntimeErrorCode as ɵRuntimeErrorCode, SHARED_STYLES_HOST as ɵSHARED_STYLES_HOST, SIGNAL as ɵSIGNAL, SSR_CONTENT_INTEGRITY_MARKER as ɵSSR_CONTENT_INTEGRITY_MARKER, TESTABILITY as ɵTESTABILITY, TESTABILITY_GETTER as ɵTESTABILITY_GETTER, TimerScheduler as ɵTimerScheduler, USE_PENDING_TASKS as ɵUSE_PENDING_TASKS, ViewRef as ɵViewRef, XSS_SECURITY_URL as ɵXSS_SECURITY_URL, _sanitizeHtml as ɵ_sanitizeHtml, _sanitizeUrl as ɵ_sanitizeUrl, allLeavingAnimations as ɵallLeavingAnimations, allowSanitizationBypassAndThrow as ɵallowSanitizationBypassAndThrow, annotateForHydration as ɵannotateForHydration, ɵassertType, bypassSanitizationTrustHtml as ɵbypassSanitizationTrustHtml, bypassSanitizationTrustResourceUrl as ɵbypassSanitizationTrustResourceUrl, bypassSanitizationTrustScript as ɵbypassSanitizationTrustScript, bypassSanitizationTrustStyle as ɵbypassSanitizationTrustStyle, bypassSanitizationTrustUrl as ɵbypassSanitizationTrustUrl, chain as ɵchain, clearResolutionOfComponentResourcesQueue as ɵclearResolutionOfComponentResourcesQueue, compileComponent as ɵcompileComponent, compileDirective as ɵcompileDirective, compileNgModule as ɵcompileNgModule, compileNgModuleDefs as ɵcompileNgModuleDefs, compileNgModuleFactory as ɵcompileNgModuleFactory, compilePipe as ɵcompilePipe, convertToBitFlags as ɵconvertToBitFlags, createInjector as ɵcreateInjector, createOrReusePlatformInjector as ɵcreateOrReusePlatformInjector, defaultIterableDiffers as ɵdefaultIterableDiffers, defaultKeyValueDiffers as ɵdefaultKeyValueDiffers, depsTracker as ɵdepsTracker, describeDomNode as ɵdescribeDomNode, devModeEqual as ɵdevModeEqual, disableProfiling as ɵdisableProfiling, enableProfiling as ɵenableProfiling, encapsulateResourceError as ɵencapsulateResourceError, findLocaleData as ɵfindLocaleData, flushModuleScopingQueueAsMuchAsPossible as ɵflushModuleScopingQueueAsMuchAsPossible, formatRuntimeError as ɵformatRuntimeError, generateStandaloneInDeclarationsError as ɵgenerateStandaloneInDeclarationsError, getAsyncClassMetadataFn as ɵgetAsyncClassMetadataFn, getClosestComponentName as ɵgetClosestComponentName, getComponentDef as ɵgetComponentDef, getCurrentClosestComponentInstance as ɵgetCurrentClosestComponentInstance, getDirectiveDef as ɵgetDirectiveDef, getDirectives as ɵgetDirectives, getDocument as ɵgetDocument, getHostElement as ɵgetHostElement, getLContext as ɵgetLContext, getLocaleCurrencyCode as ɵgetLocaleCurrencyCode, getLocalePluralCase as ɵgetLocalePluralCase, getSanitizationBypassType as ɵgetSanitizationBypassType, getTransferState as ɵgetTransferState, ɵgetUnknownElementStrictMode, ɵgetUnknownPropertyStrictMode, _global as ɵglobal, inferTagNameFromDefinition as ɵinferTagNameFromDefinition, internalCreateApplication as ɵinternalCreateApplication, internalProvideZoneChangeDetection as ɵinternalProvideZoneChangeDetection, isComponentDefPendingResolution as ɵisComponentDefPendingResolution, isInParamsFunction as ɵisInParamsFunction, isNgModule as ɵisNgModule, isPromise as ɵisPromise, isSubscribable as ɵisSubscribable, isViewDirty as ɵisViewDirty, markForRefresh as ɵmarkForRefresh, maybeUnwrapDefaultExport as ɵmaybeUnwrapDefaultExport, noSideEffects as ɵnoSideEffects, patchComponentDefWithScope as ɵpatchComponentDefWithScope, performanceMarkFeature as ɵperformanceMarkFeature, promiseWithResolvers as ɵpromiseWithResolvers, provideZonelessChangeDetectionInternal as ɵprovideZonelessChangeDetectionInternal, publishNonCoreGlobalUtil as ɵpublishNonCoreGlobalUtil, readHydrationInfo as ɵreadHydrationInfo, registerLocaleData as ɵregisterLocaleData, renderDeferBlockState as ɵrenderDeferBlockState, resetCompiledComponents as ɵresetCompiledComponents, resetIncrementalHydrationEnabledWarnedForTests as ɵresetIncrementalHydrationEnabledWarnedForTests, resetIncrementalHydrationRuntimeForTests as ɵresetIncrementalHydrationRuntimeForTests, resetJitOptions as ɵresetJitOptions, resolveComponentResources as ɵresolveComponentResources, restoreComponentResolutionQueue as ɵrestoreComponentResolutionQueue, setAllowDuplicateNgModuleIdsForTest as ɵsetAllowDuplicateNgModuleIdsForTest, ɵsetClassDebugInfo, setClassMetadata as ɵsetClassMetadata, setClassMetadataAsync as ɵsetClassMetadataAsync, setDocument as ɵsetDocument, setInParamsFunction as ɵsetInParamsFunction, setInjectorProfilerContext as ɵsetInjectorProfilerContext, setLocaleId as ɵsetLocaleId, ɵsetUnknownElementStrictMode, ɵsetUnknownPropertyStrictMode, startMeasuring as ɵstartMeasuring, stopMeasuring as ɵstopMeasuring, store as ɵstore, stringify as ɵstringify, transitiveScopesFor as ɵtransitiveScopesFor, triggerResourceLoading as ɵtriggerResourceLoading, truncateMiddle as ɵtruncateMiddle, unregisterAllLocaleData as ɵunregisterLocaleData, unwrapSafeValue as ɵunwrapSafeValue, withDomHydration as ɵwithDomHydration, withEventReplay as ɵwithEventReplay, withI18nSupport as ɵwithI18nSupport, withIncrementalHydration as ɵwithIncrementalHydration, ɵɵControlFeature, ɵɵExternalStylesFeature, __FactoryDeclaration as ɵɵFactoryDeclaration, FactoryTarget as ɵɵFactoryTarget, ɵɵHostDirectivesFeature, ɵɵInheritDefinitionFeature, __InjectableDeclaration as ɵɵInjectableDeclaration, __InjectorDeclaration as ɵɵInjectorDeclaration, __NgModuleDeclaration as ɵɵNgModuleDeclaration, ɵɵNgOnChangesFeature, ɵɵProvidersFeature, ɵɵadvance, ɵɵanimateEnter, ɵɵanimateEnterListener, ɵɵanimateLeave, ɵɵanimateLeaveListener, ɵɵariaProperty, ɵɵarrowFunction, ɵɵattachSourceLocations, ɵɵattribute, ɵɵboundaryCreate, ɵɵboundaryUpdate, ɵɵclassMap, ɵɵclassProp, ɵɵcomponentInstance, ɵɵconditional, ɵɵconditionalBranchCreate, ɵɵconditionalCreate, ɵɵcontentQuery, ɵɵcontentQuerySignal, ɵɵcontrol, ɵɵcontrolCreate, ɵɵdeclareLet, ɵɵdefer, ɵɵdeferEnableTimerScheduling, ɵɵdeferHydrateNever, ɵɵdeferHydrateOnHover, ɵɵdeferHydrateOnIdle, ɵɵdeferHydrateOnImmediate, ɵɵdeferHydrateOnInteraction, ɵɵdeferHydrateOnTimer, ɵɵdeferHydrateOnViewport, ɵɵdeferHydrateWhen, ɵɵdeferOnHover, ɵɵdeferOnIdle, ɵɵdeferOnImmediate, ɵɵdeferOnInteraction, ɵɵdeferOnTimer, ɵɵdeferOnViewport, ɵɵdeferPrefetchOnHover, ɵɵdeferPrefetchOnIdle, ɵɵdeferPrefetchOnImmediate, ɵɵdeferPrefetchOnInteraction, ɵɵdeferPrefetchOnTimer, ɵɵdeferPrefetchOnViewport, ɵɵdeferPrefetchWhen, ɵɵdeferWhen, ɵɵdefineComponent, ɵɵdefineDirective, ɵɵdefineNgModule, ɵɵdefinePipe, ɵɵdefineService, ɵɵdirectiveInject, ɵɵdisableBindings, ɵɵdomElement, ɵɵdomElementContainer, ɵɵdomElementContainerEnd, ɵɵdomElementContainerStart, ɵɵdomElementEnd, ɵɵdomElementStart, ɵɵdomListener, ɵɵdomProperty, ɵɵdomTemplate, ɵɵelement, ɵɵelementContainer, ɵɵelementContainerEnd, ɵɵelementContainerStart, ɵɵelementEnd, ɵɵelementStart, ɵɵenableBindings, ɵɵenableIncrementalHydrationRuntime, ɵɵforeignComponent, ɵɵforeignContent, ɵɵforeignContentFn, ɵɵgetBoundary, ɵɵgetComponentDepsFactory, ɵɵgetCurrentView, ɵɵgetInheritedFactory, ɵɵgetReplaceMetadataURL, ɵɵi18n, ɵɵi18nApply, ɵɵi18nAttributes, ɵɵi18nEnd, ɵɵi18nExp, ɵɵi18nPostprocess, ɵɵi18nStart, ɵɵinject, ɵɵinjectAttribute, ɵɵinterpolate, ɵɵinterpolate1, ɵɵinterpolate2, ɵɵinterpolate3, ɵɵinterpolate4, ɵɵinterpolate5, ɵɵinterpolate6, ɵɵinterpolate7, ɵɵinterpolate8, ɵɵinterpolateV, ɵɵinvalidFactory, ɵɵinvalidFactoryDep, ɵɵlistener, ɵɵloadQuery, ɵɵnamespaceHTML, ɵɵnamespaceMathML, ɵɵnamespaceSVG, ɵɵnextContext, ɵɵngDeclareClassMetadata, ɵɵngDeclareClassMetadataAsync, ɵɵngDeclareComponent, ɵɵngDeclareDirective, ɵɵngDeclareFactory, ɵɵngDeclareInjectable, ɵɵngDeclareInjector, ɵɵngDeclareNgModule, ɵɵngDeclarePipe, ɵɵngDeclareService, ɵɵpipe, ɵɵpipeBind1, ɵɵpipeBind2, ɵɵpipeBind3, ɵɵpipeBind4, ɵɵpipeBindV, ɵɵprojection, ɵɵprojectionDef, ɵɵproperty, ɵɵpureFunction0, ɵɵpureFunction1, ɵɵpureFunction2, ɵɵpureFunction3, ɵɵpureFunction4, ɵɵpureFunction5, ɵɵpureFunction6, ɵɵpureFunction7, ɵɵpureFunction8, ɵɵpureFunctionV, ɵɵqueryAdvance, ɵɵqueryRefresh, ɵɵreadContextLet, ɵɵreference, registerNgModuleType as ɵɵregisterNgModuleType, ɵɵrepeater, ɵɵrepeaterCreate, ɵɵrepeaterTrackByIdentity, ɵɵrepeaterTrackByIndex, ɵɵreplaceMetadata, ɵɵresetView, ɵɵresolveBody, ɵɵresolveDocument, ɵɵresolveWindow, ɵɵrestoreView, ɵɵsanitizeHtml, ɵɵsanitizeResourceUrl, ɵɵsanitizeScript, ɵɵsanitizeStyle, ɵɵsanitizeUrl, ɵɵsanitizeUrlOrResourceUrl, ɵɵsetComponentScope, ɵɵsetNgModuleScope, ɵɵstoreLet, ɵɵstyleMap, ɵɵstyleProp, ɵɵsyntheticHostListener, ɵɵsyntheticHostProperty, ɵɵtemplate, ɵɵtemplateRefExtractor, ɵɵtext, ɵɵtextInterpolate, ɵɵtextInterpolate1, ɵɵtextInterpolate2, ɵɵtextInterpolate3, ɵɵtextInterpolate4, ɵɵtextInterpolate5, ɵɵtextInterpolate6, ɵɵtextInterpolate7, ɵɵtextInterpolate8, ɵɵtextInterpolateV, ɵɵtrustConstantHtml, ɵɵtrustConstantResourceUrl, ɵɵtwoWayBindingSet, ɵɵtwoWayListener, ɵɵtwoWayProperty, ɵɵvalidateAttribute, ɵɵviewQuery, ɵɵviewQuerySignal };
export type { AfterContentChecked, AfterContentInit, AfterRenderOptions, AfterViewChecked, AfterViewInit, ApplicationConfig, AttributeDecorator, ComponentMirror, ContentChildDecorator, ContentChildFunction, ContentChildrenDecorator, CreateComputedOptions, DefaultExport, DoBootstrap, DoCheck, ForwardRefFn, GetTestability, HostDecorator, IdleService, ImportProvidersSource, InjectAsyncOptions, InjectDecorator, InjectableDecorator, InjectableProvider, InputFunction, InputOptions, InputOptionsWithTransform, InputOptionsWithoutTransform, InputSignal, InputSignalWithTransform, IterableChangeRecord, IterableChanges, IterableDiffer, IterableDifferFactory, KeyValueChangeRecord, KeyValueChanges, KeyValueDiffer, KeyValueDifferFactory, ModelFunction, ModelOptions, ModelSignal, NgIterable, NgZoneOptions, OnChanges, OnDestroy, OnInit, OptionalDecorator, PipeTransform, PrefetchTrigger, ResponseInit, SelfDecorator, ServiceDecorator, SimpleChanges, SkipSelfDecorator, StateKey, TrackByFunction, ViewChildDecorator, ViewChildFunction, ViewChildrenDecorator, Client as WebMcpClient, ToolDescriptor as WebMcpToolDescriptor, Execute as WebMcpToolExecute, AcxComponentDebugMetadata as ɵAcxComponentDebugMetadata, AcxDirectiveDebugMetadata as ɵAcxDirectiveDebugMetadata, AngularComponentDebugMetadata as ɵAngularComponentDebugMetadata, AngularDirectiveDebugMetadata as ɵAngularDirectiveDebugMetadata, BaseDirectiveDebugMetadata as ɵBaseDirectiveDebugMetadata, ControlFlowBlock as ɵControlFlowBlock, DebugSignalGraph as ɵDebugSignalGraph, DebugSignalGraphEdge as ɵDebugSignalGraphEdge, DebugSignalGraphNode as ɵDebugSignalGraphNode, DeferBlockData as ɵDeferBlockData, DirectiveDebugMetadata as ɵDirectiveDebugMetadata, ExternalCoreGlobalUtils as ɵExternalCoreGlobalUtils, ɵFirstAvailable, ɵFirstAvailableSignal, ForLoopBlockData as ɵForLoopBlockData, FrameworkAgnosticGlobalUtils as ɵFrameworkAgnosticGlobalUtils, HydratedNode as ɵHydratedNode, HydrationInfo as ɵHydrationInfo, ImageConfig as ɵImageConfig, InjectorProfilerContext as ɵInjectorProfilerContext, NgModuleDef as ɵNgModuleDef, NgModuleTransitiveScopes as ɵNgModuleTransitiveScopes, NgModuleType as ɵNgModuleType, Profiler as ɵProfiler, ProviderRecord as ɵProviderRecord, SafeHtml as ɵSafeHtml, SafeResourceUrl as ɵSafeResourceUrl, SafeScript as ɵSafeScript, SafeStyle as ɵSafeStyle, SafeUrl as ɵSafeUrl, SafeValue as ɵSafeValue, SharedStylesHost as ɵSharedStylesHost, ɵUnwrapDirectiveSignalInputs, WizComponentDebugMetadata as ɵWizComponentDebugMetadata };
