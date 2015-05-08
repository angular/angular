library angular2.transform.common.options;

import 'annotation_matcher.dart';
import 'mirror_mode.dart';

const ENTRY_POINT_PARAM = 'entry_points';
const REFLECTION_ENTRY_POINT_PARAM = 'reflection_entry_points';
const CUSTOM_ANNOTATIONS_PARAM = 'custom_annotations';

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

  /// The [AnnotationMatcher] which is used to identify angular annotations.
  final AnnotationMatcher annotationMatcher;

  TransformerOptions._internal(this.entryPoints, this.reflectionEntryPoints,
      this.modeName, this.mirrorMode, this.initReflector,
      this.annotationMatcher);

  factory TransformerOptions(List<String> entryPoints,
      {List<String> reflectionEntryPoints, String modeName: 'release',
      MirrorMode mirrorMode: MirrorMode.none, bool initReflector: true,
      List<AnnotationDescriptor> customAnnotationDescriptors: const []}) {
    if (reflectionEntryPoints == null || reflectionEntryPoints.isEmpty) {
      reflectionEntryPoints = entryPoints;
    }
    var annotationMatcher = new AnnotationMatcher()
      ..addAll(customAnnotationDescriptors);
    return new TransformerOptions._internal(entryPoints, reflectionEntryPoints,
        modeName, mirrorMode, initReflector, annotationMatcher);
  }
}
