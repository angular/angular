library angular2.src.analysis.server_plugin;

import 'package:analyzer/plugin/plugin.dart';

/// Contribute a plugin for services such as completions, indexing and refactoring
/// of Angular 2 dart code.
class AngularServerPlugin implements Plugin {

  /// the unique indetifier for this plugin
  static const String UNIQUE_IDENTIFIER = 'angular2.analysis.services';

  @override
  String get uniqueIdentifier => UNIQUE_IDENTIFIER;

  @override
  void registerExtensionPoints(RegisterExtensionPoint registerExtensionPoint) {}

  @override
  void registerExtensions(RegisterExtension registerExtension) {
    // TODO: register extension for code completions, indexing etc

  }
}
