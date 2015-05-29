library angular2.transform.common.options;

import 'annotation_matcher.dart';
import 'mirror_mode.dart';

/// See `optimizationPhases` below for an explanation.
const DEFAULT_OPTIMIZATION_PHASES = 5;

const CUSTOM_ANNOTATIONS_PARAM = 'custom_annotations';
const ENTRY_POINT_PARAM = 'entry_points';
const GENERATE_CHANGE_DETECTORS_PARAM = 'generate_change_detectors';
const INIT_REFLECTOR_PARAM = 'init_reflector';
const MIRROR_MODE_PARAM = 'mirror_mode';
const OPTIMIZATION_PHASES_PARAM = 'optimization_phases';
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

  /// The [AnnotationMatcher] which is used to identify angular annotations.
  final AnnotationMatcher annotationMatcher;

  /// Whether to create change detector classes for discovered `@View`s.
  final bool generateChangeDetectors;

  /// The number of phases to spend optimizing output size.
  /// Each additional phase adds time to the transformation but may decrease
  /// final output size. There is a limit beyond which this will no longer
  /// decrease size, that is, setting this to 20 may not decrease size any
  /// more than setting it to 10, but you will still pay an additional
  /// penalty in transformation time.
  /// The "correct" number of phases varies with the structure of the app.
  final int optimizationPhases;

  TransformerOptions._internal(this.entryPoints, this.reflectionEntryPoints,
      this.modeName, this.mirrorMode, this.initReflector,
      this.annotationMatcher, this.optimizationPhases,
      this.generateChangeDetectors);

  factory TransformerOptions(List<String> entryPoints,
      {List<String> reflectionEntryPoints, String modeName: 'release',
      MirrorMode mirrorMode: MirrorMode.none, bool initReflector: true,
      List<AnnotationDescriptor> customAnnotationDescriptors: const [],
      int optimizationPhases: DEFAULT_OPTIMIZATION_PHASES,
      bool generateChangeDetectors: true}) {
    if (reflectionEntryPoints == null || reflectionEntryPoints.isEmpty) {
      reflectionEntryPoints = entryPoints;
    }
    var annotationMatcher = new AnnotationMatcher()
      ..addAll(customAnnotationDescriptors);
    optimizationPhases = optimizationPhases.isNegative ? 0 : optimizationPhases;
    return new TransformerOptions._internal(entryPoints, reflectionEntryPoints,
        modeName, mirrorMode, initReflector, annotationMatcher,
        optimizationPhases, generateChangeDetectors);
  }
}
