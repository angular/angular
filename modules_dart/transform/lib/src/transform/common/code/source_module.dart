library angular2.transform.common.code.source_module;

import 'package:analyzer/src/generated/scanner.dart' show Keyword;
import 'package:angular2/src/compiler/source_module.dart';

import 'uri.dart';

/// Writes the full Dart code for the provided [SourceModule].
String writeSourceModule(SourceModule sourceModule, {String libraryName}) {
  if (sourceModule == null) return null;
  var buf = new StringBuffer();
  var sourceWithImports = sourceModule.getSourceWithImports();
  libraryName = _sanitizeLibName(
      libraryName != null ? libraryName : sourceModule.moduleUrl);
  buf..writeln('library $libraryName;')..writeln();
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

final _unsafeCharsPattern = new RegExp(r'[^a-zA-Z0-9_\.]');
String _sanitizeLibName(String moduleUrl) {
  var sanitized =
      moduleUrl.replaceAll(_unsafeCharsPattern, '_').replaceAll('/', '.');
  for (var keyword in Keyword.values) {
    sanitized.replaceAll(keyword.syntax, '${keyword.syntax}_');
  }
  return sanitized;
}
