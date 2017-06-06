import * as o from './output_ast';
import { OutputEmitter } from './abstract_emitter';
export declare function debugOutputAstAsTypeScript(ast: o.Statement | o.Expression | o.Type | any[]): string;
export declare class TypeScriptEmitter implements OutputEmitter {
    constructor();
    emitStatements(moduleUrl: string, stmts: o.Statement[], exportedVars: string[]): string;
}
