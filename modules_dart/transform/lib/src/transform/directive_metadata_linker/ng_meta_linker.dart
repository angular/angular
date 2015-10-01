library angular2.transform.directive_metadata_linker.linker;

import 'dart:async';
import 'dart:convert';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:angular2/src/transform/common/url_resolver.dart';
import 'package:angular2/src/transform/common/xhr_impl.dart';
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
    AssetReader reader, AssetId entryPoint) async {
  var ngMeta = await _readNgMeta(reader, entryPoint);
  if (ngMeta == null || ngMeta.isEmpty) return null;

  final xhr = new XhrImpl(reader);
  final entryPointAssetUri = toAssetUri(entryPoint);

  await Future.wait([
    linkNgDeps(xhr, _urlResolver, entryPointAssetUri, ngMeta.ngDeps),
    _linkDirectiveMetadataRecursive(
        ngMeta, xhr, entryPointAssetUri, new Set<String>())
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

Future<NgMeta> _linkDirectiveMetadataRecursive(
    NgMeta ngMeta, XhrImpl xhr, String moduleUrl, Set<String> seen) async {
  if (ngMeta == null ||
      ngMeta.ngDeps == null ||
      ngMeta.ngDeps.exports == null) {
    return ngMeta;
  }

  return Future
      .wait(ngMeta.ngDeps.exports
          .where((export) => !isDartCoreUri(export.uri))
          .map((export) =>
              _urlResolver.resolve(moduleUrl, toMetaExtension(export.uri)))
          .where((uri) => !seen.contains(uri))
          .map((uri) async {
    seen.add(uri);
    try {
      if (await xhr.exists(uri)) {
        var exportNgMetaJson = await xhr.get(uri);
        if (exportNgMetaJson == null) return null;
        var exportNgMeta = new NgMeta.fromJson(JSON.decode(exportNgMetaJson));
        await _linkDirectiveMetadataRecursive(exportNgMeta, xhr, uri, seen);
        if (exportNgMeta != null) {
          ngMeta.addAll(exportNgMeta);
        }
      }
    } catch (err, st) {
      // Log and continue.
      logger.warning('Failed to fetch $uri. Message: $err.\n$st');
    }
  }))
      .then((_) => ngMeta);
}
