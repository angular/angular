import { ChangeDetectorState, ChangeDetectionStrategy } from 'angular2/src/core/change_detection/change_detection';
import { ViewEncapsulation } from 'angular2/src/core/metadata/view';
import { ViewType } from 'angular2/src/core/linker/view_type';
import * as o from '../output/output_ast';
export declare class ViewTypeEnum {
    static fromValue(value: ViewType): o.Expression;
    static HOST: o.Expression;
    static COMPONENT: o.Expression;
    static EMBEDDED: o.Expression;
}
export declare class ViewEncapsulationEnum {
    static fromValue(value: ViewEncapsulation): o.Expression;
    static Emulated: o.Expression;
    static Native: o.Expression;
    static None: o.Expression;
}
export declare class ChangeDetectorStateEnum {
    static fromValue(value: ChangeDetectorState): o.Expression;
    static NeverChecked: o.Expression;
    static CheckedBefore: o.Expression;
    static Errored: o.Expression;
}
export declare class ChangeDetectionStrategyEnum {
    static fromValue(value: ChangeDetectionStrategy): o.Expression;
    static CheckOnce: o.Expression;
    static Checked: o.Expression;
    static CheckAlways: o.Expression;
    static Detached: o.Expression;
    static OnPush: o.Expression;
    static Default: o.Expression;
}
export declare class ViewConstructorVars {
    static viewUtils: o.ReadVarExpr;
    static parentInjector: o.ReadVarExpr;
    static declarationEl: o.ReadVarExpr;
}
export declare class ViewProperties {
    static renderer: o.ReadPropExpr;
    static projectableNodes: o.ReadPropExpr;
    static viewUtils: o.ReadPropExpr;
}
export declare class EventHandlerVars {
    static event: o.ReadVarExpr;
}
export declare class InjectMethodVars {
    static token: o.ReadVarExpr;
    static requestNodeIndex: o.ReadVarExpr;
    static notFoundResult: o.ReadVarExpr;
}
export declare class DetectChangesVars {
    static throwOnChange: o.ReadVarExpr;
    static changes: o.ReadVarExpr;
    static changed: o.ReadVarExpr;
    static valUnwrapper: o.ReadVarExpr;
}
