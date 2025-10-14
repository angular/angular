/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
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
export declare function ɵɵelementStart(index: number, name: string, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵelementStart;
/**
 * Mark the end of the element.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export declare function ɵɵelementEnd(): typeof ɵɵelementEnd;
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
export declare function ɵɵelement(index: number, name: string, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵelement;
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
export declare function ɵɵdomElementStart(index: number, name: string, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵdomElementStart;
/**
 * Mark the end of the directiveless element.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export declare function ɵɵdomElementEnd(): typeof ɵɵdomElementEnd;
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
export declare function ɵɵdomElement(index: number, name: string, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵdomElement;
export declare function enableLocateOrCreateElementNodeImpl(): void;
