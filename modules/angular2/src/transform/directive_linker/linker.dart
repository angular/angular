library angular2.transform.directive_linker.linker;

import 'dart:async';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/parser.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/assets.dart';
import 'package:path/path.dart' as path;

Future<String> linkNgDeps(AssetReader reader, AssetId entryPoint) async {
  var parser = new Parser(reader);
  NgDeps ngDeps = await parser.parse(entryPoint);

  if (ngDeps == null) return null;
  if (ngDeps.imports.isEmpty) return ngDeps.code;

  var allDeps = ngDeps.imports.toList()..addAll(ngDeps.exports);
  var depList = await _processNgImports(
      reader, entryPoint, allDeps.map((node) => node.uri.stringValue));

  if (depList.isEmpty) return ngDeps.code;

  var importBuf = new StringBuffer();
  var declarationBuf = new StringBuffer();
  for (var i = 0; i < depList.length; ++i) {
    importBuf.write('''
        import '${depList[i]}' as i${i};
    ''');
    declarationBuf.write('i${i}.${SETUP_METHOD_NAME}(${REFLECTOR_VAR_NAME});');
  }

  var code = ngDeps.code;
  var importSeamIdx = ngDeps.imports.last.end;
  var declarationSeamIdx = ngDeps.setupMethod.end - 1;
  return '${code.substring(0, importSeamIdx)}'
      '$importBuf'
      '${code.substring(importSeamIdx, declarationSeamIdx)}'
      '$declarationBuf'
      '${code.substring(declarationSeamIdx)}';
}

String _toDepsUri(String importUri) =>
    '${path.withoutExtension(importUri)}${DEPS_EXTENSION}';

bool _isNotDartImport(String importUri) {
  return !importUri.startsWith('dart:');
}

Future<List<String>> _processNgImports(
    AssetReader reader, AssetId entryPoint, Iterable<String> imports) {
  final nullFuture = new Future.value(null);
  var retVal = <String>[];
  return Future
      .wait(imports.where(_isNotDartImport).map(_toDepsUri).map((ngDepsUri) {
    var importAsset =
        uriToAssetId(entryPoint, ngDepsUri, logger, null /* span */);
    if (importAsset == entryPoint) return nullFuture;
    return reader.hasInput(importAsset).then((hasInput) {
      if (hasInput) retVal.add(ngDepsUri);
    });
  })).then((_) => retVal);
}
