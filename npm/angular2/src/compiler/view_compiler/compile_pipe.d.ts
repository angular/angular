import * as o from '../output/output_ast';
import { CompileView } from './compile_view';
import { CompilePipeMetadata } from '../compile_metadata';
export declare class CompilePipe {
    view: CompileView;
    meta: CompilePipeMetadata;
    instance: o.ReadPropExpr;
    private _purePipeProxies;
    constructor(view: CompileView, name: string);
    pure: boolean;
    create(): void;
    call(callingView: CompileView, args: o.Expression[]): o.Expression;
}
