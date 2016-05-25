import {CompileNode} from './compile_element';
import {TemplateAst} from '../template_ast';

export class CompileBinding {
  constructor(public node: CompileNode, public sourceAst: TemplateAst) {}
}
