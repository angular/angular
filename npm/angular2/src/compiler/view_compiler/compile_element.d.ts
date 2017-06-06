import * as o from '../output/output_ast';
import { CompileView } from './compile_view';
import { TemplateAst, ProviderAst, ReferenceAst } from '../template_ast';
import { CompileDirectiveMetadata, CompileTokenMetadata } from '../compile_metadata';
export declare class CompileNode {
    parent: CompileElement;
    view: CompileView;
    nodeIndex: number;
    renderNode: o.Expression;
    sourceAst: TemplateAst;
    constructor(parent: CompileElement, view: CompileView, nodeIndex: number, renderNode: o.Expression, sourceAst: TemplateAst);
    isNull(): boolean;
    isRootElement(): boolean;
}
export declare class CompileElement extends CompileNode {
    component: CompileDirectiveMetadata;
    private _directives;
    private _resolvedProvidersArray;
    hasViewContainer: boolean;
    hasEmbeddedView: boolean;
    static createNull(): CompileElement;
    private _compViewExpr;
    appElement: o.ReadPropExpr;
    elementRef: o.Expression;
    injector: o.Expression;
    private _instances;
    private _resolvedProviders;
    private _queryCount;
    private _queries;
    private _componentConstructorViewQueryLists;
    contentNodesByNgContentIndex: Array<o.Expression>[];
    embeddedView: CompileView;
    directiveInstances: o.Expression[];
    referenceTokens: {
        [key: string]: CompileTokenMetadata;
    };
    constructor(parent: CompileElement, view: CompileView, nodeIndex: number, renderNode: o.Expression, sourceAst: TemplateAst, component: CompileDirectiveMetadata, _directives: CompileDirectiveMetadata[], _resolvedProvidersArray: ProviderAst[], hasViewContainer: boolean, hasEmbeddedView: boolean, references: ReferenceAst[]);
    private _createAppElement();
    setComponentView(compViewExpr: o.Expression): void;
    setEmbeddedView(embeddedView: CompileView): void;
    beforeChildren(): void;
    afterChildren(childNodeCount: number): void;
    addContentNode(ngContentIndex: number, nodeExpr: o.Expression): void;
    getComponent(): o.Expression;
    getProviderTokens(): o.Expression[];
    private _getQueriesFor(token);
    private _addQuery(queryMeta, directiveInstance);
    private _getLocalDependency(requestingProviderType, dep);
    private _getDependency(requestingProviderType, dep);
}
