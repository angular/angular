library angular2.src.transform;

const entryPointParam = 'entry_point';
const reflectionEntryPointParam = 'reflection_entry_point';
const newEntryPointParam = 'new_entry_point';

/// Provides information necessary to transform an Angular2 app.
class TransformerOptions {
  /// The file where the application's call to [bootstrap] is.
  // TODO(kegluneq): Allow multiple entry points.
  final String entryPoint;

  /// The reflection entry point, that is, where the
  /// application's [ReflectionCapabilities] are set.
  final String reflectionEntryPoint;

  /// The path where we should generate code.
  final String newEntryPoint;

  TransformerOptions._internal(
      this.entryPoint, this.reflectionEntryPoint, this.newEntryPoint);

  factory TransformerOptions(String entryPoint,
      {String reflectionEntryPoint, String newEntryPoint}) {
    if (entryPoint == null || entryPoint.isEmpty) {
      throw new ArgumentError.notNull(entryPointParam);
    }
    if (reflectionEntryPoint == null || entryPoint.isEmpty) {
      reflectionEntryPoint = entryPoint;
    }
    if (newEntryPoint == null || newEntryPoint.isEmpty) {
      newEntryPoint =
          reflectionEntryPoint.replaceFirst('.dart', '.bootstrap.dart');
      if (newEntryPoint == reflectionEntryPoint) {
        newEntryPoint = 'bootstrap.${newEntryPoint}';
      }
    }
    return new TransformerOptions._internal(
        entryPoint, reflectionEntryPoint, newEntryPoint);
  }
}
