library angular2.transform.common.code.source_module;

import 'package:angular2/src/compiler/source_module.dart';
import 'package:analyzer/src/generated/scanner.dart' show Keyword;
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';
import 'package:angular2/src/transform/common/model/source_module.dart';

import 'ng_deps_code.dart';

/// Writes the full Dart code for the provided [SourceModule].
String writeSourceModule(SourceModule sourceModule, {String libraryName}) {
  if (sourceModule == null) return null;
  var buf = new StringBuffer();
  final writer = new NgDepsWriter(buf);
  var sourceWithImports = sourceModule.getSourceWithImports();
  libraryName = _sanitizeLibName(
      libraryName != null ? libraryName : sourceModule.moduleUrl);
  buf..writeln('library $libraryName;')..writeln();

  extractImports(sourceWithImports, sourceModule.moduleUrl).forEach((import) {
    writer.writeImportModel(import);
  });
  buf..writeln()..writeln(sourceWithImports.source);

  return buf.toString();
}

/// Uses `writer` to write a Dart library representing `model` and
/// `sourceModule`.
void writeTemplateFile(
    NgDepsWriterMixin writer, NgDepsModel model, SourceModule sourceModule) {
  if (model == null) return null;
  var sourceModuleCode = '';
  if (sourceModule != null) {
    var sourceWithImports = sourceModule.getSourceWithImports();
    sourceModuleCode = sourceWithImports.source;

    // Since we modify `imports`, make a copy to avoid changing the provided
    // value.
    var sourceModuleImports =
        extractImports(sourceWithImports, sourceModule.moduleUrl);
    model = model.clone();
    model.imports.addAll(sourceModuleImports);
  }
  writer.writeNgDepsModel(model);
  writer.buffer..writeln()..writeln(sourceModuleCode);
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
