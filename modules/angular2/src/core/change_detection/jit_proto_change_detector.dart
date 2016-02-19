library change_detection.jit_proto_change_detector;

import 'interfaces.dart' show ChangeDetector, ProtoChangeDetector;

class JitProtoChangeDetector implements ProtoChangeDetector {
  JitProtoChangeDetector(definition);

  static bool isSupported() => false;

  ChangeDetector instantiate() {
    throw "Jit Change Detection not supported in Dart";
  }
}
