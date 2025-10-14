/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../di/injector';
/**
 * @publicApi
 */
export declare class DebugEventListener {
    name: string;
    callback: Function;
    constructor(name: string, callback: Function);
}
/**
 * @publicApi
 */
export declare function asNativeElements(debugEls: DebugElement[]): any;
/**
 * @publicApi
 */
export declare class DebugNode {
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
export declare class DebugElement extends DebugNode {
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
     * @see [Testing components scenarios](guide/testing/components-scenarios#trigger-event-handler)
     */
    triggerEventHandler(eventName: string, eventObj?: any): void;
}
/**
 * @publicApi
 */
export declare function getDebugNode(nativeNode: any): DebugNode | null;
export declare function getAllDebugNodes(): DebugNode[];
export declare function indexDebugNode(node: DebugNode): void;
export declare function removeDebugNodeFromIndex(node: DebugNode): void;
/**
 * A boolean-valued function over a value, possibly including context information
 * regarding that value's position in an array.
 *
 * @publicApi
 */
export type Predicate<T> = (value: T) => boolean;
