import * as o from './output_ast';
import { OutputEmitter } from './abstract_emitter';
export declare class JavaScriptEmitter implements OutputEmitter {
    constructor();
    emitStatements(moduleUrl: string, stmts: o.Statement[], exportedVars: string[]): string;
}
