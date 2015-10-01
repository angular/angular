library angular2.transform.common.code.reflection_info_code;

import 'package:angular2/src/compiler/source_module.dart';

import 'uri.dart';

/// Writes the full Dart code for the provided [SourceModule].
///
/// If `libraryName` is provided, the generated source will be generated with
/// the approprate "library" directive.
String writeSourceModule(SourceModule sourceModule, {String libraryName}) {
  if (sourceModule == null) return null;
  var buf = new StringBuffer();
  var sourceWithImports = sourceModule.getSourceWithImports();

  if (libraryName != null && libraryName.isNotEmpty) {
    buf..writeln('library $libraryName;')..writeln();
  }
  sourceWithImports.imports.forEach((import) {
    // Format for importLine := [uri, prefix]
    if (import.length != 2) {
      throw new FormatException(
          'Unexpected import format! '
          'Angular 2 compiler returned imports in an unexpected format. '
          'Expected [<import_uri>, <prefix>].',
          import.join(', '));
    }
    buf.writeln(writeImportUri(import[0],
        prefix: import[1], fromAbsolute: sourceModule.moduleUrl));
  });
  buf..writeln()..writeln(sourceWithImports.source);

  return buf.toString();
}
