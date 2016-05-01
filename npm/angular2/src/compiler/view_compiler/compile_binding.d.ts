import { CompileNode } from './compile_element';
import { TemplateAst } from '../template_ast';
export declare class CompileBinding {
    node: CompileNode;
    sourceAst: TemplateAst;
    constructor(node: CompileNode, sourceAst: TemplateAst);
}
