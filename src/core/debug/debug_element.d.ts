import { Type } from 'angular2/src/facade/lang';
import { Predicate } from 'angular2/src/facade/collection';
import { AppView } from 'angular2/src/core/linker/view';
import { ElementRef } from 'angular2/src/core/linker/element_ref';
/**
 * A DebugElement contains information from the Angular compiler about an
 * element and provides access to the corresponding ElementInjector and
 * underlying DOM Element, as well as a way to query for children.
 */
export declare abstract class DebugElement {
    componentInstance: any;
    nativeElement: any;
    elementRef: ElementRef;
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
    abstract triggerEventHandler(eventName: string, eventObj: Event): void;
    abstract hasDirective(type: Type): boolean;
    abstract inject(type: Type): any;
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
 * Returns a DebugElement for a ElementRef.
 *
 * @param {ElementRef}: elementRef
 * @return {DebugElement}
 */
export declare function inspectElement(elementRef: ElementRef): DebugElement;
export declare function asNativeElements(arr: DebugElement[]): any[];
export declare class Scope {
    static all(debugElement: DebugElement): DebugElement[];
    static light(debugElement: DebugElement): DebugElement[];
    static view(debugElement: DebugElement): DebugElement[];
}
