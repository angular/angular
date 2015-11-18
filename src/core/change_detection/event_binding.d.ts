import { DirectiveIndex } from './directive_record';
import { ProtoRecord } from './proto_record';
export declare class EventBinding {
    eventName: string;
    elIndex: number;
    dirIndex: DirectiveIndex;
    records: ProtoRecord[];
    constructor(eventName: string, elIndex: number, dirIndex: DirectiveIndex, records: ProtoRecord[]);
}
