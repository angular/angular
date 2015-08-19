library angular2.transform.reflection_remover.codegen;

import 'package:path/path.dart' as path;

import 'package:angular2/src/transform/common/names.dart';

class Codegen {
  static const _PREFIX_BASE = 'ngStaticInit';

  /// The prefix used to import our generated file.
  final String prefix;

  /// The import uris
  final Iterable<String> importUris;

  Codegen(String reflectionEntryPointPath, Iterable<String> newEntryPointPaths,
      {String prefix})
      : this.prefix = prefix == null ? _PREFIX_BASE : prefix,
        importUris = newEntryPointPaths.map((p) => path
            .relative(p, from: path.dirname(reflectionEntryPointPath))
            .replaceAll('\\', '/')) {
    if (this.prefix.isEmpty) throw new ArgumentError.value('(empty)', 'prefix');
  }

  /// Generates code to import the library containing the method which sets up
  /// Angular2 reflection statically.
  ///
  /// The code generated here should follow the example of code generated for
  /// an {@link ImportDirective} node.
  String codegenImport() {
    var count = 0;
    return importUris
        .map((importUri) => 'import \'${importUri}\' as ${prefix}${count++};')
        .join('');
  }

  /// Generates code to call the method which sets up Angular2 reflection
  /// statically.
  String codegenSetupReflectionCall() {
    var count = 0;
    return importUris
        .map((_) => '${prefix}${count++}.${SETUP_METHOD_NAME}();')
        .join('');
  }
}
