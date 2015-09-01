library angular2.transform.common.code.import_export_code;

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/common/model/import_export_model.dart';

/// Visitor responsible for parsing [ImportDirective]s into [ImportModel]s.
class ImportVisitor extends Object with SimpleAstVisitor<ImportModel> {
  @override
  ImportModel visitImportDirective(ImportDirective node) {
    if (node.isSynthetic) return null;

    var prefix = node.prefix != null ? node.prefix.name : '';
    var showCombinators = [], hideCombinators = [];
    _populateCombinators(node, showCombinators, hideCombinators);
    return new ImportModel(stringLiteralToString(node.uri),
        prefix: prefix,
        isDeferred: node.deferredKeyword != null,
        showCombinators: showCombinators,
        hideCombinators: hideCombinators);
  }
}

/// Visitor responsible for parsing [ExportDirective]s into [ExportModel]s.
class ExportVisitor extends Object with SimpleAstVisitor<ExportModel> {
  @override
  ExportModel visitExportDirective(ExportDirective node) {
    if (node.isSynthetic) return null;

    var showCombinators = [], hideCombinators = [];
    _populateCombinators(node, showCombinators, hideCombinators);

    return new ExportModel(stringLiteralToString(node.uri),
        showCombinators: showCombinators, hideCombinators: hideCombinators);
  }
}

void _populateCombinators(NamespaceDirective node, List<String> showCombinators,
    List<String> hideCombinators) {
  if (node.combinators != null) {
    node.combinators.forEach((c) {
      if (c is ShowCombinator) {
        showCombinators.addAll(c.shownNames.map((id) => '$id'));
      } else if (c is HideCombinator) {
        hideCombinators.addAll(c.hiddenNames.map((id) => '$id'));
      }
    });
  }
}

/// Class to be used as a mixin to allow writing [ImportModel]s to Dart code.
class ImportWriterMixin {
  StringBuffer buffer;

  void writeImportModel(ImportModel model) {
    buffer.write("import '${model.uri}'");
    if (model.isDeferred) {
      buffer.write(' deferred');
    }
    if (model.prefix != null && model.prefix.isNotEmpty) {
      buffer.write(' as ${model.prefix}');
    }
    _writeCombinators(buffer, model);
    buffer.writeln(';');
  }
}

/// Class to be used as a mixin to allow writing [ExportModel]s to Dart code.
class ExportWriterMixin {
  StringBuffer buffer;

  void writeExportModel(ExportModel model) {
    buffer.write("export '${model.uri}'");
    _writeCombinators(buffer, model);
    buffer.writeln(';');
  }
}

void _writeCombinators(StringBuffer buffer, ImportOrExportModel model) {
  if (model.showCombinators != null && model.showCombinators.isNotEmpty) {
    buffer.write(' show ');
    for (var i = 0; i < model.showCombinators.length; ++i) {
      if (i != 0) {
        buffer.write(', ');
      }
      buffer.write(model.showCombinators[i]);
    }
  }
  if (model.hideCombinators != null && model.hideCombinators.isNotEmpty) {
    buffer.write(' hide ');
    for (var i = 0; i < model.hideCombinators.length; ++i) {
      if (i != 0) {
        buffer.write(', ');
      }
      buffer.write(model.hideCombinators[i]);
    }
  }
}
