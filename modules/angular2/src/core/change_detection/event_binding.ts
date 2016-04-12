import {DirectiveIndex} from './directive_record';
import {ProtoRecord} from './proto_record';

export class EventBinding {
  constructor(public eventName: string, public elIndex: number, public dirIndex: DirectiveIndex,
              public records: ProtoRecord[]) {}
}