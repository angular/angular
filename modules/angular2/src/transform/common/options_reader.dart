library angular2.transform.common.options_reader;

import 'package:barback/barback.dart';
import 'options.dart';

TransformerOptions parseBarbackSettings(BarbackSettings settings) {
  var config = settings.configuration;
  var entryPoints = _readFileList(config, ENTRY_POINT_PARAM);
  var reflectionEntryPoints =
      _readFileList(config, REFLECTION_ENTRY_POINT_PARAM);
  return new TransformerOptions(entryPoints,
      reflectionEntryPoints: reflectionEntryPoints,
      modeName: settings.mode.name);
}

/// Cribbed from the polymer project.
/// [https://github.com/dart-lang/polymer-dart]
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
