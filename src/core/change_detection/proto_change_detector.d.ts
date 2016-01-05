import { ChangeDetector, ProtoChangeDetector, ChangeDetectorDefinition } from './interfaces';
import { BindingRecord } from './binding_record';
import { EventBinding } from './event_binding';
import { ProtoRecord } from './proto_record';
export declare class DynamicProtoChangeDetector implements ProtoChangeDetector {
    private _definition;
    constructor(_definition: ChangeDetectorDefinition);
    instantiate(dispatcher: any): ChangeDetector;
}
export declare function createPropertyRecords(definition: ChangeDetectorDefinition): ProtoRecord[];
export declare function createEventRecords(definition: ChangeDetectorDefinition): EventBinding[];
export declare class ProtoRecordBuilder {
    records: ProtoRecord[];
    add(b: BindingRecord, variableNames: string[], bindingIndex: number): void;
}
