import * as cdAst from '../expression_parser/ast';
import * as o from '../output/output_ast';
export interface NameResolver {
    callPipe(name: string, input: o.Expression, args: o.Expression[]): o.Expression;
    getLocal(name: string): o.Expression;
    createLiteralArray(values: o.Expression[]): o.Expression;
    createLiteralMap(values: Array<Array<string | o.Expression>>): o.Expression;
}
export declare class ExpressionWithWrappedValueInfo {
    expression: o.Expression;
    needsValueUnwrapper: boolean;
    constructor(expression: o.Expression, needsValueUnwrapper: boolean);
}
export declare function convertCdExpressionToIr(nameResolver: NameResolver, implicitReceiver: o.Expression, expression: cdAst.AST, valueUnwrapper: o.ReadVarExpr): ExpressionWithWrappedValueInfo;
export declare function convertCdStatementToIr(nameResolver: NameResolver, implicitReceiver: o.Expression, stmt: cdAst.AST): o.Statement[];
