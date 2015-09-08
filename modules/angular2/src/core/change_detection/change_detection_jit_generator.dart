library change_detection.change_detection_jit_generator;

/// Placeholder JIT generator for Dart.
/// Dart does not support `eval`, so JIT generation is not an option. Instead,
/// the Dart transformer pre-generates these Change Detector classes and
/// registers them with the system. See `PreGeneratedChangeDetection`,
/// `PregenProtoChangeDetector`, and
/// `src/transform/template_compiler/change_detector_codegen.dart` for details.
class ChangeDetectorJITGenerator {
  String typeName;
  ChangeDetectorJITGenerator(definition, changeDetectionUtilVarName, abstractChangeDetectorVarName) {}

  generate() {
    throw "Jit Change Detection is not supported in Dart";
  }

  generateSource() {
    throw "Jit Change Detection is not supported in Dart";
  }

  static bool isSupported() => false;
}
