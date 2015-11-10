library angular2.src.core.change_detection.event_binding;

import "directive_record.dart" show DirectiveIndex;
import "proto_record.dart" show ProtoRecord;

class EventBinding {
  String eventName;
  num elIndex;
  DirectiveIndex dirIndex;
  List<ProtoRecord> records;
  EventBinding(this.eventName, this.elIndex, this.dirIndex, this.records) {}
}
