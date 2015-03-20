library angular2.transform.directive_linker.linker;

import 'dart:async';

import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ngdata.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/assets.dart';
import 'package:dart_style/dart_style.dart';
import 'package:path/path.dart' as path;

Future<String> linkNgDeps(Transform transform, String code, String path) async {
  var commentIdx = code.lastIndexOf('//');
  if (commentIdx < 0) return code;

  var ngData = new NgData.fromJson(code.substring(commentIdx + 2));

  StringBuffer importBuf =
      new StringBuffer(code.substring(0, ngData.importOffset));
  StringBuffer declarationBuf = new StringBuffer(
      code.substring(ngData.importOffset, ngData.registerOffset));
  String tail = code.substring(ngData.registerOffset, commentIdx);

  var ngDeps = await _processNgImports(transform, ngData.imports);

  for (var i = 0; i < ngDeps.length; ++i) {
    importBuf.write('import \'${ngDeps[i]}\' as i${i};');
    declarationBuf.write('i${i}.${SETUP_METHOD_NAME}(${REFLECTOR_VAR_NAME});');
  }

  return '${importBuf}${declarationBuf}${tail}';
}

String _toDepsUri(String importUri) =>
    '${path.withoutExtension(importUri)}${DEPS_EXTENSION}';

bool _isNotDartImport(String importUri) {
  return !importUri.startsWith('dart:');
}

Future<List<String>> _processNgImports(
    Transform transform, List<String> imports) async {
  var retVal = <String>[];

  return Future
      .wait(imports.where(_isNotDartImport).map(_toDepsUri).map((ngDepsUri) {
    var importAsset = uriToAssetId(
        transform.primaryInput.id, ngDepsUri, logger, null /* span */);
    return transform.hasInput(importAsset).then((hasInput) {
      if (hasInput) {
        retVal.add(ngDepsUri);
      }
    });
  })).then((_) => retVal);
}
