library angular2.transform.directive_metadata_extractor.extractor;

import 'dart:async';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/render/api.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_deps.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/assets.dart';

/// Returns a map from a class name (that is, its `Identifier` stringified)
/// to [DirectiveMetadata] for all `Directive`-annotated classes  visible
/// in a file importing `entryPoint`. That is, this includes all
/// `Directive` annotated classes in `entryPoint` and any assets which it
/// `export`s.
/// Returns `null` if there are no `Directive`-annotated classes in
/// `entryPoint`.
Future<Map<String, DirectiveMetadata>> extractDirectiveMetadata(
    AssetReader reader, AssetId entryPoint) async {
  return _extractDirectiveMetadataRecursive(reader, entryPoint);
}

var _nullFuture = new Future.value(null);

Future<Map<String, DirectiveMetadata>> _extractDirectiveMetadataRecursive(
    AssetReader reader, AssetId entryPoint) async {
  if (!(await reader.hasInput(entryPoint))) return null;

  var ngDeps = await NgDeps.parse(reader, entryPoint);
  var baseMap = _metadataMapFromNgDeps(ngDeps);

  return Future.wait(ngDeps.exports.map((export) {
    var uri = stringLiteralToString(export.uri);
    if (uri.startsWith('dart:')) return _nullFuture;

    uri = toDepsExtension(uri);
    var assetId = uriToAssetId(entryPoint, uri, logger, null /* span */,
        errorOnAbsolute: false);
    if (assetId == entryPoint) return _nullFuture;
    return _extractDirectiveMetadataRecursive(reader, assetId)
        .then((exportMap) {
      if (exportMap != null) {
        if (baseMap == null) {
          baseMap = exportMap;
        } else {
          baseMap.addAll(exportMap);
        }
      }
    });
  })).then((_) => baseMap);
}

Map<String, DirectiveMetadata> _metadataMapFromNgDeps(NgDeps ngDeps) {
  if (ngDeps == null || ngDeps.registeredTypes.isEmpty) return null;
  var retVal = <String, DirectiveMetadata>{};
  ngDeps.registeredTypes.forEach((rType) {
    if (rType.directiveMetadata != null) {
      retVal['${rType.typeName}'] = rType.directiveMetadata;
    }
  });
  return retVal;
}
