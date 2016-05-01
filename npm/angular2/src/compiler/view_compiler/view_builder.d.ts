import * as o from '../output/output_ast';
import { CompileView } from './compile_view';
import { TemplateAst } from '../template_ast';
import { CompileIdentifierMetadata, CompileDirectiveMetadata } from '../compile_metadata';
export declare class ViewCompileDependency {
    comp: CompileDirectiveMetadata;
    factoryPlaceholder: CompileIdentifierMetadata;
    constructor(comp: CompileDirectiveMetadata, factoryPlaceholder: CompileIdentifierMetadata);
}
export declare function buildView(view: CompileView, template: TemplateAst[], targetDependencies: ViewCompileDependency[]): number;
export declare function finishView(view: CompileView, targetStatements: o.Statement[]): void;
