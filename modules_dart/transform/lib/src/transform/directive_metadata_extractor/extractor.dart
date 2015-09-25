library angular2.transform.directive_metadata_extractor.extractor;

import 'dart:async';
import 'dart:convert';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_deps.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/assets.dart';

/// Returns [NgMeta] associated with [entryPoint].
///
/// This includes entries for every `Directive`-annotated classes and
/// constants that match the directive-aliases pattern, which are visible in a
/// file importing `entryPoint`.  That is, this includes all `Directive`
/// annotated public classes in `entryPoint`, all `DirectiveAlias` annotated
/// public variables, and any assets which it `export`s.  Returns an empty
/// [NgMeta] if there are no `Directive`-annotated classes in `entryPoint`.
Future<NgMeta> extractDirectiveMetadata(
    AssetReader reader, AssetId entryPoint) {
  return _extractDirectiveMetadataRecursive(
      reader, entryPoint, new Set<AssetId>());
}

final _nullFuture = new Future.value(null);

Future<NgMeta> _extractDirectiveMetadataRecursive(
    AssetReader reader, AssetId entryPoint, Set<AssetId> seen) async {
  if (seen.contains(entryPoint)) return _nullFuture;
  seen.add(entryPoint);
  var ngMeta = new NgMeta.empty();
  if (!(await reader.hasInput(entryPoint))) return ngMeta;

  var ngDeps = await NgDeps.parse(reader, entryPoint);
  _extractMetadata(ngDeps, ngMeta);

  var aliasesFile =
      new AssetId(entryPoint.package, toAliasExtension(entryPoint.path));

  if (await reader.hasInput(aliasesFile)) {
    ngMeta.addAll(new NgMeta.fromJson(
        JSON.decode(await reader.readAsString(aliasesFile))));
  }

  await Future.wait(ngDeps.exports.map((export) {
    var uri = stringLiteralToString(export.uri);
    if (uri.startsWith('dart:')) return _nullFuture;

    uri = toDepsExtension(uri);
    var assetId = uriToAssetId(entryPoint, uri, logger, null /* span */,
        errorOnAbsolute: false);
    if (assetId == entryPoint) return _nullFuture;
    return _extractDirectiveMetadataRecursive(reader, assetId, seen)
        .then((exportedNgMeta) {
      if (exportedNgMeta != null) {
        ngMeta.addAll(exportedNgMeta);
      }
    });
  }));
  return ngMeta;
}

// TODO(sigmund): rather than having to parse it from generated code. we should
// be able to produce directly all information we need for ngMeta.
void _extractMetadata(NgDeps ngDeps, NgMeta ngMeta) {
  if (ngDeps == null) return;
  ngDeps.registeredTypes.forEach((type) {
    ngMeta.types[type.typeName.name] = type.directiveMetadata;
  });
}
