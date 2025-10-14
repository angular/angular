/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ChangeDetectionStrategy } from '../../change_detection/constants';
import { Injector } from '../../di/injector';
import { ViewEncapsulation } from '../../metadata/view';
import { LView } from '../interfaces/view';
/**
 * Retrieves the component instance associated with a given DOM element.
 *
 * @usageNotes
 * Given the following DOM structure:
 *
 * ```html
 * <app-root>
 *   <div>
 *     <child-comp></child-comp>
 *   </div>
 * </app-root>
 * ```
 *
 * Calling `getComponent` on `<child-comp>` will return the instance of `ChildComponent`
 * associated with this DOM element.
 *
 * Calling the function on `<app-root>` will return the `MyApp` instance.
 *
 *
 * @param element DOM element from which the component should be retrieved.
 * @returns Component instance associated with the element or `null` if there
 *    is no component associated with it.
 *
 * @publicApi
 */
export declare function getComponent<T>(element: Element): T | null;
/**
 * If inside an embedded view (e.g. `*ngIf` or `*ngFor`), retrieves the context of the embedded
 * view that the element is part of. Otherwise retrieves the instance of the component whose view
 * owns the element (in this case, the result is the same as calling `getOwningComponent`).
 *
 * @param element Element for which to get the surrounding component instance.
 * @returns Instance of the component that is around the element or null if the element isn't
 *    inside any component.
 *
 * @publicApi
 */
export declare function getContext<T extends {}>(element: Element): T | null;
/**
 * Retrieves the component instance whose view contains the DOM element.
 *
 * For example, if `<child-comp>` is used in the template of `<app-comp>`
 * (i.e. a `ViewChild` of `<app-comp>`), calling `getOwningComponent` on `<child-comp>`
 * would return `<app-comp>`.
 *
 * @param elementOrDir DOM element, component or directive instance
 *    for which to retrieve the root components.
 * @returns Component instance whose view owns the DOM element or null if the element is not
 *    part of a component view.
 *
 * @publicApi
 */
export declare function getOwningComponent<T>(elementOrDir: Element | {}): T | null;
/**
 * Retrieves all root components associated with a DOM element, directive or component instance.
 * Root components are those which have been bootstrapped by Angular.
 *
 * @param elementOrDir DOM element, component or directive instance
 *    for which to retrieve the root components.
 * @returns Root components associated with the target object.
 *
 * @publicApi
 */
export declare function getRootComponents(elementOrDir: Element | {}): {}[];
/**
 * Retrieves an `Injector` associated with an element, component or directive instance.
 *
 * @param elementOrDir DOM element, component or directive instance for which to
 *    retrieve the injector.
 * @returns Injector associated with the element, component or directive instance.
 *
 * @publicApi
 */
export declare function getInjector(elementOrDir: Element | {}): Injector;
/**
 * Retrieve a set of injection tokens at a given DOM node.
 *
 * @param element Element for which the injection tokens should be retrieved.
 */
export declare function getInjectionTokens(element: Element): any[];
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
export declare function getDirectives(node: Node): {}[];
/** The framework used to author a particular application or component. */
export declare enum Framework {
    Angular = "angular",
    ACX = "acx",
    Wiz = "wiz"
}
/** Metadata common to directives from all frameworks.  */
export interface BaseDirectiveDebugMetadata {
    name?: string;
    framework?: Framework;
}
/**
 * Partial metadata for a given Angular directive instance.
 *
 * @publicApi
 */
export interface AngularDirectiveDebugMetadata extends BaseDirectiveDebugMetadata {
    framework?: Framework.Angular;
    inputs: Record<string, string>;
    outputs: Record<string, string>;
}
/**
 * Partial metadata for a given Angular component instance.
 *
 * @publicApi
 */
export interface AngularComponentDebugMetadata extends AngularDirectiveDebugMetadata {
    encapsulation: ViewEncapsulation;
    changeDetection: ChangeDetectionStrategy;
}
/** ACX change detection strategies. */
export declare enum AcxChangeDetectionStrategy {
    Default = 0,
    OnPush = 1
}
/** ACX view encapsulation modes. */
export declare enum AcxViewEncapsulation {
    Emulated = 0,
    None = 1
}
/** Partial metadata for a given ACX directive instance. */
export interface AcxDirectiveDebugMetadata extends BaseDirectiveDebugMetadata {
    framework: Framework.ACX;
    inputs: Record<string, string>;
    outputs: Record<string, string>;
}
/** Partial metadata for a given ACX component instance. */
export interface AcxComponentDebugMetadata extends AcxDirectiveDebugMetadata {
    changeDetection: AcxChangeDetectionStrategy;
    encapsulation: AcxViewEncapsulation;
}
/** Partial metadata for a given Wiz component instance. */
export interface WizComponentDebugMetadata extends BaseDirectiveDebugMetadata {
    framework: Framework.Wiz;
    props: Record<string, string>;
}
/** All potential debug metadata types across all frameworks. */
export type DirectiveDebugMetadata = AngularDirectiveDebugMetadata | AcxDirectiveDebugMetadata | AngularComponentDebugMetadata | AcxComponentDebugMetadata | WizComponentDebugMetadata;
/**
 * Returns the debug (partial) metadata for a particular directive or component instance.
 * The function accepts an instance of a directive or component and returns the corresponding
 * metadata.
 *
 * @param directiveOrComponentInstance Instance of a directive or component
 * @returns metadata of the passed directive or component
 *
 * @publicApi
 */
export declare function getDirectiveMetadata(directiveOrComponentInstance: any): AngularComponentDebugMetadata | AngularDirectiveDebugMetadata | null;
/**
 * Retrieve map of local references.
 *
 * The references are retrieved as a map of local reference name to element or directive instance.
 *
 * @param target DOM element, component or directive instance for which to retrieve
 *    the local references.
 */
export declare function getLocalRefs(target: {}): {
    [key: string]: any;
};
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
export declare function getHostElement(componentOrDirective: {}): Element;
/**
 * Retrieves the rendered text for a given component.
 *
 * This function retrieves the host element of a component and
 * and then returns the `textContent` for that element. This implies
 * that the text returned will include re-projected content of
 * the component as well.
 *
 * @param component The component to return the content text for.
 */
export declare function getRenderedText(component: any): string;
/**
 * Event listener configuration returned from `getListeners`.
 * @publicApi
 */
export interface Listener {
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
/**
 * Retrieves a list of event listeners associated with a DOM element. The list does include host
 * listeners, but it does not include event listeners defined outside of the Angular context
 * (e.g. through `addEventListener`).
 *
 * @usageNotes
 * Given the following DOM structure:
 *
 * ```html
 * <app-root>
 *   <div (click)="doSomething()"></div>
 * </app-root>
 * ```
 *
 * Calling `getListeners` on `<div>` will return an object that looks as follows:
 *
 * ```ts
 * {
 *   name: 'click',
 *   element: <div>,
 *   callback: () => doSomething(),
 *   useCapture: false
 * }
 * ```
 *
 * @param element Element for which the DOM listeners should be retrieved.
 * @returns Array of event listeners on the DOM element.
 *
 * @publicApi
 */
export declare function getListeners(element: Element): Listener[];
/**
 * Retrieve the component `LView` from component/element.
 *
 * NOTE: `LView` is a private and should not be leaked outside.
 *       Don't export this method to `ng.*` on window.
 *
 * @param target DOM element or component instance for which to retrieve the LView.
 */
export declare function getComponentLView(target: any): LView;
