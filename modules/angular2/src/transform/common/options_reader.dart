library angular2.transform.common.options_reader;

import 'package:barback/barback.dart';
import 'annotation_matcher.dart';
import 'mirror_mode.dart';
import 'options.dart';

TransformerOptions parseBarbackSettings(BarbackSettings settings) {
  var config = settings.configuration;
  var entryPoints = _readFileList(config, ENTRY_POINT_PARAM);
  var reflectionEntryPoints =
      _readFileList(config, REFLECTION_ENTRY_POINT_PARAM);
  var initReflector =
      _readBool(config, INIT_REFLECTOR_PARAM, defaultValue: true);
  var generateChangeDetectors =
      _readBool(config, GENERATE_CHANGE_DETECTORS_PARAM, defaultValue: true);
  String mirrorModeVal =
      config.containsKey(MIRROR_MODE_PARAM) ? config[MIRROR_MODE_PARAM] : '';
  var mirrorMode = MirrorMode.none;
  switch (mirrorModeVal) {
    case 'debug':
      mirrorMode = MirrorMode.debug;
      break;
    case 'verbose':
      mirrorMode = MirrorMode.verbose;
      break;
    default:
      mirrorMode = MirrorMode.none;
      break;
  }
  var optimizationPhases = _readInt(config, OPTIMIZATION_PHASES_PARAM,
      defaultValue: DEFAULT_OPTIMIZATION_PHASES);
  return new TransformerOptions(entryPoints,
      reflectionEntryPoints: reflectionEntryPoints,
      modeName: settings.mode.name,
      mirrorMode: mirrorMode,
      initReflector: initReflector,
      customAnnotationDescriptors: _readCustomAnnotations(config),
      optimizationPhases: optimizationPhases,
      generateChangeDetectors: generateChangeDetectors);
}

bool _readBool(Map config, String paramName, {bool defaultValue}) {
  return config.containsKey(paramName)
      ? config[paramName] != false
      : defaultValue;
}

/// Cribbed from the polymer project.
/// {@link https://github.com/dart-lang/polymer-dart}
List<String> _readFileList(Map config, String paramName) {
  var value = config[paramName];
  if (value == null) return null;
  var files = [];
  bool error = false;
  if (value is List) {
    files = value;
    error = value.any((e) => e is! String);
  } else if (value is String) {
    files = [value];
    error = false;
  } else {
    error = true;
  }
  if (error) {
    print('Invalid value for "$paramName" in the Angular 2 transformer.');
  }
  return files;
}

int _readInt(Map config, String paramName, {int defaultValue: null}) {
  if (!config.containsKey(paramName)) return defaultValue;
  var value = config[paramName];
  if (value is String) {
    value = int.parse(value);
  }
  if (value is! int) {
    throw new ArgumentError.value(value, paramName, 'Expected an integer');
  }
  return value;
}

/// Parse the [CUSTOM_ANNOTATIONS_PARAM] options out of the transformer into
/// [AnnotationDescriptor]s.
List<AnnotationDescriptor> _readCustomAnnotations(Map config) {
  var descriptors = [];
  var customAnnotations = config[CUSTOM_ANNOTATIONS_PARAM];
  if (customAnnotations == null) return descriptors;
  var error = false;
  if (customAnnotations is! List) {
    error = true;
  } else {
    for (var description in customAnnotations) {
      if (description is! Map) {
        error = true;
        continue;
      }
      var name = description['name'];
      var import = description['import'];
      var superClass = description['superClass'];
      if (name == null || import == null || superClass == null) {
        error = true;
        continue;
      }
      descriptors.add(new AnnotationDescriptor(name, import, superClass));
    }
  }
  if (error) {
    print(CUSTOM_ANNOTATIONS_ERROR);
  }
  return descriptors;
}

const CUSTOM_ANNOTATIONS_ERROR = '''
  Invalid value for $CUSTOM_ANNOTATIONS_PARAM in the Angular2 transformer.
  Expected something that looks like the following:

  transformers:
  - angular2:
      custom_annotations:
        - name: MyAnnotation
          import: 'package:my_package/my_annotation.dart'
          superClass: Component
        - name: ...
          import: ...
          superClass: ...''';
