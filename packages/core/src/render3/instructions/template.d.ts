import { ComponentTemplate } from '../interfaces/definition';
import { LocalRefExtractor, TAttributes, TNode, TNodeFlags } from '../interfaces/node';
import { LView, TView } from '../interfaces/view';
/**
 * Declares a new template that *cannot& have directives on its host node.
 *
 * @param declarationLView LView in which the template was declared.
 * @param declarationTView TView in which the template wa declared.
 * @param index The index of the container in the data array
 * @param templateFn Inline template
 * @param decls The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param localRefs Index of the local references in the `consts` array.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 */
export declare function declareNoDirectiveHostTemplate(declarationLView: LView, declarationTView: TView, index: number, templateFn: ComponentTemplate<any> | null, decls: number, vars: number, tagName?: string | null, attrs?: TAttributes | null, flags?: TNodeFlags, localRefsIndex?: number | null, localRefExtractor?: LocalRefExtractor): TNode;
/**
 * Creates an LContainer for an ng-template (dynamically-inserted view), e.g.
 *
 * <ng-template #foo>
 *    <div></div>
 * </ng-template>
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
 *
 * @codeGenApi
 */
export declare function ɵɵtemplate(index: number, templateFn: ComponentTemplate<any> | null, decls: number, vars: number, tagName?: string | null, attrsIndex?: number | null, localRefsIndex?: number | null, localRefExtractor?: LocalRefExtractor): typeof ɵɵtemplate;
/**
 * Creates an LContainer for an ng-template that cannot have directives.
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
 *
 * @codeGenApi
 */
export declare function ɵɵdomTemplate(index: number, templateFn: ComponentTemplate<any> | null, decls: number, vars: number, tagName?: string | null, attrsIndex?: number | null, localRefsIndex?: number | null, localRefExtractor?: LocalRefExtractor): typeof ɵɵdomTemplate;
export declare function enableLocateOrCreateContainerAnchorImpl(): void;
