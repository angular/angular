/**
 * @license Angular v22.3.0-next.0+sha-95e8dec
 * (c) 2010-2026 Google LLC. https://angular.dev/
 * License: MIT
 */

import { InjectionToken, Type, AbstractType, ValueProvider, ExistingProvider, FactoryProvider, ConstructorProvider, StaticClassProvider, ClassProvider, EnvironmentProviders, Injector, ProviderToken, InjectOptions, Provider, ProcessProvidersFunction, ModuleWithProviders, DestroyRef, InternalInjectFlags, WritableSignal, OutputRef, StaticProvider } from './_chrome_dev_tools_performance-chunk.js';
import { Observable, Subject, Subscription } from 'rxjs';
import './_event_dispatcher-chunk.js';
import { ReactiveNode } from './_formatter-chunk.js';
import { SignalNode, BaseEffectNode } from './_effect-chunk.js';
import { Injector as Injector$1, InjectionToken as InjectionToken$1, NotFound } from '@angular/core/primitives/di';
import * as _angular_core from '@angular/core';

/**
 * Reactive node type for an input signal. An input signal extends a signal.
 * There are special properties to enable transforms and required inputs.
 */
interface InputSignalNode<T, TransformT> extends SignalNode<T> {
    /**
     * User-configured transform that will run whenever a new value is applied
     * to the input signal node.
     */
    transformFn: ((value: TransformT) => T) | undefined;
    /**
     * Applies a new value to the input signal. Expects transforms to be run
     * manually before.
     *
     * This function is called by the framework runtime code whenever a binding
     * changes. The value can in practice be anything at runtime, but for typing
     * purposes we assume it's a valid `T` value. Type-checking will enforce that.
     */
    applyValueToInputSignal<T, TransformT>(node: InputSignalNode<T, TransformT>, value: T): void;
    /**
     * A debug name for the input signal. Used in Angular DevTools to identify the signal.
     */
    debugName?: string;
}

/**
 * A [DI token](api/core/InjectionToken) that enables or disables all enter and leave animations.
 */
declare const ANIMATIONS_DISABLED: InjectionToken<boolean>;
/**
 * The event type for when `animate.enter` and `animate.leave` are used with function
 * callbacks.
 *
 * @see [Animating your applications with animate.enter and animate.leave](guide/animations)
 *
 * @publicApi 20.2
 */
type AnimationCallbackEvent = {
    target: Element;
    animationComplete: VoidFunction;
};
/**
 * A [DI token](api/core/InjectionToken) that configures the maximum animation timeout
 * before element removal. The default value mirrors from Chrome's cross document
 * navigation view transition timeout. It's intended to prevent people from accidentally
 * forgetting to call the removal function in their callback. Also serves as a delay
 * for when stylesheets are pruned.
 *
 * @publicApi 20.2
 * @see [Animating your applications with animate.enter and animate.leave](guide/animations)
 */
declare const MAX_ANIMATION_TIMEOUT: InjectionToken<number>;
/**
 * The function type for `animate.enter` and `animate.leave` when they are used with
 * function callbacks.
 *
 * @publicApi 20.2
 *
 * @see [Animating your applications with animate.enter and animate.leave](guide/animations)
 */
type AnimationFunction = (event: AnimationCallbackEvent) => void;
type RunEnterAnimationFn = VoidFunction;
type RunLeaveAnimationFn = () => {
    promise: Promise<void>;
    resolve: VoidFunction;
};
interface EnterNodeAnimations {
    animateFns: RunEnterAnimationFn[];
    resolvers?: VoidFunction[];
}
interface LeaveNodeAnimations {
    animateFns: RunLeaveAnimationFn[];
    resolvers?: VoidFunction[];
}
interface AnimationLViewData {
    enter?: Map<number, EnterNodeAnimations>;
    leave?: Map<number, LeaveNodeAnimations>;
    running?: Promise<unknown>;
    detachedLeaveAnimationFns?: VoidFunction[];
}
/**
 * Represents the class, class list, or a function returning the class or class list
 * bound to an animate instruction.
 */
type AnimationClassValue = string | string[] | (() => AnimationClassValue) | undefined | null;
/**
 * Function that returns the class or class list bound to the animate instruction
 */
type AnimationClassBindingFn = () => AnimationClassValue;

/** Actions that are supported by the tracing framework. */
declare enum TracingAction {
    CHANGE_DETECTION = 0,
    AFTER_NEXT_RENDER = 1
}
/** A single tracing snapshot. */
interface TracingSnapshot {
    run<T>(action: TracingAction, fn: () => T): T;
    /** Disposes of the tracing snapshot. Must be run exactly once per TracingSnapshot. */
    dispose(): void;
}
/**
 * Injection token for a `TracingService`, optionally provided.
 */
declare const TracingService: InjectionToken<TracingService<TracingSnapshot>>;
/**
 * Tracing mechanism which can associate causes (snapshots) with runs of
 * subsequent operations.
 *
 * Not defined by Angular directly, but defined in contexts where tracing is
 * desired.
 */
interface TracingService<T extends TracingSnapshot> {
    /**
     * Take a snapshot of the current context which will be stored by Angular and
     * used when additional work is performed that was scheduled in this context.
     *
     * @param linkedSnapshot Optional snapshot to use link to the current context.
     * The caller is no longer responsible for calling dispose on the linkedSnapshot.
     *
     * @return The tracing snapshot. The caller is responsible for diposing of the
     * snapshot.
     */
    snapshot(linkedSnapshot: T | null): T;
    /**
     * Propagate the current tracing context to the provided function.
     * @param fn A function.
     * @return A function that will propagate the current tracing context.
     */
    propagate?<T extends Function>(fn: T): T;
    /**
     * Wrap an event listener bound by the framework for tracing.
     * @param element Element on which the event is bound.
     * @param eventName Name of the event.
     * @param handler Event handler.
     * @return A new event handler to be bound instead of the original one.
     */
    wrapEventListener?<T extends Function>(element: HTMLElement, eventName: string, handler: T): T;
    /**
     * Trace the creation of a component instance.
     * @param className Name of the component. May be null if the class is anonymous.
     * @param fn Function that creates the component instance.
     */
    componentCreate?<T>(className: string | null, fn: () => T): T;
}

declare const enum NotificationSource {
    MarkAncestorsForTraversal = 0,
    SetInput = 1,
    DeferBlockStateUpdate = 2,
    DebugApplyChanges = 3,
    MarkForCheck = 4,
    Listener = 5,
    CustomElement = 6,
    RenderHook = 7,
    ViewAttached = 8,
    ViewDetachedFromDOM = 9,
    AsyncAnimationsLoaded = 10,
    PendingTaskRemoved = 11,
    RootEffect = 12,
    ViewEffect = 13
}
/**
 * Injectable that is notified when an `LView` is made aware of changes to application state.
 */
declare abstract class ChangeDetectionScheduler {
    abstract notify(source: NotificationSource): void;
    abstract runningTick: boolean;
}
/** Token used to indicate if zoneless was enabled via provideZonelessChangeDetection(). */
declare const ZONELESS_ENABLED: InjectionToken<boolean>;
/** Token used to indicate `provideZonelessChangeDetection` was used. */
declare const PROVIDED_ZONELESS: InjectionToken<boolean>;

/**
 * @fileoverview
 * While Angular only uses Trusted Types internally for the time being,
 * references to Trusted Types could leak into our core.d.ts, which would force
 * anyone compiling against @angular/core to provide the @types/trusted-types
 * package in their compilation unit.
 *
 * Until https://github.com/microsoft/TypeScript/issues/30024 is resolved, we
 * will keep Angular's public API surface free of references to Trusted Types.
 * For internal and semi-private APIs that need to reference Trusted Types, the
 * minimal type definitions for the Trusted Types API provided by this module
 * should be used instead. They are marked as "declare" to prevent them from
 * being renamed by compiler optimization.
 *
 * Adapted from
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/trusted-types/index.d.ts
 * but restricted to the API surface used within Angular.
 */
type TrustedHTML = string & {
    __brand__: 'TrustedHTML';
};
type TrustedScript = string & {
    __brand__: 'TrustedScript';
};
type TrustedScriptURL = string & {
    __brand__: 'TrustedScriptURL';
};

/**
 * Function used to sanitize the value before writing it into the renderer.
 */
type SanitizerFn = (value: any, tagName: string, propName: string) => string | TrustedHTML | TrustedScript | TrustedScriptURL;

/**
 * Stores a list of nodes which need to be removed.
 *
 * Numbers are indexes into the `LView`
 * - index > 0: `removeRNode(lView[0])`
 * - index < 0: `removeICU(~lView[0])`
 */
interface I18nRemoveOpCodes extends Array<number> {
    __brand__: 'I18nRemoveOpCodes';
}
/**
 * Array storing OpCode for dynamically creating `i18n` blocks.
 *
 * Example:
 * ```ts
 * <I18nCreateOpCode>[
 *   // For adding text nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   lView[1].appendChild(lView[0] = document.createTextNode('xyz'));
 *   'xyz', 0, 1 << SHIFT_PARENT | 0 << SHIFT_REF | AppendChild,
 *
 *   // For adding element nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   lView[1].appendChild(lView[0] = document.createElement('div'));
 *   ELEMENT_MARKER, 'div', 0, 1 << SHIFT_PARENT | 0 << SHIFT_REF | AppendChild,
 *
 *   // For adding comment nodes
 *   // ---------------------
 *   // Equivalent to:
 *   //   lView[1].appendChild(lView[0] = document.createComment(''));
 *   ICU_MARKER, '', 0, 1 << SHIFT_PARENT | 0 << SHIFT_REF | AppendChild,
 *
 *   // For moving existing nodes to a different location
 *   // --------------------------------------------------
 *   // Equivalent to:
 *   //   const node = lView[1];
 *   //   lView[2].appendChild(node);
 *   1 << SHIFT_REF | Select, 2 << SHIFT_PARENT | 0 << SHIFT_REF | AppendChild,
 *
 *   // For removing existing nodes
 *   // --------------------------------------------------
 *   //   const node = lView[1];
 *   //   removeChild(tView.data(1), node, lView);
 *   1 << SHIFT_REF | Remove,
 *
 *   // For writing attributes
 *   // --------------------------------------------------
 *   //   const node = lView[1];
 *   //   node.setAttribute('attr', 'value');
 *   1 << SHIFT_REF | Attr, 'attr', 'value'
 * ];
 * ```
 */
interface IcuCreateOpCodes extends Array<number | string | ELEMENT_MARKER | ICU_MARKER | null>, I18nDebug {
    __brand__: 'I18nCreateOpCodes';
}
/**
 * Marks that the next string is an element name.
 *
 * See `I18nMutateOpCodes` documentation.
 */
declare const ELEMENT_MARKER: ELEMENT_MARKER;
interface ELEMENT_MARKER {
    marker: 'element';
}
/**
 * Marks that the next string is comment text need for ICU.
 *
 * See `I18nMutateOpCodes` documentation.
 */
declare const ICU_MARKER: ICU_MARKER;
interface ICU_MARKER {
    marker: 'ICU';
}
interface I18nDebug {
    /**
     * Human readable representation of the OpCode arrays.
     *
     * NOTE: This property only exists if `ngDevMode` is set to `true` and it is not present in
     * production. Its presence is purely to help debug issue in development, and should not be relied
     * on in production application.
     */
    debug?: string[];
}
/**
 * Array storing OpCode for dynamically creating `i18n` translation DOM elements.
 *
 * This array creates a sequence of `Text` and `Comment` (as ICU anchor) DOM elements. It consists
 * of a pair of `number` and `string` pairs which encode the operations for the creation of the
 * translated block.
 *
 * The number is shifted and encoded according to `I18nCreateOpCode`
 *
 * Pseudocode:
 * ```ts
 * const i18nCreateOpCodes = [
 *   10 << I18nCreateOpCode.SHIFT, "Text Node add to DOM",
 *   11 << I18nCreateOpCode.SHIFT | I18nCreateOpCode.COMMENT, "Comment Node add to DOM",
 *   12 << I18nCreateOpCode.SHIFT | I18nCreateOpCode.APPEND_LATER, "Text Node added later"
 * ];
 *
 * for(var i=0; i<i18nCreateOpCodes.length; i++) {
 *   const opcode = i18NCreateOpCodes[i++];
 *   const index = opcode >> I18nCreateOpCode.SHIFT;
 *   const text = i18NCreateOpCodes[i];
 *   let node: Text|Comment;
 *   if (opcode & I18nCreateOpCode.COMMENT === I18nCreateOpCode.COMMENT) {
 *     node = lView[~index] = document.createComment(text);
 *   } else {
 *     node = lView[index] = document.createText(text);
 *   }
 *   if (opcode & I18nCreateOpCode.APPEND_EAGERLY !== I18nCreateOpCode.APPEND_EAGERLY) {
 *     parentNode.appendChild(node);
 *   }
 * }
 * ```
 */
interface I18nCreateOpCodes extends Array<number | string>, I18nDebug {
    __brand__: 'I18nCreateOpCodes';
}
/**
 * Stores DOM operations which need to be applied to update DOM render tree due to changes in
 * expressions.
 *
 * The basic idea is that `i18nExp` OpCodes capture expression changes and update a change
 * mask bit. (Bit 1 for expression 1, bit 2 for expression 2 etc..., bit 32 for expression 32 and
 * higher.) The OpCodes then compare its own change mask against the expression change mask to
 * determine if the OpCodes should execute.
 *
 * NOTE: 32nd bit is special as it says 32nd or higher. This way if we have more than 32 bindings
 * the code still works, but with lower efficiency. (it is unlikely that a translation would have
 * more than 32 bindings.)
 *
 * These OpCodes can be used by both the i18n block as well as ICU sub-block.
 *
 * ## Example
 *
 * Assume
 * ```ts
 *   if (rf & RenderFlags.Update) {
 *    i18nExp(ctx.exp1); // If changed set mask bit 1
 *    i18nExp(ctx.exp2); // If changed set mask bit 2
 *    i18nExp(ctx.exp3); // If changed set mask bit 3
 *    i18nExp(ctx.exp4); // If changed set mask bit 4
 *    i18nApply(0);            // Apply all changes by executing the OpCodes.
 *  }
 * ```
 * We can assume that each call to `i18nExp` sets an internal `changeMask` bit depending on the
 * index of `i18nExp`.
 *
 * ### OpCodes
 * ```ts
 * <I18nUpdateOpCodes>[
 *   // The following OpCodes represent: `<div i18n-title="pre{{exp1}}in{{exp2}}post">`
 *   // If `changeMask & 0b11`
 *   //        has changed then execute update OpCodes.
 *   //        has NOT changed then skip `8` values and start processing next OpCodes.
 *   0b11, 8,
 *   // Concatenate `newValue = 'pre'+lView[bindIndex-4]+'in'+lView[bindIndex-3]+'post';`.
 *   'pre', -4, 'in', -3, 'post',
 *   // Update attribute: `elementAttribute(1, 'title', sanitizerFn(newValue));`
 *   1 << SHIFT_REF | Attr, 'title', sanitizerFn,
 *
 *   // The following OpCodes represent: `<div i18n>Hello {{exp3}}!">`
 *   // If `changeMask & 0b100`
 *   //        has changed then execute update OpCodes.
 *   //        has NOT changed then skip `4` values and start processing next OpCodes.
 *   0b100, 4,
 *   // Concatenate `newValue = 'Hello ' + lView[bindIndex -2] + '!';`.
 *   'Hello ', -2, '!',
 *   // Update text: `lView[1].textContent = newValue;`
 *   1 << SHIFT_REF | Text,
 *
 *   // The following OpCodes represent: `<div i18n>{exp4, plural, ... }">`
 *   // If `changeMask & 0b1000`
 *   //        has changed then execute update OpCodes.
 *   //        has NOT changed then skip `2` values and start processing next OpCodes.
 *   0b1000, 2,
 *   // Concatenate `newValue = lView[bindIndex -1];`.
 *   -1,
 *   // Switch ICU: `icuSwitchCase(lView[1], 0, newValue);`
 *   0 << SHIFT_ICU | 1 << SHIFT_REF | IcuSwitch,
 *
 *   // Note `changeMask & -1` is always true, so the IcuUpdate will always execute.
 *   -1, 1,
 *   // Update ICU: `icuUpdateCase(lView[1], 0);`
 *   0 << SHIFT_ICU | 1 << SHIFT_REF | IcuUpdate,
 *
 * ];
 * ```
 *
 */
interface I18nUpdateOpCodes extends Array<string | number | SanitizerFn | null>, I18nDebug {
    __brand__: 'I18nUpdateOpCodes';
}
/**
 * Store information for the i18n translation block.
 */
interface TI18n {
    /**
     * A set of OpCodes which will create the Text Nodes and ICU anchors for the translation blocks.
     *
     * NOTE: The ICU anchors are filled in with ICU Update OpCode.
     */
    create: I18nCreateOpCodes;
    /**
     * A set of OpCodes which will be executed on each change detection to determine if any changes to
     * DOM are required.
     */
    update: I18nUpdateOpCodes;
    /**
     * An AST representing the translated message. This is used for hydration (and serialization),
     * while the Update and Create OpCodes are used at runtime.
     */
    ast: Array<I18nNode>;
    /**
     * Index of a parent TNode, which represents a host node for this i18n block.
     */
    parentTNodeIndex: number;
}
/**
 * Defines the ICU type of `select` or `plural`
 */
declare const enum IcuType {
    select = 0,
    plural = 1
}
interface TIcu {
    /**
     * Defines the ICU type of `select` or `plural`
     */
    type: IcuType;
    /**
     * Index in `LView` where the anchor node is stored. `<!-- ICU 0:0 -->`
     */
    anchorIdx: number;
    /**
     * Currently selected ICU case pointer.
     *
     * `lView[currentCaseLViewIndex]` stores the currently selected case. This is needed to know how
     * to clean up the current case when transitioning no the new case.
     *
     * If the value stored is:
     * `null`: No current case selected.
     *   `<0`: A flag which means that the ICU just switched and that `icuUpdate` must be executed
     *         regardless of the `mask`. (After the execution the flag is cleared)
     *   `>=0` A currently selected case index.
     */
    currentCaseLViewIndex: number;
    /**
     * A list of case values which the current ICU will try to match.
     *
     * The last value is `other`
     */
    cases: any[];
    /**
     * A set of OpCodes to apply in order to build up the DOM render tree for the ICU
     */
    create: IcuCreateOpCodes[];
    /**
     * A set of OpCodes to apply in order to destroy the DOM render tree for the ICU.
     */
    remove: I18nRemoveOpCodes[];
    /**
     * A set of OpCodes to apply in order to update the DOM render tree for the ICU bindings.
     */
    update: I18nUpdateOpCodes[];
}
type I18nNode = I18nTextNode | I18nElementNode | I18nICUNode | I18nPlaceholderNode;
/**
 * Represents a block of text in a translation, such as `Hello, {{ name }}!`.
 */
interface I18nTextNode {
    /** The AST node kind */
    kind: I18nNodeKind.TEXT;
    /** The LView index */
    index: number;
}
/**
 * Represents a simple DOM element in a translation, such as `<div>...</div>`
 */
interface I18nElementNode {
    /** The AST node kind */
    kind: I18nNodeKind.ELEMENT;
    /** The LView index */
    index: number;
    /** The child nodes */
    children: Array<I18nNode>;
}
/**
 * Represents an ICU in a translation.
 */
interface I18nICUNode {
    /** The AST node kind */
    kind: I18nNodeKind.ICU;
    /** The LView index */
    index: number;
    /** The branching cases */
    cases: Array<Array<I18nNode>>;
    /** The LView index that stores the active case */
    currentCaseLViewIndex: number;
}
/**
 * Represents special content that is embedded into the translation. This can
 * either be a special built-in element, such as <ng-container> and <ng-content>,
 * or it can be a sub-template, for example, from a structural directive.
 */
interface I18nPlaceholderNode {
    /** The AST node kind */
    kind: I18nNodeKind.PLACEHOLDER;
    /** The LView index */
    index: number;
    /** The child nodes */
    children: Array<I18nNode>;
    /** The placeholder type */
    type: I18nPlaceholderType;
}
declare const enum I18nPlaceholderType {
    ELEMENT = 0,
    SUBTEMPLATE = 1
}
declare const enum I18nNodeKind {
    TEXT = 0,
    ELEMENT = 1,
    PLACEHOLDER = 2,
    ICU = 3
}

/**
 * The goal here is to make sure that the browser DOM API is the Renderer.
 * We do this by defining a subset of DOM API to be the renderer and then
 * use that at runtime for rendering.
 *
 * At runtime we can then use the DOM api directly, in server or web-worker
 * it will be easy to implement such API.
 */
/** Subset of API needed for appending elements and text nodes. */
interface RNode {
    /**
     * Returns the parent Element, Document, or DocumentFragment
     */
    parentNode: RNode | null;
    /**
     * Returns the parent Element if there is one
     */
    parentElement: RElement | null;
    /**
     * Gets the Node immediately following this one in the parent's childNodes
     */
    nextSibling: RNode | null;
    /**
     * Gets the Node immediately preceding this one in the parent's childNodes
     */
    previousSibling: RNode | null;
    /**
     * Insert a child node.
     *
     * Used exclusively for adding View root nodes into ViewAnchor location.
     */
    insertBefore(newChild: RNode, refChild: RNode | null, isViewRoot: boolean): void;
    /**
     * Append a child node.
     *
     * Used exclusively for building up DOM which are static (ie not View roots)
     */
    appendChild(newChild: RNode): RNode;
    /**
     * Returns the root node containing this node. This is either:
     * 1. The `Document` containing the node, if attached in light DOM.
     * 2. The `ShadowRoot` containing the node, if attached in shadow DOM.
     * 3. The root node of a detached tree.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode
     */
    getRootNode?(options?: {
        composed?: boolean;
    }): RNode;
}
/**
 * Subset of API needed for writing attributes, properties, and setting up
 * listeners on Element.
 */
interface RElement extends RNode {
    firstChild: RNode | null;
    style: RCssStyleDeclaration;
    classList: RDomTokenList;
    className: string;
    tagName: string;
    textContent: string | null;
    hasAttribute(name: string): boolean;
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string | TrustedHTML | TrustedScript | TrustedScriptURL): void;
    removeAttribute(name: string): void;
    setAttributeNS(namespaceURI: string, qualifiedName: string, value: string | TrustedHTML | TrustedScript | TrustedScriptURL): void;
    addEventListener(type: string, listener: EventListener, useCapture?: boolean): void;
    removeEventListener(type: string, listener?: EventListener, options?: boolean): void;
    remove(): void;
    setProperty?(name: string, value: any): void;
}
interface RCssStyleDeclaration {
    removeProperty(propertyName: string): string;
    setProperty(propertyName: string, value: string | null, priority?: string): void;
}
interface RDomTokenList {
    add(token: string): void;
    remove(token: string): void;
}
interface RText extends RNode {
    textContent: string | null;
}
interface RComment extends RNode {
    textContent: string | null;
}

/**
 * Keys within serialized view data structure to represent various
 * parts. See the `SerializedView` interface below for additional information.
 */
declare const ELEMENT_CONTAINERS = "e";
declare const TEMPLATES = "t";
declare const CONTAINERS = "c";
declare const MULTIPLIER = "x";
declare const NUM_ROOT_NODES = "r";
declare const TEMPLATE_ID = "i";
declare const NODES = "n";
declare const DISCONNECTED_NODES = "d";
declare const I18N_DATA = "l";
declare const DEFER_BLOCK_ID = "di";
declare const DEFER_BLOCK_STATE = "s";
/**
 * Represents element containers within this view, stored as key-value pairs
 * where key is an index of a container in an LView (also used in the
 * `elementContainerStart` instruction), the value is the number of root nodes
 * in this container. This information is needed to locate an anchor comment
 * node that goes after all container nodes.
 */
interface SerializedElementContainers {
    [key: number]: number;
}
/**
 * Serialized data structure that contains relevant hydration
 * annotation information that describes a given hydration boundary
 * (e.g. a component).
 */
interface SerializedView {
    /**
     * Serialized information about <ng-container>s.
     */
    [ELEMENT_CONTAINERS]?: SerializedElementContainers;
    /**
     * Serialized information about templates.
     * Key-value pairs where a key is an index of the corresponding
     * `template` instruction and the value is a unique id that can
     * be used during hydration to identify that template.
     */
    [TEMPLATES]?: Record<number, string>;
    /**
     * Serialized information about view containers.
     * Key-value pairs where a key is an index of the corresponding
     * LContainer entry within an LView, and the value is a list
     * of serialized information about views within this container.
     */
    [CONTAINERS]?: Record<number, SerializedContainerView[]>;
    /**
     * Serialized information about nodes in a template.
     * Key-value pairs where a key is an index of the corresponding
     * DOM node in an LView and the value is a path that describes
     * the location of this node (as a set of navigation instructions).
     */
    [NODES]?: Record<number, string>;
    /**
     * A list of ids which represents a set of nodes disconnected
     * from the DOM tree at the serialization time, but otherwise
     * present in the internal data structures.
     *
     * This information is used to avoid triggering the hydration
     * logic for such nodes and instead use a regular "creation mode".
     */
    [DISCONNECTED_NODES]?: number[];
    /**
     * Serialized information about i18n blocks in a template.
     * Key-value pairs where a key is an index of the corresponding
     * i18n entry within an LView, and the value is a list of
     * active ICU cases.
     */
    [I18N_DATA]?: Record<number, number[]>;
    /**
     * If this view represents a `@defer` block, this field contains
     * unique id of the block.
     */
    [DEFER_BLOCK_ID]?: string;
    /**
     * This field represents a status, based on the `DeferBlockState` enum.
     */
    [DEFER_BLOCK_STATE]?: number;
}
/**
 * Serialized data structure that contains relevant hydration
 * annotation information about a view that is a part of a
 * ViewContainer collection.
 */
interface SerializedContainerView extends SerializedView {
    /**
     * Unique id that represents a TView that was used to create
     * a given instance of a view:
     *  - TViewType.Embedded: a unique id generated during serialization on the server
     *  - TViewType.Component: an id generated based on component properties
     *                        (see `getComponentId` function for details)
     */
    [TEMPLATE_ID]: string;
    /**
     * Number of root nodes that belong to this view.
     * This information is needed to effectively traverse the DOM tree
     * and identify segments that belong to different views.
     */
    [NUM_ROOT_NODES]: number;
    /**
     * Number of times this view is repeated.
     * This is used to avoid serializing and sending the same hydration
     * information about similar views (for example, produced by *ngFor).
     */
    [MULTIPLIER]?: number;
}
/**
 * An object that contains hydration-related information serialized
 * on the server, as well as the necessary references to segments of
 * the DOM, to facilitate the hydration process for a given hydration
 * boundary on the client.
 */
interface DehydratedView {
    /**
     * The readonly hydration annotation data.
     */
    data: Readonly<SerializedView>;
    /**
     * A reference to the first child in a DOM segment associated
     * with a given hydration boundary.
     *
     * Once a view becomes hydrated, the value is set to `null`, which
     * indicates that further detaching/attaching view actions should result
     * in invoking corresponding DOM actions (attaching DOM nodes action is
     * skipped when we hydrate, since nodes are already in the DOM).
     */
    firstChild: RNode | null;
    /**
     * Stores references to first nodes in DOM segments that
     * represent either an <ng-container> or a view container.
     */
    segmentHeads?: {
        [index: number]: RNode | null;
    };
    /**
     * An instance of a Set that represents nodes disconnected from
     * the DOM tree at the serialization time, but otherwise present
     * in the internal data structures.
     *
     * The Set is based on the `SerializedView[DISCONNECTED_NODES]` data
     * and is needed to have constant-time lookups.
     *
     * If the value is `null`, it means that there were no disconnected
     * nodes detected in this view at serialization time.
     */
    disconnectedNodes?: Set<number> | null;
    /**
     * A mapping from a view to the first child to begin claiming nodes.
     *
     * This mapping is generated by an i18n block, and is the source of
     * truth for the nodes inside of it.
     */
    i18nNodes?: Map<number, RNode | null>;
    /**
     * A mapping from the index of an ICU node to dehydrated data for it.
     *
     * This information is used during the hydration process on the client.
     * ICU cases that were active during server-side rendering will be added
     * to the map. The hydration logic will "claim" matching cases, removing
     * them from the map. The remaining entries are "unclaimed", and will be
     * removed from the DOM during hydration cleanup.
     */
    dehydratedIcuData?: Map<number, DehydratedIcuData>;
}
/**
 * An object that contains hydration-related information serialized
 * on the server, as well as the necessary references to segments of
 * the DOM, to facilitate the hydration process for a given view
 * inside a view container (either an embedded view or a view created
 * for a component).
 */
interface DehydratedContainerView extends DehydratedView {
    data: Readonly<SerializedContainerView>;
}
/**
 * An object that contains information about a dehydrated ICU case,
 * to facilitate cleaning up ICU cases that were active during
 * server-side rendering, but not during hydration.
 */
interface DehydratedIcuData {
    /**
     * The case index that this data represents.
     */
    case: number;
    /**
     * A reference back to the AST for the ICU node. This allows the
     * AST to be used to clean up dehydrated nodes.
     */
    node: I18nICUNode;
}

/**
 * `KeyValueArray` is an array where even positions contain keys and odd positions contain values.
 *
 * `KeyValueArray` provides a very efficient way of iterating over its contents. For small
 * sets (~10) the cost of binary searching an `KeyValueArray` has about the same performance
 * characteristics that of a `Map` with significantly better memory footprint.
 *
 * If used as a `Map` the keys are stored in alphabetical order so that they can be binary searched
 * for retrieval.
 *
 * See: `keyValueArraySet`, `keyValueArrayGet`, `keyValueArrayIndexOf`, `keyValueArrayDelete`.
 */
interface KeyValueArray<VALUE> extends Array<VALUE | string> {
    __brand__: 'array-map';
}

/**
 * Value stored in the `TData` which is needed to re-concatenate the styling.
 *
 * See: `TStylingKeyPrimitive` and `TStylingStatic`
 */
type TStylingKey = TStylingKeyPrimitive | TStylingStatic;
/**
 * The primitive portion (`TStylingStatic` removed) of the value stored in the `TData` which is
 * needed to re-concatenate the styling.
 *
 * - `string`: Stores the property name. Used with `ɵɵstyleProp`/`ɵɵclassProp` instruction.
 * - `null`: Represents map, so there is no name. Used with `ɵɵstyleMap`/`ɵɵclassMap`.
 * - `false`: Represents an ignore case. This happens when `ɵɵstyleProp`/`ɵɵclassProp` instruction
 *   is combined with directive which shadows its input `@Input('class')`. That way the binding
 *   should not participate in the styling resolution.
 */
type TStylingKeyPrimitive = string | null | false;
/**
 * Store the static values for the styling binding.
 *
 * The `TStylingStatic` is just `KeyValueArray` where key `""` (stored at location 0) contains the
 * `TStylingKey` (stored at location 1). In other words this wraps the `TStylingKey` such that the
 * `""` contains the wrapped value.
 *
 * When instructions are resolving styling they may need to look forward or backwards in the linked
 * list to resolve the value. For this reason we have to make sure that he linked list also contains
 * the static values. However the list only has space for one item per styling instruction. For this
 * reason we store the static values here as part of the `TStylingKey`. This means that the
 * resolution function when looking for a value needs to first look at the binding value, and than
 * at `TStylingKey` (if it exists).
 *
 * Imagine we have:
 *
 * ```angular-ts
 * <div class="TEMPLATE" my-dir>
 *
 * @Directive({
 *   host: {
 *     class: 'DIR',
 *     '[class.dynamic]': 'exp' // ɵɵclassProp('dynamic', ctx.exp);
 *   }
 * })
 * ```
 *
 * In the above case the linked list will contain one item:
 *
 * ```ts
 *   // assume binding location: 10 for `ɵɵclassProp('dynamic', ctx.exp);`
 *   tData[10] = <TStylingStatic>[
 *     '': 'dynamic', // This is the wrapped value of `TStylingKey`
 *     'DIR': true,   // This is the default static value of directive binding.
 *   ];
 *   tData[10 + 1] = 0; // We don't have prev/next.
 *
 *   lView[10] = undefined;     // assume `ctx.exp` is `undefined`
 *   lView[10 + 1] = undefined; // Just normalized `lView[10]`
 * ```
 *
 * So when the function is resolving styling value, it first needs to look into the linked list
 * (there is none) and than into the static `TStylingStatic` too see if there is a default value for
 * `dynamic` (there is not). Therefore it is safe to remove it.
 *
 * If setting `true` case:
 * ```ts
 *   lView[10] = true;     // assume `ctx.exp` is `true`
 *   lView[10 + 1] = true; // Just normalized `lView[10]`
 * ```
 * So when the function is resolving styling value, it first needs to look into the linked list
 * (there is none) and than into `TNode.residualClass` (TNode.residualStyle) which contains
 * ```ts
 *   tNode.residualClass = [
 *     'TEMPLATE': true,
 *   ];
 * ```
 *
 * This means that it is safe to add class.
 */
interface TStylingStatic extends KeyValueArray<any> {
}
/**
 * This is a branded number which contains previous and next index.
 *
 * When we come across styling instructions we need to store the `TStylingKey` in the correct
 * order so that we can re-concatenate the styling value in the desired priority.
 *
 * The insertion can happen either at the:
 * - end of template as in the case of coming across additional styling instruction in the template
 * - in front of the template in the case of coming across additional instruction in the
 *   `hostBindings`.
 *
 * We use `TStylingRange` to store the previous and next index into the `TData` where the template
 * bindings can be found.
 *
 * - bit 0 is used to mark that the previous index has a duplicate for current value.
 * - bit 1 is used to mark that the next index has a duplicate for the current value.
 * - bits 2-16 are used to encode the next/tail of the template.
 * - bits 17-32 are used to encode the previous/head of template.
 *
 * NODE: *duplicate* false implies that it is statically known that this binding will not collide
 * with other bindings and therefore there is no need to check other bindings. For example the
 * bindings in `<div [style.color]="exp" [style.width]="exp">` will never collide and will have
 * their bits set accordingly. Previous duplicate means that we may need to check previous if the
 * current binding is `null`. Next duplicate means that we may need to check next bindings if the
 * current binding is not `null`.
 *
 * NOTE: `0` has special significance and represents `null` as in no additional pointer.
 */
type TStylingRange = number & {
    __brand__: 'TStylingRange';
};

/**
 * A set of marker values to be used in the attributes arrays. These markers indicate that some
 * items are not regular attributes and the processing should be adapted accordingly.
 */
declare const enum AttributeMarker {
    /**
     * An implicit marker which indicates that the value in the array are of `attributeKey`,
     * `attributeValue` format.
     *
     * NOTE: This is implicit as it is the type when no marker is present in array. We indicate that
     * it should not be present at runtime by the negative number.
     */
    ImplicitAttributes = -1,
    /**
     * Marker indicates that the following 3 values in the attributes array are:
     * namespaceUri, attributeName, attributeValue
     * in that order.
     */
    NamespaceURI = 0,
    /**
     * Signals class declaration.
     *
     * Each value following `Classes` designates a class name to include on the element.
     * ## Example:
     *
     * Given:
     * ```html
     * <div class="foo bar baz">...</div>
     * ```
     *
     * the generated code is:
     * ```ts
     * var _c1 = [AttributeMarker.Classes, 'foo', 'bar', 'baz'];
     * ```
     */
    Classes = 1,
    /**
     * Signals style declaration.
     *
     * Each pair of values following `Styles` designates a style name and value to include on the
     * element.
     * ## Example:
     *
     * Given:
     * ```html
     * <div style="width:100px; height:200px; color:red">...</div>
     * ```
     *
     * the generated code is:
     * ```ts
     * var _c1 = [AttributeMarker.Styles, 'width', '100px', 'height'. '200px', 'color', 'red'];
     * ```
     */
    Styles = 2,
    /**
     * Signals that the following attribute names were extracted from input or output bindings.
     *
     * For example, given the following HTML:
     *
     * ```html
     * <div moo="car" [foo]="exp" (bar)="doSth()">
     * ```
     *
     * the generated code is:
     *
     * ```ts
     * var _c1 = ['moo', 'car', AttributeMarker.Bindings, 'foo', 'bar'];
     * ```
     */
    Bindings = 3,
    /**
     * Signals that the following attribute names were hoisted from an inline-template declaration.
     *
     * For example, given the following HTML:
     *
     * ```html
     * <div *ngFor="let value of values; trackBy:trackBy" dirA [dirB]="value">
     * ```
     *
     * the generated code for the `template()` instruction would include:
     *
     * ```
     * ['dirA', '', AttributeMarker.Bindings, 'dirB', AttributeMarker.Template, 'ngFor', 'ngForOf',
     * 'ngForTrackBy', 'let-value']
     * ```
     *
     * while the generated code for the `element()` instruction inside the template function would
     * include:
     *
     * ```
     * ['dirA', '', AttributeMarker.Bindings, 'dirB']
     * ```
     */
    Template = 4,
    /**
     * Signals that the following attribute is `ngProjectAs` and its value is a parsed
     * `CssSelector`.
     *
     * For example, given the following HTML:
     *
     * ```html
     * <h1 attr="value" ngProjectAs="[title]">
     * ```
     *
     * the generated code for the `element()` instruction would include:
     *
     * ```ts
     * ['attr', 'value', AttributeMarker.ProjectAs, ['', 'title', '']]
     * ```
     */
    ProjectAs = 5,
    /**
     * Signals that the following attribute will be translated by runtime i18n
     *
     * For example, given the following HTML:
     *
     * ```html
     * <div moo="car" foo="value" i18n-foo [bar]="binding" i18n-bar>
     * ```
     *
     * the generated code is:
     *
     * ```ts
     * var _c1 = ['moo', 'car', AttributeMarker.I18n, 'foo', 'bar'];
     * ```
     */
    I18n = 6
}

/** Symbol used to store and retrieve the render function for a foreign component. */
declare const RENDER: unique symbol;
/** Symbol used to store and retrieve the disposal registration function for a foreign component. */
declare const ON_DESTROY: unique symbol;
/** Symbol used to store and retrieve the content adapter function for a foreign component. */
declare const CONTENT_ADAPTER: unique symbol;
/** Symbol used to store and retrieve the context retrieval function for a foreign component. */
declare const GET_CONTEXT: unique symbol;
/**
 * A function used to render a foreign component in an Angular template.
 *
 * The function accepts the component's properties and optional context. It should return an array
 * of nodes rendered and owned by the foreign component. It may also return a callback to perform
 * any necessary cleanup when the component is destroyed.
 *
 * @template TProps The properties of the foreign component.
 * @template TContext The context passed to the foreign component.
 */
type ForeignRenderFn<TProps, TContext> = (props: TProps, context?: TContext) => [Node[], VoidFunction?];
/**
 * A function that captures the runtime context of a foreign component.
 *
 * @template TContext The captured context type.
 */
type ForeignGetContextFn<TContext> = () => TContext;
/**
 * A function that allows a foreign component to register a destroy callback.
 *
 * Angular will invoke this function during the creation phase of projected content
 * to provide a cleanup callback. The foreign component is responsible for calling
 * this callback when the container slot is removed or when the foreign component itself
 * is destroyed. This triggers the destruction and lifecycle cleanup of the nested Angular views.
 */
type ForeignOnDestroyFn = (destroy: VoidFunction) => void;
/**
 * A function that adapts an Angular content producer callback into a compatible representation for
 * the foreign component.
 */
type ForeignContentAdapterFn = (producer: () => Node[]) => any;
/**
 * Represents a component from another framework that Angular can import and render.
 *
 * @template TProps The properties of the foreign component.
 * @template TContext The context passed to the foreign component.
 */
interface ForeignComponent<TProps = {}, TContext = unknown> {
    readonly [RENDER]: ForeignRenderFn<TProps, TContext>;
    readonly [ON_DESTROY]: ForeignOnDestroyFn;
    readonly [CONTENT_ADAPTER]: ForeignContentAdapterFn;
    readonly [GET_CONTEXT]?: ForeignGetContextFn<TContext>;
}

/**
 * Expresses a single CSS Selector.
 *
 * Beginning of array
 * - First index: element name
 * - Subsequent odd indices: attr keys
 * - Subsequent even indices: attr values
 *
 * After SelectorFlags.CLASS flag
 * - Class name values
 *
 * SelectorFlags.NOT flag
 * - Changes the mode to NOT
 * - Can be combined with other flags to set the element / attr / class mode
 *
 * e.g. SelectorFlags.NOT | SelectorFlags.ELEMENT
 *
 * Example:
 * Original: `div.foo.bar[attr1=val1][attr2]`
 * Parsed: ['div', 'attr1', 'val1', 'attr2', '', SelectorFlags.CLASS, 'foo', 'bar']
 *
 * Original: 'div[attr1]:not(.foo[attr2])
 * Parsed: [
 *  'div', 'attr1', '',
 *  SelectorFlags.NOT | SelectorFlags.ATTRIBUTE 'attr2', '', SelectorFlags.CLASS, 'foo'
 * ]
 *
 * See more examples in node_selector_matcher_spec.ts
 */
type CssSelector = (string | SelectorFlags)[];
/**
 * A list of CssSelectors.
 *
 * A directive or component can have multiple selectors. This type is used for
 * directive defs so any of the selectors in the list will match that directive.
 *
 * Original: 'form, [ngForm]'
 * Parsed: [['form'], ['', 'ngForm', '']]
 */
type CssSelectorList = CssSelector[];
/** Flags used to build up CssSelectors */
declare const enum SelectorFlags {
    /** Indicates this is the beginning of a new negative selector */
    NOT = 1,
    /** Mode for matching attributes */
    ATTRIBUTE = 2,
    /** Mode for matching tag names */
    ELEMENT = 4,
    /** Mode for matching class names */
    CLASS = 8
}

/**
 * TNodeType corresponds to the {@link TNode} `type` property.
 *
 * NOTE: type IDs are such that we use each bit to denote a type. This is done so that we can easily
 * check if the `TNode` is of more than one type.
 *
 * `if (tNode.type === TNodeType.Text || tNode.type === TNode.Element)`
 * can be written as:
 * `if (tNode.type & (TNodeType.Text | TNodeType.Element))`
 *
 * However any given `TNode` can only be of one type.
 */
declare const enum TNodeType {
    /**
     * The TNode contains information about a DOM element aka {@link RText}.
     */
    Text = 1,
    /**
     * The TNode contains information about a DOM element aka {@link RElement}.
     */
    Element = 2,
    /**
     * The TNode contains information about an {@link LContainer} for embedded views.
     */
    Container = 4,
    /**
     * The TNode contains information about an `<ng-container>` element {@link RNode}.
     */
    ElementContainer = 8,
    /**
     * The TNode contains information about an `<ng-content>` projection
     */
    Projection = 16,
    /**
     * The TNode contains information about an ICU comment used in `i18n`.
     */
    Icu = 32,
    /**
     * Special node type representing a placeholder for future `TNode` at this location.
     *
     * I18n translation blocks are created before the element nodes which they contain. (I18n blocks
     * can span over many elements.) Because i18n `TNode`s (representing text) are created first they
     * often may need to point to element `TNode`s which are not yet created. In such a case we create
     * a `Placeholder` `TNode`. This allows the i18n to structurally link the `TNode`s together
     * without knowing any information about the future nodes which will be at that location.
     *
     * On `firstCreatePass` When element instruction executes it will try to create a `TNode` at that
     * location. Seeing a `Placeholder` `TNode` already there tells the system that it should reuse
     * existing `TNode` (rather than create a new one) and just update the missing information.
     */
    Placeholder = 64,
    /**
     * The TNode contains information about a `@let` declaration.
     */
    LetDeclaration = 128,
    /**
     * The TNode contains a control directive's update function.
     */
    ControlDirective = 256,
    AnyRNode = 3,// Text | Element
    AnyContainer = 12
}
/**
 * Corresponds to the TNode.flags property.
 */
declare const enum TNodeFlags {
    /** Bit #1 - This bit is set if the node is a host for any directive (including a component) */
    isDirectiveHost = 1,
    /** Bit #2 - This bit is set if the node has been projected */
    isProjected = 2,
    /** Bit #3 - This bit is set if any directive on this node has content queries */
    hasContentQuery = 4,
    /** Bit #4 - This bit is set if the node has any "class" inputs */
    hasClassInput = 8,
    /** Bit #5 - This bit is set if the node has any "style" inputs */
    hasStyleInput = 16,
    /** Bit #6 - This bit is set if the node has been detached by i18n */
    isDetached = 32,
    /**
     * Bit #7 - This bit is set if the node has directives with host bindings.
     *
     * This flags allows us to guard host-binding logic and invoke it only on nodes
     * that actually have directives with host bindings.
     */
    hasHostBindings = 64,
    /**
     * Bit #8 - This bit is set if the node is a located inside skip hydration block.
     */
    inSkipHydrationBlock = 128,
    /**
     * Bit #9 - This bit is set if the node is a start of a set of control flow blocks.
     */
    isControlFlowStart = 256,
    /**
     * Bit #10 - This bit is set if the node is within a set of control flow blocks.
     */
    isInControlFlow = 512,
    /**
     * Bit #11 - This bit is set if the node hosts a custom control component.
     *
     * A custom control component's model property is named `value`.
     */
    isFormValueControl = 1024,
    /**
     * Bit #12 - This bit is set if the node hosts a custom checkbox component.
     *
     * A custom checkbox component's model property is named `checked`.
     */
    isFormCheckboxControl = 2048,
    /**
     * Bit #13 - This bit is set if the node hosts an interoperable control implementation.
     *
     * This is used to bind to a `ControlValueAccessor` from `@angular/forms`.
     */
    isPassThroughControl = 4096
}
/**
 * Corresponds to the TNode.providerIndexes property.
 */
declare const enum TNodeProviderIndexes {
    /** The index of the first provider on this node is encoded on the least significant bits. */
    ProvidersStartIndexMask = 1048575,
    /**
     * The count of view providers from the component on this node is
     * encoded on the 20 most significant bits.
     */
    CptViewProvidersCountShift = 20,
    CptViewProvidersCountShifter = 1048576
}
/**
 * A combination of:
 * - Attribute names and values.
 * - Special markers acting as flags to alter attributes processing.
 * - Parsed ngProjectAs selectors.
 */
type TAttributes = (string | AttributeMarker | CssSelector)[];
/**
 * Constants that are associated with a view. Includes:
 * - Attribute arrays.
 * - Local definition arrays.
 * - Translated messages (i18n).
 * - Foreign components.
 */
type TConstants = (TAttributes | string | ForeignComponent<any, any>)[];
/**
 * Factory function that returns an array of consts. Consts can be represented as a function in
 * case any additional statements are required to define consts in the list. An example is i18n
 * where additional i18n calls are generated, which should be executed when consts are requested
 * for the first time.
 */
type TConstantsFactory = () => TConstants;
/**
 * TConstants type that describes how the `consts` field is generated on ComponentDef: it can be
 * either an array or a factory function that returns that array.
 */
type TConstantsOrFactory = TConstants | TConstantsFactory;
/**
 * Binding data (flyweight) for a particular node that is shared between all templates
 * of a specific type.
 *
 * If a property is:
 *    - PropertyAliases: that property's data was generated and this is it
 *    - Null: that property's data was already generated and nothing was found.
 *    - Undefined: that property's data has not yet been generated
 *
 * see: https://en.wikipedia.org/wiki/Flyweight_pattern for more on the Flyweight pattern
 */
interface TNode {
    /** The type of the TNode. See TNodeType. */
    type: TNodeType;
    /**
     * Index of the TNode in TView.data and corresponding native element in LView.
     *
     * This is necessary to get from any TNode to its corresponding native element when
     * traversing the node tree.
     *
     * If index is -1, this is a dynamically created container node or embedded view node.
     */
    index: number;
    /**
     * Insert before existing DOM node index.
     *
     * When DOM nodes are being inserted, normally they are being appended as they are created.
     * Under i18n case, the translated text nodes are created ahead of time as part of the
     * `ɵɵi18nStart` instruction which means that this `TNode` can't just be appended and instead
     * needs to be inserted using `insertBeforeIndex` semantics.
     *
     * Additionally sometimes it is necessary to insert new text nodes as a child of this `TNode`. In
     * such a case the value stores an array of text nodes to insert.
     *
     * Example:
     * ```html
     * <div i18n>
     *   Hello <span>World</span>!
     * </div>
     * ```
     * In the above example the `ɵɵi18nStart` instruction can create `Hello `, `World` and `!` text
     * nodes. It can also insert `Hello ` and `!` text node as a child of `<div>`, but it can't
     * insert `World` because the `<span>` node has not yet been created. In such a case the
     * `<span>` `TNode` will have an array which will direct the `<span>` to not only insert
     * itself in front of `!` but also to insert the `World` (created by `ɵɵi18nStart`) into
     * `<span>` itself.
     *
     * Pseudo code:
     * ```ts
     *   if (insertBeforeIndex === null) {
     *     // append as normal
     *   } else if (Array.isArray(insertBeforeIndex)) {
     *     // First insert current `TNode` at correct location
     *     const currentNode = lView[this.index];
     *     parentNode.insertBefore(currentNode, lView[this.insertBeforeIndex[0]]);
     *     // Now append all of the children
     *     for(let i=1; i<this.insertBeforeIndex; i++) {
     *       currentNode.appendChild(lView[this.insertBeforeIndex[i]]);
     *     }
     *   } else {
     *     parentNode.insertBefore(lView[this.index], lView[this.insertBeforeIndex])
     *   }
     * ```
     * - null: Append as normal using `parentNode.appendChild`
     * - `number`: Append using
     *      `parentNode.insertBefore(lView[this.index], lView[this.insertBeforeIndex])`
     *
     * *Initialization*
     *
     * Because `ɵɵi18nStart` executes before nodes are created, on `TView.firstCreatePass` it is not
     * possible for `ɵɵi18nStart` to set the `insertBeforeIndex` value as the corresponding `TNode`
     * has not yet been created. For this reason the `ɵɵi18nStart` creates a `TNodeType.Placeholder`
     * `TNode` at that location. See `TNodeType.Placeholder` for more information.
     */
    insertBeforeIndex: InsertBeforeIndex;
    /**
     * The index of the closest injector in this node's LView.
     *
     * If the index === -1, there is no injector on this node or any ancestor node in this view.
     *
     * If the index !== -1, it is the index of this node's injector OR the index of a parent
     * injector in the same view. We pass the parent injector index down the node tree of a view so
     * it's possible to find the parent injector without walking a potentially deep node tree.
     * Injector indices are not set across view boundaries because there could be multiple component
     * hosts.
     *
     * If tNode.injectorIndex === tNode.parent.injectorIndex, then the index belongs to a parent
     * injector.
     */
    injectorIndex: number;
    /** Stores starting index of the directives. */
    directiveStart: number;
    /**
     * Stores final exclusive index of the directives.
     *
     * The area right behind the `directiveStart-directiveEnd` range is used to allocate the
     * `HostBindingFunction` `vars` (or null if no bindings.) Therefore `directiveEnd` is used to set
     * `LFrame.bindingRootIndex` before `HostBindingFunction` is executed.
     */
    directiveEnd: number;
    /**
     * Offset from the `directiveStart` at which the component (one at most) of the node is stored.
     * Set to -1 if no components have been applied to the node. Component index can be found using
     * `directiveStart + componentOffset`.
     */
    componentOffset: number;
    /**
     * Index at which the signal forms field directive is stored.
     * Value is set to -1 if there are no field directives.
     */
    controlDirectiveIndex: number;
    /**
     * Index at which the custom control directive is stored.
     * Value is set to -1 if there is no custom control directive.
     */
    customControlIndex: number;
    /**
     * Stores the last directive which had a styling instruction.
     *
     * Initial value of this is `-1` which means that no `hostBindings` styling instruction has
     * executed. As `hostBindings` instructions execute they set the value to the index of the
     * `DirectiveDef` which contained the last `hostBindings` styling instruction.
     *
     * Valid values are:
     * - `-1` No `hostBindings` instruction has executed.
     * - `directiveStart <= directiveStylingLast < directiveEnd`: Points to the `DirectiveDef` of
     * the last styling instruction which executed in the `hostBindings`.
     *
     * This data is needed so that styling instructions know which static styling data needs to be
     * collected from the `DirectiveDef.hostAttrs`. A styling instruction needs to collect all data
     * since last styling instruction.
     */
    directiveStylingLast: number;
    /**
     * Stores indexes of property bindings. This field is only set in the ngDevMode and holds
     * indexes of property bindings so TestBed can get bound property metadata for a given node.
     */
    propertyBindings: number[] | null;
    /**
     * Stores if Node isComponent, isProjected, hasContentQuery, hasClassInput and hasStyleInput
     * etc.
     */
    flags: TNodeFlags;
    /**
     * This number stores two values using its bits:
     *
     * - the index of the first provider on that node (first 16 bits)
     * - the count of view providers from the component on this node (last 16 bits)
     */
    providerIndexes: TNodeProviderIndexes;
    /**
     * The value name associated with this node.
     * if type:
     *   `TNodeType.Text`: text value
     *   `TNodeType.Element`: tag name
     *   `TNodeType.ICUContainer`: `TIcu`
     */
    value: any;
    /**
     * The namespace associated with this node.
     */
    namespace: string | null;
    /**
     * Attributes associated with an element. We need to store attributes to support various
     * use-cases (attribute injection, content projection with selectors, directives matching).
     * Attributes are stored statically because reading them from the DOM would be way too slow for
     * content projection and queries.
     *
     * Since attrs will always be calculated first, they will never need to be marked undefined by
     * other instructions.
     *
     * For regular attributes a name of an attribute and its value alternate in the array.
     * e.g. ['role', 'checkbox']
     * This array can contain flags that will indicate "special attributes" (attributes with
     * namespaces, attributes extracted from bindings and outputs).
     */
    attrs: TAttributes | null;
    /**
     * Same as `TNode.attrs` but contains merged data across all directive host bindings.
     *
     * We need to keep `attrs` as unmerged so that it can be used for attribute selectors.
     * We merge attrs here so that it can be used in a performant way for initial rendering.
     *
     * The `attrs` are merged in first pass in following order:
     * - Component's `hostAttrs`
     * - Directives' `hostAttrs`
     * - Template `TNode.attrs` associated with the current `TNode`.
     */
    mergedAttrs: TAttributes | null;
    /**
     * A set of local names under which a given element is exported in a template and
     * visible to queries. An entry in this array can be created for different reasons:
     * - an element itself is referenced, ex.: `<div #foo>`
     * - a component is referenced, ex.: `<my-cmpt #foo>`
     * - a directive is referenced, ex.: `<my-cmpt #foo="directiveExportAs">`.
     *
     * A given element might have different local names and those names can be associated
     * with a directive. We store local names at even indexes while odd indexes are reserved
     * for directive index in a view (or `-1` if there is no associated directive).
     *
     * Some examples:
     * - `<div #foo>` => `["foo", -1]`
     * - `<my-cmpt #foo>` => `["foo", myCmptIdx]`
     * - `<my-cmpt #foo #bar="directiveExportAs">` => `["foo", myCmptIdx, "bar", directiveIdx]`
     * - `<div #foo #bar="directiveExportAs">` => `["foo", -1, "bar", directiveIdx]`
     */
    localNames: (string | number)[] | null;
    /** Information about input properties that need to be set once from attribute data. */
    initialInputs: InitialInputData | null;
    /**
     * Input data for all directives on this node. `null` means that there are no directives with
     * inputs on this node.
     */
    inputs: NodeInputBindings | null;
    /**
     * Input data for host directives applied to the node.
     */
    hostDirectiveInputs: HostDirectiveInputs | null;
    /**
     * Output data for all directives on this node. `null` means that there are no directives with
     * outputs on this node.
     */
    outputs: NodeOutputBindings | null;
    /**
     * Input data for host directives applied to the node.
     */
    hostDirectiveOutputs: HostDirectiveOutputs | null;
    /**
     * Mapping between directive classes applied to the node and their indexes.
     */
    directiveToIndex: DirectiveIndexMap | null;
    /**
     * The TView attached to this node.
     *
     * If this TNode corresponds to an LContainer with a template (e.g. structural
     * directive), the template's TView will be stored here.
     *
     * If this TNode corresponds to an element, tView will be `null`.
     */
    tView: TView | null;
    /**
     * The next sibling node. Necessary so we can propagate through the root nodes of a view
     * to insert them or remove them from the DOM.
     */
    next: TNode | null;
    /**
     * The previous sibling node.
     * This simplifies operations when we need a pointer to the previous node.
     */
    prev: TNode | null;
    /**
     * The next projected sibling. Since in Angular content projection works on the node-by-node
     * basis the act of projecting nodes might change nodes relationship at the insertion point
     * (target view). At the same time we need to keep initial relationship between nodes as
     * expressed in content view.
     */
    projectionNext: TNode | null;
    /**
     * First child of the current node.
     *
     * For component nodes, the child will always be a ContentChild (in same view).
     * For embedded view nodes, the child will be in their child view.
     */
    child: TNode | null;
    /**
     * Parent node (in the same view only).
     *
     * We need a reference to a node's parent so we can append the node to its parent's native
     * element at the appropriate time.
     *
     * If the parent would be in a different view (e.g. component host), this property will be null.
     * It's important that we don't try to cross component boundaries when retrieving the parent
     * because the parent will change (e.g. index, attrs) depending on where the component was
     * used (and thus shouldn't be stored on TNode). In these cases, we retrieve the parent through
     * LView.node instead (which will be instance-specific).
     *
     * If this is an inline view node (V), the parent will be its container.
     */
    parent: TElementNode | TContainerNode | null;
    /**
     * List of projected TNodes for a given component host element OR index into the said nodes.
     *
     * For easier discussion assume this example:
     * `<parent>`'s view definition:
     * ```html
     * <child id="c1">content1</child>
     * <child id="c2"><span>content2</span></child>
     * ```
     * `<child>`'s view definition:
     * ```html
     * <ng-content id="cont1"></ng-content>
     * ```
     *
     * If `Array.isArray(projection)` then `TNode` is a host element:
     * - `projection` stores the content nodes which are to be projected.
     *    - The nodes represent categories defined by the selector: For example:
     *      `<ng-content/><ng-content select="abc"/>` would represent the heads for `<ng-content/>`
     *      and `<ng-content select="abc"/>` respectively.
     *    - The nodes we store in `projection` are heads only, we used `.next` to get their
     *      siblings.
     *    - The nodes `.next` is sorted/rewritten as part of the projection setup.
     *    - `projection` size is equal to the number of projections `<ng-content>`. The size of
     *      `c1` will be `1` because `<child>` has only one `<ng-content>`.
     * - we store `projection` with the host (`c1`, `c2`) rather than the `<ng-content>` (`cont1`)
     *   because the same component (`<child>`) can be used in multiple locations (`c1`, `c2`) and
     * as a result have different set of nodes to project.
     * - without `projection` it would be difficult to efficiently traverse nodes to be projected.
     *
     * If `typeof projection == 'number'` then `TNode` is a `<ng-content>` element:
     * - `projection` is an index of the host's `projection`Nodes.
     *   - This would return the first head node to project:
     *     `getHost(currentTNode).projection[currentTNode.projection]`.
     * - When projecting nodes the parent node retrieved may be a `<ng-content>` node, in which case
     *   the process is recursive in nature.
     *
     * If `projection` is of type `RNode[][]` than we have a collection of native nodes passed as
     * projectable nodes during dynamic component creation.
     */
    projection: (TNode | RNode[])[] | number | null;
    /**
     * A collection of all `style` static values for an element (including from host).
     *
     * This field will be populated if and when:
     *
     * - There are one or more initial `style`s on an element (e.g. `<div style="width:200px;">`)
     * - There are one or more initial `style`s on a directive/component host
     *   (e.g. `@Directive({host: {style: "width:200px;" } }`)
     */
    styles: string | null;
    /**
     * A collection of all `style` static values for an element excluding host sources.
     *
     * Populated when there are one or more initial `style`s on an element
     * (e.g. `<div style="width:200px;">`)
     * Must be stored separately from `tNode.styles` to facilitate setting directive
     * inputs that shadow the `style` property. If we used `tNode.styles` as is for shadowed inputs,
     * we would feed host styles back into directives as "inputs". If we used `tNode.attrs`, we
     * would have to concatenate the attributes on every template pass. Instead, we process once on
     * first create pass and store here.
     */
    stylesWithoutHost: string | null;
    /**
     * A `KeyValueArray` version of residual `styles`.
     *
     * When there are styling instructions than each instruction stores the static styling
     * which is of lower priority than itself. This means that there may be a higher priority
     * styling than the instruction.
     *
     * Imagine:
     * ```angular-ts
     * <div style="color: highest;" my-dir>
     *
     * @Directive({
     *   host: {
     *     style: 'color: lowest; ',
     *     '[styles.color]': 'exp' // ɵɵstyleProp('color', ctx.exp);
     *   }
     * })
     * ```
     *
     * In the above case:
     * - `color: lowest` is stored with `ɵɵstyleProp('color', ctx.exp);` instruction
     * -  `color: highest` is the residual and is stored here.
     *
     * - `undefined': not initialized.
     * - `null`: initialized but `styles` is `null`
     * - `KeyValueArray`: parsed version of `styles`.
     */
    residualStyles: KeyValueArray<any> | undefined | null;
    /**
     * A collection of all class static values for an element (including from host).
     *
     * This field will be populated if and when:
     *
     * - There are one or more initial classes on an element (e.g. `<div class="one two three">`)
     * - There are one or more initial classes on an directive/component host
     *   (e.g. `@Directive({host: {class: "SOME_CLASS" } }`)
     */
    classes: string | null;
    /**
     * A collection of all class static values for an element excluding host sources.
     *
     * Populated when there are one or more initial classes on an element
     * (e.g. `<div class="SOME_CLASS">`)
     * Must be stored separately from `tNode.classes` to facilitate setting directive
     * inputs that shadow the `class` property. If we used `tNode.classes` as is for shadowed
     * inputs, we would feed host classes back into directives as "inputs". If we used
     * `tNode.attrs`, we would have to concatenate the attributes on every template pass. Instead,
     * we process once on first create pass and store here.
     */
    classesWithoutHost: string | null;
    /**
     * A `KeyValueArray` version of residual `classes`.
     *
     * Same as `TNode.residualStyles` but for classes.
     *
     * - `undefined': not initialized.
     * - `null`: initialized but `classes` is `null`
     * - `KeyValueArray`: parsed version of `classes`.
     */
    residualClasses: KeyValueArray<any> | undefined | null;
    /**
     * Stores the head/tail index of the class bindings.
     *
     * - If no bindings, the head and tail will both be 0.
     * - If there are template bindings, stores the head/tail of the class bindings in the template.
     * - If no template bindings but there are host bindings, the head value will point to the last
     *   host binding for "class" (not the head of the linked list), tail will be 0.
     *
     * See: `style_binding_list.ts` for details.
     *
     * This is used by `insertTStylingBinding` to know where the next styling binding should be
     * inserted so that they can be sorted in priority order.
     */
    classBindings: TStylingRange;
    /**
     * Stores the head/tail index of the class bindings.
     *
     * - If no bindings, the head and tail will both be 0.
     * - If there are template bindings, stores the head/tail of the style bindings in the template.
     * - If no template bindings but there are host bindings, the head value will point to the last
     *   host binding for "style" (not the head of the linked list), tail will be 0.
     *
     * See: `style_binding_list.ts` for details.
     *
     * This is used by `insertTStylingBinding` to know where the next styling binding should be
     * inserted so that they can be sorted in priority order.
     */
    styleBindings: TStylingRange;
}
/**
 * See `TNode.insertBeforeIndex`
 */
type InsertBeforeIndex = null | number | number[];
/** Static data for an element  */
interface TElementNode extends TNode {
    /** Index in the data[] array */
    index: number;
    child: TElementNode | TTextNode | TElementContainerNode | TContainerNode | TProjectionNode | null;
    /**
     * Element nodes will have parents unless they are the first node of a component or
     * embedded view (which means their parent is in a different view and must be
     * retrieved using viewData[HOST_NODE]).
     */
    parent: TElementNode | TElementContainerNode | null;
    tView: null;
    /**
     * If this is a component TNode with projection, this will be an array of projected
     * TNodes or native nodes (see TNode.projection for more info). If it's a regular element node
     * or a component without projection, it will be null.
     */
    projection: (TNode | RNode[])[] | null;
    /**
     * Stores TagName
     */
    value: string;
}
/** Static data for a text node */
interface TTextNode extends TNode {
    /** Index in the data[] array */
    index: number;
    child: null;
    /**
     * Text nodes will have parents unless they are the first node of a component or
     * embedded view (which means their parent is in a different view and must be
     * retrieved using LView.node).
     */
    parent: TElementNode | TElementContainerNode | null;
    tView: null;
    projection: null;
}
/** Static data for an LContainer */
interface TContainerNode extends TNode {
    /**
     * Index in the data[] array.
     *
     * If it's -1, this is a dynamically created container node that isn't stored in
     * data[] (e.g. when you inject ViewContainerRef) .
     */
    index: number;
    child: null;
    /**
     * Container nodes will have parents unless:
     *
     * - They are the first node of a component or embedded view
     * - They are dynamically created
     */
    parent: TElementNode | TElementContainerNode | null;
    tView: TView | null;
    projection: null;
    value: null;
}
/** Static data for an <ng-container> */
interface TElementContainerNode extends TNode {
    /** Index in the LView[] array. */
    index: number;
    child: TElementNode | TTextNode | TContainerNode | TElementContainerNode | TProjectionNode | null;
    parent: TElementNode | TElementContainerNode | null;
    tView: null;
    projection: null;
}
/** Static data for an LProjectionNode  */
interface TProjectionNode extends TNode {
    /** Index in the data[] array */
    child: null;
    /**
     * Projection nodes will have parents unless they are the first node of a component
     * or embedded view (which means their parent is in a different view and must be
     * retrieved using LView.node).
     */
    parent: TElementNode | TElementContainerNode | null;
    tView: null;
    /** Index of the projection node. (See TNode.projection for more info.) */
    projection: number;
    value: null;
}
/**
 * Maps the public names of outputs available on a specific node to the index
 * of the directive instance that defines the output, for example:
 *
 * ```
 * {
 *   "publicName": [0, 5]
 * }
 * ```
 */
type NodeOutputBindings = Record<string, number[]>;
/**
 * Maps the public names of inputs applied to a specific node to the index of the
 * directive instance to which the input value should be written, for example:
 *
 * ```
 * {
 *   "publicName": [0, 5]
 * }
 * ```
 */
type NodeInputBindings = Record<string, number[]>;
/**
 * This array contains information about input properties that
 * need to be set once from attribute data. It's ordered by
 * directive index (relative to element) so it's simple to
 * look up a specific directive's initial input data.
 *
 * Within each sub-array:
 *
 * i+0: public name
 * i+1: initial value
 *
 * If a directive on a node does not have any input properties
 * that should be set from attributes, its index is set to null
 * to avoid a sparse array.
 *
 * e.g. [null, ['role-min', 'minified-input', 'button']]
 */
type InitialInputData = (InitialInputs | null)[];
/**
 * Used by InitialInputData to store input properties
 * that should be set once from attributes.
 *
 * i+0: attribute name
 * i+1: minified/internal input name
 * i+2: input flags
 * i+3: initial value
 *
 * e.g. ['role-min', 'minified-input', 'button']
 */
type InitialInputs = string[];
/**
 * Represents inputs coming from a host directive and exposed on a TNode.
 *
 * - The key is the public name of an input as it is exposed on the specific node.
 * - The value is an array where:
 *   - i+0: Index of the host directive that should be written to.
 *   - i+1: Public name of the input as it was defined on the host directive before aliasing.
 */
type HostDirectiveInputs = Record<string, (number | string)[]>;
/**
 * Represents outputs coming from a host directive and exposed on a TNode.
 *
 * - The key is the public name of an output as it is exposed on the specific node.
 * - The value is an array where:
 *   - i+0: Index of the host directive on which the output is defined..
 *   - i+1: Public name of the output as it was defined on the host directive before aliasing.
 */
type HostDirectiveOutputs = Record<string, (number | string)[]>;
/**
 * Represents a map between a class reference and the index at which its directive is available on
 * a specific TNode. The value can be either:
 *   1. A number means that there's only one selector-matched directive on the node and it
 *      doesn't have any host directives.
 *   2. An array means that there's a selector-matched directive and it has host directives.
 *      The array is structured as follows:
 *        - 0: Index of the selector-matched directive.
 *        - 1: Start index of the range within which the host directives are defined.
 *        - 2: End of the host directive range.
 *
 * Example:
 * ```
 * Map {
 *   [NoHostDirectives]: 5,
 *   [HasHostDirectives]: [10, 6, 8],
 * }
 * ```
 */
type DirectiveIndexMap = Map<Type<unknown> | AbstractType<unknown>, number | [directiveIndex: number, hostDirectivesStart: number, hostDirectivesEnd: number]>;
/**
 * Type representing a set of TNodes that can have local refs (`#foo`) placed on them.
 */
type TNodeWithLocalRefs = TContainerNode | TElementNode | TElementContainerNode;
/**
 * Type for a function that extracts a value for a local refs.
 * Example:
 * - `<div #nativeDivEl>` - `nativeDivEl` should point to the native `<div>` element;
 * - `<ng-template #tplRef>` - `tplRef` should point to the `TemplateRef` instance;
 */
type LocalRefExtractor = (tNode: TNodeWithLocalRefs, currentView: LView) => any;

/**
 * Special location which allows easy identification of type. If we have an array which was
 * retrieved from the `LView` and that array has `true` at `TYPE` location, we know it is
 * `LContainer`.
 */
declare const TYPE = 1;
/**
 * Below are constants for LContainer indices to help us look up LContainer members
 * without having to remember the specific indices.
 * Uglify will inline these when minifying so there shouldn't be a cost.
 */
declare const DEHYDRATED_VIEWS = 6;
declare const NATIVE = 7;
declare const VIEW_REFS = 8;
declare const MOVED_VIEWS = 9;
/**
 * Size of LContainer's header. Represents the index after which all views in the
 * container will be inserted. We need to keep a record of current views so we know
 * which views are already in the DOM (and don't need to be re-added) and so we can
 * remove views from the DOM when they are no longer required.
 */
declare const CONTAINER_HEADER_OFFSET = 10;
/**
 * The state associated with a container.
 *
 * This is an array so that its structure is closer to LView. This helps
 * when traversing the view tree (which is a mix of containers and component
 * views), so we can jump to viewOrContainer[NEXT] in the same way regardless
 * of type.
 */
interface LContainer extends Array<any> {
    /**
     * The host element of this LContainer.
     *
     * The host could be an LView if this container is on a component node.
     * In that case, the component LView is its HOST.
     */
    readonly [HOST]: RElement | RComment | LView;
    /**
     * This is a type field which allows us to differentiate `LContainer` from `StylingContext` in an
     * efficient way. The value is always set to `true`
     */
    [TYPE]: true;
    /** Flags for this container. See LContainerFlags for more info. */
    [FLAGS]: LContainerFlags;
    /**
     * Access to the parent view is necessary so we can propagate back
     * up from inside a container to parent[NEXT].
     */
    [PARENT]: LView;
    /**
     * This allows us to jump from a container to a sibling container or component
     * view with the same parent, so we can remove listeners efficiently.
     */
    [NEXT]: LView | LContainer | null;
    /**
     * A collection of views created based on the underlying `<ng-template>` element but inserted into
     * a different `LContainer`. We need to track views created from a given declaration point since
     * queries collect matches from the embedded view declaration point and _not_ the insertion point.
     */
    [MOVED_VIEWS]: LView[] | null;
    /**
     * Pointer to the `TNode` which represents the host of the container.
     */
    [T_HOST]: TNode;
    /** The comment element that serves as an anchor for this LContainer. */
    [NATIVE]: RComment;
    /**
     * Array of `ViewRef`s used by any `ViewContainerRef`s that point to this container.
     *
     * This is lazily initialized by `ViewContainerRef` when the first view is inserted.
     *
     * NOTE: This is stored as `any[]` because render3 should really not be aware of `ViewRef` and
     * doing so creates circular dependency.
     */
    [VIEW_REFS]: unknown[] | null;
    /**
     * Array of dehydrated views within this container.
     *
     * This information is used during the hydration process on the client.
     * The hydration logic tries to find a matching dehydrated view, "claim" it
     * and use this information to do further matching. After that, this "claimed"
     * view is removed from the list. The remaining "unclaimed" views are
     * "garbage-collected" later on, i.e. removed from the DOM once the hydration
     * logic finishes.
     */
    [DEHYDRATED_VIEWS]: DehydratedContainerView[] | null;
}
/** Flags associated with an LContainer (saved in LContainer[FLAGS]) */
declare const enum LContainerFlags {
    None = 0,
    /**
     * Flag to signify that this `LContainer` may have transplanted views which need to be change
     * detected. (see: `LView[DECLARATION_COMPONENT_VIEW])`.
     *
     * This flag, once set, is never unset for the `LContainer`.
     */
    HasTransplantedViews = 2,
    /**
     * Flag to signify that this `LContainer` is logical-only and its views should not be added
     * to or removed from the rendering tree by the platform renderer.
     */
    LogicalOnly = 4
}

/**
 * Information about how a type or `InjectionToken` interfaces with the DI system.
 *
 * At a minimum, this includes a `factory` which defines how to create the given type `T`, possibly
 * requesting injection of other types if necessary.
 *
 * Optionally, a `providedIn` parameter specifies that the given type belongs to a particular
 * `Injector`, `NgModule`, or a special scope (e.g. `'root'`). A value of `null` indicates
 * that the injectable does not belong to any scope.
 *
 * @codeGenApi
 * @publicApi The ViewEngine compiler emits code with this type for injectables. This code is
 *   deployed to npm, and should be treated as public api.

 */
interface ɵɵInjectableDeclaration<T> {
    /**
     * Specifies that the given type belongs to a particular injector:
     * - `InjectorType` such as `NgModule`,
     * - `'root'` the root injector
     * - `'any'` all injectors.
     * - `null`, does not belong to any injector. Must be explicitly listed in the injector
     *   `providers`.
     */
    providedIn: InjectorType<any> | 'root' | 'platform' | 'any' | 'environment' | null;
    /**
     * The token to which this definition belongs.
     *
     * Note that this may not be the same as the type that the `factory` will create.
     */
    token: unknown;
    /**
     * Factory method to execute to create an instance of the injectable.
     */
    factory: (t?: Type<any>) => any;
    /**
     * In a case of no explicit injector, a location where the instance of the injectable is stored.
     */
    value: any;
}
/**
 * Information about the providers to be included in an `Injector` as well as how the given type
 * which carries the information should be created by the DI system.
 *
 * An `InjectorDef` can import other types which have `InjectorDefs`, forming a deep nested
 * structure of providers with a defined priority (identically to how `NgModule`s also have
 * an import/dependency structure).
 *
 * NOTE: This is a private type and should not be exported
 *
 * @codeGenApi
 */
interface ɵɵInjectorDef<T> {
    providers: (Type<any> | ValueProvider | ExistingProvider | FactoryProvider | ConstructorProvider | StaticClassProvider | ClassProvider | EnvironmentProviders | any[])[];
    imports: (InjectorType<any> | InjectorTypeWithProviders<any>)[];
}
/**
 * A `Type` which has a `ɵprov: ɵɵInjectableDeclaration` static field.
 *
 * `InjectableType`s contain their own Dependency Injection metadata and are usable in an
 * `InjectorDef`-based `StaticInjector`.
 *
 * @publicApi
 */
interface InjectableType<T> extends Type<T> {
    /**
     * Opaque type whose structure is highly version dependent. Do not rely on any properties.
     */
    ɵprov: unknown;
}
/**
 * A type which has an `InjectorDef` static field.
 *
 * `InjectorTypes` can be used to configure a `StaticInjector`.
 *
 * This is an opaque type whose structure is highly version dependent. Do not rely on any
 * properties.
 *
 * @publicApi
 */
interface InjectorType<T> extends Type<T> {
    ɵfac?: unknown;
    ɵinj: unknown;
}
/**
 * Describes the `InjectorDef` equivalent of a `ModuleWithProviders`, an `InjectorType` with an
 * associated array of providers.
 *
 * Objects of this type can be listed in the imports section of an `InjectorDef`.
 *
 * NOTE: This is a private type and should not be exported
 */
interface InjectorTypeWithProviders<T> {
    ngModule: InjectorType<T>;
    providers?: (Type<any> | ValueProvider | ExistingProvider | FactoryProvider | ConstructorProvider | StaticClassProvider | ClassProvider | EnvironmentProviders | any[])[];
}
/**
 * Construct an injectable definition which defines how a token will be constructed by the DI
 * system, and in which injectors (if any) it will be available.
 *
 * This should be assigned to a static `ɵprov` field on a type, which will then be an
 * `InjectableType`.
 *
 * Options:
 * * `providedIn` determines which injectors will include the injectable, by either associating it
 *   with an `@NgModule` or other `InjectorType`, or by specifying that this injectable should be
 *   provided in the `'root'` injector, which will be the application-level injector in most apps.
 * * `factory` gives the zero argument function which will create an instance of the injectable.
 *   The factory can call [`inject`](api/core/inject) to access the `Injector` and request injection
 * of dependencies.
 *
 * @codeGenApi
 * @publicApi This instruction has been emitted by ViewEngine for some time and is deployed to npm.
 */
declare function ɵɵdefineInjectable<T>(opts: {
    token: unknown;
    providedIn?: Type<any> | 'root' | 'platform' | 'any' | 'environment' | null;
    factory: (parent?: Type<any>) => T;
}): ɵɵInjectableDeclaration<T>;
/**
 * Construct an `InjectorDef` which configures an injector.
 *
 * This should be assigned to a static injector def (`ɵinj`) field on a type, which will then be an
 * `InjectorType`.
 *
 * Options:
 *
 * * `providers`: an optional array of providers to add to the injector. Each provider must
 *   either have a factory or point to a type which has a `ɵprov` static property (the
 *   type must be an `InjectableType`).
 * * `imports`: an optional array of imports of other `InjectorType`s or `InjectorTypeWithModule`s
 *   whose providers will also be added to the injector. Locally provided types will override
 *   providers from imports.
 *
 * @codeGenApi
 */
declare function ɵɵdefineInjector(options: {
    providers?: any[];
    imports?: any[];
}): unknown;
/**
 * Read the injectable def (`ɵprov`) for `type` in a way which is immune to accidentally reading
 * inherited value.
 *
 * @param type A type which may have its own (non-inherited) `ɵprov`.
 */
declare function getInjectableDef<T>(type: any): ɵɵInjectableDeclaration<T> | null;
declare function isInjectable(type: any): boolean;
declare const NG_PROV_DEF: string;
declare const NG_INJ_DEF: string;

type InjectorScope = 'root' | 'platform' | 'environment';
/**
 * An internal token whose presence in an injector indicates that the injector should treat itself
 * as a root scoped injector when processing requests for unknown tokens which may indicate
 * they are provided in the root scope.
 */
declare const INJECTOR_SCOPE: InjectionToken<InjectorScope | null>;

/**
 * An `Injector` that's part of the environment injector hierarchy, which exists outside of the
 * component tree.
 *
 * @see [Types of injector hierarchies](guide/di/hierarchical-dependency-injection#types-of-injector-hierarchies)
 *
 * @publicApi
 */
declare abstract class EnvironmentInjector implements Injector {
    /**
     * Retrieves an instance from the injector based on the provided token.
     * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
     * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
     */
    abstract get<T>(token: ProviderToken<T>, notFoundValue: undefined, options: InjectOptions & {
        optional?: false;
    }): T;
    /**
     * Retrieves an instance from the injector based on the provided token.
     * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
     * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
     */
    abstract get<T>(token: ProviderToken<T>, notFoundValue: null | undefined, options: InjectOptions): T | null;
    /**
     * Retrieves an instance from the injector based on the provided token.
     * @returns The instance from the injector if defined, otherwise the `notFoundValue`.
     * @throws When the `notFoundValue` is `undefined` or `Injector.THROW_IF_NOT_FOUND`.
     */
    abstract get<T>(token: ProviderToken<T>, notFoundValue?: T, options?: InjectOptions): T;
    /**
     * @deprecated from v4.0.0 use ProviderToken<T>
     * @suppress {duplicate}
     */
    abstract get<T>(token: string | ProviderToken<T>, notFoundValue?: any): any;
    /**
     * Runs the given function in the context of this `EnvironmentInjector`.
     *
     * Within the function's stack frame, [`inject`](api/core/inject) can be used to inject
     * dependencies from this injector. Note that `inject` is only usable synchronously, and cannot be
     * used in any asynchronous callbacks or after any `await` points.
     *
     * @param fn the closure to be run in the context of this injector
     * @returns the return value of the function, if any
     * @deprecated use the standalone function `runInInjectionContext` instead
     */
    abstract runInContext<ReturnT>(fn: () => ReturnT): ReturnT;
    abstract destroy(): void;
    /**
     * Indicates whether the instance has already been destroyed.
     */
    abstract get destroyed(): boolean;
}
declare class R3Injector extends EnvironmentInjector implements Injector$1 {
    readonly parent: Injector;
    readonly source: string | null;
    readonly scopes: Set<InjectorScope>;
    /**
     * Map of tokens to records which contain the instances of those tokens.
     * - `null` value implies that we don't have the record. Used by tree-shakable injectors
     * to prevent further searches.
     */
    private records;
    /**
     * Set of values instantiated by this injector which contain `ngOnDestroy` lifecycle hooks.
     */
    private _ngOnDestroyHooks;
    private _onDestroyHooks;
    /**
     * Flag indicating that this injector was previously destroyed.
     */
    get destroyed(): boolean;
    private _destroyed;
    private injectorDefTypes;
    constructor(providers: Array<Provider | EnvironmentProviders>, parent: Injector, source: string | null, scopes: Set<InjectorScope>);
    retrieve<T>(token: InjectionToken$1<T>, options?: unknown): T | NotFound;
    /**
     * Destroy the injector and release references to every instance or provider associated with it.
     *
     * Also calls the `OnDestroy` lifecycle hooks of every instance that was created for which a
     * hook was found.
     */
    destroy(): void;
    onDestroy(callback: () => void): () => void;
    runInContext<ReturnT>(fn: () => ReturnT): ReturnT;
    get<T>(token: ProviderToken<T>, notFoundValue?: any, options?: InjectOptions): T;
    toString(): string;
    /**
     * Process a `SingleProvider` and add it.
     */
    private processProvider;
    private hydrate;
    private injectableDefInScope;
    private removeOnDestroy;
}

/**
 * A schema definition associated with a component or an NgModule.
 *
 * @see {@link NgModule}
 * @see {@link CUSTOM_ELEMENTS_SCHEMA}
 * @see {@link NO_ERRORS_SCHEMA}
 *
 * @param name The name of a defined schema.
 *
 * @publicApi
 */
interface SchemaMetadata {
    name: string;
}
/**
 * Defines a schema that allows an NgModule to contain the following:
 * - Non-Angular elements named with dash case (`-`).
 * - Element properties named with dash case (`-`).
 * Dash case is the naming convention for custom elements.
 *
 * @publicApi
 */
declare const CUSTOM_ELEMENTS_SCHEMA: SchemaMetadata;
/**
 * Defines a schema that allows any property on any element.
 *
 * This schema allows you to ignore the errors related to any unknown elements or properties in a
 * template. The usage of this schema is generally discouraged because it prevents useful validation
 * and may hide real errors in your template. Consider using the `CUSTOM_ELEMENTS_SCHEMA` instead.
 *
 * @publicApi
 */
declare const NO_ERRORS_SCHEMA: SchemaMetadata;

/**
 * Defines the CSS styles encapsulation policies for the {@link /api/core/Component Component} decorator's
 * `encapsulation` option.
 *
 * See {@link Component#encapsulation encapsulation}.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/ts/metadata/encapsulation.ts region='longform'}
 *
 * @publicApi
 */
declare enum ViewEncapsulation {
    /**
     * Emulates a native Shadow DOM encapsulation behavior by adding a specific attribute to the
     * component's host element and applying the same attribute to all the CSS selectors provided
     * via {@link Component#styles styles} or {@link Component#styleUrls styleUrls}.
     *
     * This is the default option.
     */
    Emulated = 0,
    /**
     * Doesn't provide any sort of CSS style encapsulation, meaning that all the styles provided
     * via {@link Component#styles styles} or {@link Component#styleUrls styleUrls} are applicable
     * to any HTML element of the application regardless of their host Component.
     */
    None = 2,
    /**
     * Uses the browser's native Shadow DOM API to encapsulate CSS styles, meaning that it creates
     * a ShadowRoot for the component's host element which is then used to encapsulate
     * all the Component's styling.
     */
    ShadowDom = 3,
    /**
     * Similar to `ShadowDom`, but prevents any external styles from leaking into the
     * component's ShadowRoot. This is useful when you want to ensure that the component's
     * styles are completely isolated from the rest of the application, including global styles.
     *
     * @experimental 21.0
     */
    ExperimentalIsolatedShadowDom = 4
}

/**
 * Definition of what a factory function should look like.
 */
type FactoryFn<T> = {
    /**
     * Subclasses without an explicit constructor call through to the factory of their base
     * definition, providing it with their own constructor to instantiate.
     */
    <U extends T>(t?: Type<U>): U;
    /**
     * If no constructor to instantiate is provided, an instance of type T itself is created.
     */
    (t?: undefined): T;
};

/**
 * A control directive definition that captures control-related behavior for a directive.
 *
 * This is the type of `DirectiveDef.controlDef`.
 *
 * @see ɵɵControlFeature
 */
interface ControlDirectiveDef {
    readonly passThroughInput: string | null;
    readonly create: (instance: unknown, host: ControlDirectiveHost) => void;
    readonly update: (instance: unknown, host: ControlDirectiveHost) => void;
}
/**
 * Interface provided by the runtime to directives that act as form controls, as the argument to
 * `ɵngControlCreate` and `ɵngControlUpdate` lifecycle hooks.
 *
 * @param _TPassthroughInput if given, the name of an input which, if found on other directives,
 *   will cause the control infrastructure to recognize this usage as "pass-through". This sets
 *   the `hasPassThrough` flag. This generic is only read by the compiler on the type declaration
 *   of `ɵngControlCreate`, and has no impact on the type of the host.
 */
interface ControlDirectiveHost<_TPassthroughInput extends string | undefined = undefined> {
    /**
     * A string that describes this control directive, used for error messages.
     */
    readonly descriptor: string;
    /**
     * Whether any other directive on the element has an input that matches this directive's
     * `_TPassThroughInput` declaration.
     */
    readonly hasPassThrough: boolean;
    /**
     * A `FormUiControl` instance that this directive is declared on.
     */
    readonly customControl: unknown | undefined;
    /** The native DOM element for the host node, if applicable. */
    readonly nativeElement: HTMLElement;
    /**
     * Registers a listener that will be called when the custom control's value changes.
     *
     * This abstracts over the fact that different types of custom controls use different model
     * names (`value` vs `checked`).
     */
    listenToCustomControlModel(listener: (value: unknown) => void): void;
    /**
     * Registers a listener that will be called when the custom control emits an output.
     */
    listenToCustomControlOutput(outputName: string, listener: () => void): void;
    /**
     * Sets the custom control's value.
     *
     * This abstracts over the fact that different types of custom controls use different model
     * names (`value` vs `checked`).
     */
    setCustomControlModelInput(value: unknown): void;
    /**
     * Checks if the custom control has an input with the given name.
     */
    customControlHasInput(inputName: string): boolean;
    /**
     * Updates a property binding on all directives on this node, aside from the control directive
     * itself.
     *
     * @param inputName Name of the input to update.
     * @param value New value to write to the input.
     * @param writePredicate Optional predicate function that receives the current value of the
     * input to decide if the value should be written.
     */
    setInputOnDirectives(inputName: string, value: unknown, writePredicate?: (currentValue: unknown) => boolean): boolean;
    /**
     * Listens to a DOM event on the host element.
     */
    listenToDom(eventName: string, listener: (event: Event) => void): void;
}

/**
 * Definition of what a template rendering function should look like for a component.
 */
type ComponentTemplate<T> = {
    <U extends T>(rf: RenderFlags, ctx: T | U): void;
};
/**
 * Definition of what a view queries function should look like.
 */
type ViewQueriesFunction<T> = <U extends T>(rf: RenderFlags, ctx: U) => void;
/** Function that resolves providers and publishes them to the DI system. */
type ProvidersResolver = (def: DirectiveDef<unknown>, processProvidersFn?: ProcessProvidersFunction) => void;
/**
 * Definition of what a content queries function should look like.
 */
type ContentQueriesFunction<T> = <U extends T>(rf: RenderFlags, ctx: U, directiveIndex: number) => void;
interface ClassDebugInfo {
    className: string;
    filePath?: string;
    lineNumber?: number;
    forbidOrphanRendering?: boolean;
}
/**
 * Flags passed into template functions to determine which blocks (i.e. creation, update)
 * should be executed.
 *
 * Typically, a template runs both the creation block and the update block on initialization and
 * subsequent runs only execute the update block. However, dynamically created views require that
 * the creation block be executed separately from the update block (for backwards compat).
 */
declare const enum RenderFlags {
    Create = 1,
    Update = 2
}
/**
 * A subclass of `Type` which has a static `ɵcmp`:`ComponentDef` field making it
 * consumable for rendering.
 */
interface ComponentType<T> extends Type<T> {
    ɵcmp: unknown;
}
/**
 * A subclass of `Type` which has a static `ɵdir`:`DirectiveDef` field making it
 * consumable for rendering.
 */
interface DirectiveType<T> extends Type<T> {
    ɵdir: unknown;
    ɵfac: unknown;
}
/**
 * A subclass of `Type` which has a static `ɵpipe`:`PipeDef` field making it
 * consumable for rendering.
 */
interface PipeType<T> extends Type<T> {
    ɵpipe: unknown;
}
/**
 * Runtime link information for Directives.
 *
 * This is an internal data structure used by the render to link
 * directives into templates.
 *
 * NOTE: Always use `defineDirective` function to create this object,
 * never create the object directly since the shape of this object
 * can change between versions.
 *
 * @param Selector type metadata specifying the selector of the directive or component
 *
 * See: {@link defineDirective}
 */
interface DirectiveDef<T> {
    /**
     * A dictionary mapping the inputs' public name to their minified property names
     * (along with flags if there are any).
     */
    readonly inputs: Record<string, [
        minifiedName: string,
        flags: number,
        transform: InputTransformFunction | null
    ]>;
    /**
     * Contains the raw input information produced by the compiler. Can be
     * used to do further processing after the `inputs` have been inverted.
     */
    readonly inputConfig: {
        [P in keyof T]?: string | [number, string, string?, InputTransformFunction?];
    };
    /**
     * @deprecated This is only here because `NgOnChanges` incorrectly uses declared name instead of
     * public or minified name.
     */
    readonly declaredInputs: Record<string, string>;
    /**
     * A dictionary mapping the outputs' minified property names to their public API names, which
     * are their aliases if any, or their original unminified property names
     * (as in `@Output('alias') propertyName: any;`).
     */
    readonly outputs: Record<string, string>;
    /**
     * Function to create and refresh content queries associated with a given directive.
     */
    contentQueries: ContentQueriesFunction<T> | null;
    /**
     * Query-related instructions for a directive. Note that while directives don't have a
     * view and as such view queries won't necessarily do anything, there might be
     * components that extend the directive.
     */
    viewQuery: ViewQueriesFunction<T> | null;
    /**
     * Refreshes host bindings on the associated directive.
     */
    readonly hostBindings: HostBindingsFunction<T> | null;
    /**
     * The number of bindings in this directive `hostBindings` (including pure fn bindings).
     *
     * Used to calculate the length of the component's LView array, so we
     * can pre-fill the array and set the host binding start index.
     */
    readonly hostVars: number;
    /**
     * Assign static attribute values to a host element.
     *
     * This property will assign static attribute values as well as class and style
     * values to a host element. Since attribute values can consist of different types of values, the
     * `hostAttrs` array must include the values in the following format:
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
    readonly hostAttrs: TAttributes | null;
    /** Token representing the directive. Used by DI. */
    readonly type: Type<T> | AbstractType<T>;
    /** Function that resolves `providers` and publishes them into the DI system. */
    providersResolver: ProvidersResolver | null;
    /** Function that resolves `viewProviders` and publishes them into the DI system. */
    viewProvidersResolver: ProvidersResolver | null;
    /** The selectors that will be used to match nodes to this directive. */
    readonly selectors: CssSelectorList;
    /**
     * Name under which the directive is exported (for use with local references in template)
     */
    readonly exportAs: string[] | null;
    /**
     * Whether this directive (or component) is standalone.
     */
    readonly standalone: boolean;
    /**
     * Whether this directive (or component) uses the signals authoring experience.
     */
    readonly signals: boolean;
    /**
     * Factory function used to create a new directive instance. Will be null initially.
     * Populated when the factory is first requested by directive instantiation logic.
     */
    readonly factory: FactoryFn<T> | null;
    /**
     * The features applied to this directive
     */
    readonly features: DirectiveDefFeature[] | null;
    /**
     * Info related to debugging/troubleshooting for this component. This info is only available in
     * dev mode.
     */
    debugInfo: ClassDebugInfo | null;
    /**
     * Function inteded to be called after template selector matching is done
     * in order to resolve information about their host directives. Patched
     * onto the definition by the `ɵɵHostDirectivesFeature`.
     */
    resolveHostDirectives: ((matches: DirectiveDef<unknown>[]) => HostDirectiveResolution) | null;
    /**
     * Additional directives to be applied whenever the directive has been matched.
     *
     * `HostDirectiveConfig` objects represent a host directive that can be resolved eagerly and were
     * already pre-processed when the definition was created. A function needs to be resolved lazily
     * during directive matching, because it's a forward reference.
     *
     * **Note:** we can't use `HostDirectiveConfig` in the array, because there's no way to
     * distinguish if a function in the array is a `Type` or a `() => HostDirectiveConfig[]`.
     */
    hostDirectives: (HostDirectiveDef | (() => HostDirectiveConfig[]))[] | null;
    controlDef: ControlDirectiveDef | null;
    /**
     * Cache of inputs that this custom control directive covers,
     * used by the signal forms system.
     */
    signalFormsInputPresence: Record<string, boolean> | null;
    setInput: (<U extends T>(this: DirectiveDef<U>, instance: U, inputSignalNode: null | InputSignalNode<unknown, unknown>, value: any, publicName: string, privateName: string) => void) | null;
}
/**
 * Runtime link information for Components.
 *
 * This is an internal data structure used by the render to link
 * components into templates.
 *
 * NOTE: Always use `defineComponent` function to create this object,
 * never create the object directly since the shape of this object
 * can change between versions.
 *
 * See: {@link defineComponent}
 */
interface ComponentDef<T> extends DirectiveDef<T> {
    /**
     * Unique ID for the component. Used in view encapsulation and
     * to keep track of the injector in standalone components.
     */
    readonly id: string;
    /**
     * The View template of the component.
     */
    readonly template: ComponentTemplate<T>;
    /** Constants associated with the component's view. */
    readonly consts: TConstantsOrFactory | null;
    /**
     * An array of `ngContent[selector]` values that were found in the template.
     */
    readonly ngContentSelectors?: string[];
    /**
     * A set of styles that the component needs to be present for component to render correctly.
     */
    readonly styles: string[];
    /**
     * The number of nodes, local refs, and pipes in this component template.
     *
     * Used to calculate the length of the component's LView array, so we
     * can pre-fill the array and set the binding start index.
     */
    readonly decls: number;
    /**
     * The number of bindings in this component template (including pure fn bindings).
     *
     * Used to calculate the length of the component's LView array, so we
     * can pre-fill the array and set the host binding start index.
     */
    readonly vars: number;
    /**
     * Query-related instructions for a component.
     */
    viewQuery: ViewQueriesFunction<T> | null;
    /**
     * The view encapsulation type, which determines how styles are applied to
     * DOM elements. One of
     * - `Emulated` (default): Emulate native scoping of styles.
     * - `Native`: Use the native encapsulation mechanism of the renderer.
     * - `ShadowDom`: Use modern [ShadowDOM](https://w3c.github.io/webcomponents/spec/shadow/) and
     *   create a ShadowRoot for component's host element.
     * - `None`: Do not provide any template or style encapsulation.
     */
    readonly encapsulation: ViewEncapsulation;
    /**
     * Defines arbitrary developer-defined data to be stored on a renderer instance.
     * This is useful for renderers that delegate to other renderers.
     */
    readonly data: {
        [kind: string]: any;
        animation?: any[];
    };
    /** Whether or not this component's ChangeDetectionStrategy is OnPush */
    readonly onPush: boolean;
    /** Whether or not this component is signal-based. */
    readonly signals: boolean;
    /**
     * Registry of directives and components that may be found in this view.
     *
     * The property is either an array of `DirectiveDef`s or a function which returns the array of
     * `DirectiveDef`s. The function is necessary to be able to support forward declarations.
     */
    directiveDefs: DirectiveDefListOrFactory | null;
    /**
     * Registry of pipes that may be found in this view.
     *
     * The property is either an array of `PipeDefs`s or a function which returns the array of
     * `PipeDefs`s. The function is necessary to be able to support forward declarations.
     */
    pipeDefs: PipeDefListOrFactory | null;
    /**
     * Unfiltered list of all dependencies of a component, or `null` if none.
     */
    dependencies: TypeOrFactory<DependencyTypeList> | null;
    /**
     * The set of schemas that declare elements to be allowed in the component's template.
     */
    schemas: SchemaMetadata[] | null;
    /**
     * Ivy runtime uses this place to store the computed tView for the component. This gets filled on
     * the first run of component.
     */
    tView: TView | null;
    /**
     * A function used by the framework to create standalone injectors.
     */
    getStandaloneInjector: ((parentInjector: EnvironmentInjector) => EnvironmentInjector | null) | null;
    /**
     * A function used by the framework to create the list of external runtime style URLs.
     */
    getExternalStyles: ((encapsulationId?: string) => string[]) | null;
    /**
     * Used to store the result of `noSideEffects` function so that it is not removed by closure
     * compiler. The property should never be read.
     */
    readonly _?: unknown;
}
/**
 * Runtime link information for Pipes.
 *
 * This is an internal data structure used by the renderer to link
 * pipes into templates.
 *
 * NOTE: Always use `definePipe` function to create this object,
 * never create the object directly since the shape of this object
 * can change between versions.
 *
 * See: {@link definePipe}
 */
interface PipeDef<T> {
    /** Token representing the pipe. */
    type: Type<T> | AbstractType<T>;
    /**
     * Pipe name.
     *
     * Used to resolve pipe in templates.
     */
    readonly name: string;
    /**
     * Factory function used to create a new pipe instance. Will be null initially.
     * Populated when the factory is first requested by pipe instantiation logic.
     */
    factory: FactoryFn<T> | null;
    /**
     * Whether or not the pipe is pure.
     *
     * Pure pipes result only depends on the pipe input and not on internal
     * state of the pipe.
     */
    readonly pure: boolean;
    /**
     * Whether this pipe is standalone.
     */
    readonly standalone: boolean;
    onDestroy: (() => void) | null;
}
interface DirectiveDefFeature {
    <T>(directiveDef: DirectiveDef<T>): void;
    /**
     * Marks a feature as something that {@link InheritDefinitionFeature} will execute
     * during inheritance.
     *
     * NOTE: DO NOT SET IN ROOT OF MODULE! Doing so will result in tree-shakers/bundlers
     * identifying the change as a side effect, and the feature will be included in
     * every bundle.
     */
    ngInherit?: true;
}
/** Data produced after host directives are resolved for a node. */
type HostDirectiveResolution = [
    matches: DirectiveDef<unknown>[],
    hostDirectiveDefs: HostDirectiveDefs | null,
    hostDirectiveRanges: HostDirectiveRanges | null
];
/**
 * Map that tracks a selector-matched directive to the range within which its host directives
 * are declared. Host directives for a specific directive are always contiguous within the runtime.
 * Note that both the start and end are inclusive and they're both **after** `tNode.directiveStart`.
 */
type HostDirectiveRanges = Map<DirectiveDef<unknown>, [start: number, end: number]>;
/** Runtime information used to configure a host directive. */
interface HostDirectiveDef<T = unknown> {
    /** Class representing the host directive. */
    directive: Type<T>;
    /** Directive inputs that have been exposed. */
    inputs: HostDirectiveBindingMap;
    /** Directive outputs that have been exposed. */
    outputs: HostDirectiveBindingMap;
}
/**
 * Mapping between the public aliases of directive bindings and the underlying inputs/outputs that
 * they represent. Also serves as an allowlist of the inputs/outputs from the host directive that
 * the author has decided to expose.
 */
type HostDirectiveBindingMap = {
    [publicName: string]: string;
};
/**
 * Mapping between a directive that was used as a host directive
 * and the configuration that was used to define it as such.
 */
type HostDirectiveDefs = Map<DirectiveDef<unknown>, HostDirectiveDef>;
/** Value that can be used to configure a host directive. */
type HostDirectiveConfig = Type<unknown> | {
    directive: Type<unknown>;
    inputs?: string[];
    outputs?: string[];
};
interface ComponentDefFeature {
    <T>(componentDef: ComponentDef<T>): void;
    /**
     * Marks a feature as something that {@link InheritDefinitionFeature} will execute
     * during inheritance.
     *
     * NOTE: DO NOT SET IN ROOT OF MODULE! Doing so will result in tree-shakers/bundlers
     * identifying the change as a side effect, and the feature will be included in
     * every bundle.
     */
    ngInherit?: true;
}
/** Function that can be used to transform incoming input values. */
type InputTransformFunction = (value: any) => any;
/**
 * Type used for directiveDefs on component definition.
 *
 * The function is necessary to be able to support forward declarations.
 */
type DirectiveDefListOrFactory = (() => DirectiveDefList) | DirectiveDefList;
type DirectiveDefList = (DirectiveDef<any> | ComponentDef<any>)[];
type DependencyType = DirectiveType<any> | ComponentType<any> | PipeType<any> | Type<any>;
type DependencyTypeList = Array<DependencyType>;
type TypeOrFactory<T> = T | (() => T);
type HostBindingsFunction<T> = <U extends T>(rf: RenderFlags, ctx: U) => void;
/**
 * Type used for PipeDefs on component definition.
 *
 * The function is necessary to be able to support forward declarations.
 */
type PipeDefListOrFactory = (() => PipeDefList) | PipeDefList;
type PipeDefList = PipeDef<any>[];
/**
 * NgModule scope info as provided by AoT compiler
 *
 * In full compilation Ivy resolved all the "module with providers" and forward refs the whole array
 * if at least one element is forward refed. So we end up with type `Type<any>[]|(() =>
 * Type<any>[])`.
 *
 * In local mode the compiler passes the raw info as they are to the runtime functions as it is not
 * possible to resolve them any further due to limited info at compile time. So we end up with type
 * `RawScopeInfoFromDecorator[]`.
 */
interface NgModuleScopeInfoFromDecorator {
    /** List of components, directives, and pipes declared by this module. */
    declarations?: Type<any>[] | (() => Type<any>[]) | RawScopeInfoFromDecorator[];
    /** List of modules or `ModuleWithProviders` or standalone components imported by this module. */
    imports?: Type<any>[] | (() => Type<any>[]) | RawScopeInfoFromDecorator[];
    /**
     * List of modules, `ModuleWithProviders`, components, directives, or pipes exported by this
     * module.
     */
    exports?: Type<any>[] | (() => Type<any>[]) | RawScopeInfoFromDecorator[];
    /**
     * The set of components that are bootstrapped when this module is bootstrapped. This field is
     * only available in local compilation mode. In full compilation mode bootstrap info is passed
     * directly to the module def runtime after statically analyzed and resolved.
     */
    bootstrap?: Type<any>[] | (() => Type<any>[]) | RawScopeInfoFromDecorator[];
}
/**
 * The array element type passed to:
 *  - NgModule's annotation imports/exports/declarations fields
 *  - standalone component annotation imports field
 */
type RawScopeInfoFromDecorator = Type<any> | ModuleWithProviders<any> | (() => Type<any>) | (() => ModuleWithProviders<any>) | readonly any[];

/**
 * Basic set of data structures used for identifying a defer block
 * and triggering defer blocks
 */
interface DehydratedDeferBlock {
    lView: LView;
    tNode: TNode;
    lContainer: LContainer;
}
/**
 * Describes the shape of a function generated by the compiler
 * to download dependencies that can be defer-loaded.
 */
type DependencyResolverFn = () => Array<Promise<DependencyType> | DependencyType>;
/**
 * Describes the state of defer block dependency loading.
 */
declare enum DeferDependenciesLoadingState {
    /** Initial state, dependency loading is not yet triggered */
    NOT_STARTED = 0,
    /** Dependency loading is in progress */
    IN_PROGRESS = 1,
    /** Dependency loading has completed successfully */
    COMPLETE = 2,
    /** Dependency loading has failed */
    FAILED = 3
}
/** Configuration object for a loading block as it is stored in the component constants. */
type DeferredLoadingBlockConfig = [minimumTime: number | null, afterTime: number | null];
/** Configuration object for a placeholder block as it is stored in the component constants. */
type DeferredPlaceholderBlockConfig = [minimumTime: number | null];
/**
 * Describes the data shared across all instances of a defer block.
 */
interface TDeferBlockDetails {
    /**
     * Index in an LView and TData arrays where a template for the primary content
     * can be found.
     */
    primaryTmplIndex: number;
    /**
     * Index in an LView and TData arrays where a template for the loading block can be found.
     */
    loadingTmplIndex: number | null;
    /**
     * Extra configuration parameters (such as `after` and `minimum`) for the loading block.
     */
    loadingBlockConfig: DeferredLoadingBlockConfig | null;
    /**
     * Index in an LView and TData arrays where a template for the placeholder block can be found.
     */
    placeholderTmplIndex: number | null;
    /**
     * Extra configuration parameters (such as `after` and `minimum`) for the placeholder block.
     */
    placeholderBlockConfig: DeferredPlaceholderBlockConfig | null;
    /**
     * Index in an LView and TData arrays where a template for the error block can be found.
     */
    errorTmplIndex: number | null;
    /**
     * Compiler-generated function that loads all dependencies for a defer block.
     */
    dependencyResolverFn: DependencyResolverFn | null;
    /**
     * Keeps track of the current loading state of defer block dependencies.
     */
    loadingState: DeferDependenciesLoadingState;
    /**
     * Dependency loading Promise. This Promise is helpful for cases when there
     * are multiple instances of a defer block (e.g. if it was used inside of an *ngFor),
     * which all await the same set of dependencies.
     */
    loadingPromise: Promise<unknown> | null;
    /**
     * List of providers collected from all NgModules that were imported by
     * standalone components used within this defer block.
     */
    providers: Provider[] | null;
    /**
     * List of hydrate triggers for a given block
     */
    hydrateTriggers: Map<DeferBlockTrigger, HydrateTriggerDetails | null> | null;
    /**
     * Defer block flags, which should be used for all
     * instances of a given defer block (the flags that should be
     * placed into the `TDeferDetails` at runtime).
     */
    flags: TDeferDetailsFlags;
    /**
     * Tracks debugging information about the deferred block.
     */
    debug: {
        /** Text representations of the block's triggers. */
        triggers?: Set<string>;
    } | null;
}
/**
 * Specifies defer block flags, which should be used for all
 * instances of a given defer block (the flags that should be
 * placed into the `TDeferDetails` at runtime).
 */
declare const enum TDeferDetailsFlags {
    Default = 0,
    /**
     * Whether or not the defer block has hydrate triggers.
     */
    HasHydrateTriggers = 1
}
/**
 * Describes the current state of this defer block instance.
 *
 * @publicApi
 */
declare enum DeferBlockState {
    /** The placeholder block content is rendered */
    Placeholder = 0,
    /** The loading block content is rendered */
    Loading = 1,
    /** The main content block content is rendered */
    Complete = 2,
    /** The error block content is rendered */
    Error = 3
}
/**
 * Represents defer trigger types.
 */
declare const enum DeferBlockTrigger {
    Idle = 0,
    Immediate = 1,
    Viewport = 2,
    Interaction = 3,
    Hover = 4,
    Timer = 5,
    When = 6,
    Never = 7
}
/** Describes specified delay (in ms) in the `hydrate on timer()` trigger. */
interface HydrateTimerTriggerDetails {
    type: DeferBlockTrigger.Timer;
    delay?: number;
}
/** Describes the config for a `hydrate on viewport` trigger. */
interface HydrateViewportTriggerDetails {
    type: DeferBlockTrigger.Viewport;
    intersectionObserverOptions?: IntersectionObserverInit;
}
/** * Describes all possible hydration trigger details specified in a template. */
type HydrateTriggerDetails = HydrateTimerTriggerDetails | HydrateViewportTriggerDetails;
/**
 * Internal structure used for configuration of defer block behavior.
 * */
interface DeferBlockConfig {
    behavior: DeferBlockBehavior;
}
/**
 * Options for configuring defer blocks behavior.
 * @publicApi
 */
declare enum DeferBlockBehavior {
    /**
     * Manual triggering mode for defer blocks. Provides control over when defer blocks render
     * and which state they render.
     */
    Manual = 0,
    /**
     * Playthrough mode for defer blocks. This mode behaves like defer blocks would in a browser.
     * This is the default behavior in test environments.
     */
    Playthrough = 1
}
/**
 * **INTERNAL**, avoid referencing it in application code.
 *
 * Describes a helper class that allows to intercept a call to retrieve current
 * dependency loading function and replace it with a different implementation.
 * This interceptor class is needed to allow testing blocks in different states
 * by simulating loading response.
 */
interface DeferBlockDependencyInterceptor {
    /**
     * Invoked for each defer block when dependency loading function is accessed.
     */
    intercept(dependencyFn: DependencyResolverFn | null): DependencyResolverFn | null;
    /**
     * Allows to configure an interceptor function.
     */
    setInterceptor(interceptorFn: (current: DependencyResolverFn) => DependencyResolverFn): void;
}

/**
 * Error details caught by the error boundary
 *
 * @developerPreview 22.2
 */
interface ErrorDetails {
    /**
     * The class of the component or directive where the error occurred.
     */
    readonly declarationType: Type<unknown>;
    /**
     * The instance of the component or directive where the error occurred.
     */
    readonly declarationInstance: unknown;
    /**
     * Information about the error boundary that caught the error.
     */
    readonly boundary?: {
        /**
         * The component where the error boundary that caught the rendering error was located
         */
        readonly type: Type<unknown>;
        /**
         * Call this method to retry rendering the error boundary.
         */
        readonly reset: () => void;
    };
    /**
     * The function that intercepted the error, if any.
     */
    readonly caughtBy?: Function;
}
/**
 * Provides a hook for centralized exception handling.
 *
 * The default implementation of `ErrorHandler` prints error messages to the `console`. To
 * intercept error handling, write a custom exception handler that replaces this default as
 * appropriate for your app.
 *
 * @usageNotes
 * ### Example
 *
 * ```ts
 * class MyErrorHandler implements ErrorHandler {
 *   handleError(error) {
 *     // do something with the exception
 *   }
 * }
 *
 * // Provide in standalone apps
 * bootstrapApplication(AppComponent, {
 *   providers: [{provide: ErrorHandler, useClass: MyErrorHandler}]
 * })
 *
 * // Provide in module-based apps
 * @NgModule({
 *   providers: [{provide: ErrorHandler, useClass: MyErrorHandler}]
 * })
 * class MyModule {}
 * ```
 *
 * @publicApi
 *
 * @see [Unhandled errors in Angular](best-practices/error-handling)
 *
 */
declare class ErrorHandler {
    handleError(error: any): void;
    /**
     * Callback to handle errors happening during the rendering of a component/directive view.
     *
     * @param error The error that was thrown.
     * @param details Additional information about the error.
     */
    onViewError?(error: Error, details: ErrorDetails): void;
}
/**
 * `InjectionToken` used to configure how to call the `ErrorHandler`.
 */
declare const INTERNAL_APPLICATION_ERROR_HANDLER: InjectionToken<(e: any) => void>;
/**
 * Provides an environment initializer which forwards unhandled errors to the ErrorHandler.
 *
 * The listeners added are for the window's 'unhandledrejection' and 'error' events.
 *
 * @see [Global error listeners](best-practices/error-handling#global-error-listeners)
 *
 * @publicApi
 */
declare function provideBrowserGlobalErrorListeners(): EnvironmentProviders;

/**
 * A SecurityContext marks a location that has dangerous security implications, e.g. a DOM property
 * like `innerHTML` that could cause Cross Site Scripting (XSS) security bugs when improperly
 * handled.
 *
 * See DomSanitizer for more details on security in Angular applications.
 *
 * @publicApi
 */
declare enum SecurityContext {
    NONE = 0,
    HTML = 1,
    STYLE = 2,
    SCRIPT = 3,
    URL = 4,
    RESOURCE_URL = 5,
    ATTRIBUTE_NO_BINDING = 6
}

/**
 * Sanitizer is used by the views to sanitize potentially dangerous values.
 *
 * @see [Sanitization and security contexts](best-practices/security#sanitization-and-security-contexts)
 *
 * @publicApi
 */
declare abstract class Sanitizer {
    abstract sanitize(context: SecurityContext, value: {} | string | null): string | null;
    /** @nocollapse */
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<null>;
}

/**
 * A callback that runs after render.
 *
 * @publicApi
 */
interface AfterRenderRef {
    /**
     * Shut down the callback, preventing it from being called again.
     */
    destroy(): void;
}

declare class AfterRenderManager {
    impl: AfterRenderImpl | null;
    execute(): void;
    /** @nocollapse */
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<AfterRenderManager>;
}
declare class AfterRenderImpl {
    private readonly ngZone;
    private readonly scheduler;
    private readonly errorHandler;
    /** Current set of active sequences. */
    private readonly sequences;
    /** Tracks registrations made during the current set of executions. */
    private readonly deferredRegistrations;
    /** Whether the `AfterRenderManager` is currently executing hooks. */
    executing: boolean;
    constructor();
    /**
     * Run the sequence of phases of hooks, once through. As a result of executing some hooks, more
     * might be scheduled.
     */
    execute(): void;
    register(sequence: AfterRenderSequence): void;
    addSequence(sequence: AfterRenderSequence): void;
    unregister(sequence: AfterRenderSequence): void;
    protected maybeTrace<T>(fn: () => T, snapshot: TracingSnapshot | null): T;
    /** @nocollapse */
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<AfterRenderImpl>;
}
type AfterRenderHook = (value?: unknown) => unknown;
type AfterRenderHooks = [
    AfterRenderHook | undefined,
    AfterRenderHook | undefined,
    AfterRenderHook | undefined,
    AfterRenderHook | undefined
];
declare class AfterRenderSequence implements AfterRenderRef {
    readonly impl: AfterRenderImpl;
    readonly hooks: AfterRenderHooks;
    readonly view: LView | undefined;
    once: boolean;
    snapshot: TracingSnapshot | null;
    /**
     * Whether this sequence errored or was destroyed during this execution, and hooks should no
     * longer run for it.
     */
    erroredOrDestroyed: boolean;
    /**
     * The value returned by the last hook execution (if any), ready to be pipelined into the next
     * one.
     */
    pipelinedValue: unknown;
    private unregisterOnDestroy;
    constructor(impl: AfterRenderImpl, hooks: AfterRenderHooks, view: LView | undefined, once: boolean, destroyRef: DestroyRef | null, snapshot?: TracingSnapshot | null);
    afterRun(): void;
    destroy(): void;
}

interface ReactiveLViewConsumer extends ReactiveNode {
    lView: LView | null;
}

/**
 * Abstraction that encompasses any kind of effect that can be scheduled.
 */
interface SchedulableEffect {
    run(): void;
    zone: {
        run<T>(fn: () => T): T;
    } | null;
    dirty: boolean;
}
/**
 * A scheduler which manages the execution of effects.
 */
declare abstract class EffectScheduler {
    abstract add(e: SchedulableEffect): void;
    /**
     * Schedule the given effect to be executed at a later time.
     *
     * It is an error to attempt to execute any effects synchronously during a scheduling operation.
     */
    abstract schedule(e: SchedulableEffect): void;
    /**
     * Run any scheduled effects.
     */
    abstract flush(): void;
    /** Remove a scheduled effect */
    abstract remove(e: SchedulableEffect): void;
    /** @nocollapse */
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<ZoneAwareEffectScheduler>;
}
/**
 * A wrapper around `ZoneAwareQueueingScheduler` that schedules flushing via the microtask queue
 * when.
 */
declare class ZoneAwareEffectScheduler implements EffectScheduler {
    private dirtyEffectCount;
    private queues;
    add(handle: SchedulableEffect): void;
    schedule(handle: SchedulableEffect): void;
    remove(handle: SchedulableEffect): void;
    private enqueue;
    /**
     * Run all scheduled effects.
     *
     * Execution order of effects within the same zone is guaranteed to be FIFO, but there is no
     * ordering guarantee between effects scheduled in different zones.
     */
    flush(): void;
    private flushQueue;
}

/**
 * A global reactive effect, which can be manually destroyed.
 *
 * @publicApi 20.0
 *
 * @see [Destroying effects](guide/signals/effect#destroying-effects)
 */
interface EffectRef {
    /**
     * Shut down the effect, removing it from any upcoming scheduled executions.
     */
    destroy(): void;
}
/**
 * Options passed to the `effect` function.
 *
 * @publicApi 20.0
 */
interface CreateEffectOptions {
    /**
     * The `Injector` in which to create the effect.
     *
     * If this is not provided, the current [injection context](guide/di/dependency-injection-context)
     * will be used instead (via `inject`).
     */
    injector?: Injector;
    /**
     * Whether the `effect` should require manual cleanup.
     *
     * If this is `false` (the default) the effect will automatically register itself to be cleaned up
     * with the current `DestroyRef`.
     *
     * If this is `true` and you want to use the effect outside an injection context, you still
     * need to provide an `Injector` to the effect.
     */
    manualCleanup?: boolean;
    /**
     * @deprecated no longer required, signal writes are allowed by default.
     */
    allowSignalWrites?: boolean;
    /**
     * A debug name for the effect. Used in Angular DevTools to identify the effect.
     */
    debugName?: string;
}
/**
 * An effect can, optionally, register a cleanup function. If registered, the cleanup is executed
 * before the next effect run. The cleanup function makes it possible to "cancel" any work that the
 * previous effect run might have started.
 *
 * @see [Effect cleanup functions](guide/signals/effect#effect-cleanup-functions)
 *
 * @publicApi 20.0
 */
type EffectCleanupFn = () => void;
/**
 * A callback passed to the effect function that makes it possible to register cleanup logic.
 *
 * @see [Effect cleanup functions](guide/signals/effect#effect-cleanup-functions)
 *
 * @publicApi 20.0
 */
type EffectCleanupRegisterFn = (cleanupFn: EffectCleanupFn) => void;
/**
 * Registers an "effect" that will be scheduled & executed whenever the signals that it reads
 * changes.
 *
 * Angular has two different kinds of effect: component effects and root effects. Component effects
 * are created when `effect()` is called from a component, directive, or within a service of a
 * component/directive. Root effects are created when `effect()` is called from outside the
 * component tree, such as in a root service.
 *
 * The two effect types differ in their timing. Component effects run as a component lifecycle
 * event during Angular's synchronization (change detection) process, and can safely read input
 * signals or create/destroy views that depend on component state. Root effects run as microtasks
 * and have no connection to the component tree or change detection.
 *
 * `effect()` must be run in injection context, unless the `injector` option is manually specified.
 *
 * @see [Effects](guide/signals/effect)
 *
 * @publicApi 20.0
 */
declare function effect(effectFn: (onCleanup: EffectCleanupRegisterFn) => void, options?: CreateEffectOptions): EffectRef;
interface EffectNode extends BaseEffectNode, SchedulableEffect {
    cleanupFns: EffectCleanupFn[] | undefined;
    injector: Injector;
    notifier: ChangeDetectionScheduler;
    userFn: (onCleanup: EffectCleanupRegisterFn) => void;
    onDestroyFns: (() => void)[] | null;
}
interface ViewEffectNode extends EffectNode {
    view: LView;
}

/**
 * An unmodifiable list of items that Angular keeps up to date when the state
 * of the application changes.
 *
 * The type of object that {@link ViewChildren}, {@link ContentChildren}, and {@link QueryList}
 * provide.
 *
 * Implements an iterable interface, therefore it can be used in both ES6
 * javascript `for (var i of items)` loops as well as in Angular templates with
 * `@for(i of myList; track $index)`.
 *
 * Changes can be observed by subscribing to the `changes` `Observable`.
 * *
 * @usageNotes
 * ### Example
 * ```ts
 * @Component({...})
 * class Container {
 *   @ViewChildren(Item) items:QueryList<Item>;
 * }
 * ```
 *
 * @publicApi
 *
 * @see [Using QueryList](guide/components/queries#using-querylist)
 */
declare class QueryList<T> implements Iterable<T> {
    private _emitDistinctChangesOnly;
    readonly dirty = true;
    private _onDirty?;
    private _results;
    private _changesDetected;
    private _changes;
    readonly length: number;
    readonly first: T;
    readonly last: T;
    /**
     * Returns `Observable` of `QueryList` notifying the subscriber of changes.
     */
    get changes(): Observable<any>;
    /**
     * @param emitDistinctChangesOnly Whether `QueryList.changes` should fire only when actual change
     *     has occurred. Or if it should fire when query is recomputed. (recomputing could resolve in
     *     the same result)
     */
    constructor(_emitDistinctChangesOnly?: boolean);
    /**
     * Returns the QueryList entry at `index`.
     */
    get(index: number): T | undefined;
    /**
     * See
     * [Array.map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
     */
    map<U>(fn: (item: T, index: number, array: T[]) => U): U[];
    /**
     * See
     * [Array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
     */
    filter<S extends T>(predicate: (value: T, index: number, array: readonly T[]) => value is S): S[];
    filter(predicate: (value: T, index: number, array: readonly T[]) => unknown): T[];
    /**
     * See
     * [Array.find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find)
     */
    find(fn: (item: T, index: number, array: T[]) => boolean): T | undefined;
    /**
     * See
     * [Array.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
     */
    reduce<U>(fn: (prevValue: U, curValue: T, curIndex: number, array: T[]) => U, init: U): U;
    /**
     * See
     * [Array.forEach](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
     */
    forEach(fn: (item: T, index: number, array: T[]) => void): void;
    /**
     * See
     * [Array.some](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
     */
    some(fn: (value: T, index: number, array: T[]) => boolean): boolean;
    /**
     * Returns a copy of the internal results list as an Array.
     */
    toArray(): T[];
    toString(): string;
    /**
     * Updates the stored data of the query list, and resets the `dirty` flag to `false`, so that
     * on change detection, it will not notify of changes to the queries, unless a new change
     * occurs.
     *
     * @param resultsTree The query results to store
     * @param identityAccessor Optional function for extracting stable object identity from a value
     *    in the array. This function is executed for each element of the query result list while
     *    comparing current query list with the new one (provided as a first argument of the `reset`
     *    function) to detect if the lists are different. If the function is not provided, elements
     *    are compared as is (without any pre-processing).
     */
    reset(resultsTree: Array<T | any[]>, identityAccessor?: (value: T) => unknown): void;
    /**
     * Triggers a change event by emitting on the `changes` {@link EventEmitter}.
     */
    notifyOnChanges(): void;
    /** internal */
    setDirty(): void;
    /** internal */
    destroy(): void;
    [Symbol.iterator]: () => Iterator<T>;
}

/**
 * An object representing query metadata extracted from query annotations.
 */
interface TQueryMetadata {
    predicate: ProviderToken<unknown> | string[];
    read: any;
    flags: QueryFlags;
}
/**
 * A set of flags to be used with Queries.
 *
 * NOTE: Ensure changes here are reflected in `packages/compiler/src/render3/view/compiler.ts`
 */
declare const enum QueryFlags {
    /**
     * No flags
     */
    none = 0,
    /**
     * Whether or not the query should descend into children.
     */
    descendants = 1,
    /**
     * The query can be computed statically and hence can be assigned eagerly.
     *
     * NOTE: Backwards compatibility with ViewEngine.
     */
    isStatic = 2,
    /**
     * If the `QueryList` should fire change event only if actual change to query was computed (vs old
     * behavior where the change was fired whenever the query was recomputed, even if the recomputed
     * query resulted in the same list.)
     */
    emitDistinctChangesOnly = 4
}
/**
 * TQuery objects represent all the query-related data that remain the same from one view instance
 * to another and can be determined on the very first template pass. Most notably TQuery holds all
 * the matches for a given view.
 */
interface TQuery {
    /**
     * Query metadata extracted from query annotations.
     */
    metadata: TQueryMetadata;
    /**
     * Index of a query in a declaration view in case of queries propagated to en embedded view, -1
     * for queries declared in a given view. We are storing this index so we can find a parent query
     * to clone for an embedded view (when an embedded view is created).
     */
    indexInDeclarationView: number;
    /**
     * Matches collected on the first template pass. Each match is a pair of:
     * - TNode index;
     * - match index;
     *
     * A TNode index can be either:
     * - a positive number (the most common case) to indicate a matching TNode;
     * - a negative number to indicate that a given query is crossing a <ng-template> element and
     * results from views created based on TemplateRef should be inserted at this place.
     *
     * A match index is a number used to find an actual value (for a given node) when query results
     * are materialized. This index can have one of the following values:
     * - -2 - indicates that we need to read a special token (TemplateRef, ViewContainerRef etc.);
     * - -1 - indicates that we need to read a default value based on the node type (TemplateRef for
     * ng-template and ElementRef for other elements);
     * - a positive number - index of an injectable to be read from the element injector.
     */
    matches: number[] | null;
    /**
     * A flag indicating if a given query crosses an <ng-template> element. This flag exists for
     * performance reasons: we can notice that queries not crossing any <ng-template> elements will
     * have matches from a given view only (and adapt processing accordingly).
     */
    crossesNgTemplate: boolean;
    /**
     * A method call when a given query is crossing an element (or element container). This is where a
     * given TNode is matched against a query predicate.
     * @param tView
     * @param tNode
     */
    elementStart(tView: TView, tNode: TNode): void;
    /**
     * A method called when processing the elementEnd instruction - this is mostly useful to determine
     * if a given content query should match any nodes past this point.
     * @param tNode
     */
    elementEnd(tNode: TNode): void;
    /**
     * A method called when processing the template instruction. This is where a
     * given TContainerNode is matched against a query predicate.
     * @param tView
     * @param tNode
     */
    template(tView: TView, tNode: TNode): void;
    /**
     * A query-related method called when an embedded TView is created based on the content of a
     * <ng-template> element. We call this method to determine if a given query should be propagated
     * to the embedded view and if so - return a cloned TQuery for this embedded view.
     * @param tNode
     * @param childQueryIndex
     */
    embeddedTView(tNode: TNode, childQueryIndex: number): TQuery | null;
}
/**
 * TQueries represent a collection of individual TQuery objects tracked in a given view. Most of the
 * methods on this interface are simple proxy methods to the corresponding functionality on TQuery.
 */
interface TQueries {
    /**
     * Adds a new TQuery to a collection of queries tracked in a given view.
     * @param tQuery
     */
    track(tQuery: TQuery): void;
    /**
     * Returns a TQuery instance for at the given index  in the queries array.
     * @param index
     */
    getByIndex(index: number): TQuery;
    /**
     * Returns the number of queries tracked in a given view.
     */
    length: number;
    /**
     * A proxy method that iterates over all the TQueries in a given TView and calls the corresponding
     * `elementStart` on each and every TQuery.
     * @param tView
     * @param tNode
     */
    elementStart(tView: TView, tNode: TNode): void;
    /**
     * A proxy method that iterates over all the TQueries in a given TView and calls the corresponding
     * `elementEnd` on each and every TQuery.
     * @param tNode
     */
    elementEnd(tNode: TNode): void;
    /**
     * A proxy method that iterates over all the TQueries in a given TView and calls the corresponding
     * `template` on each and every TQuery.
     * @param tView
     * @param tNode
     */
    template(tView: TView, tNode: TNode): void;
    /**
     * A proxy method that iterates over all the TQueries in a given TView and calls the corresponding
     * `embeddedTView` on each and every TQuery.
     * @param tNode
     */
    embeddedTView(tNode: TNode): TQueries | null;
}
/**
 * An interface that represents query-related information specific to a view instance. Most notably
 * it contains:
 * - materialized query matches;
 * - a pointer to a QueryList where materialized query results should be reported.
 */
interface LQuery<T> {
    /**
     * Materialized query matches for a given view only (!). Results are initialized lazily so the
     * array of matches is set to `null` initially.
     */
    matches: (T | null)[] | null;
    /**
     * A QueryList where materialized query results should be reported.
     */
    queryList: QueryList<T>;
    /**
     * Clones an LQuery for an embedded view. A cloned query shares the same `QueryList` but has a
     * separate collection of materialized matches.
     */
    clone(): LQuery<T>;
    /**
     * Called when an embedded view, impacting results of this query, is inserted or removed.
     */
    setDirty(): void;
}
/**
 * lQueries represent a collection of individual LQuery objects tracked in a given view.
 */
interface LQueries {
    /**
     * A collection of queries tracked in a given view.
     */
    queries: LQuery<any>[];
    /**
     * A method called when a new embedded view is created. As a result a set of LQueries applicable
     * for a new embedded view is instantiated (cloned) from the declaration view.
     * @param tView
     */
    createEmbeddedView(tView: TView): LQueries | null;
    /**
     * A method called when an embedded view is inserted into a container. As a result all impacted
     * `LQuery` objects (and associated `QueryList`) are marked as dirty.
     * @param tView
     */
    insertView(tView: TView): void;
    /**
     * A method called when an embedded view is detached from a container. As a result all impacted
     * `LQuery` objects (and associated `QueryList`) are marked as dirty.
     * @param tView
     */
    detachView(tView: TView): void;
    /**
     * A method called when a view finishes its creation pass. As a result all impacted
     * `LQuery` objects (and associated `QueryList`) are marked as dirty. This additional dirty
     * marking gives us a precise point in time where we can collect results for a given view in an
     * atomic way.
     * @param tView
     */
    finishViewCreation(tView: TView): void;
}

/**
 * Used by `RendererFactory2` to associate custom rendering data and styles
 * with a rendering implementation.
 *  @publicApi
 */
interface RendererType2 {
    /**
     * A unique identifying string for the new renderer, used when creating
     * unique styles for encapsulation.
     */
    id: string;
    /**
     * The view encapsulation type, which determines how styles are applied to
     * DOM elements. One of
     * - `Emulated` (default): Emulate native scoping of styles.
     * - `Native`: Use the native encapsulation mechanism of the renderer.
     * - `ShadowDom`: Use modern [Shadow
     * DOM](https://w3c.github.io/webcomponents/spec/shadow/) and
     * create a ShadowRoot for component's host element.
     * - `None`: Do not provide any template or style encapsulation.
     */
    encapsulation: ViewEncapsulation;
    /**
     * Defines CSS styles to be stored on a renderer instance.
     */
    styles: string[];
    /**
     * Defines arbitrary developer-defined data to be stored on a renderer instance.
     * This is useful for renderers that delegate to other renderers.
     */
    data: {
        [kind: string]: any;
    };
    /**
     * A function used by the framework to create the list of external runtime style URLs.
     */
    getExternalStyles?: ((encapsulationId?: string) => string[]) | null;
}
/**
 * Flags for renderer-specific style modifiers.
 * @publicApi
 */
declare enum RendererStyleFlags2 {
    /**
     * Marks a style as important.
     */
    Important = 1,
    /**
     * Marks a style as using dash case naming (this-is-dash-case).
     */
    DashCase = 2
}

/**
 * Creates and initializes a custom renderer that implements the `Renderer2` base class.
 *
 * @publicApi
 */
declare abstract class RendererFactory2 {
    /**
     * Creates and initializes a custom renderer for a host DOM element.
     * @param hostElement The element to render.
     * @param type The base class to implement.
     * @returns The new custom renderer instance.
     */
    abstract createRenderer(hostElement: any, type: RendererType2 | null): Renderer2;
    /**
     * A callback invoked when rendering has begun.
     */
    abstract begin?(): void;
    /**
     * A callback invoked when rendering has completed.
     */
    abstract end?(): void;
    /**
     * Use with animations test-only mode. Notifies the test when rendering has completed.
     * @returns The asynchronous result of the developer-defined function.
     */
    abstract whenRenderingDone?(): Promise<any>;
}
/**
 * Extend this base class to implement custom rendering. By default, Angular
 * renders a template into DOM. You can use custom rendering to intercept
 * rendering calls, or to render to something other than DOM.
 *
 * <div class="docs-alert docs-alert-important">
 * <p>
 * Please be aware that usage of `Renderer2`, in context of accessing DOM elements, provides no
 * extra security which makes it equivalent to
 * {@link /best-practices/security#direct-use-of-the-dom-apis-and-explicit-sanitization-calls Security vulnerabilities}.
 * </p>
 * </div>
 *
 * Create your custom renderer using `RendererFactory2`.
 *
 * Use a custom renderer to bypass Angular's templating and
 * make custom UI changes that can't be expressed declaratively.
 * For example if you need to set a property or an attribute whose name is
 * not statically known, use the `setProperty()` or
 * `setAttribute()` method.
 *
 * @publicApi
 */
declare abstract class Renderer2 {
    /**
     * Use to store arbitrary developer-defined data on a renderer instance,
     * as an object containing key-value pairs.
     * This is useful for renderers that delegate to other renderers.
     */
    abstract get data(): {
        [key: string]: any;
    };
    /**
     * Implement this callback to destroy the renderer or the host element.
     */
    abstract destroy(): void;
    /**
     * Implement this callback to create an instance of the host element.
     * @param name An identifying name for the new element, unique within the namespace.
     * @param namespace The namespace for the new element.
     * @returns The new element.
     */
    abstract createElement(name: string, namespace?: string | null): any;
    /**
     * Implement this callback to add a comment to the DOM of the host element.
     * @param value The comment text.
     * @returns The modified element.
     */
    abstract createComment(value: string): any;
    /**
     * Implement this callback to add text to the DOM of the host element.
     * @param value The text string.
     * @returns The modified element.
     */
    abstract createText(value: string): any;
    /**
     * If null or undefined, the view engine won't call it.
     * This is used as a performance optimization for production mode.
     */
    destroyNode: ((node: any) => void) | null;
    /**
     * Appends a child to a given parent node in the host element DOM.
     * @param parent The parent node.
     * @param newChild The new child node.
     */
    abstract appendChild(parent: any, newChild: any): void;
    /**
     * Implement this callback to insert a child node at a given position in a parent node
     * in the host element DOM.
     * @param parent The parent node.
     * @param newChild The new child nodes.
     * @param refChild The existing child node before which `newChild` is inserted.
     * @param isMove Optional argument which signifies if the current `insertBefore` is a result of a
     *     move. Animation uses this information to trigger move animations. In the past the Animation
     *     would always assume that any `insertBefore` is a move. This is not strictly true because
     *     with runtime i18n it is possible to invoke `insertBefore` as a result of i18n and it should
     *     not trigger an animation move.
     */
    abstract insertBefore(parent: any, newChild: any, refChild: any, isMove?: boolean): void;
    /**
     * Implement this callback to remove a child node from the host element's DOM.
     * @param parent The parent node.
     * @param oldChild The child node to remove.
     * @param isHostElement Optionally signal to the renderer whether this element is a host element
     * @param requireSynchronousElementRemoval Optionally signal to the renderer whether this element
     * needs synchronous removal
     */
    abstract removeChild(parent: any, oldChild: any, isHostElement?: boolean, requireSynchronousElementRemoval?: boolean): void;
    /**
     * Implement this callback to prepare an element to be bootstrapped
     * as a root element, and return the element instance.
     * @param selectorOrNode The DOM element.
     * @param preserveContent Whether the contents of the root element
     * should be preserved, or cleared upon bootstrap (default behavior).
     * Use with `ViewEncapsulation.ShadowDom` to allow simple native
     * content projection via `<slot>` elements.
     * @returns The root element.
     */
    abstract selectRootElement(selectorOrNode: string | any, preserveContent?: boolean): any;
    /**
     * Implement this callback to get the parent of a given node
     * in the host element's DOM.
     * @param node The child node to query.
     * @returns The parent node, or null if there is no parent.
     * This is because the check is synchronous,
     * and the caller can't rely on checking for null.
     */
    abstract parentNode(node: any): any;
    /**
     * Implement this callback to get the next sibling node of a given node
     * in the host element's DOM.
     * @returns The sibling node, or null if there is no sibling.
     * This is because the check is synchronous,
     * and the caller can't rely on checking for null.
     */
    abstract nextSibling(node: any): any;
    /**
     * Implement this callback to set an attribute value for an element in the DOM.
     * @param el The element.
     * @param name The attribute name.
     * @param value The new value.
     * @param namespace The namespace.
     */
    abstract setAttribute(el: any, name: string, value: string, namespace?: string | null): void;
    /**
     * Implement this callback to remove an attribute from an element in the DOM.
     * @param el The element.
     * @param name The attribute name.
     * @param namespace The namespace.
     */
    abstract removeAttribute(el: any, name: string, namespace?: string | null): void;
    /**
     * Implement this callback to add a class to an element in the DOM.
     * @param el The element.
     * @param name The class name.
     */
    abstract addClass(el: any, name: string): void;
    /**
     * Implement this callback to remove a class from an element in the DOM.
     * @param el The element.
     * @param name The class name.
     */
    abstract removeClass(el: any, name: string): void;
    /**
     * Implement this callback to set a CSS style for an element in the DOM.
     * @param el The element.
     * @param style The name of the style.
     * @param value The new value.
     * @param flags Flags for style variations. No flags are set by default.
     */
    abstract setStyle(el: any, style: string, value: any, flags?: RendererStyleFlags2): void;
    /**
     * Implement this callback to remove the value from a CSS style for an element in the DOM.
     * @param el The element.
     * @param style The name of the style.
     * @param flags Flags for style variations to remove, if set. ???
     */
    abstract removeStyle(el: any, style: string, flags?: RendererStyleFlags2): void;
    /**
     * Implement this callback to set the value of a property of an element in the DOM.
     * @param el The element.
     * @param name The property name.
     * @param value The new value.
     */
    abstract setProperty(el: any, name: string, value: any): void;
    /**
     * Implement this callback to set the value of a node in the host element.
     * @param node The node.
     * @param value The new value.
     */
    abstract setValue(node: any, value: string): void;
    /**
     * Implement this callback to start an event listener.
     * @param target The context in which to listen for events. Can be
     * the entire window or document, the body of the document, or a specific
     * DOM element.
     * @param eventName The event to listen for.
     * @param callback A handler function to invoke when the event occurs.
     * @param options Options that configure how the event listener is bound.
     * @returns An "unlisten" function for disposing of this handler.
     */
    abstract listen(target: 'window' | 'document' | 'body' | any, eventName: string, callback: (event: any) => boolean | void, options?: ListenerOptions): () => void;
}
/**
 * This enum is meant to be used by `ɵtype` properties of the different renderers implemented
 * by the framework
 *
 * We choose to not add `ɵtype` to `Renderer2` to no expose it to the public API.
 */
declare const enum AnimationRendererType {
    Regular = 0,
    Delegated = 1
}
/**
 * Options that can be used to configure an event listener.
 * @publicApi
 */
interface ListenerOptions {
    capture?: boolean;
    once?: boolean;
    passive?: boolean;
}

/**
 * The goal here is to make sure that the browser DOM API is the Renderer.
 * We do this by defining a subset of DOM API to be the renderer and then
 * use that at runtime for rendering.
 *
 * At runtime we can then use the DOM api directly, in server or web-worker
 * it will be easy to implement such API.
 */
type GlobalTargetName = 'document' | 'window' | 'body';
type GlobalTargetResolver = (element: any) => EventTarget;
/**
 * Procedural style of API needed to create elements and text nodes.
 *
 * In non-native browser environments (e.g. platforms such as web-workers), this is the
 * facade that enables element manipulation. In practice, this is implemented by `Renderer2`.
 */
interface Renderer {
    destroy(): void;
    createComment(value: string): RComment;
    createElement(name: string, namespace?: string | null): RElement;
    createText(value: string): RText;
    /**
     * This property is allowed to be null / undefined,
     * in which case the view engine won't call it.
     * This is used as a performance optimization for production mode.
     */
    destroyNode?: ((node: RNode) => void) | null;
    appendChild(parent: RElement, newChild: RNode): void;
    insertBefore(parent: RNode, newChild: RNode, refChild: RNode | null, isMove?: boolean): void;
    removeChild(parent: RElement | null, oldChild: RNode, isHostElement?: boolean, requireSynchronousElementRemoval?: boolean): void;
    selectRootElement(selectorOrNode: string | any, preserveContent?: boolean): RElement;
    parentNode(node: RNode): RElement | null;
    nextSibling(node: RNode): RNode | null;
    setAttribute(el: RElement, name: string, value: string | TrustedHTML | TrustedScript | TrustedScriptURL, namespace?: string | null): void;
    removeAttribute(el: RElement, name: string, namespace?: string | null): void;
    addClass(el: RElement, name: string): void;
    removeClass(el: RElement, name: string): void;
    setStyle(el: RElement, style: string, value: any, flags?: RendererStyleFlags2): void;
    removeStyle(el: RElement, style: string, flags?: RendererStyleFlags2): void;
    setProperty(el: RElement, name: string, value: any): void;
    setValue(node: RText | RComment, value: string): void;
    listen(target: GlobalTargetName | RNode, eventName: string, callback: (event: any) => boolean | void, options?: ListenerOptions): () => void;
}
interface RendererFactory {
    createRenderer(hostElement: RElement | null, rendererType: RendererType2 | null): Renderer;
    begin?(): void;
    end?(): void;
}

declare const HOST = 0;
declare const TVIEW = 1;
declare const FLAGS = 2;
declare const PARENT = 3;
declare const NEXT = 4;
declare const T_HOST = 5;
declare const HYDRATION = 6;
declare const CLEANUP = 7;
declare const CONTEXT = 8;
declare const INJECTOR = 9;
declare const ENVIRONMENT = 10;
declare const RENDERER = 11;
declare const CHILD_HEAD = 12;
declare const CHILD_TAIL = 13;
declare const DECLARATION_VIEW = 14;
declare const DECLARATION_COMPONENT_VIEW = 15;
declare const DECLARATION_LCONTAINER = 16;
declare const PREORDER_HOOK_FLAGS = 17;
declare const QUERIES = 18;
declare const ID = 19;
declare const EMBEDDED_VIEW_INJECTOR = 20;
declare const ON_DESTROY_HOOKS = 21;
declare const EFFECTS_TO_SCHEDULE = 22;
declare const EFFECTS = 23;
declare const REACTIVE_TEMPLATE_CONSUMER = 24;
declare const AFTER_RENDER_SEQUENCES_TO_ADD = 25;
declare const ANIMATIONS = 26;
declare const ON_ERROR = 27;
interface OpaqueViewState {
    '__brand__': 'Brand for OpaqueViewState that nothing will match';
}
/**
 * `LView` stores all of the information needed to process the instructions as
 * they are invoked from the template. Each embedded view and component view has its
 * own `LView`. When processing a particular view, we set the `viewData` to that
 * `LView`. When that view is done processing, the `viewData` is set back to
 * whatever the original `viewData` was before (the parent `LView`).
 *
 * Keeping separate state for each view facilities view insertion / deletion, so we
 * don't have to edit the data array based on which views are present.
 */
interface LView<T = unknown> extends Array<any> {
    /**
     * The node into which this `LView` is inserted.
     */
    [HOST]: RElement | null;
    /**
     * The static data for this view. We need a reference to this so we can easily walk up the
     * node tree in DI and get the TView.data array associated with a node (where the
     * directive defs are stored).
     */
    readonly [TVIEW]: TView;
    /** Flags for this view. See LViewFlags for more info. */
    [FLAGS]: LViewFlags;
    /**
     * This may store an {@link LView} or {@link LContainer}.
     *
     * `LView` - The parent view. This is needed when we exit the view and must restore the previous
     * LView. Without this, the render method would have to keep a stack of
     * views as it is recursively rendering templates.
     *
     * `LContainer` - The current view is part of a container, and is an embedded view.
     */
    [PARENT]: LView | LContainer | null;
    /**
     *
     * The next sibling LView or LContainer.
     *
     * Allows us to propagate between sibling view states that aren't in the same
     * container. Embedded views already have a node.next, but it is only set for
     * views in the same container. We need a way to link component views and views
     * across containers as well.
     */
    [NEXT]: LView | LContainer | null;
    /** Queries active for this view - nodes from a view are reported to those queries. */
    [QUERIES]: LQueries | null;
    /**
     * Store the `TNode` of the location where the current `LView` is inserted into.
     *
     * Given:
     * ```html
     * <div>
     *   <ng-template><span></span></ng-template>
     * </div>
     * ```
     *
     * We end up with two `TView`s.
     * - `parent` `TView` which contains `<div><!-- anchor --></div>`
     * - `child` `TView` which contains `<span></span>`
     *
     * Typically the `child` is inserted into the declaration location of the `parent`, but it can be
     * inserted anywhere. Because it can be inserted anywhere it is not possible to store the
     * insertion information in the `TView` and instead we must store it in the `LView[T_HOST]`.
     *
     * So to determine where is our insertion parent we would execute:
     * ```ts
     * const parentLView = lView[PARENT];
     * const parentTNode = lView[T_HOST];
     * const insertionParent = parentLView[parentTNode.index];
     * ```
     *
     *
     * If `null`, this is the root view of an application (root component is in this view) and it has
     * no parents.
     */
    [T_HOST]: TNode | null;
    /**
     * When a view is destroyed, listeners need to be released and outputs need to be
     * unsubscribed. This context array stores both listener functions wrapped with
     * their context and output subscription instances for a particular view.
     *
     * These change per LView instance, so they cannot be stored on TView. Instead,
     * TView.cleanup saves an index to the necessary context in this array.
     *
     * After `LView` is created it is possible to attach additional instance specific functions at the
     * end of the `lView[CLEANUP]` because we know that no more `T` level cleanup functions will be
     * added here.
     */
    [CLEANUP]: any[] | null;
    /**
     * - For dynamic views, this is the context with which to render the template (e.g.
     *   `NgForContext`), or `{}` if not defined explicitly.
     * - For root view of the root component it's a reference to the component instance itself.
     * - For components, the context is a reference to the component instance itself.
     * - For inline views, the context is null.
     */
    [CONTEXT]: T;
    /** A Module Injector to be used as fall back after Element Injectors are consulted. */
    readonly [INJECTOR]: Injector;
    /**
     * Contextual data that is shared across multiple instances of `LView` in the same application.
     */
    [ENVIRONMENT]: LViewEnvironment;
    /** Renderer to be used for this view. */
    [RENDERER]: Renderer;
    /**
     * Reference to the first LView or LContainer beneath this LView in
     * the hierarchy.
     *
     * Necessary to store this so views can traverse through their nested views
     * to remove listeners and call onDestroy callbacks.
     */
    [CHILD_HEAD]: LView | LContainer | null;
    /**
     * The last LView or LContainer beneath this LView in the hierarchy.
     *
     * The tail allows us to quickly add a new state to the end of the view list
     * without having to propagate starting from the first child.
     */
    [CHILD_TAIL]: LView | LContainer | null;
    /**
     * View where this view's template was declared.
     *
     * The template for a dynamically created view may be declared in a different view than
     * it is inserted. We already track the "insertion view" (view where the template was
     * inserted) in LView[PARENT], but we also need access to the "declaration view"
     * (view where the template was declared). Otherwise, we wouldn't be able to call the
     * view's template function with the proper contexts. Context should be inherited from
     * the declaration view tree, not the insertion view tree.
     *
     * Example (AppComponent template):
     *
     * <ng-template #foo></ng-template>       <-- declared here -->
     * <some-comp [tpl]="foo"></some-comp>    <-- inserted inside this component -->
     *
     * The <ng-template> above is declared in the AppComponent template, but it will be passed into
     * SomeComp and inserted there. In this case, the declaration view would be the AppComponent,
     * but the insertion view would be SomeComp. When we are removing views, we would want to
     * traverse through the insertion view to clean up listeners. When we are calling the
     * template function during change detection, we need the declaration view to get inherited
     * context.
     */
    [DECLARATION_VIEW]: LView | null;
    /**
     * Points to the declaration component view, used to track transplanted `LView`s.
     *
     * See: `DECLARATION_VIEW` which points to the actual `LView` where it was declared, whereas
     * `DECLARATION_COMPONENT_VIEW` points to the component which may not be same as
     * `DECLARATION_VIEW`.
     *
     * Example:
     * ```html
     * <#VIEW #myComp>
     *  <div *ngIf="true">
     *   <ng-template #myTmpl>...</ng-template>
     *  </div>
     * </#VIEW>
     * ```
     * In the above case `DECLARATION_VIEW` for `myTmpl` points to the `LView` of `ngIf` whereas
     * `DECLARATION_COMPONENT_VIEW` points to `LView` of the `myComp` which owns the template.
     *
     * The reason for this is that all embedded views are always check-always whereas the component
     * view can be check-always or on-push. When we have a transplanted view it is important to
     * determine if we have transplanted a view from check-always declaration to on-push insertion
     * point. In such a case the transplanted view needs to be added to the `LContainer` in the
     * declared `LView` and CD during the declared view CD (in addition to the CD at the insertion
     * point.) (Any transplanted views which are intra Component are of no interest because the CD
     * strategy of declaration and insertion will always be the same, because it is the same
     * component.)
     *
     * Queries already track moved views in `LView[DECLARATION_LCONTAINER]` and
     * `LContainer[MOVED_VIEWS]`. However the queries also track `LView`s which moved within the same
     * component `LView`. Transplanted views are a subset of moved views, and we use
     * `DECLARATION_COMPONENT_VIEW` to differentiate them. As in this example.
     *
     * Example showing intra component `LView` movement.
     * ```html
     * <#VIEW #myComp>
     *   <div *ngIf="condition; then thenBlock else elseBlock"></div>
     *   <ng-template #thenBlock>Content to render when condition is true.</ng-template>
     *   <ng-template #elseBlock>Content to render when condition is false.</ng-template>
     * </#VIEW>
     * ```
     * The `thenBlock` and `elseBlock` is moved but not transplanted.
     *
     * Example showing inter component `LView` movement (transplanted view).
     * ```html
     * <#VIEW #myComp>
     *   <ng-template #myTmpl>...</ng-template>
     *   <insertion-component [template]="myTmpl"></insertion-component>
     * </#VIEW>
     * ```
     * In the above example `myTmpl` is passed into a different component. If `insertion-component`
     * instantiates `myTmpl` and `insertion-component` is on-push then the `LContainer` needs to be
     * marked as containing transplanted views and those views need to be CD as part of the
     * declaration CD.
     *
     *
     * When change detection runs, it iterates over `[MOVED_VIEWS]` and CDs any child `LView`s where
     * the `DECLARATION_COMPONENT_VIEW` of the current component and the child `LView` does not match
     * (it has been transplanted across components.)
     *
     * Note: `[DECLARATION_COMPONENT_VIEW]` points to itself if the LView is a component view (the
     *       simplest / most common case).
     *
     * see also:
     *   - https://hackmd.io/@mhevery/rJUJsvv9H write up of the problem
     *   - `LContainer[HAS_TRANSPLANTED_VIEWS]` which marks which `LContainer` has transplanted views.
     *   - `LContainer[TRANSPLANT_HEAD]` and `LContainer[TRANSPLANT_TAIL]` storage for transplanted
     *   - `LView[DECLARATION_LCONTAINER]` similar problem for queries
     *   - `LContainer[MOVED_VIEWS]` similar problem for queries
     */
    [DECLARATION_COMPONENT_VIEW]: LView;
    /**
     * A declaration point of embedded views (ones instantiated based on the content of a
     * <ng-template>), null for other types of views.
     *
     * We need to track all embedded views created from a given declaration point so we can prepare
     * query matches in a proper order (query matches are ordered based on their declaration point and
     * _not_ the insertion point).
     */
    [DECLARATION_LCONTAINER]: LContainer | null;
    /**
     * More flags for this view. See PreOrderHookFlags for more info.
     */
    [PREORDER_HOOK_FLAGS]: PreOrderHookFlags;
    /** Unique ID of the view. Used for `__ngContext__` lookups in the `LView` registry. */
    [ID]: number;
    /**
     * A container related to hydration annotation information that's associated with this LView.
     */
    [HYDRATION]: DehydratedView | null;
    /**
     * Optional injector assigned to embedded views that takes
     * precedence over the element and module injectors.
     */
    readonly [EMBEDDED_VIEW_INJECTOR]: Injector | null;
    /**
     * Effect scheduling operations that need to run during this views's update pass.
     */
    [EFFECTS_TO_SCHEDULE]: Array<() => void> | null;
    [EFFECTS]: Set<ViewEffectNode> | null;
    /**
     * A collection of callbacks functions that are executed when a given LView is destroyed. Those
     * are user defined, LView-specific destroy callbacks that don't have any corresponding TView
     * entries.
     */
    [ON_DESTROY_HOOKS]: Array<() => void> | null;
    /**
     * The `Consumer` for this `LView`'s template so that signal reads can be tracked.
     *
     * This is initially `null` and gets assigned a consumer after template execution
     * if any signals were read.
     */
    [REACTIVE_TEMPLATE_CONSUMER]: ReactiveLViewConsumer | null;
    [AFTER_RENDER_SEQUENCES_TO_ADD]: AfterRenderSequence[] | null;
    [ANIMATIONS]: AnimationLViewData | null;
    /**
     * Function to be called when an error occurs during change detection or lifecycle hooks
     * in this view or any of its descendants. The error is always encapsulated in an `Error` instance.
     */
    [ON_ERROR]: ((error: Error, details: ErrorDetails) => void) | null;
}
/**
 * Contextual data that is shared across multiple instances of `LView` in the same application.
 */
interface LViewEnvironment {
    /** Factory to be used for creating Renderer. */
    rendererFactory: RendererFactory;
    /** An optional custom sanitizer. */
    sanitizer: Sanitizer | null;
    /** Scheduler for change detection to notify when application state changes. */
    changeDetectionScheduler: ChangeDetectionScheduler | null;
    /** Service used for tracing different parts of the application. */
    tracingService: TracingService<TracingSnapshot> | null;
    /**
     * Whether `ng-reflect-*` attributes should be produced in dev mode
     * (always disabled in prod mode).
     */
    ngReflect: boolean;
}
/** Flags associated with an LView (saved in LView[FLAGS]) */
declare const enum LViewFlags {
    /** The state of the init phase on the first 2 bits */
    InitPhaseStateIncrementer = 1,
    InitPhaseStateMask = 3,
    /**
     * Whether or not the view is in creationMode.
     *
     * This must be stored in the view rather than using `data` as a marker so that
     * we can properly support embedded views. Otherwise, when exiting a child view
     * back into the parent view, `data` will be defined and `creationMode` will be
     * improperly reported as false.
     */
    CreationMode = 4,
    /**
     * Whether or not this LView instance is on its first processing pass.
     *
     * An LView instance is considered to be on its "first pass" until it
     * has completed one creation mode run and one update mode run. At this
     * time, the flag is turned off.
     */
    FirstLViewPass = 8,
    /** Whether this view has default change detection strategy (checks always) or onPush */
    CheckAlways = 16,
    /** Whether there are any i18n blocks inside this LView. */
    HasI18n = 32,
    /** Whether or not this view is currently dirty (needing check) */
    Dirty = 64,
    /** Whether or not this view is currently attached to change detection tree. */
    Attached = 128,
    /** Whether or not this view is destroyed. */
    Destroyed = 256,
    /** Whether or not this view is the root view */
    IsRoot = 512,
    /**
     * Whether this moved LView needs to be refreshed. Similar to the Dirty flag, but used for
     * transplanted and signal views where the parent/ancestor views are not marked dirty as well.
     * i.e. "Refresh just this view". Used in conjunction with the HAS_CHILD_VIEWS_TO_REFRESH
     * flag.
     */
    RefreshView = 1024,
    /** Indicates that the view **or any of its ancestors** have an embedded view injector. */
    HasEmbeddedViewInjector = 2048,
    /** Indicates that the view was created with `signals: true`. */
    SignalView = 4096,
    /**
     * Indicates that this LView has a view underneath it that needs to be refreshed during change
     * detection. This flag indicates that even if this view is not dirty itself, we still need to
     * traverse its children during change detection.
     */
    HasChildViewsToRefresh = 8192,
    /**
     * This is the count of the bits the 1 was shifted above (base 10)
     */
    IndexWithinInitPhaseShift = 14,
    /**
     * Index of the current init phase on last 21 bits
     */
    IndexWithinInitPhaseIncrementer = 16384,
    IndexWithinInitPhaseReset = 16383
}
/** More flags associated with an LView (saved in LView[PREORDER_HOOK_FLAGS]) */
declare const enum PreOrderHookFlags {
    /**
       The index of the next pre-order hook to be called in the hooks array, on the first 16
       bits
     */
    IndexOfTheNextPreOrderHookMaskMask = 65535,
    /**
     * The number of init hooks that have already been called, on the last 16 bits
     */
    NumberOfInitHooksCalledIncrementer = 65536,
    NumberOfInitHooksCalledShift = 16,
    NumberOfInitHooksCalledMask = 4294901760
}
/**
 * Stores a set of OpCodes to process `HostBindingsFunction` associated with a current view.
 *
 * In order to invoke `HostBindingsFunction` we need:
 * 1. 'elementIdx`: Index to the element associated with the `HostBindingsFunction`.
 * 2. 'directiveIdx`: Index to the directive associated with the `HostBindingsFunction`. (This will
 *    become the context for the `HostBindingsFunction` invocation.)
 * 3. `bindingRootIdx`: Location where the bindings for the `HostBindingsFunction` start. Internally
 *    `HostBindingsFunction` binding indexes start from `0` so we need to add `bindingRootIdx` to
 *    it.
 * 4. `HostBindingsFunction`: A host binding function to execute.
 *
 * The above information needs to be encoded into the `HostBindingOpCodes` in an efficient manner.
 *
 * 1. `elementIdx` is encoded into the `HostBindingOpCodes` as `~elementIdx` (so a negative number);
 * 2. `directiveIdx`
 * 3. `bindingRootIdx`
 * 4. `HostBindingsFunction` is passed in as is.
 *
 * The `HostBindingOpCodes` array contains:
 * - negative number to select the element index.
 * - followed by 1 or more of:
 *    - a number to select the directive index
 *    - a number to select the bindingRoot index
 *    - and a function to invoke.
 *
 * ## Example
 *
 * ```ts
 * const hostBindingOpCodes = [
 *   ~30,                               // Select element 30
 *   40, 45, MyDir.ɵdir.hostBindings    // Invoke host bindings on MyDir on element 30;
 *                                      // directiveIdx = 40; bindingRootIdx = 45;
 *   50, 55, OtherDir.ɵdir.hostBindings // Invoke host bindings on OtherDire on element 30
 *                                      // directiveIdx = 50; bindingRootIdx = 55;
 * ]
 * ```
 *
 * ## Pseudocode
 * ```ts
 * const hostBindingOpCodes = tView.hostBindingOpCodes;
 * if (hostBindingOpCodes === null) return;
 * for (let i = 0; i < hostBindingOpCodes.length; i++) {
 *   const opCode = hostBindingOpCodes[i] as number;
 *   if (opCode < 0) {
 *     // Negative numbers are element indexes.
 *     setSelectedIndex(~opCode);
 *   } else {
 *     // Positive numbers are NumberTuple which store bindingRootIndex and directiveIndex.
 *     const directiveIdx = opCode;
 *     const bindingRootIndx = hostBindingOpCodes[++i] as number;
 *     const hostBindingFn = hostBindingOpCodes[++i] as HostBindingsFunction<any>;
 *     setBindingRootForHostBindings(bindingRootIndx, directiveIdx);
 *     const context = lView[directiveIdx];
 *     hostBindingFn(RenderFlags.Update, context);
 *   }
 * }
 * ```
 *
 */
interface HostBindingOpCodes extends Array<number | HostBindingsFunction<any>> {
    __brand__: 'HostBindingOpCodes';
    debug?: string[];
}
/**
 * Explicitly marks `TView` as a specific type in `ngDevMode`
 *
 * It is useful to know conceptually what time of `TView` we are dealing with when
 * debugging an application (even if the runtime does not need it.) For this reason
 * we store this information in the `ngDevMode` `TView` and than use it for
 * better debugging experience.
 */
declare const enum TViewType {
    /**
     * Root `TView` is the used to bootstrap components into. It is used in conjunction with
     * `LView` which takes an existing DOM node not owned by Angular and wraps it in `TView`/`LView`
     * so that other components can be loaded into it.
     */
    Root = 0,
    /**
     * `TView` associated with a Component. This would be the `TView` directly associated with the
     * component view (as opposed an `Embedded` `TView` which would be a child of `Component` `TView`)
     */
    Component = 1,
    /**
     * `TView` associated with a template. Such as `*ngIf`, `<ng-template>` etc... A `Component`
     * can have zero or more `Embedded` `TView`s.
     */
    Embedded = 2,
    /**
     * Foreign `TView` associated with a range of nodes between `head` and `tail` comment nodes.
     */
    Foreign = 3
}
/**
 * The static data for an LView (shared between all templates of a
 * given type).
 *
 * Stored on the `ComponentDef.tView`.
 */
interface TView {
    /**
     * Type of `TView` (`Root`|`Component`|`Embedded`).
     */
    type: TViewType;
    /**
     * This is a blueprint used to generate LView instances for this TView. Copying this
     * blueprint is faster than creating a new LView from scratch.
     */
    blueprint: LView;
    /**
     * The template function used to refresh the view of dynamically created views
     * and components. Will be null for inline views.
     */
    template: ComponentTemplate<{}> | null;
    /**
     * A function containing query-related instructions.
     */
    viewQuery: ViewQueriesFunction<{}> | null;
    /**
     * A `TNode` representing the declaration location of this `TView` (not part of this TView).
     */
    declTNode: TNode | null;
    /** Whether or not this template has been processed in creation mode. */
    firstCreatePass: boolean;
    /**
     *  Whether or not this template has been processed in update mode (e.g. change detected)
     *
     * `firstUpdatePass` is used by styling to set up `TData` to contain metadata about the styling
     * instructions. (Mainly to build up a linked list of styling priority order.)
     *
     * Typically this function gets cleared after first execution. If exception is thrown then this
     * flag can remain turned un until there is first successful (no exception) pass. This means that
     * individual styling instructions keep track of if they have already been added to the linked
     * list to prevent double adding.
     */
    firstUpdatePass: boolean;
    /** Static data equivalent of LView.data[]. Contains TNodes, PipeDefInternal or TI18n. */
    data: TData;
    /**
     * The binding start index is the index at which the data array
     * starts to store bindings only. Saving this value ensures that we
     * will begin reading bindings at the correct point in the array when
     * we are in update mode.
     *
     * -1 means that it has not been initialized.
     */
    bindingStartIndex: number;
    /**
     * The index where the "expando" section of `LView` begins. The expando
     * section contains injectors, directive instances, and host binding values.
     * Unlike the "decls" and "vars" sections of `LView`, the length of this
     * section cannot be calculated at compile-time because directives are matched
     * at runtime to preserve locality.
     *
     * We store this start index so we know where to start checking host bindings
     * in `setHostBindings`.
     */
    expandoStartIndex: number;
    /**
     * Whether or not there are any static view queries tracked on this view.
     *
     * We store this so we know whether or not we should do a view query
     * refresh after creation mode to collect static query results.
     */
    staticViewQueries: boolean;
    /**
     * Whether or not there are any static content queries tracked on this view.
     *
     * We store this so we know whether or not we should do a content query
     * refresh after creation mode to collect static query results.
     */
    staticContentQueries: boolean;
    /**
     * A reference to the first child node located in the view.
     */
    firstChild: TNode | null;
    /**
     * Stores the OpCodes to be replayed during change-detection to process the `HostBindings`
     *
     * See `HostBindingOpCodes` for encoding details.
     */
    hostBindingOpCodes: HostBindingOpCodes | null;
    /**
     * Full registry of directives and components that may be found in this view.
     *
     * It's necessary to keep a copy of the full def list on the TView so it's possible
     * to render template functions without a host component.
     */
    directiveRegistry: DirectiveDefList | null;
    /**
     * Full registry of pipes that may be found in this view.
     *
     * The property is either an array of `PipeDefs`s or a function which returns the array of
     * `PipeDefs`s. The function is necessary to be able to support forward declarations.
     *
     * It's necessary to keep a copy of the full def list on the TView so it's possible
     * to render template functions without a host component.
     */
    pipeRegistry: PipeDefList | null;
    /**
     * Array of ngOnInit, ngOnChanges and ngDoCheck hooks that should be executed for this view in
     * creation mode.
     *
     * This array has a flat structure and contains TNode indices, directive indices (where an
     * instance can be found in `LView`) and hook functions. TNode index is followed by the directive
     * index and a hook function. If there are multiple hooks for a given TNode, the TNode index is
     * not repeated and the next lifecycle hook information is stored right after the previous hook
     * function. This is done so that at runtime the system can efficiently iterate over all of the
     * functions to invoke without having to make any decisions/lookups.
     */
    preOrderHooks: HookData | null;
    /**
     * Array of ngOnChanges and ngDoCheck hooks that should be executed for this view in update mode.
     *
     * This array has the same structure as the `preOrderHooks` one.
     */
    preOrderCheckHooks: HookData | null;
    /**
     * Array of ngAfterContentInit and ngAfterContentChecked hooks that should be executed
     * for this view in creation mode.
     *
     * Even indices: Directive index
     * Odd indices: Hook function
     */
    contentHooks: HookData | null;
    /**
     * Array of ngAfterContentChecked hooks that should be executed for this view in update
     * mode.
     *
     * Even indices: Directive index
     * Odd indices: Hook function
     */
    contentCheckHooks: HookData | null;
    /**
     * Array of ngAfterViewInit and ngAfterViewChecked hooks that should be executed for
     * this view in creation mode.
     *
     * Even indices: Directive index
     * Odd indices: Hook function
     */
    viewHooks: HookData | null;
    /**
     * Array of ngAfterViewChecked hooks that should be executed for this view in
     * update mode.
     *
     * Even indices: Directive index
     * Odd indices: Hook function
     */
    viewCheckHooks: HookData | null;
    /**
     * Array of ngOnDestroy hooks that should be executed when this view is destroyed.
     *
     * Even indices: Directive index
     * Odd indices: Hook function
     */
    destroyHooks: DestroyHookData | null;
    /**
     * When a view is destroyed, listeners need to be released and outputs need to be
     * unsubscribed. This cleanup array stores both listener data (in chunks of 4)
     * and output data (in chunks of 2) for a particular view. Combining the arrays
     * saves on memory (70 bytes per array) and on a few bytes of code size (for two
     * separate for loops).
     *
     * If it's a native DOM listener or output subscription being stored:
     * 1st index is: event name  `name = tView.cleanup[i+0]`
     * 2nd index is: index of native element or a function that retrieves global target (window,
     *               document or body) reference based on the native element:
     *    `typeof idxOrTargetGetter === 'function'`: global target getter function
     *    `typeof idxOrTargetGetter === 'number'`: index of native element
     *
     * 3rd index is: index of listener function `listener = lView[CLEANUP][tView.cleanup[i+2]]`
     * 4th index is: `useCaptureOrIndx = tView.cleanup[i+3]`
     *    `typeof useCaptureOrIndx == 'boolean' : useCapture boolean
     *    `typeof useCaptureOrIndx == 'number':
     *         `useCaptureOrIndx >= 0` `removeListener = LView[CLEANUP][useCaptureOrIndx]`
     *         `useCaptureOrIndx <  0` `subscription = LView[CLEANUP][-useCaptureOrIndx]`
     *
     * If it's an output subscription or query list destroy hook:
     * 1st index is: output unsubscribe function / query list destroy function
     * 2nd index is: index of function context in LView.cleanupInstances[]
     *               `tView.cleanup[i+0].call(lView[CLEANUP][tView.cleanup[i+1]])`
     */
    cleanup: any[] | null;
    /**
     * A list of element indices for child components that will need to be
     * refreshed when the current view has finished its check. These indices have
     * already been adjusted for the HEADER_OFFSET.
     *
     */
    components: number[] | null;
    /**
     * A collection of queries tracked in a given view.
     */
    queries: TQueries | null;
    /**
     * An array of indices pointing to directives with content queries alongside with the
     * corresponding query index. Each entry in this array is a tuple of:
     * - index of the first content query index declared by a given directive;
     * - index of a directive.
     *
     * We are storing those indexes so we can refresh content queries as part of a view refresh
     * process.
     */
    contentQueries: number[] | null;
    /**
     * Set of schemas that declare elements to be allowed inside the view.
     */
    schemas: SchemaMetadata[] | null;
    /**
     * Array of constants for the view. Includes attribute arrays, local definition arrays etc.
     * Used for directive matching, attribute bindings, local definitions and more.
     */
    consts: TConstants | null;
    /**
     * Indicates that there was an error before we managed to complete the first create pass of the
     * view. This means that the view is likely corrupted and we should try to recover it.
     */
    incompleteFirstPass: boolean;
    /**
     * Unique id of this TView for hydration purposes:
     * - TViewType.Embedded: a unique id generated during serialization on the server
     * - TViewType.Component: an id generated based on component properties
     *                        (see `getComponentId` function for details)
     */
    ssrId: string | null;
}
/** Single hook callback function. */
type HookFn = () => void;
/**
 * Information necessary to call a hook. E.g. the callback that
 * needs to invoked and the index at which to find its context.
 */
type HookEntry = number | HookFn;
/**
 * Array of hooks that should be executed for a view and their directive indices.
 *
 * For each node of the view, the following data is stored:
 * 1) Node index (optional)
 * 2) A series of number/function pairs where:
 *  - even indices are directive indices
 *  - odd indices are hook functions
 *
 * Special cases:
 *  - a negative directive index flags an init hook (ngOnInit, ngAfterContentInit, ngAfterViewInit)
 */
type HookData = HookEntry[];
/**
 * Array of destroy hooks that should be executed for a view and their directive indices.
 *
 * The array is set up as a series of number/function or number/(number|function)[]:
 * - Even indices represent the context with which hooks should be called.
 * - Odd indices are the hook functions themselves. If a value at an odd index is an array,
 *   it represents the destroy hooks of a `multi` provider where:
 *     - Even indices represent the index of the provider for which we've registered a destroy hook,
 *       inside of the `multi` provider array.
 *     - Odd indices are the destroy hook functions.
 * For example:
 * LView: `[0, 1, 2, AService, 4, [BService, CService, DService]]`
 * destroyHooks: `[3, AService.ngOnDestroy, 5, [0, BService.ngOnDestroy, 2, DService.ngOnDestroy]]`
 *
 * In the example above `AService` is a type provider with an `ngOnDestroy`, whereas `BService`,
 * `CService` and `DService` are part of a `multi` provider where only `BService` and `DService`
 * have an `ngOnDestroy` hook.
 */
type DestroyHookData = (HookEntry | HookData)[];
/**
 * Static data that corresponds to the instance-specific data array on an LView.
 *
 * Each node's static data is stored in tData at the same index that it's stored
 * in the data array.  Any nodes that do not have static data store a null value in
 * tData to avoid a sparse array.
 *
 * Each pipe's definition is stored here at the same index as its pipe instance in
 * the data array.
 *
 * Each host property's name is stored here at the same index as its value in the
 * data array.
 *
 * Each property binding name is stored here at the same index as its value in
 * the data array. If the binding is an interpolation, the static string values
 * are stored parallel to the dynamic values. Example:
 *
 * id="prefix {{ v0 }} a {{ v1 }} b {{ v2 }} suffix"
 *
 * LView       |   TView.data
 *------------------------
 *  v0 value   |   'a'
 *  v1 value   |   'b'
 *  v2 value   |   id � prefix � suffix
 *
 * Injector bloom filters are also stored here.
 */
type TData = (TNode | PipeDef<any> | DirectiveDef<any> | ComponentDef<any> | number | TStylingRange | TStylingKey | ProviderToken<any> | TI18n | I18nUpdateOpCodes | TIcu | null | string | TDeferBlockDetails)[];

/**
 * An interface implemented by all Angular type decorators, which allows them to be used as
 * decorators as well as Angular syntax.
 *
 * ```ts
 * @ng.Component({...})
 * class MyClass {...}
 * ```
 *
 * @publicApi
 */
interface TypeDecorator {
    /**
     * Invoke as decorator.
     */
    <T extends Type<any>>(type: T): T;
    (target: Object, propertyKey?: string | symbol, parameterIndex?: number): void;
    (target: unknown, context: unknown): void;
}

/**
 * The strategy that the default change detector uses to detect changes.
 * When set, takes effect the next time change detection is triggered.
 *
 * @see {@link /api/core/ChangeDetectorRef?tab=usage-notes Change detection usage}
 * @see {@link /best-practices/skipping-subtrees Skipping component subtrees}
 *
 * @publicApi
 */
declare enum ChangeDetectionStrategy {
    /**
     * Use the `CheckOnce` strategy, meaning that automatic change detection is deactivated
     * until reactivated by setting the strategy to `Default` (`CheckAlways`).
     * Change detection can still be explicitly invoked.
     * This strategy applies to all child directives and cannot be overridden.
     *
     * NOTE: OnPush is enabled by default.
     */
    OnPush = 0,
    /**
     * Use the `Eager` strategy, meaning that the component is checked eagerly when the change
     * detection traversal reaches it, rather than only checking under certain circumstances (e.g.
     * `markForCheck`, a signal in the template changed, etc).
     */
    Eager = 1,
    /**
     * This value is equivalent to setting `Eager` and is due to be removed.
     * @deprecated Use `Eager` instead.
     */
    Default = 1
}

/**
 * @publicApi
 */
type ɵɵDirectiveDeclaration<T, Selector extends string, ExportAs extends string[], InputMap extends {
    [key: string]: string | {
        alias: string | null;
        required: boolean;
        isSignal?: boolean;
    };
}, OutputMap extends {
    [key: string]: string;
}, QueryFields extends string[], NgContentSelectors extends never = never, IsStandalone extends boolean = false, HostDirectives = never, IsSignal extends boolean = false> = unknown;
/**
 * @publicApi
 */
type ɵɵComponentDeclaration<T, Selector extends String, ExportAs extends string[], InputMap extends {
    [key: string]: string | {
        alias: string | null;
        required: boolean;
        isSignal?: boolean;
    };
}, OutputMap extends {
    [key: string]: string;
}, QueryFields extends string[], NgContentSelectors extends string[], IsStandalone extends boolean = false, HostDirectives = never, IsSignal extends boolean = false> = unknown;
/**
 * @publicApi
 */
type ɵɵNgModuleDeclaration<T, Declarations, Imports, Exports> = unknown;
/**
 * @publicApi
 */
type ɵɵPipeDeclaration<T, Name extends string | null, IsStandalone extends boolean = false> = unknown;
/**
 * @publicApi
 */
type ɵɵInjectorDeclaration<T> = unknown;
/**
 * @publicApi
 */
type ɵɵFactoryDeclaration<T, CtorDependencies extends CtorDependency[]> = (parent?: Type<any>) => any;
/**
 * An object literal of this type is used to represent the metadata of a constructor dependency.
 * The type itself is never referred to from generated code.
 *
 * @publicApi
 */
type CtorDependency = {
    /**
     * If an `@Attribute` decorator is used, this represents the injected attribute's name. If the
     * attribute name is a dynamic expression instead of a string literal, this will be the unknown
     * type.
     */
    attribute?: string | unknown;
    /**
     * If `@Optional()` is used, this key is set to true.
     */
    optional?: true;
    /**
     * If `@Host` is used, this key is set to true.
     */
    host?: true;
    /**
     * If `@Self` is used, this key is set to true.
     */
    self?: true;
    /**
     * If `@SkipSelf` is used, this key is set to true.
     */
    skipSelf?: true;
} | null;

/**
 * Represents an instance of an `NgModule` created by an `NgModuleFactory`.
 * Provides access to the `NgModule` instance and related objects.
 *
 * @publicApi
 */
declare abstract class NgModuleRef<T> {
    /**
     * The injector that contains all of the providers of the `NgModule`.
     */
    abstract get injector(): EnvironmentInjector;
    /**
     * The `NgModule` instance.
     */
    abstract get instance(): T;
    /**
     * Destroys the module instance and all of the data structures associated with it.
     */
    abstract destroy(): void;
    /**
     * Registers a callback to be executed when the module is destroyed.
     */
    abstract onDestroy(callback: () => void): void;
}
interface InternalNgModuleRef<T> extends NgModuleRef<T> {
    _bootstrapComponents: Type<any>[];
    resolveInjectorInitializers(): void;
}
/**
 * @publicApi
 *
 * @deprecated
 * This class was mostly used as a part of ViewEngine-based JIT API and is no longer needed in Ivy
 * JIT mode. Angular provides APIs that accept NgModule classes directly (such as
 * [PlatformRef.bootstrapModule](api/core/PlatformRef#bootstrapModule) and
 * [createNgModule](api/core/createNgModule)), consider switching to those APIs instead of
 * using factory-based ones.
 */
declare abstract class NgModuleFactory<T> {
    abstract get moduleType(): Type<T>;
    abstract create(parentInjector: Injector | null): NgModuleRef<T>;
}

/**
 * Base class that provides change detection functionality.
 * A change-detection tree collects all views that are to be checked for changes.
 * Use the methods to add and remove views from the tree, initiate change-detection,
 * and explicitly mark views as _dirty_, meaning that they have changed and need to be re-rendered.
 *
 * @see [Using change detection hooks](guide/components/lifecycle)
 *
 * @usageNotes
 *
 * The following examples demonstrate how to modify default change-detection behavior
 * to perform explicit detection when needed.
 *
 * ### Use `markForCheck()` with `CheckOnce` strategy
 *
 * The following example sets the `OnPush` change-detection strategy for a component
 * (`CheckOnce`, rather than the default `CheckAlways`), then forces a second check
 * after an interval.
 *
 * {@example core/ts/change_detect/change-detection.ts region='mark-for-check'}
 *
 * ### Detach change detector to limit how often check occurs
 *
 * The following example defines a component with a large list of read-only data
 * that is expected to change constantly, many times per second.
 * To improve performance, we want to check and update the list
 * less often than the changes actually occur. To do that, we detach
 * the component's change detector and perform an explicit local check every five seconds.
 *
 * {@example core/ts/change_detect/change-detection.ts region='detach'}
 *
 *
 * ### Reattaching a detached component
 *
 * The following example creates a component displaying live data.
 * The component detaches its change detector from the main change detector tree
 * when the `live` property is set to false, and reattaches it when the property
 * becomes true.
 *
 * {@example core/ts/change_detect/change-detection.ts region='reattach'}
 *
 * @publicApi
 */
declare abstract class ChangeDetectorRef {
    /**
     * When a view uses the {@link ChangeDetectionStrategy#OnPush} (checkOnce)
     * change detection strategy, explicitly marks the view as changed so that
     * it can be checked again.
     *
     * Components are normally marked as dirty (in need of rerendering) when inputs
     * have changed or events have fired in the view. Call this method to ensure that
     * a component is checked even if these triggers have not occurred.
     *
     * <!-- TODO: Add a link to a chapter on OnPush components -->
     *
     */
    abstract markForCheck(): void;
    /**
     * Detaches this view from the change-detection tree.
     * A detached view is  not checked until it is reattached.
     * Use in combination with `detectChanges()` to implement local change detection checks.
     *
     * Detached views are not checked during change detection runs until they are
     * re-attached, even if they are marked as dirty.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
     *
     */
    abstract detach(): void;
    /**
     * Checks this view and its children. Use in combination with {@link ChangeDetectorRef#detach}
     * to implement local change detection checks.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
     *
     */
    abstract detectChanges(): void;
    /**
     * Re-attaches the previously detached view to the change detection tree.
     * Views are attached to the tree by default.
     *
     * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
     *
     */
    abstract reattach(): void;
}
/** Returns a ChangeDetectorRef (a.k.a. a ViewRef) */
declare function injectChangeDetectorRef(flags: InternalInjectFlags): ChangeDetectorRef;

/**
 * A wrapper around a native element inside of a View.
 *
 * An `ElementRef` is backed by a render-specific element. In the browser, this is usually a DOM
 * element.
 *
 * @security Permitting direct access to the DOM can make your application more vulnerable to
 * XSS attacks. Carefully review any use of `ElementRef` in your code. For more detail, see the
 * [Security Guide](https://g.co/ng/security).
 *
 * @see [Using DOM APIs](guide/components/dom-apis)
 *
 * @publicApi
 */
declare class ElementRef<T = any> {
    /**
     * <div class="docs-alert docs-alert-important">
     *   <header>Use with caution</header>
     *   <p>
     *    Use this API as the last resort when direct access to DOM is needed. Use templating and
     *    data-binding provided by Angular instead. If used, it is recommended in combination with
     *    {@link /best-practices/security#direct-use-of-the-dom-apis-and-explicit-sanitization-calls DomSanitizer}
     *    for maxiumum security;
     *   </p>
     * </div>
     */
    nativeElement: T;
    constructor(nativeElement: T);
}

/**
 * Represents an Angular view.
 *
 * @see {@link /api/core/ChangeDetectorRef#usage-notes Change detection usage}
 *
 * @publicApi
 */
declare abstract class ViewRef extends ChangeDetectorRef {
    /**
     * Destroys this view and all of the data structures associated with it.
     */
    abstract destroy(): void;
    /**
     * Reports whether this view has been destroyed.
     * @returns True after the `destroy()` method has been called, false otherwise.
     */
    abstract get destroyed(): boolean;
    /**
     * A lifecycle hook that provides additional developer-defined cleanup
     * functionality for views.
     * @param callback A handler function that cleans up developer-defined data
     * associated with a view. Called when the `destroy()` method is invoked.
     */
    abstract onDestroy(callback: Function): void;
}
/**
 * Represents an Angular view in a view container.
 * An embedded view can be referenced from a component
 * other than the hosting component whose template defines it, or it can be defined
 * independently by a `TemplateRef`.
 *
 * Properties of elements in a view can change, but the structure (number and order) of elements in
 * a view cannot. Change the structure of elements by inserting, moving, or
 * removing nested views in a view container.
 *
 * @see {@link ViewContainerRef}
 *
 * @usageNotes
 *
 * The following template breaks down into two separate `TemplateRef` instances,
 * an outer one and an inner one.
 *
 * ```html
 * Count: {{items.length}}
 * <ul>
 *   <li *ngFor="let  item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * This is the outer `TemplateRef`:
 *
 * ```html
 * Count: {{items.length}}
 * <ul>
 *   <ng-template ngFor let-item [ngForOf]="items"></ng-template>
 * </ul>
 * ```
 *
 * This is the inner `TemplateRef`:
 *
 * ```html
 *   <li>{{item}}</li>
 * ```
 *
 * The outer and inner `TemplateRef` instances are assembled into views as follows:
 *
 * ```html
 * <!-- ViewRef: outer-0 -->
 * Count: 2
 * <ul>
 *   <ng-template view-container-ref></ng-template>
 *   <!-- ViewRef: inner-1 --><li>first</li><!-- /ViewRef: inner-1 -->
 *   <!-- ViewRef: inner-2 --><li>second</li><!-- /ViewRef: inner-2 -->
 * </ul>
 * <!-- /ViewRef: outer-0 -->
 * ```
 * @publicApi
 */
declare abstract class EmbeddedViewRef<C> extends ViewRef {
    /**
     * The context for this view, inherited from the anchor element.
     */
    abstract context: C;
    /**
     * The root nodes for this embedded view.
     */
    abstract get rootNodes(): any[];
}

/**
 * Represents a component created by a `ComponentFactory`.
 * Provides access to the component instance and related objects,
 * and provides the means of destroying the instance.
 *
 * @see [Programmatically rendering components](guide/components/programmatic-rendering)
 *
 * @publicApi
 */
declare abstract class ComponentRef<C> {
    /**
     * Updates a specified input name to a new value. Using this method will properly mark for check
     * component using the `OnPush` change detection strategy. It will also assure that the
     * `OnChanges` lifecycle hook runs when a dynamically created component is change-detected.
     *
     * @param name The name of an input.
     * @param value The new value of an input.
     */
    abstract setInput(name: string, value: unknown): void;
    /**
     * The host or anchor element for this component instance.
     */
    abstract get location(): ElementRef;
    /**
     * The dependency injector for this component instance.
     */
    abstract get injector(): Injector;
    /**
     * This component instance.
     */
    abstract get instance(): C;
    /**
     * The host view defined by the template
     * for this component instance.
     */
    abstract get hostView(): ViewRef;
    /**
     * The change detector for this component instance.
     */
    abstract get changeDetectorRef(): ChangeDetectorRef;
    /**
     * The type of this component (as created by a `ComponentFactory` class).
     */
    abstract get componentType(): Type<any>;
    /**
     * Destroys the component instance and all of the data structures associated with it.
     */
    abstract destroy(): void;
    /**
     * A lifecycle hook that provides additional developer-defined cleanup
     * functionality for the component.
     * @param callback A handler function that cleans up developer-defined data
     * associated with this component. Called when the `destroy()` method is invoked.
     */
    abstract onDestroy(callback: Function): void;
}

/** Symbol used to store and retrieve metadata about a binding. */
declare const BINDING: unique symbol;
/**
 * A dynamically-defined binding targeting.
 * For example, `inputBinding('value', () => 123)` creates an input binding.
 *
 * @see [Binding inputs, outputs and setting host directives at creation](guide/components/programmatic-rendering#binding-inputs-outputs-and-setting-host-directives-at-creation)
 */
interface Binding {
    readonly [BINDING]: unknown;
}
/**
 * Represents a dynamically-created directive with bindings targeting it specifically.
 *
 * @see [Binding inputs, outputs and setting host directives at creation](guide/components/programmatic-rendering#binding-inputs-outputs-and-setting-host-directives-at-creation)
 */
interface DirectiveWithBindings<T> {
    /** Directive type that should be created. */
    type: Type<T>;
    /** Bindings that should be applied to the specific directive. */
    bindings: Binding[];
}
/**
 * Creates an input binding.
 * @param publicName Public name of the input to bind to.
 * @param value Callback that returns the current value for the binding. Can be either a signal or
 *   a plain getter function.
 *
 * ### Usage Example
 * In this example we create an instance of the `MyButton` component and bind the value of
 * the `isDisabled` signal to its `disabled` input.
 *
 * ```ts
 * const isDisabled = signal(false);
 *
 * createComponent(MyButton, {
 *   bindings: [inputBinding('disabled', isDisabled)]
 * });
 * ```
 * @see [Binding inputs, outputs and setting host directives at creation](guide/components/programmatic-rendering#binding-inputs-outputs-and-setting-host-directives-at-creation)
 */
declare function inputBinding(publicName: string, value: () => unknown): Binding;
/**
 * Creates an output binding.
 * @param eventName Public name of the output to listen to.
 * @param listener Function to be called when the output emits.
 *
 * ### Usage example
 * In this example we create an instance of the `MyCheckbox` component and listen
 * to its `onChange` event.
 *
 * ```ts
 * interface CheckboxChange {
 *   value: string;
 * }
 *
 * createComponent(MyCheckbox, {
 *   bindings: [
 *    outputBinding<CheckboxChange>('onChange', event => console.log(event.value))
 *   ],
 * });
 * ```
 * @see [Binding inputs, outputs and setting host directives at creation](guide/components/programmatic-rendering#binding-inputs-outputs-and-setting-host-directives-at-creation)
 */
declare function outputBinding<T>(eventName: string, listener: (event: T) => unknown): Binding;
/**
 * Creates a two-way binding.
 * @param eventName Public name of the two-way compatible input.
 * @param value Writable signal from which to get the current value and to which to write new
 * values.
 *
 * ### Usage example
 * In this example we create an instance of the `MyCheckbox` component and bind to its `value`
 * input using a two-way binding.
 *
 * ```ts
 * const checkboxValue = signal('');
 *
 * createComponent(MyCheckbox, {
 *   bindings: [
 *    twoWayBinding('value', checkboxValue),
 *   ],
 * });
 * ```
 * @see [Binding inputs, outputs and setting host directives at creation](guide/components/programmatic-rendering#binding-inputs-outputs-and-setting-host-directives-at-creation)
 */
declare function twoWayBinding(publicName: string, value: WritableSignal<unknown>): Binding;

/**
 * Use in components with the `@Output` directive to emit custom events
 * synchronously or asynchronously, and register handlers for those events
 * by subscribing to an instance.
 *
 * @usageNotes
 *
 * Extends
 * [RxJS `Subject`](https://rxjs.dev/api/index/class/Subject)
 * for Angular by adding the `emit()` method.
 *
 * In the following example, a component defines two output properties
 * that create event emitters. When the title is clicked, the emitter
 * emits an open or close event to toggle the current visibility state.
 *
 * ```angular-ts
 * @Component({
 *   selector: 'zippy',
 *   template: `
 *   <div class="zippy">
 *     <div (click)="toggle()">Toggle</div>
 *     <div [hidden]="!visible">
 *       <ng-content></ng-content>
 *     </div>
 *  </div>`})
 * export class Zippy {
 *   visible: boolean = true;
 *   @Output() open: EventEmitter<any> = new EventEmitter();
 *   @Output() close: EventEmitter<any> = new EventEmitter();
 *
 *   toggle() {
 *     this.visible = !this.visible;
 *     if (this.visible) {
 *       this.open.emit(null);
 *     } else {
 *       this.close.emit(null);
 *     }
 *   }
 * }
 * ```
 *
 * Access the event object with the `$event` argument passed to the output event
 * handler:
 *
 * ```html
 * <zippy (open)="onOpen($event)" (close)="onClose($event)"></zippy>
 * ```
 *
 * @see [Declaring outputs with the @Output decorator](guide/components/outputs#declaring-outputs-with-the-output-decorator)
 *
 * @publicApi
 */
interface EventEmitter<T> extends Subject<T>, OutputRef<T> {
    /**
     * Creates an instance of this class that can
     * deliver events synchronously or asynchronously.
     *
     * @param [isAsync=false] When true, deliver events asynchronously.
     *
     */
    new (isAsync?: boolean): EventEmitter<T>;
    /**
     * Emits an event containing a given value.
     * @param value The value to emit.
     */
    emit(value?: T): void;
    /**
     * Registers handlers for events emitted by this instance.
     * @param next When supplied, a custom handler for emitted events.
     * @param error When supplied, a custom handler for an error notification from this emitter.
     * @param complete When supplied, a custom handler for a completion notification from this
     *     emitter.
     */
    subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void): Subscription;
    /**
     * Registers handlers for events emitted by this instance.
     * @param observerOrNext When supplied, a custom handler for emitted events, or an observer
     *     object.
     * @param error When supplied, a custom handler for an error notification from this emitter.
     * @param complete When supplied, a custom handler for a completion notification from this
     *     emitter.
     */
    subscribe(observerOrNext?: any, error?: any, complete?: any): Subscription;
}
/**
 * @publicApi
 */
declare const EventEmitter: {
    new (isAsync?: boolean): EventEmitter<any>;
    new <T>(isAsync?: boolean): EventEmitter<T>;
    readonly prototype: EventEmitter<any>;
};

/**
 * An injectable service for executing work inside or outside of the Angular zone.
 *
 * The most common use of this service is to optimize performance when starting a work consisting of
 * one or more asynchronous tasks that don't require UI updates or error handling to be handled by
 * Angular. Such tasks can be kicked off via {@link #runOutsideAngular} and if needed, these tasks
 * can reenter the Angular zone via {@link #run}.
 *
 * <!-- TODO: add/fix links to:
 *   - docs explaining zones and the use of zones in Angular and change-detection
 *   - link to runOutsideAngular/run (throughout this file!)
 *   -->
 *
 * @usageNotes
 * ### Example
 *
 * ```ts
 * import {Component, NgZone} from '@angular/core';
 *
 * @Component({
 *   selector: 'ng-zone-demo',
 *   template: `
 *     <h2>Demo: NgZone</h2>
 *
 *     <p>Progress: {{progress}}%</p>
 *     @if(progress >= 100) {
 *        <p>Done processing {{label}} of Angular zone!</p>
 *     }
 *
 *     <button (click)="processWithinAngularZone()">Process within Angular zone</button>
 *     <button (click)="processOutsideOfAngularZone()">Process outside of Angular zone</button>
 *   `,
 * })
 * export class NgZoneDemo {
 *   progress: number = 0;
 *   label: string;
 *
 *   constructor(private _ngZone: NgZone) {}
 *
 *   // Loop inside the Angular zone
 *   // so the UI DOES refresh after each setTimeout cycle
 *   processWithinAngularZone() {
 *     this.label = 'inside';
 *     this.progress = 0;
 *     this._increaseProgress(() => console.log('Inside Done!'));
 *   }
 *
 *   // Loop outside of the Angular zone
 *   // so the UI DOES NOT refresh after each setTimeout cycle
 *   processOutsideOfAngularZone() {
 *     this.label = 'outside';
 *     this.progress = 0;
 *     this._ngZone.runOutsideAngular(() => {
 *       this._increaseProgress(() => {
 *         // reenter the Angular zone and display done
 *         this._ngZone.run(() => { console.log('Outside Done!'); });
 *       });
 *     });
 *   }
 *
 *   _increaseProgress(doneCallback: () => void) {
 *     this.progress += 1;
 *     console.log(`Current progress: ${this.progress}%`);
 *
 *     if (this.progress < 100) {
 *       window.setTimeout(() => this._increaseProgress(doneCallback), 10);
 *     } else {
 *       doneCallback();
 *     }
 *   }
 * }
 * ```
 *
 * @see [Resolving zone pollution](best-practices/zone-pollution#run-tasks-outside-ngzone)
 *
 * @publicApi
 */
declare class NgZone {
    readonly hasPendingMacrotasks: boolean;
    readonly hasPendingMicrotasks: boolean;
    /**
     * Whether there are no outstanding microtasks or macrotasks.
     */
    readonly isStable: boolean;
    /**
     * Notifies when code enters Angular Zone. This gets fired first on VM Turn.
     */
    readonly onUnstable: EventEmitter<any>;
    /**
     * Notifies when there is no more microtasks enqueued in the current VM Turn.
     * This is a hint for Angular to do change detection, which may enqueue more microtasks.
     * For this reason this event can fire multiple times per VM Turn.
     */
    readonly onMicrotaskEmpty: EventEmitter<any>;
    /**
     * Notifies when the last `onMicrotaskEmpty` has run and there are no more microtasks, which
     * implies we are about to relinquish VM turn.
     * This event gets called just once.
     */
    readonly onStable: EventEmitter<any>;
    /**
     * Notifies that an error has been delivered.
     */
    readonly onError: EventEmitter<any>;
    constructor(options: {
        enableLongStackTrace?: boolean;
        shouldCoalesceEventChangeDetection?: boolean;
        shouldCoalesceRunChangeDetection?: boolean;
    });
    /**
      This method checks whether the method call happens within an Angular Zone instance.
    */
    static isInAngularZone(): boolean;
    /**
      Assures that the method is called within the Angular Zone, otherwise throws an error.
    */
    static assertInAngularZone(): void;
    /**
      Assures that the method is called outside of the Angular Zone, otherwise throws an error.
    */
    static assertNotInAngularZone(): void;
    /**
     * Executes the `fn` function synchronously within the Angular zone and returns value returned by
     * the function.
     *
     * Running functions via `run` allows you to reenter Angular zone from a task that was executed
     * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * within the Angular zone.
     *
     * If a synchronous error happens it will be rethrown and not reported via `onError`.
     */
    run<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T;
    /**
     * Executes the `fn` function synchronously within the Angular zone as a task and returns value
     * returned by the function.
     *
     * Running functions via `runTask` allows you to reenter Angular zone from a task that was executed
     * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * within the Angular zone.
     *
     * If a synchronous error happens it will be rethrown and not reported via `onError`.
     */
    runTask<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[], name?: string): T;
    /**
     * Same as `run`, except that synchronous errors are caught and forwarded via `onError` and not
     * rethrown.
     */
    runGuarded<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T;
    /**
     * Executes the `fn` function synchronously in Angular's parent zone and returns value returned by
     * the function.
     *
     * Running functions via {@link #runOutsideAngular} allows you to escape Angular's zone and do
     * work that
     * doesn't trigger Angular change-detection or is subject to Angular's error handling.
     *
     * Any future tasks or microtasks scheduled from within this function will continue executing from
     * outside of the Angular zone.
     *
     * Use {@link #run} to reenter the Angular zone and do work that updates the application model.
     */
    runOutsideAngular<T>(fn: (...args: any[]) => T): T;
}
/**
 * Provides a noop implementation of `NgZone` which does nothing. This zone requires explicit calls
 * to framework to perform rendering.
 */
declare class NoopNgZone implements NgZone {
    readonly hasPendingMicrotasks = false;
    readonly hasPendingMacrotasks = false;
    readonly isStable = true;
    readonly onUnstable: EventEmitter<any>;
    readonly onMicrotaskEmpty: EventEmitter<any>;
    readonly onStable: EventEmitter<any>;
    readonly onError: EventEmitter<any>;
    run<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any): T;
    runGuarded<T>(fn: (...args: any[]) => any, applyThis?: any, applyArgs?: any): T;
    runOutsideAngular<T>(fn: (...args: any[]) => T): T;
    runTask<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any, name?: string): T;
}

/**
 * A DI token that provides a set of callbacks to
 * be called for every component that is bootstrapped.
 *
 * Each callback must take a `ComponentRef` instance and return nothing.
 *
 * `(componentRef: ComponentRef) => void`
 *
 * @publicApi
 */
declare const APP_BOOTSTRAP_LISTENER: InjectionToken<readonly ((compRef: ComponentRef<any>) => void)[]>;
/**
 * Provides additional options to the bootstrapping process.
 *
 * @publicApi
 * @deprecated 20.2 Configure `NgZone` in the `providers` array of the application module instead.
 */
interface BootstrapOptions {
    /**
     * Optionally specify which `NgZone` should be used when not configured in the providers.
     *
     * - Provide your own `NgZone` instance.
     * - `zone.js` - Use default `NgZone` which requires `Zone.js`.
     * - `noop` - Use `NoopNgZone` which does nothing.
     *
     * @deprecated BootstrapOptions is deprecated. Provide `NgZone` in the `providers` array of the module instead.
     */
    ngZone?: NgZone | 'zone.js' | 'noop';
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
     * triggered. We can coalesce such kind of events to only trigger
     * change detection only once.
     *
     * By default, this option will be false. So the events will not be
     * coalesced and the change detection will be triggered multiple times.
     * And if this option be set to true, the change detection will be
     * triggered async by scheduling a animation frame. So in the case above,
     * the change detection will only be triggered once.
     *
     * @deprecated BootstrapOptions is deprecated. Use `provideZoneChangeDetection` instead to configure coalescing.
     */
    ngZoneEventCoalescing?: boolean;
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
     * @deprecated BootstrapOptions is deprecated. Use `provideZoneChangeDetection` instead to configure coalescing.
     */
    ngZoneRunCoalescing?: boolean;
}
/**
 * A reference to an Angular application running on a page.
 *
 * @usageNotes
 * ### isStable examples and caveats
 *
 * Note two important points about `isStable`, demonstrated in the examples below:
 * - the application will never be stable if you start any kind
 * of recurrent asynchronous task when the application starts
 * (for example for a polling process, started with a `setInterval`, a `setTimeout`
 * or using RxJS operators like `interval`);
 * - the `isStable` Observable runs outside of the Angular zone.
 *
 * Let's imagine that you start a recurrent task
 * (here incrementing a counter, using RxJS `interval`),
 * and at the same time subscribe to `isStable`.
 *
 * ```ts
 * constructor(appRef: ApplicationRef) {
 *   appRef.isStable.pipe(
 *      filter(stable => stable)
 *   ).subscribe(() => console.log('App is stable now');
 *   interval(1000).subscribe(counter => console.log(counter));
 * }
 * ```
 * In this example, `isStable` will never emit `true`,
 * and the trace "App is stable now" will never get logged.
 *
 * If you want to execute something when the app is stable,
 * you have to wait for the application to be stable
 * before starting your polling process.
 *
 * ```ts
 * constructor(appRef: ApplicationRef) {
 *   appRef.isStable.pipe(
 *     first(stable => stable),
 *     tap(stable => console.log('App is stable now')),
 *     switchMap(() => interval(1000))
 *   ).subscribe(counter => console.log(counter));
 * }
 * ```
 * In this example, the trace "App is stable now" will be logged
 * and then the counter starts incrementing every second.
 *
 * Note also that this Observable runs outside of the Angular zone,
 * which means that the code in the subscription
 * to this Observable will not trigger the change detection.
 *
 * Let's imagine that instead of logging the counter value,
 * you update a field of your component
 * and display it in its template.
 *
 * ```ts
 * constructor(appRef: ApplicationRef) {
 *   appRef.isStable.pipe(
 *     first(stable => stable),
 *     switchMap(() => interval(1000))
 *   ).subscribe(counter => this.value = counter);
 * }
 * ```
 * As the `isStable` Observable runs outside the zone,
 * the `value` field will be updated properly,
 * but the template will not be refreshed!
 *
 * You'll have to manually trigger the change detection to update the template.
 *
 * ```ts
 * constructor(appRef: ApplicationRef, cd: ChangeDetectorRef) {
 *   appRef.isStable.pipe(
 *     first(stable => stable),
 *     switchMap(() => interval(1000))
 *   ).subscribe(counter => {
 *     this.value = counter;
 *     cd.detectChanges();
 *   });
 * }
 * ```
 *
 * Or make the subscription callback run inside the zone.
 *
 * ```ts
 * constructor(appRef: ApplicationRef, zone: NgZone) {
 *   appRef.isStable.pipe(
 *     first(stable => stable),
 *     switchMap(() => interval(1000))
 *   ).subscribe(counter => zone.run(() => this.value = counter));
 * }
 * ```
 *
 * @publicApi
 */
declare class ApplicationRef {
    private _destroyed;
    private _destroyListeners;
    private readonly internalErrorHandler;
    private readonly afterRenderManager;
    private readonly zonelessEnabled;
    private readonly rootEffectScheduler;
    private allTestViews;
    private autoDetectTestViews;
    /**
     * Indicates whether this instance was destroyed.
     */
    get destroyed(): boolean;
    /**
     * Get a list of component types registered to this application.
     * This list is populated even before the component is created.
     */
    readonly componentTypes: Type<any>[];
    /**
     * Get a list of components registered to this application.
     */
    readonly components: ComponentRef<any>[];
    private internalPendingTask;
    /**
     * Returns an Observable that indicates when the application is stable or unstable.
     */
    get isStable(): Observable<boolean>;
    constructor();
    /**
     * @returns A promise that resolves when the application becomes stable
     */
    whenStable(): Promise<void>;
    private readonly _injector;
    private _rendererFactory;
    /**
     * The `EnvironmentInjector` used to create this application.
     */
    get injector(): EnvironmentInjector;
    /**
     * Bootstrap a component onto the element identified by its selector or, optionally, to a
     * specified element.
     *
     * @usageNotes
     * ### Bootstrap process
     *
     * When bootstrapping a component, Angular mounts it onto a target DOM element
     * and kicks off automatic change detection. The target DOM element can be
     * provided using the `hostElement` argument.
     *
     * If the target DOM element is not provided, Angular tries to find one on a page
     * using the `selector` of the component that is being bootstrapped
     * (first matched element is used).
     *
     * ### Example
     *
     * Generally, we define the component to bootstrap in the `bootstrap` array of `NgModule`,
     * but it requires us to know the component while writing the application code.
     *
     * Imagine a situation where we have to wait for an API call to decide about the component to
     * bootstrap. We can use the `ngDoBootstrap` hook of the `NgModule` and call this method to
     * dynamically bootstrap a component.
     *
     * {@example core/ts/platform/platform.ts region='componentSelector'}
     *
     * Optionally, a component can be mounted onto a DOM element that does not match the
     * selector of the bootstrapped component.
     *
     * In the following example, we are providing a CSS selector to match the target element.
     *
     * {@example core/ts/platform/platform.ts region='cssSelector'}
     *
     * While in this example, we are providing reference to a DOM node.
     *
     * {@example core/ts/platform/platform.ts region='domNode'}
     */
    bootstrap<C>(component: Type<C>, options?: {
        hostElement?: Element | string;
        directives?: (Type<unknown> | DirectiveWithBindings<unknown>)[];
        bindings?: Binding[];
    }): ComponentRef<C>;
    bootstrap<C>(component: Type<C>, hostElement?: Element | string): ComponentRef<C>;
    private bootstrapImpl;
    /**
     * Invoke this method to explicitly process change detection and its side-effects.
     *
     * In development mode, `tick()` also performs a second change detection cycle to ensure that no
     * further changes are detected. If additional changes are picked up during this second cycle,
     * bindings in the app have side-effects that cannot be resolved in a single change detection
     * pass.
     * In this case, Angular throws an error, since an Angular application can only have one change
     * detection pass during which all change detection must complete.
     */
    tick(): void;
    private tickImpl;
    /**
     * Performs the core work of synchronizing the application state with the UI, resolving any
     * pending dirtiness (potentially in a loop).
     */
    private synchronize;
    /**
     * Perform a single synchronization pass.
     */
    private synchronizeOnce;
    /**
     * Checks `allViews` for views which require refresh/traversal, and updates `dirtyFlags`
     * accordingly, with two potential behaviors:
     *
     * 1. If any of our views require updating, then this adds the `ViewTreeTraversal` dirty flag.
     *    This _should_ be a no-op, since the scheduler should've added the flag at the same time the
     *    view was marked as needing updating.
     *
     *    TODO(alxhub): figure out if this behavior is still needed for edge cases.
     *
     * 2. If none of our views require updating, then clear the view-related `dirtyFlag`s. This
     *    happens when the scheduler is notified of a view becoming dirty, but the view itself isn't
     *    reachable through traversal from our roots (e.g. it's detached from the CD tree).
     */
    private syncDirtyFlagsWithViews;
    /**
     * Attaches a view so that it will be dirty checked.
     * The view will be automatically detached when it is destroyed.
     * This will throw if the view is already attached to a ViewContainer.
     */
    attachView(viewRef: ViewRef): void;
    /**
     * Detaches a view from dirty checking again.
     */
    detachView(viewRef: ViewRef): void;
    private _loadComponent;
    /**
     * Registers a listener to be called when an instance is destroyed.
     *
     * @param callback A callback function to add as a listener.
     * @returns A function which unregisters a listener.
     */
    onDestroy(callback: () => void): VoidFunction;
    /**
     * Destroys an Angular application represented by this `ApplicationRef`. Calling this function
     * will destroy the associated environment injectors as well as all the bootstrapped components
     * with their views.
     */
    destroy(): void;
    /**
     * Returns the number of attached views.
     */
    get viewCount(): number;
    static ɵfac: ɵɵFactoryDeclaration<ApplicationRef, never>;
    static ɵprov: ɵɵInjectableDeclaration<any>;
}

interface NavigationEventMap {
    navigate: NavigateEvent;
    navigatesuccess: Event;
    navigateerror: ErrorEvent;
    currententrychange: NavigationCurrentEntryChangeEvent;
}
interface NavigationResult {
    committed: Promise<NavigationHistoryEntry>;
    finished: Promise<NavigationHistoryEntry>;
}
declare class Navigation extends EventTarget {
    entries(): NavigationHistoryEntry[];
    readonly currentEntry: NavigationHistoryEntry | null;
    updateCurrentEntry(options: NavigationUpdateCurrentEntryOptions): void;
    readonly transition: NavigationTransition | null;
    readonly canGoBack: boolean;
    readonly canGoForward: boolean;
    navigate(url: string, options?: NavigationNavigateOptions): NavigationResult;
    reload(options?: NavigationReloadOptions): NavigationResult;
    traverseTo(key: string, options?: NavigationOptions): NavigationResult;
    back(options?: NavigationOptions): NavigationResult;
    forward(options?: NavigationOptions): NavigationResult;
    onnavigate: ((this: Navigation, ev: NavigateEvent) => any) | null;
    onnavigatesuccess: ((this: Navigation, ev: Event) => any) | null;
    onnavigateerror: ((this: Navigation, ev: ErrorEvent) => any) | null;
    oncurrententrychange: ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any) | null;
    addEventListener<K extends keyof NavigationEventMap>(type: K, listener: (this: Navigation, ev: NavigationEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof NavigationEventMap>(type: K, listener: (this: Navigation, ev: NavigationEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
declare class NavigationTransition {
    readonly navigationType: NavigationType;
    readonly from: NavigationHistoryEntry;
    readonly to: NavigationDestination;
    readonly finished: Promise<void>;
    readonly committed: Promise<void>;
}
interface NavigationHistoryEntryEventMap {
    dispose: Event;
}
declare class NavigationHistoryEntry extends EventTarget {
    readonly key: string;
    readonly id: string;
    readonly url: string | null;
    readonly index: number;
    readonly sameDocument: boolean;
    getState(): unknown;
    ondispose: ((this: NavigationHistoryEntry, ev: Event) => any) | null;
    addEventListener<K extends keyof NavigationHistoryEntryEventMap>(type: K, listener: (this: NavigationHistoryEntry, ev: NavigationHistoryEntryEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof NavigationHistoryEntryEventMap>(type: K, listener: (this: NavigationHistoryEntry, ev: NavigationHistoryEntryEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}
type NavigationType = 'push' | 'reload' | 'replace' | 'traverse';
interface NavigationUpdateCurrentEntryOptions {
    state: unknown;
}
interface NavigationOptions {
    info?: unknown;
}
interface NavigationNavigateOptions extends NavigationOptions {
    state?: unknown;
    history?: 'auto' | 'push' | 'replace';
}
interface NavigationReloadOptions extends NavigationOptions {
    state?: unknown;
}
declare class NavigationCurrentEntryChangeEvent extends Event {
    constructor(type: string, eventInit?: NavigationCurrentEntryChangeEventInit);
    readonly navigationType: NavigationType | null;
    readonly from: NavigationHistoryEntry;
}
interface NavigationCurrentEntryChangeEventInit extends EventInit {
    navigationType?: NavigationType | null;
    from: NavigationHistoryEntry;
}
declare class NavigateEvent extends Event {
    constructor(type: string, eventInit?: NavigateEventInit);
    readonly navigationType: NavigationType;
    readonly canIntercept: boolean;
    readonly userInitiated: boolean;
    readonly hashChange: boolean;
    readonly hasUAVisualTransition: boolean;
    readonly destination: NavigationDestination;
    readonly signal: AbortSignal;
    readonly formData: FormData | null;
    readonly downloadRequest: string | null;
    readonly info?: unknown;
    readonly sourceElement: Element | null;
    intercept(options?: NavigationInterceptOptions): void;
    scroll(): void;
}
interface NavigateEventInit extends EventInit {
    navigationType?: NavigationType;
    canIntercept?: boolean;
    userInitiated?: boolean;
    hashChange?: boolean;
    hasUAVisualTransition?: boolean;
    destination: NavigationDestination;
    signal: AbortSignal;
    formData?: FormData | null;
    downloadRequest?: string | null;
    info?: unknown;
    sourceElement?: Element | null;
}
type NavigationInterceptHandler = () => PromiseLike<void> | void;
type NavigationPrecommitHandler = (controller: NavigationPrecommitController) => PromiseLike<void> | void;
interface NavigationPrecommitController {
    redirect: (url: string, options?: NavigationNavigateOptions) => void;
    addHandler: (handler: NavigationInterceptHandler) => void;
}
interface NavigationInterceptOptions {
    precommitHandler?: NavigationPrecommitHandler;
    handler?: NavigationInterceptHandler;
    focusReset?: 'after-transition' | 'manual';
    scroll?: 'after-transition' | 'manual';
}
declare class NavigationDestination {
    readonly url: string;
    readonly key: string;
    readonly id: string;
    readonly index: number;
    readonly sameDocument: boolean;
    getState(): unknown;
}

/**
 * Low-level service for running the angular compiler during runtime
 * to create {@link NgModuleFactory} instances, which
 * can later be used to create and render a Component instance.
 *
 * Each `@NgModule` provides an own `Compiler` to its injector,
 * that will use the directives/pipes of the ng module for compilation
 * of components.
 *
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 */
declare class Compiler {
    /**
     * Compiles the given NgModule and all of its components. All templates of the components
     * have to be inlined.
     */
    compileModuleSync<T>(moduleType: Type<T>): NgModuleFactory<T>;
    /**
     * Compiles the given NgModule and all of its components
     */
    compileModuleAsync<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>>;
    /**
     * Clears all caches.
     */
    clearCache(): void;
    /**
     * Clears the cache for the given component/ngModule.
     */
    clearCacheFor(type: Type<any>): void;
    /**
     * Returns the id for a given NgModule, if one is defined and known to the compiler.
     */
    getModuleId(moduleType: Type<any>): string | undefined;
    static ɵfac: ɵɵFactoryDeclaration<Compiler, never>;
    static ɵprov: ɵɵInjectableDeclaration<any>;
}
/**
 * Options for creating a compiler.
 *
 * @publicApi
 */
type CompilerOptions = {
    defaultEncapsulation?: ViewEncapsulation;
    providers?: StaticProvider[];
    preserveWhitespaces?: boolean;
};
/**
 * Token to provide CompilerOptions in the platform injector.
 *
 * @publicApi
 */
declare const COMPILER_OPTIONS: InjectionToken<CompilerOptions[]>;
/**
 * A factory for creating a Compiler
 *
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 */
declare abstract class CompilerFactory {
    abstract createCompiler(options?: CompilerOptions[]): Compiler;
}

/**
 * The Angular platform is the entry point for Angular on a web page.
 * Each page has exactly one platform. Services (such as reflection) which are common
 * to every Angular application running on the page are bound in its scope.
 * A page's platform is initialized implicitly when a platform is created using a platform
 * factory such as `PlatformBrowser`, or explicitly by calling the `createPlatform()` function.
 *
 * @publicApi
 */
declare class PlatformRef {
    private _injector;
    private _modules;
    private _destroyListeners;
    private _destroyed;
    /**
     * Creates an instance of an `@NgModule` for the given platform.
     *
     * @deprecated Passing NgModule factories as the `PlatformRef.bootstrapModuleFactory` function
     *     argument is deprecated. Use the `PlatformRef.bootstrapModule` API instead.
     */
    bootstrapModuleFactory<M>(moduleFactory: NgModuleFactory<M>, options?: BootstrapOptions & {
        applicationProviders?: Array<Provider | EnvironmentProviders>;
    }): Promise<NgModuleRef<M>>;
    /**
     * Creates an instance of an `@NgModule` for a given platform.
     *
     * @usageNotes
     * ### Simple Example
     *
     * ```ts
     * @NgModule({
     *   imports: [BrowserModule]
     * })
     * class MyModule {}
     *
     * let moduleRef = platformBrowser().bootstrapModule(MyModule);
     * ```
     *
     */
    bootstrapModule<M>(moduleType: Type<M>, compilerOptions?: (CompilerOptions & BootstrapOptions & {
        applicationProviders?: Array<Provider | EnvironmentProviders>;
    }) | Array<CompilerOptions & BootstrapOptions & {
        applicationProviders?: Array<Provider | EnvironmentProviders>;
    }>): Promise<NgModuleRef<M>>;
    /**
     * Registers a listener to be called when the platform is destroyed.
     */
    onDestroy(callback: () => void): void;
    /**
     * Retrieves the platform {@link Injector}, which is the parent injector for
     * every Angular application on the page and provides singleton providers.
     */
    get injector(): Injector;
    /**
     * Destroys the current Angular platform and all Angular applications on the page.
     * Destroys all modules and listeners registered with the platform.
     */
    destroy(): void;
    /**
     * Indicates whether this instance was destroyed.
     */
    get destroyed(): boolean;
    static ɵfac: ɵɵFactoryDeclaration<PlatformRef, never>;
    static ɵprov: ɵɵInjectableDeclaration<any>;
}

/**
 * Defer block instance for testing.
 */
interface DeferBlockDetails extends DehydratedDeferBlock {
    tDetails: TDeferBlockDetails;
}
/**
 * Retrieves all defer blocks in a given LView.
 *
 * @param lView lView with defer blocks
 * @param deferBlocks defer block aggregator array
 */
declare function getDeferBlocks(lView: LView, deferBlocks: DeferBlockDetails[]): void;

/**
 * Type of the Directive decorator / constructor function.
 * @publicApi
 */
interface DirectiveDecorator {
    /**
     * Decorator that marks a class as an Angular directive.
     * You can define your own directives to attach custom behavior to elements in the DOM.
     *
     * The options provide configuration metadata that determines
     * how the directive should be processed, instantiated and used at
     * runtime.
     *
     * Directive classes, like component classes, can implement
     * [life-cycle hooks](guide/components/lifecycle) to influence their configuration and behavior.
     *
     *
     * @usageNotes
     * To define a directive, mark the class with the decorator and provide metadata.
     *
     * ```ts
     * import {Directive} from '@angular/core';
     *
     * @Directive({
     *   selector: 'my-directive',
     * })
     * export class MyDirective {
     * ...
     * }
     * ```
     *
     * ### Declaring directives
     *
     * By default, directives are marked as standalone, which makes
     * them available to other components in your application.
     *
     * ```ts
     * @Directive({
     *   selector: 'my-directive',
     * })
     * ```
     *
     * Please make sure that directives marked as standalone are not already declared in an NgModule.
     *
     * ** Declaring a directive in an NgModule **
     * If you want to declare a directive in an ngModule, add the `standalone: false` flag to the
     * Directive decorator metadata and add the directive to the `declarations` and `exports`
     * fields of your ngModule.
     *
     * ```ts
     * @Directive({
     *   standalone: false,
     *   selector: 'my-directive',
     * })
     * class MyDirective {}
     *
     * @NgModule({
     *   declarations: [MyDirective, SomeComponent],
     *   exports: [MyDirective], // making it available outside of this module
     * })
     * class SomeNgModule {}
     * ```
     *
     * When declaring a directive in an NgModule, please make sure that:
     *  - the directive is declared in exactly one NgModule.
     *  - the directive is not standalone.
     *  - you do not re-declare a directive imported from another module.
     *  - the directive is included into the `exports` field as well if you want this directive to be
     *    accessible for components outside of the NgModule.
     *
     *
     * @Annotation
     */
    (obj?: Directive): TypeDecorator;
    /**
     * See the `Directive` decorator.
     */
    new (obj?: Directive): Directive;
}
/**
 * Directive decorator and metadata.
 *
 * @see [Built-in directives](guide/directives)
 * @see [Including inputs and outputs](guide/directives/directive-composition-api#including-inputs-and-outputs)
 * @see [Assigning a reference to an Angular directive](guide/templates/variables#assigning-a-reference-to-an-angular-directive)
 * @see [Referencing component children with queries](guide/components/queries)
 * @see [Binding to the host element](guide/components/host-elements#binding-to-the-host-element)
 * @see [Host directive semantics](guide/directives/directive-composition-api#host-directive-semantics)
 * @Annotation
 * @publicApi
 */
interface Directive {
    /**
     * The CSS selector that identifies this directive in a template
     * and triggers instantiation of the directive.
     *
     * Declare as one of the following:
     *
     * - `element-name`: Select by element name.
     * - `.class`: Select by class name.
     * - `[attribute]`: Select by attribute name.
     * - `[attribute=value]`: Select by attribute name and value.
     * - `:not(sub_selector)`: Select only if the element does not match the `sub_selector`.
     * - `selector1, selector2`: Select if either `selector1` or `selector2` matches.
     *
     * Angular only allows directives to apply on CSS selectors that do not cross
     * element boundaries.
     *
     * For the following template HTML, a directive with an `input[type=text]` selector,
     * would be instantiated only on the `<input type="text">` element.
     *
     * ```html
     * <form>
     *   <input type="text">
     *   <input type="radio">
     * <form>
     * ```
     *
     */
    selector?: string;
    /**
     * Enumerates the set of data-bound input properties for a directive
     *
     * Angular automatically updates input properties during change detection.
     * The `inputs` property accepts either strings or object literals that configure the directive
     * properties that should be exposed as inputs.
     *
     * When an object literal is passed in, the `name` property indicates which property on the
     * class the input should write to, while the `alias` determines the name under
     * which the input will be available in template bindings. The `required` property indicates that
     * the input is required which will trigger a compile-time error if it isn't passed in when the
     * directive is used.
     *
     * When a string is passed into the `inputs` array, it can have a format of `'name'` or
     * `'name: alias'` where `name` is the property on the class that the directive should write
     * to, while the `alias` determines the name under which the input will be available in
     * template bindings. String-based input definitions are assumed to be optional.
     *
     * @usageNotes
     *
     * The following example creates a component with two data-bound properties.
     *
     * ```ts
     * @Component({
     *   selector: 'bank-account',
     *   inputs: ['bankName', {name: 'id', alias: 'account-id'}],
     *   template: `
     *     Bank Name: {{bankName}}
     *     Account Id: {{id}}
     *   `
     * })
     * class BankAccount {
     *   bankName: string;
     *   id: string;
     * }
     * ```
     *
     */
    inputs?: ({
        name: string;
        alias?: string;
        required?: boolean;
        transform?: (value: any) => any;
    } | string)[];
    /**
     * Enumerates the set of event-bound output properties.
     *
     * When an output property emits an event, an event handler attached to that event
     * in the template is invoked.
     *
     * The `outputs` property defines a set of `directiveProperty` to `alias`
     * configuration:
     *
     * - `directiveProperty` specifies the component property that emits events.
     * - `alias` specifies the DOM property the event handler is attached to.
     *
     * @usageNotes
     *
     * ```ts
     * @Component({
     *   selector: 'child-dir',
     *   outputs: [ 'bankNameChange' ],
     *   template: `<input (input)="bankNameChange.emit($event.target.value)" />`
     * })
     * class ChildDir {
     *  bankNameChange: EventEmitter<string> = new EventEmitter<string>();
     * }
     *
     * @Component({
     *   selector: 'main',
     *   template: `
     *     {{ bankName }} <child-dir (bankNameChange)="onBankNameChange($event)"></child-dir>
     *   `
     * })
     * class MainComponent {
     *  bankName: string;
     *
     *   onBankNameChange(bankName: string) {
     *     this.bankName = bankName;
     *   }
     * }
     * ```
     *
     */
    outputs?: string[];
    /**
     * Configures the injector of this
     * directive or component with a token
     * that maps to a provider of a dependency.
     */
    providers?: Provider[];
    /**
     * Defines the name that can be used in the template to assign this directive to a variable.
     *
     * @usageNotes
     *
     * ```ts
     * @Directive({
     *   selector: 'child-dir',
     *   exportAs: 'child'
     * })
     * class ChildDir {
     * }
     *
     * @Component({
     *   selector: 'main',
     *   template: `<child-dir #c="child"></child-dir>`
     * })
     * class MainComponent {
     * }
     * ```
     *
     */
    exportAs?: string;
    /**
     * Configures the queries that will be injected into the directive.
     *
     * Content queries are set before the `ngAfterContentInit` callback is called.
     * View queries are set before the `ngAfterViewInit` callback is called.
     *
     * @usageNotes
     *
     * The following example shows how queries are defined
     * and when their results are available in lifecycle hooks:
     *
     * ```ts
     * @Component({
     *   selector: 'someDir',
     *   queries: {
     *     contentChildren: new ContentChildren(ChildDirective),
     *     viewChildren: new ViewChildren(ChildDirective)
     *   },
     *   template: '<child-directive></child-directive>'
     * })
     * class SomeDir {
     *   contentChildren: QueryList<ChildDirective>,
     *   viewChildren: QueryList<ChildDirective>
     *
     *   ngAfterContentInit() {
     *     // contentChildren is set
     *   }
     *
     *   ngAfterViewInit() {
     *     // viewChildren is set
     *   }
     * }
     * ```
     *
     * @Annotation
     */
    queries?: {
        [key: string]: any;
    };
    /**
     * Maps class properties to host element bindings for properties,
     * attributes, and events, using a set of key-value pairs.
     *
     * Angular automatically checks host property bindings during change detection.
     * If a binding changes, Angular updates the directive's host element.
     *
     * When the key is a property of the host element, the property value is
     * propagated to the specified DOM property.
     *
     * When the key is a static attribute in the DOM, the attribute value
     * is propagated to the specified property in the host element.
     *
     * For event handling:
     * - The key is the DOM event that the directive listens to.
     *  The global target names that can be used to prefix an event name are
     * `document:`, `window:` and `body:`.
     *
     * - The value is the statement to execute when the event occurs. If the
     * statement evaluates to `false`, then `preventDefault` is applied on the DOM
     * event. A handler method can refer to the `$event` local variable.
     *
     */
    host?: {
        [key: string]: string;
    };
    /**
     * When present, this directive/component is ignored by the AOT compiler.
     * It remains in distributed code, and the JIT compiler attempts to compile it
     * at run time, in the browser.
     * To ensure the correct behavior, the app must import `@angular/compiler`.
     */
    jit?: true;
    /**
     * Set `standalone` to `false` if you want to import the directive into an NgModule.
     */
    standalone?: boolean;
    /**
     * Standalone directives that should be applied to the host whenever the directive is matched.
     * By default, none of the inputs or outputs of the host directives will be available on the host,
     * unless they are specified in the `inputs` or `outputs` properties.
     *
     * You can additionally alias inputs and outputs by putting a colon and the alias after the
     * original input or output name. For example, if a directive applied via `hostDirectives`
     * defines an input named `menuDisabled`, you can alias this to `disabled` by adding
     * `'menuDisabled: disabled'` as an entry to `inputs`.
     */
    hostDirectives?: (Type<unknown> | {
        directive: Type<unknown>;
        inputs?: string[];
        outputs?: string[];
    })[];
}
/**
 * Type of the Directive metadata.
 *
 * @publicApi
 */
declare const Directive: DirectiveDecorator;
/**
 * Component decorator interface
 *
 * @publicApi
 */
interface ComponentDecorator {
    /**
     * Decorator that marks a class as an Angular component and provides configuration
     * metadata that determines how the component should be processed,
     * instantiated, and used at runtime.
     *
     * Components are the most basic UI building block of an Angular app.
     * An Angular app contains a tree of Angular components.
     *
     * Angular components are a subset of directives, always associated with a template.
     * Unlike other directives, only one component can be instantiated for a given element in a
     * template.
     *
     * Standalone components can be directly imported in any other standalone component or NgModule.
     * NgModule based apps on the other hand require components to belong to an NgModule in
     * order for them to be available to another component or application. To make a component a
     * member of an NgModule, list it in the `declarations` field of the `NgModule` metadata.
     *
     * Note that, in addition to these options for configuring a directive,
     * you can control a component's runtime behavior by implementing
     * life-cycle hooks. For more information, see the
     * [Lifecycle Hooks](guide/components/lifecycle) guide.
     *
     * HELPFUL: You may not use this interface to describe a class that is a component. Decorators do not affect the typing of the decorated classes.
     * Use `Type<unknown>` instead of `Type<Component>`.
     *
     * @usageNotes
     *
     * ### Setting component inputs
     *
     * The following example creates a component with two data-bound properties,
     * specified by the `inputs` value.
     *
     * {@example core/ts/metadata/directives.ts region='component-input'}
     *
     *
     * ### Setting component outputs
     *
     * The following example shows two output function that emit on an interval. One
     * emits an output every second, while the other emits every five seconds.
     *
     * {@example core/ts/metadata/directives.ts region='component-output-interval'}
     *
     * ### Injecting a class with a view provider
     *
     * The following simple example injects a class into a component
     * using the view provider specified in component metadata:
     *
     * ```ts
     * class Greeter {
     *    greet(name:string) {
     *      return 'Hello ' + name + '!';
     *    }
     * }
     *
     * @Directive({
     *   selector: 'needs-greeter'
     * })
     * class NeedsGreeter {
     *   greeter:Greeter;
     *
     *   constructor(greeter:Greeter) {
     *     this.greeter = greeter;
     *   }
     * }
     *
     * @Component({
     *   selector: 'greet',
     *   viewProviders: [
     *     Greeter
     *   ],
     *   template: `<needs-greeter></needs-greeter>`
     * })
     * class HelloWorld {
     * }
     *
     * ```
     *
     * ### Preserving whitespace
     *
     * Removing whitespace can greatly reduce AOT-generated code size and speed up view creation.
     * As of Angular 6, the default for `preserveWhitespaces` is false (whitespace is removed).
     * To change the default setting for all components in your application, set
     * the `preserveWhitespaces` option of the AOT compiler.
     *
     * By default, the AOT compiler removes whitespace characters as follows:
     * * Trims all whitespaces at the beginning and the end of a template.
     * * Removes whitespace-only text nodes. For example,
     *
     * ```html
     * <button>Action 1</button>  <button>Action 2</button>
     * ```
     *
     * becomes:
     *
     * ```html
     * <button>Action 1</button><button>Action 2</button>
     * ```
     *
     * * Replaces a series of whitespace characters in text nodes with a single space.
     * For example, `<span>\n some text\n</span>` becomes `<span> some text </span>`.
     * * Does NOT alter text nodes inside HTML tags such as `<pre>` or `<textarea>`,
     * where whitespace characters are significant.
     *
     * Note that these transformations can influence DOM nodes layout, although impact
     * should be minimal.
     *
     * You can override the default behavior to preserve whitespace characters
     * in certain fragments of a template. For example, you can exclude an entire
     * DOM sub-tree by using the `ngPreserveWhitespaces` attribute:
     *
     * ```html
     * <div ngPreserveWhitespaces>
     *     whitespaces are preserved here
     *     <span>    and here </span>
     * </div>
     * ```
     *
     * You can force a single space to be preserved in a text node by using `&ngsp;`,
     * which is replaced with a space character by Angular's template
     * compiler:
     *
     * ```html
     * <a>Spaces</a>&ngsp;<a>between</a>&ngsp;<a>links.</a>
     * <!-- compiled to be equivalent to:
     *  <a>Spaces</a> <a>between</a> <a>links.</a>  -->
     * ```
     *
     * Note that sequences of `&ngsp;` are still collapsed to just one space character when
     * the `preserveWhitespaces` option is set to `false`.
     *
     * ```html
     * <a>before</a>&ngsp;&ngsp;&ngsp;<a>after</a>
     * <!-- compiled to be equivalent to:
     *  <a>before</a> <a>after</a> -->
     * ```
     *
     * To preserve sequences of whitespace characters, use the
     * `ngPreserveWhitespaces` attribute.
     *
     * @Annotation
     */
    (obj: Component): TypeDecorator;
    /**
     * See the `Component` decorator.
     */
    new (obj: Component): Component;
}
/**
 * Supplies configuration metadata for an Angular component.
 *
 * @see [Anatomy of a component](guide/components)
 * @see [ChangeDetectionStrategy](guide/components/advanced-configuration#changedetectionstrategy)
 * @see [Using the viewProviders array](guide/di/hierarchical-dependency-injection#using-the-viewproviders-array)
 * @see [Style scoping](guide/components/styling#style-scoping)
 *
 * @publicApi
 */
interface Component extends Directive {
    /**
     * The change-detection strategy to use for this component.
     *
     * When a component is instantiated, Angular creates a change detector,
     * which is responsible for propagating the component's bindings.
     * The strategy is one of:
     * - `ChangeDetectionStrategy#OnPush` sets the strategy to `CheckOnce` (on demand).
     * - `ChangeDetectionStrategy#Eager` sets the strategy to `CheckAlways`.
     *
     * NOTE: OnPush is enabled by default.
     */
    changeDetection?: ChangeDetectionStrategy;
    /**
     * Defines the set of injectable objects that are visible to its view DOM children.
     * See [example](#injecting-a-class-with-a-view-provider).
     *
     */
    viewProviders?: Provider[];
    /**
     * The relative path or absolute URL of a template file for an Angular component.
     * If provided, do not supply an inline template using `template`.
     *
     */
    templateUrl?: string;
    /**
     * An inline template for an Angular component. If provided,
     * do not supply a template file using `templateUrl`.
     *
     */
    template?: string;
    /**
     * One relative path or an absolute URL for file containing a CSS stylesheet to use
     * in this component.
     */
    styleUrl?: string;
    /**
     * Relative paths or absolute URLs for files containing CSS stylesheets to use in this component.
     */
    styleUrls?: string[];
    /**
     * One or more inline CSS stylesheets to use
     * in this component.
     */
    styles?: string | string[];
    /**
     * One or more animation `trigger()` calls, containing
     * [`state()`](api/animations/state) and `transition()` definitions.
     * See the [Animations guide](guide/animations) and animations API documentation.
     *
     * @deprecated 20.2 Use `animate.enter` or `animate.leave` instead. Intent to remove in v23
     */
    animations?: any[];
    /**
     * An encapsulation policy for the component's styling.
     * Possible values:
     * - `ViewEncapsulation.Emulated`: Apply modified component styles in order to emulate
     *                                 a native Shadow DOM CSS encapsulation behavior.
     * - `ViewEncapsulation.None`: Apply component styles globally without any sort of encapsulation.
     * - `ViewEncapsulation.ShadowDom`: Use the browser's native Shadow DOM API to encapsulate styles.
     *
     * If not supplied, the value is taken from the `CompilerOptions`
     * which defaults to `ViewEncapsulation.Emulated`.
     *
     * If the policy is `ViewEncapsulation.Emulated` and the component has no
     * {@link Component#styles styles} nor {@link Component#styleUrls styleUrls},
     * the policy is automatically switched to `ViewEncapsulation.None`.
     */
    encapsulation?: ViewEncapsulation;
    /**
     * True to preserve or false to remove potentially superfluous whitespace characters
     * from the compiled template. Whitespace characters are those matching the `\s`
     * character class in JavaScript regular expressions. Default is false, unless
     * overridden in compiler options.
     */
    preserveWhitespaces?: boolean;
    /**
     * Set `standalone` to `false` if you want to import the directive into an NgModule.
     */
    standalone?: boolean;
    /**
     * The imports property specifies the standalone component's template dependencies — those
     * directives, components, and pipes that can be used within its template. Standalone components
     * can import other standalone components, directives, and pipes as well as existing NgModules.
     *
     * This property is only available for standalone components - specifying it for components
     * declared in an NgModule generates a compilation error.
     */
    imports?: (Type<any> | ReadonlyArray<any>)[];
    /**
     * The set of schemas that declare elements to be allowed in a standalone component. Elements and
     * properties that are neither Angular components nor directives must be declared in a schema.
     *
     * This property is only available for standalone components - specifying it for components
     * declared in an NgModule generates a compilation error.
     */
    schemas?: SchemaMetadata[];
}
/**
 * Component decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
declare const Component: ComponentDecorator;
/**
 * Type of the Pipe decorator / constructor function.
 *
 * @publicApi
 */
interface PipeDecorator {
    /**
     *
     * Decorator that marks a class as pipe and supplies configuration metadata.
     *
     * A pipe class must implement the `PipeTransform` interface.
     * For example, if the name is "myPipe", use a template binding expression
     * such as the following:
     *
     * ```html
     * {{ exp | myPipe }}
     * ```
     *
     * The result of the expression is passed to the pipe's `transform()` method.
     *
     * A pipe must belong to an NgModule in order for it to be available
     * to a template. To make it a member of an NgModule,
     * list it in the `declarations` field of the `NgModule` metadata.
     *
     * @see [Pipes](/guide/templates/pipes)
     *
     */
    (obj: Pipe): TypeDecorator;
    /**
     * See the `Pipe` decorator.
     */
    new (obj: Pipe): Pipe;
}
/**
 * Type of the Pipe metadata.
 *
 * @publicApi
 */
interface Pipe {
    /**
     * The pipe name to use in template bindings.
     * Typically uses lowerCamelCase
     * because the name cannot contain hyphens.
     */
    name: string;
    /**
     * When true, the pipe is pure, meaning that the
     * `transform()` method is invoked only when its input arguments
     * change. Pipes are pure by default.
     *
     * If the pipe has internal state (that is, the result
     * depends on state other than its arguments), set `pure` to false.
     * In this case, the pipe is invoked on each change-detection cycle,
     * even if the arguments have not changed.
     */
    pure?: boolean;
    /**
     * Angular pipes marked as `standalone` do not need to be declared in an NgModule. Such
     * pipes don't depend on any "intermediate context" of an NgModule (ex. configured providers).
     */
    standalone?: boolean;
}
/**
 * @Annotation
 * @publicApi
 */
declare const Pipe: PipeDecorator;
/**
 * @publicApi
 */
interface InputDecorator {
    /**
     * Decorator that marks a class field as an input property and supplies configuration metadata.
     * The input property is bound to a DOM property in the template. During change detection,
     * Angular automatically updates the data property with the DOM property's value.
     *
     * @usageNotes
     *
     * You can supply an optional name to use in templates when the
     * component is instantiated, that maps to the
     * name of the bound property. By default, the original
     * name of the bound property is used for input binding.
     *
     * The following example creates a component with two input properties,
     * one of which is given a special binding name.
     *
     * ```ts
     * import { Component, Input, numberAttribute, booleanAttribute } from '@angular/core';
     * @Component({
     *   selector: 'bank-account',
     *   template: `
     *     Bank Name: {{bankName}}
     *     Account Id: {{id}}
     *     Account Status: {{status ? 'Active' : 'InActive'}}
     *   `
     * })
     * class BankAccount {
     *   // This property is bound using its original name.
     *   // Defining argument required as true inside the Input Decorator
     *   // makes this property declaration as mandatory
     *   @Input({ required: true }) bankName!: string;
     *   // Argument alias makes this property value is bound to a different property name
     *   // when this component is instantiated in a template.
     *   // Argument transform convert the input value from string to number
     *   @Input({ alias:'account-id', transform: numberAttribute }) id: number;
     *   // Argument transform the input value from string to boolean
     *   @Input({ transform: booleanAttribute }) status: boolean;
     *   // this property is not bound, and is not automatically updated by Angular
     *   normalizedBankName: string;
     * }
     *
     * @Component({
     *   selector: 'app',
     *   template: `
     *     <bank-account bankName="RBC" account-id="4747" status="true"></bank-account>
     *   `
     * })
     * class App {}
     * ```
     *
     * @see [Input properties](guide/components/inputs)
     * @see [Output properties](guide/components/outputs)
     */
    (arg?: string | Input): any;
    new (arg?: string | Input): any;
}
/**
 * Type of metadata for an `Input` property.
 *
 * @publicApi
 */
interface Input {
    /**
     * The name of the DOM property to which the input property is bound.
     */
    alias?: string;
    /**
     * Whether the input is required for the directive to function.
     */
    required?: boolean;
    /**
     * Function with which to transform the input value before assigning it to the directive instance.
     */
    transform?: (value: any) => any;
}
/**
 * @Annotation
 * @publicApi
 */
declare const Input: InputDecorator;
/**
 * Type of the Output decorator / constructor function.
 *
 * @publicApi
 */
interface OutputDecorator {
    /**
     * Decorator that marks a class field as an output property and supplies configuration metadata.
     * The DOM property bound to the output property is automatically updated during change detection.
     *
     * @usageNotes
     *
     * You can supply an optional name to use in templates when the
     * component is instantiated, that maps to the
     * name of the bound property. By default, the original
     * name of the bound property is used for output binding.
     *
     * See `Input` decorator for an example of providing a binding name.
     *
     * @see [Input properties](guide/components/inputs)
     * @see [Output properties](guide/components/outputs)
     *
     */
    (alias?: string): any;
    new (alias?: string): any;
}
/**
 * Type of the Output metadata.
 *
 * @publicApi
 */
interface Output {
    /**
     * The name of the DOM property to which the output property is bound.
     */
    alias?: string;
}
/**
 * @Annotation
 * @publicApi
 */
declare const Output: OutputDecorator;
/**
 * Type of the HostBinding decorator / constructor function.
 *
 * @publicApi
 */
interface HostBindingDecorator {
    /**
     * Decorator that marks a DOM property or an element class, style or attribute as a host-binding
     * property and supplies configuration metadata. Angular automatically checks host bindings during
     * change detection, and if a binding changes it updates the host element of the directive.
     *
     * @usageNotes
     *
     * NOTE:  **Always** prefer using the [`host` property](guide/components/host-elements#binding-to-the-host-element) over `@HostBinding`.
     * This decorator exist exclusively for backwards compatibility.
     *
     * The following example creates a directive that sets the `valid` and `invalid`
     * class, a style color, and an id on the DOM element that has an `ngModel` directive on it.
     *
     * ```ts
     * @Directive({selector: '[ngModel]'})
     * class NgModelStatus {
     *   constructor(public control: NgModel) {}
     *   // class bindings
     *   @HostBinding('class.valid') get valid() { return this.control.valid; }
     *   @HostBinding('class.invalid') get invalid() { return this.control.invalid; }
     *
     *   // style binding
     *   @HostBinding('style.color') get color() { return this.control.valid ? 'green': 'red'; }
     *
     *   // style binding also supports a style unit extension
     *   @HostBinding('style.width.px') @Input() width: number = 500;
     *
     *   // attribute binding
     *   @HostBinding('attr.aria-required')
     *   @Input() required: boolean = false;
     *
     *   // property binding
     *   @HostBinding('id') get id() { return this.control.value?.length ? 'odd':  'even'; }
     *
     * @Component({
     *   selector: 'app',
     *   template: `<input [(ngModel)]="prop">`,
     * })
     * class App {
     *   prop;
     * }
     * ```
     *
     */
    (hostPropertyName?: string): any;
    new (hostPropertyName?: string): any;
}
/**
 * Type of the HostBinding metadata.
 *
 * @publicApi
 */
interface HostBinding {
    /**
     * The DOM property that is bound to a data property.
     * This field also accepts:
     *   * classes, prefixed by `class.`
     *   * styles, prefixed by `style.`
     *   * attributes, prefixed by `attr.`
     */
    hostPropertyName?: string;
}
/**
 * @Annotation
 * @publicApi
 */
declare const HostBinding: HostBindingDecorator;
/**
 * Type of the HostListener decorator / constructor function.
 *
 * @publicApi
 */
interface HostListenerDecorator {
    /**
     * Decorator that declares a DOM event to listen for,
     * and provides a handler method to run when that event occurs.
     *
     * Angular invokes the supplied handler method when the host element emits the specified event,
     * and updates the bound element with the result.
     *
     * If the handler method returns false, applies `preventDefault` on the bound element.
     *
     * @usageNotes
     *
     * NOTE:  **Always** prefer using the [`host` property](guide/components/host-elements#binding-to-the-host-element) over `@HostListener`.
     * This decorator exist exclusively for backwards compatibility.
     *
     * The following example declares a directive
     * that attaches a click listener to a button and counts clicks.
     *
     * ```ts
     * @Directive({selector: 'button[counting]'})
     * class CountClicks {
     *   numberOfClicks = 0;
     *
     *   @HostListener('click', ['$event.target'])
     *   onClick(btn) {
     *     console.log('button', btn, 'number of clicks:', this.numberOfClicks++);
     *   }
     * }
     *
     * @Component({
     *   selector: 'app',
     *   template: '<button counting>Increment</button>',
     * })
     * class App {}
     * ```
     *
     * The following example registers another DOM event handler that listens for `Enter` key-press
     * events on the global `window`.
     * ```angular-ts
     * import { HostListener, Component } from "@angular/core";
     *
     * @Component({
     *   selector: 'app',
     *   template: `
     *    <h1>Hello, you have pressed enter {{counter}} number of times!</h1>
     *      Press enter  key to increment the counter.
     *    <button (click)="resetCounter()">Reset Counter</button>`
     * })
     * class AppComponent {
     *   counter = 0;
     *   @HostListener('window:keydown.enter', ['$event'])
     *   handleKeyDown(event: KeyboardEvent) {
     *     this.counter++;
     *   }
     *   resetCounter() {
     *     this.counter = 0;
     *   }
     * }
     * ```
     * The list of valid key names for `keydown` and `keyup` events
     * can be found here:
     * https://www.w3.org/TR/DOM-Level-3-Events-key/#named-key-attribute-values
     *
     * NOTE: that keys can also be combined, e.g. `@HostListener('keydown.shift.a')`.
     *
     * Key names are matched against `KeyboardEvent.key`, which depends on the user's keyboard
     * layout and input language. To match a physical key regardless of layout, use the `code`
     * modifier instead, e.g. `@HostListener('keydown.code.KeyA')`. See
     * [Using key modifiers](guide/templates/event-listeners#using-key-modifiers) for details.
     *
     * The global target names that can be used to prefix an event name are
     * `document:`, `window:` and `body:`.
     *
     */
    (eventName: string, args?: string[]): any;
    new (eventName: string, args?: string[]): any;
}
/**
 * Type of the HostListener metadata.
 *
 * @publicApi
 */
interface HostListener {
    /**
     * The DOM event to listen for.
     */
    eventName?: string;
    /**
     * A set of arguments to pass to the handler method when the event occurs.
     */
    args?: string[];
}
/**
 * @Annotation
 * @publicApi
 */
declare const HostListener: HostListenerDecorator;

/**
 * Type of the NgModule decorator / constructor function.
 *
 * @publicApi
 */
interface NgModuleDecorator {
    /**
     * Decorator that marks a class as an NgModule and supplies configuration metadata.
     */
    (obj?: NgModule): TypeDecorator;
    new (obj?: NgModule): NgModule;
}
/**
 * Type of the NgModule metadata.
 *
 * @publicApi
 */
interface NgModule {
    /**
     * The set of injectable objects that are available in the injector
     * of this module.
     *
     * @see [Dependency Injection guide](guide/di)
     * @see [NgModule guide](guide/ngmodules/overview)
     *
     * @usageNotes
     *
     * Dependencies whose providers are listed here become available for injection
     * into any component, directive, pipe or service that is a child of this injector.
     * The NgModule used for bootstrapping uses the root injector, and can provide dependencies
     * to any part of the app.
     *
     * A lazy-loaded module has its own injector, typically a child of the app root injector.
     * Lazy-loaded services are scoped to the lazy-loaded module's injector.
     * If a lazy-loaded module also provides the `UserService`, any component created
     * within that module's context (such as by router navigation) gets the local instance
     * of the service, not the instance in the root injector.
     * Components in external modules continue to receive the instance provided by their injectors.
     *
     * ### Example
     *
     * The following example defines a class that is injected in
     * the HelloWorld NgModule:
     *
     * ```ts
     * class Greeter {
     *    greet(name:string) {
     *      return 'Hello ' + name + '!';
     *    }
     * }
     *
     * @NgModule({
     *   providers: [
     *     Greeter
     *   ]
     * })
     * class HelloWorld {
     *   greeter:Greeter;
     *
     *   constructor(greeter:Greeter) {
     *     this.greeter = greeter;
     *   }
     * }
     * ```
     */
    providers?: Array<Provider | EnvironmentProviders>;
    /**
     * The set of components, directives, and pipes (declarables
     * that belong to this module.
     *
     * @usageNotes
     *
     * The set of selectors that are available to a template include those declared here, and
     * those that are exported from imported NgModules.
     *
     * Declarables must belong to exactly one module.
     * The compiler emits an error if you try to declare the same class in more than one module.
     * Be careful not to declare a class that is imported from another module.
     *
     * ### Example
     *
     * The following example allows the CommonModule to use the `NgFor`
     * directive.
     *
     * ```javascript
     * @NgModule({
     *   declarations: [NgFor]
     * })
     * class CommonModule {
     * }
     * ```
     */
    declarations?: Array<Type<any> | any[]>;
    /**
     * The set of NgModules whose exported declarables
     * are available to templates in this module.
     *
     * @usageNotes
     *
     * A template can use exported declarables from any
     * imported module, including those from modules that are imported indirectly
     * and re-exported.
     * For example, `ModuleA` imports `ModuleB`, and also exports
     * it, which makes the declarables from `ModuleB` available
     * wherever `ModuleA` is imported.
     *
     * ### Example
     *
     * The following example allows MainModule to use anything exported by
     * `CommonModule`:
     *
     * ```javascript
     * @NgModule({
     *   imports: [CommonModule]
     * })
     * class MainModule {
     * }
     * ```
     *
     */
    imports?: Array<Type<any> | ModuleWithProviders<{}> | any[]>;
    /**
     * The set of components, directives, and pipes declared in this
     * NgModule that can be used in the template of any component that is part of an
     * NgModule that imports this NgModule. Exported declarations are the module's public API.
     *
     * A declarable belongs to one and only one NgModule.
     * A module can list another module among its exports, in which case all of that module's
     * public declaration are exported.
     *
     * @usageNotes
     *
     * Declarations are private by default.
     * If this ModuleA does not export UserComponent, then only the components within this
     * ModuleA can use UserComponent.
     *
     * ModuleA can import ModuleB and also export it, making exports from ModuleB
     * available to an NgModule that imports ModuleA.
     *
     * ### Example
     *
     * The following example exports the `NgFor` directive from CommonModule.
     *
     * ```javascript
     * @NgModule({
     *   exports: [NgFor]
     * })
     * class CommonModule {
     * }
     * ```
     */
    exports?: Array<Type<any> | any[]>;
    /**
     * The set of components that are bootstrapped when this module is bootstrapped.
     */
    bootstrap?: Array<Type<any> | any[]>;
    /**
     * The set of schemas that declare elements to be allowed in the NgModule.
     * Elements and properties that are neither Angular components nor directives
     * must be declared in a schema.
     *
     * Allowed value are `NO_ERRORS_SCHEMA` and `CUSTOM_ELEMENTS_SCHEMA`.
     *
     * @security When using one of `NO_ERRORS_SCHEMA` or `CUSTOM_ELEMENTS_SCHEMA`
     * you must ensure that allowed elements and properties securely escape inputs.
     */
    schemas?: Array<SchemaMetadata | any[]>;
    /**
     * A name or path that uniquely identifies this NgModule in `getNgModuleById`.
     * If left `undefined`, the NgModule is not registered with `getNgModuleById`.
     */
    id?: string;
    /**
     * When present, this module is ignored by the AOT compiler.
     * It remains in distributed code, and the JIT compiler attempts to compile it
     * at run time, in the browser.
     * To ensure the correct behavior, the app must import `@angular/compiler`.
     */
    jit?: true;
}
/**
 * @Annotation
 */
declare const NgModule: NgModuleDecorator;

/**
 * @publicApi
 */
declare class DebugEventListener {
    name: string;
    callback: Function;
    constructor(name: string, callback: Function);
}
/**
 * @publicApi
 */
declare function asNativeElements(debugEls: DebugElement[]): any;
/**
 * @publicApi
 */
declare class DebugNode {
    /**
     * The underlying DOM node.
     */
    readonly nativeNode: any;
    constructor(nativeNode: Node);
    /**
     * The `DebugElement` parent. Will be `null` if this is the root element.
     */
    get parent(): DebugElement | null;
    /**
     * The host dependency injector. For example, the root element's component instance injector.
     */
    get injector(): Injector;
    /**
     * The element's own component instance, if it has one.
     */
    get componentInstance(): any;
    /**
     * An object that provides parent context for this element. Often an ancestor component instance
     * that governs this element.
     *
     * When an element is repeated within *ngFor, the context is an `NgForOf` whose `$implicit`
     * property is the value of the row instance value. For example, the `hero` in `*ngFor="let hero
     * of heroes"`.
     */
    get context(): any;
    /**
     * The callbacks attached to the component's @Output properties and/or the element's event
     * properties.
     */
    get listeners(): DebugEventListener[];
    /**
     * Dictionary of objects associated with template local variables (e.g. #foo), keyed by the local
     * variable name.
     */
    get references(): {
        [key: string]: any;
    };
    /**
     * This component's injector lookup tokens. Includes the component itself plus the tokens that the
     * component lists in its providers metadata.
     */
    get providerTokens(): any[];
}
/**
 * @publicApi
 *
 * @see [Component testing scenarios](guide/testing/components-scenarios)
 * @see [Basics of testing components](guide/testing/components-basics)
 * @see [Testing utility APIs](guide/testing/utility-apis)
 */
declare class DebugElement extends DebugNode {
    constructor(nativeNode: Element);
    /**
     * The underlying DOM element at the root of the component.
     */
    get nativeElement(): any;
    /**
     * The element tag name, if it is an element.
     */
    get name(): string;
    /**
     *  Gets a map of property names to property values for an element.
     *
     *  This map includes:
     *  - Regular property bindings (e.g. `[id]="id"`)
     *  - Host property bindings (e.g. `host: { '[id]': "id" }`)
     *  - Interpolated property bindings (e.g. `id="{{ value }}")
     *
     *  It does not include:
     *  - input property bindings (e.g. `[myCustomInput]="value"`)
     *  - attribute bindings (e.g. `[attr.role]="menu"`)
     */
    get properties(): {
        [key: string]: any;
    };
    /**
     *  A map of attribute names to attribute values for an element.
     */
    get attributes(): {
        [key: string]: string | null;
    };
    /**
     * The inline styles of the DOM element.
     */
    get styles(): {
        [key: string]: string | null;
    };
    /**
     * A map containing the class names on the element as keys.
     *
     * This map is derived from the `className` property of the DOM element.
     *
     * Note: The values of this object will always be `true`. The class key will not appear in the KV
     * object if it does not exist on the element.
     *
     * @see [Element.className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className)
     */
    get classes(): {
        [key: string]: boolean;
    };
    /**
     * The `childNodes` of the DOM element as a `DebugNode` array.
     *
     * @see [Node.childNodes](https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes)
     */
    get childNodes(): DebugNode[];
    /**
     * The immediate `DebugElement` children. Walk the tree by descending through `children`.
     */
    get children(): DebugElement[];
    /**
     * @returns the first `DebugElement` that matches the predicate at any depth in the subtree.
     */
    query(predicate: Predicate<DebugElement>): DebugElement;
    /**
     * @returns All `DebugElement` matches for the predicate at any depth in the subtree.
     */
    queryAll(predicate: Predicate<DebugElement>): DebugElement[];
    /**
     * @returns All `DebugNode` matches for the predicate at any depth in the subtree.
     */
    queryAllNodes(predicate: Predicate<DebugNode>): DebugNode[];
    /**
     * Triggers the event by its name if there is a corresponding listener in the element's
     * `listeners` collection.
     *
     * If the event lacks a listener or there's some other problem, consider
     * calling `nativeElement.dispatchEvent(eventObject)`.
     *
     * @param eventName The name of the event to trigger
     * @param eventObj The _event object_ expected by the handler
     *
     * @see [Testing components scenarios](guide/testing/components-scenarios#triggereventhandler)
     */
    triggerEventHandler(eventName: string, eventObj?: any): void;
}
/**
 * @publicApi
 */
declare function getDebugNode(nativeNode: any): DebugNode | null;
/**
 * A boolean-valued function over a value, possibly including context information
 * regarding that value's position in an array.
 *
 * @publicApi
 */
type Predicate<T> = (value: T) => boolean;

export { ANIMATIONS_DISABLED, APP_BOOTSTRAP_LISTENER, AfterRenderManager, AnimationRendererType, ApplicationRef, AttributeMarker, COMPILER_OPTIONS, CONTAINER_HEADER_OFFSET, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionScheduler, ChangeDetectionStrategy, ChangeDetectorRef, Compiler, CompilerFactory, Component, ComponentRef, DebugElement, DebugEventListener, DebugNode, DeferBlockBehavior, DeferBlockState, Directive, EffectScheduler, ElementRef, EmbeddedViewRef, EnvironmentInjector, ErrorHandler, EventEmitter, HostBinding, HostListener, INJECTOR_SCOPE, INTERNAL_APPLICATION_ERROR_HANDLER, Input, MAX_ANIMATION_TIMEOUT, NG_INJ_DEF, NG_PROV_DEF, NO_ERRORS_SCHEMA, NavigateEvent, Navigation, NavigationCurrentEntryChangeEvent, NavigationDestination, NavigationHistoryEntry, NavigationTransition, NgModule, NgModuleFactory, NgModuleRef, NgZone, NoopNgZone, NotificationSource, Output, PROVIDED_ZONELESS, Pipe, PlatformRef, QueryList, R3Injector, RenderFlags, Renderer2, RendererFactory2, RendererStyleFlags2, Sanitizer, SecurityContext, TDeferDetailsFlags, TracingAction, TracingService, ViewEncapsulation, ViewRef, ZONELESS_ENABLED, asNativeElements, effect, getDebugNode, getDeferBlocks, getInjectableDef, injectChangeDetectorRef, inputBinding, isInjectable, outputBinding, provideBrowserGlobalErrorListeners, twoWayBinding, ɵɵdefineInjectable, ɵɵdefineInjector };
export type { AfterRenderRef, AnimationCallbackEvent, AnimationClassBindingFn, AnimationFunction, Binding, BootstrapOptions, ClassDebugInfo, CompilerOptions, ComponentDecorator, ComponentDef, ComponentDefFeature, ComponentTemplate, ComponentType, ContentQueriesFunction, ControlDirectiveHost, CreateEffectOptions, CssSelectorList, DeferBlockConfig, DeferBlockDependencyInterceptor, DeferBlockDetails, DehydratedDeferBlock, DependencyResolverFn, DependencyTypeList, DirectiveDecorator, DirectiveDef, DirectiveDefFeature, DirectiveType, DirectiveWithBindings, EffectCleanupFn, EffectCleanupRegisterFn, EffectRef, ErrorDetails, GlobalTargetResolver, HostBindingDecorator, HostBindingsFunction, HostDirectiveConfig, HostListenerDecorator, InjectableType, InjectorType, InputDecorator, InputSignalNode, InputTransformFunction, InternalNgModuleRef, LContainer, LView, ListenerOptions, LocalRefExtractor, NavigationInterceptOptions, NavigationNavigateOptions, NavigationOptions, NavigationReloadOptions, NavigationResult, NavigationType, NavigationUpdateCurrentEntryOptions, NgModuleDecorator, NgModuleScopeInfoFromDecorator, OpaqueViewState, OutputDecorator, PipeDecorator, PipeDef, PipeType, Predicate, RElement, RNode, RawScopeInfoFromDecorator, RendererType2, SanitizerFn, SchemaMetadata, TAttributes, TDeferBlockDetails, TNode, TView, TracingSnapshot, TrustedHTML, TrustedScript, TrustedScriptURL, TypeDecorator, TypeOrFactory, ViewQueriesFunction, ɵɵComponentDeclaration, ɵɵDirectiveDeclaration, ɵɵFactoryDeclaration, ɵɵInjectableDeclaration, ɵɵInjectorDeclaration, ɵɵInjectorDef, ɵɵNgModuleDeclaration, ɵɵPipeDeclaration };
