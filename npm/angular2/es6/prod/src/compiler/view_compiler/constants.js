import { isBlank, resolveEnumToken } from 'angular2/src/facade/lang';
import { CompileIdentifierMetadata } from '../compile_metadata';
import { ChangeDetectorState, ChangeDetectionStrategy } from 'angular2/src/core/change_detection/change_detection';
import { ViewEncapsulation } from 'angular2/src/core/metadata/view';
import { ViewType } from 'angular2/src/core/linker/view_type';
import * as o from '../output/output_ast';
import { Identifiers } from '../identifiers';
function _enumExpression(classIdentifier, value) {
    if (isBlank(value))
        return o.NULL_EXPR;
    var name = resolveEnumToken(classIdentifier.runtime, value);
    return o.importExpr(new CompileIdentifierMetadata({
        name: `${classIdentifier.name}.${name}`,
        moduleUrl: classIdentifier.moduleUrl,
        runtime: value
    }));
}
export class ViewTypeEnum {
    static fromValue(value) {
        return _enumExpression(Identifiers.ViewType, value);
    }
}
ViewTypeEnum.HOST = ViewTypeEnum.fromValue(ViewType.HOST);
ViewTypeEnum.COMPONENT = ViewTypeEnum.fromValue(ViewType.COMPONENT);
ViewTypeEnum.EMBEDDED = ViewTypeEnum.fromValue(ViewType.EMBEDDED);
export class ViewEncapsulationEnum {
    static fromValue(value) {
        return _enumExpression(Identifiers.ViewEncapsulation, value);
    }
}
ViewEncapsulationEnum.Emulated = ViewEncapsulationEnum.fromValue(ViewEncapsulation.Emulated);
ViewEncapsulationEnum.Native = ViewEncapsulationEnum.fromValue(ViewEncapsulation.Native);
ViewEncapsulationEnum.None = ViewEncapsulationEnum.fromValue(ViewEncapsulation.None);
export class ChangeDetectorStateEnum {
    static fromValue(value) {
        return _enumExpression(Identifiers.ChangeDetectorState, value);
    }
}
ChangeDetectorStateEnum.NeverChecked = ChangeDetectorStateEnum.fromValue(ChangeDetectorState.NeverChecked);
ChangeDetectorStateEnum.CheckedBefore = ChangeDetectorStateEnum.fromValue(ChangeDetectorState.CheckedBefore);
ChangeDetectorStateEnum.Errored = ChangeDetectorStateEnum.fromValue(ChangeDetectorState.Errored);
export class ChangeDetectionStrategyEnum {
    static fromValue(value) {
        return _enumExpression(Identifiers.ChangeDetectionStrategy, value);
    }
}
ChangeDetectionStrategyEnum.CheckOnce = ChangeDetectionStrategyEnum.fromValue(ChangeDetectionStrategy.CheckOnce);
ChangeDetectionStrategyEnum.Checked = ChangeDetectionStrategyEnum.fromValue(ChangeDetectionStrategy.Checked);
ChangeDetectionStrategyEnum.CheckAlways = ChangeDetectionStrategyEnum.fromValue(ChangeDetectionStrategy.CheckAlways);
ChangeDetectionStrategyEnum.Detached = ChangeDetectionStrategyEnum.fromValue(ChangeDetectionStrategy.Detached);
ChangeDetectionStrategyEnum.OnPush = ChangeDetectionStrategyEnum.fromValue(ChangeDetectionStrategy.OnPush);
ChangeDetectionStrategyEnum.Default = ChangeDetectionStrategyEnum.fromValue(ChangeDetectionStrategy.Default);
export class ViewConstructorVars {
}
ViewConstructorVars.viewUtils = o.variable('viewUtils');
ViewConstructorVars.parentInjector = o.variable('parentInjector');
ViewConstructorVars.declarationEl = o.variable('declarationEl');
export class ViewProperties {
}
ViewProperties.renderer = o.THIS_EXPR.prop('renderer');
ViewProperties.projectableNodes = o.THIS_EXPR.prop('projectableNodes');
ViewProperties.viewUtils = o.THIS_EXPR.prop('viewUtils');
export class EventHandlerVars {
}
EventHandlerVars.event = o.variable('$event');
export class InjectMethodVars {
}
InjectMethodVars.token = o.variable('token');
InjectMethodVars.requestNodeIndex = o.variable('requestNodeIndex');
InjectMethodVars.notFoundResult = o.variable('notFoundResult');
export class DetectChangesVars {
}
DetectChangesVars.throwOnChange = o.variable(`throwOnChange`);
DetectChangesVars.changes = o.variable(`changes`);
DetectChangesVars.changed = o.variable(`changed`);
DetectChangesVars.valUnwrapper = o.variable(`valUnwrapper`);
