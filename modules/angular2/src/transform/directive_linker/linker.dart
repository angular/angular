library angular2.transform.directive_linker.linker;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
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

  var allDeps = <UriBasedDirective>[]
    ..addAll(ngDeps.imports)
    ..addAll(ngDeps.exports)
    ..sort((a, b) => a.end.compareTo(b.end));
  var linkedDepsMap = await _processNgImports(reader, entryPoint, allDeps);

  if (linkedDepsMap.isEmpty) return ngDeps.code;

  var importBuf = new StringBuffer();
  var declarationBuf = new StringBuffer();
  var code = ngDeps.code;
  var codeIdx = 0;
  // Generate import statements for linked deps where necessary.
  for (var i = 0, it = allDeps.iterator; it.moveNext();) {
    if (linkedDepsMap.containsKey(it.current)) {
      importBuf.write(code.substring(codeIdx, it.current.end));
      codeIdx = it.current.end;
      importBuf.write('''
        import '${linkedDepsMap[it.current]}' as i${i};
      ''');
      declarationBuf
          .write('i${i}.${SETUP_METHOD_NAME}(${REFLECTOR_VAR_NAME});');
      ++i;
    }
  }

  var declarationSeamIdx = ngDeps.setupMethod.end - 1;
  return '$importBuf'
      '${code.substring(codeIdx, declarationSeamIdx)}'
      '$declarationBuf'
      '${code.substring(declarationSeamIdx)}';
}

String _toDepsUri(String importUri) =>
    '${path.withoutExtension(importUri)}${DEPS_EXTENSION}';

bool _isNotDartDirective(UriBasedDirective directive) {
  return !stringLiteralToString(directive.uri).startsWith('dart:');
}

/// Maps each input {@link UriBasedDirective} to its associated `.ng_deps.dart`
/// file, if it exists.
Future<Map<UriBasedDirective, String>> _processNgImports(AssetReader reader,
    AssetId entryPoint, Iterable<UriBasedDirective> directives) {
  final nullFuture = new Future.value(null);
  final retVal = <UriBasedDirective, String>{};
  return Future
      .wait(directives
          .where(_isNotDartDirective)
          .map((UriBasedDirective directive) {
    var ngDepsUri = _toDepsUri(stringLiteralToString(directive.uri));
    var ngDepsAsset = uriToAssetId(entryPoint, ngDepsUri, logger,
        null /*
    span */
        );
    if (ngDepsAsset == entryPoint) return nullFuture;
    return reader.hasInput(ngDepsAsset).then((hasInput) {
      if (hasInput) {
        retVal[directive] = ngDepsUri;
      }
    }, onError: (_) => null);
  })).then((_) => retVal);
}
