import { TemplateAst, BoundEventAst } from './template_ast';
import { CompileDirectiveMetadata, CompilePipeMetadata } from './directive_metadata';
import { AppProtoView } from 'angular2/src/core/linker/view';
import { ViewType } from 'angular2/src/core/linker/view_type';
import { AppProtoElement } from 'angular2/src/core/linker/element';
import { ResolvedMetadataCache } from 'angular2/src/core/linker/resolved_metadata_cache';
import { Expression } from './util';
export declare const PROTO_VIEW_JIT_IMPORTS: {
    'AppProtoView': typeof AppProtoView;
    'AppProtoElement': typeof AppProtoElement;
    'ViewType': typeof ViewType;
};
export declare var APP_VIEW_MODULE_REF: string;
export declare var VIEW_TYPE_MODULE_REF: string;
export declare var APP_EL_MODULE_REF: string;
export declare var METADATA_MODULE_REF: string;
export declare class ProtoViewCompiler {
    constructor();
    compileProtoViewRuntime(metadataCache: ResolvedMetadataCache, component: CompileDirectiveMetadata, template: TemplateAst[], pipes: CompilePipeMetadata[]): CompileProtoViews<AppProtoView, AppProtoElement, any>;
    compileProtoViewCodeGen(resolvedMetadataCacheExpr: Expression, component: CompileDirectiveMetadata, template: TemplateAst[], pipes: CompilePipeMetadata[]): CompileProtoViews<Expression, Expression, string>;
}
export declare class CompileProtoViews<APP_PROTO_VIEW, APP_PROTO_EL, STATEMENT> {
    declarations: STATEMENT[];
    protoViews: CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL>[];
    constructor(declarations: STATEMENT[], protoViews: CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL>[]);
}
export declare class CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL> {
    embeddedTemplateIndex: number;
    protoElements: CompileProtoElement<APP_PROTO_EL>[];
    protoView: APP_PROTO_VIEW;
    constructor(embeddedTemplateIndex: number, protoElements: CompileProtoElement<APP_PROTO_EL>[], protoView: APP_PROTO_VIEW);
}
export declare class CompileProtoElement<APP_PROTO_EL> {
    boundElementIndex: any;
    attrNameAndValues: string[][];
    variableNameAndValues: string[][];
    renderEvents: BoundEventAst[];
    directives: CompileDirectiveMetadata[];
    embeddedTemplateIndex: number;
    appProtoEl: APP_PROTO_EL;
    constructor(boundElementIndex: any, attrNameAndValues: string[][], variableNameAndValues: string[][], renderEvents: BoundEventAst[], directives: CompileDirectiveMetadata[], embeddedTemplateIndex: number, appProtoEl: APP_PROTO_EL);
}
