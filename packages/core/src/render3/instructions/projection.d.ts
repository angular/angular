import { ComponentTemplate } from '../interfaces/definition';
import { TAttributes, TNode } from '../interfaces/node';
import { ProjectionSlots } from '../interfaces/projection';
/**
 * Checks a given node against matching projection slots and returns the
 * determined slot index. Returns "null" if no slot matched the given node.
 *
 * This function takes into account the parsed ngProjectAs selector from the
 * node's attributes. If present, it will check whether the ngProjectAs selector
 * matches any of the projection slot selectors.
 */
export declare function matchingProjectionSlotIndex(tNode: TNode, projectionSlots: ProjectionSlots): number | null;
/**
 * Instruction to distribute projectable nodes among <ng-content> occurrences in a given template.
 * It takes all the selectors from the entire component's template and decides where
 * each projected node belongs (it re-distributes nodes among "buckets" where each "bucket" is
 * backed by a selector).
 *
 * This function requires CSS selectors to be provided in 2 forms: parsed (by a compiler) and text,
 * un-parsed form.
 *
 * The parsed form is needed for efficient matching of a node against a given CSS selector.
 * The un-parsed, textual form is needed for support of the ngProjectAs attribute.
 *
 * Having a CSS selector in 2 different formats is not ideal, but alternatives have even more
 * drawbacks:
 * - having only a textual form would require runtime parsing of CSS selectors;
 * - we can't have only a parsed as we can't re-construct textual form from it (as entered by a
 * template author).
 *
 * @param projectionSlots? A collection of projection slots. A projection slot can be based
 *        on a parsed CSS selectors or set to the wildcard selector ("*") in order to match
 *        all nodes which do not match any selector. If not specified, a single wildcard
 *        selector projection slot will be defined.
 *
 * @codeGenApi
 */
export declare function ɵɵprojectionDef(projectionSlots?: ProjectionSlots): void;
/**
 * Inserts previously re-distributed projected nodes. This instruction must be preceded by a call
 * to the projectionDef instruction.
 *
 * @param nodeIndex Index of the projection node.
 * @param selectorIndex Index of the slot selector.
 *  - 0 when the selector is `*` (or unspecified as this is the default value),
 *  - 1 based index of the selector from the {@link projectionDef}
 * @param attrs Static attributes set on the `ng-content` node.
 * @param fallbackTemplateFn Template function with fallback content.
 *   Will be rendered if the slot is empty at runtime.
 * @param fallbackDecls Number of declarations in the fallback template.
 * @param fallbackVars Number of variables in the fallback template.
 *
 * @codeGenApi
 */
export declare function ɵɵprojection(nodeIndex: number, selectorIndex?: number, attrs?: TAttributes, fallbackTemplateFn?: ComponentTemplate<unknown>, fallbackDecls?: number, fallbackVars?: number): void;
