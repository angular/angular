/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SelectorlessMatcher, SelectorMatcher } from '../../directive_matching';
import { BoundTarget, DirectiveMeta, Target, TargetBinder } from './t2_api';
/**
 * Given a template string and a set of available directive selectors,
 * computes a list of matching selectors and splits them into 2 buckets:
 * (1) eagerly used in a template and (2) directives used only in defer
 * blocks. Similarly, returns 2 lists of pipes (eager and deferrable).
 *
 * Note: deferrable directives selectors and pipes names used in `@defer`
 * blocks are **candidates** and API caller should make sure that:
 *
 *  * A Component where a given template is defined is standalone
 *  * Underlying dependency classes are also standalone
 *  * Dependency class symbols are not eagerly used in a TS file
 *    where a host component (that owns the template) is located
 */
export declare function findMatchingDirectivesAndPipes(template: string, directiveSelectors: string[]): {
    directives: {
        regular: string[];
        deferCandidates: string[];
    };
    pipes: {
        regular: string[];
        deferCandidates: string[];
    };
};
/** Object used to match template nodes to directives. */
export type DirectiveMatcher<DirectiveT extends DirectiveMeta> = SelectorMatcher<DirectiveT[]> | SelectorlessMatcher<DirectiveT>;
/**
 * Processes `Target`s with a given set of directives and performs a binding operation, which
 * returns an object similar to TypeScript's `ts.TypeChecker` that contains knowledge about the
 * target.
 */
export declare class R3TargetBinder<DirectiveT extends DirectiveMeta> implements TargetBinder<DirectiveT> {
    private directiveMatcher;
    constructor(directiveMatcher: DirectiveMatcher<DirectiveT> | null);
    /**
     * Perform a binding operation on the given `Target` and return a `BoundTarget` which contains
     * metadata about the types referenced in the template.
     */
    bind(target: Target<DirectiveT>): BoundTarget<DirectiveT>;
}
