/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import '../util/ng_dev_mode';
import { LContext } from './interfaces/context';
import { LView } from './interfaces/view';
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
export declare function getLContext(target: any): LContext | null;
/**
 * Takes a component instance and returns the view for that component.
 *
 * @param componentInstance
 * @returns The component's view
 */
export declare function getComponentViewByInstance(componentInstance: {}): LView;
export declare function attachLViewId(target: any, data: LView): void;
/**
 * Returns the monkey-patch value data present on the target (which could be
 * a component, directive or a DOM node).
 */
export declare function readLView(target: any): LView | null;
/**
 * Assigns the given data to the given target (which could be a component,
 * directive or DOM node instance) using monkey-patching.
 */
export declare function attachPatchData(target: any, data: LView | LContext): void;
/**
 * Returns the monkey-patch value data present on the target (which could be
 * a component, directive or a DOM node).
 */
export declare function readPatchedData(target: any): LView | LContext | null;
export declare function readPatchedLView<T>(target: any): LView<T> | null;
export declare function isComponentInstance(instance: any): boolean;
export declare function isDirectiveInstance(instance: any): boolean;
/**
 * Returns a list of directives applied to a node at a specific index. The list includes
 * directives matched by selector and any host directives, but it excludes components.
 * Use `getComponentAtNodeIndex` to find the component applied to a node.
 *
 * @param nodeIndex The node index
 * @param lView The target view data
 */
export declare function getDirectivesAtNodeIndex(nodeIndex: number, lView: LView): any[] | null;
export declare function getComponentAtNodeIndex(nodeIndex: number, lView: LView): {} | null;
/**
 * Returns a map of local references (local reference name => element or directive instance) that
 * exist on a given element.
 */
export declare function discoverLocalRefs(lView: LView, nodeIndex: number): {
    [key: string]: any;
} | null;
