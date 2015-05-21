library angular2.src.change_detection.pregen_proto_change_detector;

import 'package:angular2/src/change_detection/coalesce.dart';
import 'package:angular2/src/change_detection/directive_record.dart';
import 'package:angular2/src/change_detection/interfaces.dart';
import 'package:angular2/src/change_detection/pipes/pipe_registry.dart';
import 'package:angular2/src/change_detection/proto_change_detector.dart';
import 'package:angular2/src/change_detection/proto_record.dart';

export 'dart:core' show List;
export 'package:angular2/src/change_detection/abstract_change_detector.dart'
    show AbstractChangeDetector;
export 'package:angular2/src/change_detection/directive_record.dart'
    show DirectiveIndex, DirectiveRecord;
export 'package:angular2/src/change_detection/interfaces.dart'
    show ChangeDetector, ChangeDetectorDefinition, ProtoChangeDetector;
export 'package:angular2/src/change_detection/pipes/pipe_registry.dart'
    show PipeRegistry;
export 'package:angular2/src/change_detection/proto_record.dart'
    show ProtoRecord;
export 'package:angular2/src/change_detection/change_detection_util.dart'
    show ChangeDetectionUtil;
export 'package:angular2/src/facade/lang.dart' show looseIdentical;

typedef ChangeDetector InstantiateMethod(dynamic dispatcher,
    PipeRegistry registry, List<ProtoRecord> protoRecords,
    List<DirectiveRecord> directiveRecords);

class PregenProtoChangeDetector extends ProtoChangeDetector {
  final String id;
  final InstantiateMethod _instantiateMethod;
  final PipeRegistry _pipeRegistry;
  final List<ProtoRecord> _protoRecords;
  final List<DirectiveRecord> _directiveRecords;

  /// Internal ctor.
  PregenProtoChangeDetector._(this.id, this._instantiateMethod,
      this._pipeRegistry, this._protoRecords, this._directiveRecords);

  /// Provides a ProtoChangeDetector to be used by pre-generated change
  /// detectors in Angular 2 Dart.
  factory PregenProtoChangeDetector(InstantiateMethod instantiateMethod,
      PipeRegistry registry, ChangeDetectorDefinition def) {
    var recordBuilder = new ProtoRecordBuilder();
    def.bindingRecords.forEach((b) {
      recordBuilder.addAst(b, def.variableNames);
    });
    var protoRecords = coalesce(recordBuilder.records);
    return new PregenProtoChangeDetector._(def.id, instantiateMethod, registry,
        protoRecords, def.directiveRecords);
  }

  @override
  instantiate(dynamic dispatcher) => _instantiateMethod(
      dispatcher, _pipeRegistry, _protoRecords, _directiveRecords);
}
