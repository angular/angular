import { CodegenNameUtil } from './codegen_name_util';
import { ProtoRecord } from './proto_record';
import { BindingTarget } from './binding_record';
import { DirectiveRecord } from './directive_record';
import { ChangeDetectionStrategy } from './constants';
/**
 * Class responsible for providing change detection logic for change detector classes.
 */
export declare class CodegenLogicUtil {
    private _names;
    private _utilName;
    private _changeDetectorStateName;
    private _changeDetection;
    constructor(_names: CodegenNameUtil, _utilName: string, _changeDetectorStateName: string, _changeDetection: ChangeDetectionStrategy);
    /**
     * Generates a statement which updates the local variable representing `protoRec` with the current
     * value of the record. Used by property bindings.
     */
    genPropertyBindingEvalValue(protoRec: ProtoRecord): string;
    /**
     * Generates a statement which updates the local variable representing `protoRec` with the current
     * value of the record. Used by event bindings.
     */
    genEventBindingEvalValue(eventRecord: any, protoRec: ProtoRecord): string;
    private _genEvalValue(protoRec, getLocalName, localsAccessor);
    genPropertyBindingTargets(propertyBindingTargets: BindingTarget[], genDebugInfo: boolean): string;
    genDirectiveIndices(directiveRecords: DirectiveRecord[]): string;
    genHydrateDirectives(directiveRecords: DirectiveRecord[]): string;
    genDirectivesOnDestroy(directiveRecords: DirectiveRecord[]): string;
    private _genEventHandler(boundElementIndex, eventName);
    private _genReadDirective(index);
    genHydrateDetectors(directiveRecords: DirectiveRecord[]): string;
    genContentLifecycleCallbacks(directiveRecords: DirectiveRecord[]): string[];
    genViewLifecycleCallbacks(directiveRecords: DirectiveRecord[]): string[];
}
