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
export declare function ɵɵelementContainerStart(index: number, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵelementContainerStart;
/**
 * Mark the end of the <ng-container>.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export declare function ɵɵelementContainerEnd(): typeof ɵɵelementContainerEnd;
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
export declare function ɵɵelementContainer(index: number, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵelementContainer;
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
export declare function ɵɵdomElementContainerStart(index: number, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵdomElementContainerStart;
/**
 * Mark the end of a directiveless <ng-container>.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export declare function ɵɵdomElementContainerEnd(): typeof ɵɵelementContainerEnd;
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
export declare function ɵɵdomElementContainer(index: number, attrsIndex?: number | null, localRefsIndex?: number): typeof ɵɵdomElementContainer;
export declare function enableLocateOrCreateElementContainerNodeImpl(): void;
