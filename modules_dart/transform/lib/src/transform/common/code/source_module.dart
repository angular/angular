library angular2.transform.common.code.source_module;

import 'package:angular2/src/compiler/source_module.dart';

import 'uri.dart';

/// Writes the full Dart code for the provided [SourceModule].
String writeSourceModule(SourceModule sourceModule, {String libraryName}) {
  if (sourceModule == null) return null;
  var buf = new StringBuffer();
  var sourceWithImports = sourceModule.getSourceWithImports();
  var libraryName = _getLibName(sourceModule.moduleUrl);
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
String _getLibName(String moduleUrl) {
  // TODO(tbosch): use `.replaceAll('/', '.')` here as well
  // Also: replaceAll('asset:', '').
  // Right now, this fails in some cases with Dart2Js, e.g.
  // (Error 'switch' is a reserved word and can't be used here.
  //  library angular2_material.lib.src.components.switcher.switch.template.dart;)
  return moduleUrl.replaceAll(_unsafeCharsPattern, '_');
}
