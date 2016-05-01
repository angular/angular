import * as o from './output_ast';
import { OutputEmitter } from './abstract_emitter';
export declare function debugOutputAstAsDart(ast: o.Statement | o.Expression | o.Type | any[]): string;
export declare class DartEmitter implements OutputEmitter {
    constructor();
    emitStatements(moduleUrl: string, stmts: o.Statement[], exportedVars: string[]): string;
}
