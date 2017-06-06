import * as o from '../output/output_ast';
import { ViewCompileDependency } from './view_builder';
import { CompileDirectiveMetadata, CompilePipeMetadata } from '../compile_metadata';
import { TemplateAst } from '../template_ast';
import { CompilerConfig } from '../config';
export declare class ViewCompileResult {
    statements: o.Statement[];
    viewFactoryVar: string;
    dependencies: ViewCompileDependency[];
    constructor(statements: o.Statement[], viewFactoryVar: string, dependencies: ViewCompileDependency[]);
}
export declare class ViewCompiler {
    private _genConfig;
    constructor(_genConfig: CompilerConfig);
    compileComponent(component: CompileDirectiveMetadata, template: TemplateAst[], styles: o.Expression, pipes: CompilePipeMetadata[]): ViewCompileResult;
}
