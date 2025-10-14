/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TrackByFunction } from '../../change_detection';
import { LContainer } from '../interfaces/container';
import { ComponentTemplate } from '../interfaces/definition';
import { LocalRefExtractor } from '../interfaces/node';
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
export declare function ɵɵconditionalCreate(index: number, templateFn: ComponentTemplate<any> | null, decls: number, vars: number, tagName?: string | null, attrsIndex?: number | null, localRefsIndex?: number | null, localRefExtractor?: LocalRefExtractor): typeof ɵɵconditionalBranchCreate;
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
export declare function ɵɵconditionalBranchCreate(index: number, templateFn: ComponentTemplate<any> | null, decls: number, vars: number, tagName?: string | null, attrsIndex?: number | null, localRefsIndex?: number | null, localRefExtractor?: LocalRefExtractor): typeof ɵɵconditionalBranchCreate;
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
export declare function ɵɵconditional<T>(matchingTemplateIndex: number, contextValue?: T): void;
export declare class RepeaterContext<T> {
    private lContainer;
    $implicit: T;
    $index: number;
    constructor(lContainer: LContainer, $implicit: T, $index: number);
    get $count(): number;
}
/**
 * A built-in trackBy function used for situations where users specified collection index as a
 * tracking expression. Having this function body in the runtime avoids unnecessary code generation.
 *
 * @param index
 * @returns
 */
export declare function ɵɵrepeaterTrackByIndex(index: number): number;
/**
 * A built-in trackBy function used for situations where users specified collection item reference
 * as a tracking expression. Having this function body in the runtime avoids unnecessary code
 * generation.
 *
 * @param index
 * @returns
 */
export declare function ɵɵrepeaterTrackByIdentity<T>(_: number, value: T): T;
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
export declare function ɵɵrepeaterCreate(index: number, templateFn: ComponentTemplate<unknown>, decls: number, vars: number, tagName: string | null, attrsIndex: number | null, trackByFn: TrackByFunction<unknown>, trackByUsesComponentInstance?: boolean, emptyTemplateFn?: ComponentTemplate<unknown>, emptyDecls?: number, emptyVars?: number, emptyTagName?: string | null, emptyAttrsIndex?: number | null): void;
/**
 * The repeater instruction does update-time diffing of a provided collection (against the
 * collection seen previously) and maps changes in the collection to views structure (by adding,
 * removing or moving views as needed).
 * @param collection - the collection instance to be checked for changes
 * @codeGenApi
 */
export declare function ɵɵrepeater(collection: Iterable<unknown> | undefined | null): void;
