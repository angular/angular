import { TemplateAst } from './template_ast';
import { CompileDirectiveMetadata } from './directive_metadata';
import { SourceExpressions, SourceExpression } from './source_module';
import { AppProtoView, AppView } from 'angular2/src/core/linker/view';
import { AppProtoElement, AppElement } from 'angular2/src/core/linker/element';
import { Expression } from './util';
import { CompileProtoView } from './proto_view_compiler';
export declare const VIEW_JIT_IMPORTS: {
    'AppView': typeof AppView;
    'AppElement': typeof AppElement;
    'flattenNestedViewRenderNodes': (nodes: any[]) => any[];
    'checkSlotCount': (componentName: string, expectedSlotCount: number, projectableNodes: any[][]) => void;
};
export declare class ViewCompiler {
    constructor();
    compileComponentRuntime(component: CompileDirectiveMetadata, template: TemplateAst[], styles: Array<string | any[]>, protoViews: CompileProtoView<AppProtoView, AppProtoElement>[], changeDetectorFactories: Function[], componentViewFactory: Function): Function;
    compileComponentCodeGen(component: CompileDirectiveMetadata, template: TemplateAst[], styles: SourceExpression, protoViews: CompileProtoView<Expression, Expression>[], changeDetectorFactoryExpressions: SourceExpressions, componentViewFactory: Function): SourceExpression;
}
