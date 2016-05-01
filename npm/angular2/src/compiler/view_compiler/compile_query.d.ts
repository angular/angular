import * as o from '../output/output_ast';
import { CompileQueryMetadata, CompileTokenMap } from '../compile_metadata';
import { CompileView } from './compile_view';
import { CompileMethod } from './compile_method';
export declare class CompileQuery {
    meta: CompileQueryMetadata;
    queryList: o.Expression;
    ownerDirectiveExpression: o.Expression;
    view: CompileView;
    private _values;
    constructor(meta: CompileQueryMetadata, queryList: o.Expression, ownerDirectiveExpression: o.Expression, view: CompileView);
    addValue(value: o.Expression, view: CompileView): void;
    afterChildren(targetMethod: CompileMethod): void;
}
export declare function createQueryList(query: CompileQueryMetadata, directiveInstance: o.Expression, propertyName: string, compileView: CompileView): o.Expression;
export declare function addQueryToTokenMap(map: CompileTokenMap<CompileQuery[]>, query: CompileQuery): void;
