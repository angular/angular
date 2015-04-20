library angular2.transform.common.options;

import 'mirror_mode.dart';

const ENTRY_POINT_PARAM = 'entry_points';
const REFLECTION_ENTRY_POINT_PARAM = 'reflection_entry_points';

/// Provides information necessary to transform an Angular2 app.
class TransformerOptions {
  /// The path to the files where the application's calls to `bootstrap` are.
  final List<String> entryPoints;

  /// The paths to the files where the application's {@link ReflectionCapabilities}
  /// are set.
  final List<String> reflectionEntryPoints;

  /// The `BarbackMode#name` we are running in.
  final String modeName;

  /// The [MirrorMode] to use for the transformation.
  final MirrorMode mirrorMode;

  /// Whether to generate calls to our generated `initReflector` code
  final bool initReflector;

  TransformerOptions._internal(this.entryPoints, this.reflectionEntryPoints,
      this.modeName, this.mirrorMode, this.initReflector);

  factory TransformerOptions(List<String> entryPoints,
      {List<String> reflectionEntryPoints, String modeName: 'release',
      MirrorMode mirrorMode: MirrorMode.none, bool initReflector: true}) {
    if (reflectionEntryPoints == null || reflectionEntryPoints.isEmpty) {
      reflectionEntryPoints = entryPoints;
    }
    return new TransformerOptions._internal(entryPoints, reflectionEntryPoints,
        modeName, mirrorMode, initReflector);
  }
}
