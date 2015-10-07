library angular2.transform.directive_metadata_linker.linker;

import 'dart:async';
import 'dart:convert';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:angular2/src/transform/common/url_resolver.dart';
import 'package:barback/barback.dart';

import 'ng_deps_linker.dart';

/// Returns [NgMeta] associated with [entryPoint] combined with the [NgMeta] of
/// all files `export`ed from the original file.
///
/// This includes entries for every `Directive`-annotated class and
/// constants that match the directive-aliases pattern.
///
/// There are entries for each of these which is visible from a file importing
/// the original .dart file that produced `entryPoint`. That is, this includes
/// all `Directive` annotated public classes in that file, all `DirectiveAlias`
/// annotated public variables, and any of those entries which are visible from
/// files which the .dart file `export`ed.
///
/// Returns an empty [NgMeta] if there are no `Directive`-annotated classes or
/// `DirectiveAlias` annotated constants in `entryPoint`.
Future<NgMeta> linkDirectiveMetadata(
    AssetReader reader, AssetId assetId) async {
  var ngMeta = await _readNgMeta(reader, assetId);
  if (ngMeta == null || ngMeta.isEmpty) return null;

  await Future.wait([
    linkNgDeps(ngMeta.ngDeps, reader, assetId, _urlResolver),
    logElapsedAsync(() async {
      await _linkRecursive(ngMeta, reader, assetId, new Set<String>());
      return ngMeta;
    }, operationName: 'linkDirectiveMetadata', assetId: assetId)
  ]);
  return ngMeta;
}

Future<NgMeta> _readNgMeta(AssetReader reader, AssetId ngMetaAssetId) async {
  if (!(await reader.hasInput(ngMetaAssetId))) return null;

  var ngMetaJson = await reader.readAsString(ngMetaAssetId);
  if (ngMetaJson == null || ngMetaJson.isEmpty) return null;

  return new NgMeta.fromJson(JSON.decode(ngMetaJson));
}

final _urlResolver = const TransformerUrlResolver();

Future _linkRecursive(NgMeta ngMeta, AssetReader reader, AssetId assetId,
    Set<String> seen) async {
  if (ngMeta == null ||
      ngMeta.ngDeps == null ||
      ngMeta.ngDeps.exports == null) {
    return ngMeta;
  }
  var assetUri = toAssetUri(assetId);

  return Future.wait(ngMeta.ngDeps.exports
      .where((export) => !isDartCoreUri(export.uri))
      .map((export) =>
          _urlResolver.resolve(assetUri, toMetaExtension(export.uri)))
      .where((uri) => !seen.contains(uri))
      .map((uri) async {
    seen.add(uri);
    try {
      final exportAssetId = fromUri(uri);
      final exportNgMeta = await _readNgMeta(reader, exportAssetId);
      if (exportNgMeta != null) {
        await _linkRecursive(exportNgMeta, reader, exportAssetId, seen);
        ngMeta.addAll(exportNgMeta);
      }
    } catch (err, st) {
      // Log and continue.
      logger.warning('Failed to fetch $uri. Message: $err.\n$st');
    }
  }));
}
