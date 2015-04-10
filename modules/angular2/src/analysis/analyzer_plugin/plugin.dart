library angular2.src.analysis.analyzer_plugin;

import 'package:analyzer/plugin/plugin.dart';

/// Contribute a plugin to the dart analyzer for analysis of
/// Angular 2 dart code.
class AngularAnalyzerPlugin implements Plugin {

  /// the unique indetifier for this plugin
  static const String UNIQUE_IDENTIFIER = 'angular2.analysis';

  @override
  String get uniqueIdentifier => UNIQUE_IDENTIFIER;

  @override
  void registerExtensionPoints(RegisterExtensionPoint registerExtensionPoint) {}

  @override
  void registerExtensions(RegisterExtension registerExtension) {
    // TODO(keerti): register extension for analysis
  }
}
