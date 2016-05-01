import * as o from '../output/output_ast';
import { BoundTextAst, BoundElementPropertyAst, DirectiveAst } from '../template_ast';
import { CompileView } from './compile_view';
import { CompileElement, CompileNode } from './compile_element';
export declare function bindRenderText(boundText: BoundTextAst, compileNode: CompileNode, view: CompileView): void;
export declare function bindRenderInputs(boundProps: BoundElementPropertyAst[], compileElement: CompileElement): void;
export declare function bindDirectiveHostProps(directiveAst: DirectiveAst, directiveInstance: o.Expression, compileElement: CompileElement): void;
export declare function bindDirectiveInputs(directiveAst: DirectiveAst, directiveInstance: o.Expression, compileElement: CompileElement): void;
