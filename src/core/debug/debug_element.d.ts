import { Type } from 'angular2/src/facade/lang';
import { Predicate } from 'angular2/src/facade/collection';
import { AppView } from 'angular2/src/core/linker/view';
import { ElementRef } from 'angular2/src/core/linker/element_ref';
/**
 * A DebugElement contains information from the Angular compiler about an
 * element and provides access to the corresponding ElementInjector and
 * underlying DOM Element, as well as a way to query for children.
 *
 * A DebugElement can be obtained from a {@link ComponentFixture} or from an
 * {@link ElementRef} via {@link inspectElement}.
 */
export declare abstract class DebugElement {
    /**
     * Return the instance of the component associated with this element, if any.
     */
    componentInstance: any;
    /**
     * Return the native HTML element for this DebugElement.
     */
    nativeElement: any;
    /**
     * Return an Angular {@link ElementRef} for this element.
     */
    elementRef: ElementRef;
    /**
     * Get the directive active for this element with the given index, if any.
     */
    abstract getDirectiveInstance(directiveIndex: number): any;
    /**
     * Get child DebugElements from within the Light DOM.
     *
     * @return {DebugElement[]}
     */
    children: DebugElement[];
    /**
     * Get the root DebugElement children of a component. Returns an empty
     * list if the current DebugElement is not a component root.
     *
     * @return {DebugElement[]}
     */
    componentViewChildren: DebugElement[];
    /**
     * Simulate an event from this element as if the user had caused
     * this event to fire from the page.
     */
    abstract triggerEventHandler(eventName: string, eventObj: Event): void;
    /**
     * Check whether the element has a directive with the given type.
     */
    abstract hasDirective(type: Type): boolean;
    /**
     * Inject the given type from the element injector.
     */
    abstract inject(type: Type): any;
    /**
     * Read a local variable from the element (e.g. one defined with `#variable`).
     */
    abstract getLocal(name: string): any;
    /**
     * Return the first descendant TestElement matching the given predicate
     * and scope.
     *
     * @param {Function: boolean} predicate
     * @param {Scope} scope
     *
     * @return {DebugElement}
     */
    query(predicate: Predicate<DebugElement>, scope?: Function): DebugElement;
    /**
     * Return descendant TestElememts matching the given predicate
     * and scope.
     *
     * @param {Function: boolean} predicate
     * @param {Scope} scope
     *
     * @return {DebugElement[]}
     */
    queryAll(predicate: Predicate<DebugElement>, scope?: Function): DebugElement[];
}
export declare class DebugElement_ extends DebugElement {
    private _parentView;
    private _boundElementIndex;
    constructor(_parentView: AppView, _boundElementIndex: number);
    componentInstance: any;
    nativeElement: any;
    elementRef: ElementRef;
    getDirectiveInstance(directiveIndex: number): any;
    children: DebugElement[];
    componentViewChildren: DebugElement[];
    triggerEventHandler(eventName: string, eventObj: Event): void;
    hasDirective(type: Type): boolean;
    inject(type: Type): any;
    getLocal(name: string): any;
}
/**
 * Returns a {@link DebugElement} for an {@link ElementRef}.
 *
 * @param {ElementRef}: elementRef
 * @return {DebugElement}
 */
export declare function inspectElement(elementRef: ElementRef): DebugElement;
/**
 * Maps an array of {@link DebugElement}s to an array of native DOM elements.
 */
export declare function asNativeElements(arr: DebugElement[]): any[];
/**
 * Set of scope functions used with {@link DebugElement}'s query functionality.
 */
export declare class Scope {
    /**
     * Scope queries to both the light dom and view of an element and its
     * children.
     *
     * ## Example
     *
     * {@example core/debug/ts/debug_element/debug_element.ts region='scope_all'}
     */
    static all(debugElement: DebugElement): DebugElement[];
    /**
     * Scope queries to the light dom of an element and its children.
     *
     * ## Example
     *
     * {@example core/debug/ts/debug_element/debug_element.ts region='scope_light'}
     */
    static light(debugElement: DebugElement): DebugElement[];
    /**
     * Scope queries to the view of an element of its children.
     *
     * ## Example
     *
     * {@example core/debug/ts/debug_element/debug_element.ts region='scope_view'}
     */
    static view(debugElement: DebugElement): DebugElement[];
}
