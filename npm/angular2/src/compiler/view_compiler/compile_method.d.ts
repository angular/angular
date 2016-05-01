import * as o from '../output/output_ast';
import { TemplateAst } from '../template_ast';
import { CompileView } from './compile_view';
export declare class CompileMethod {
    private _view;
    private _newState;
    private _currState;
    private _debugEnabled;
    private _bodyStatements;
    constructor(_view: CompileView);
    private _updateDebugContextIfNeeded();
    private _updateDebugContext(newState);
    resetDebugInfoExpr(nodeIndex: number, templateAst: TemplateAst): o.Expression;
    resetDebugInfo(nodeIndex: number, templateAst: TemplateAst): void;
    addStmt(stmt: o.Statement): void;
    addStmts(stmts: o.Statement[]): void;
    finish(): o.Statement[];
    isEmpty(): boolean;
}
