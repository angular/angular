library angular2.transform.directive_metadata_linker.linker;

import 'dart:async';
import 'dart:convert';

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/compiler/directive_metadata.dart';
import "package:angular2/src/core/change_detection/change_detection.dart"
    show ChangeDetectionStrategy;
import "package:angular2/src/core/compiler/interfaces.dart" show LifecycleHooks;
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/model/annotation_model.pb.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/assets.dart';

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
Future<NgMeta> linkDirectiveMetadata(AssetReader reader, AssetId entryPoint) {
  return _linkDirectiveMetadataRecursive(
      reader, entryPoint, new Set<AssetId>());
}

final _nullFuture = new Future.value(null);

Future<NgMeta> _linkDirectiveMetadataRecursive(
    AssetReader reader, AssetId entryPoint, Set<AssetId> seen) async {
  // Break cycles, if they exist.
  if (seen.contains(entryPoint)) return _nullFuture;
  seen.add(entryPoint);
  if (!(await reader.hasInput(entryPoint))) return new NgMeta.empty();

  var ngMetaJson = await reader.readAsString(entryPoint);
  if (ngMetaJson == null || ngMetaJson.isEmpty) return new NgMeta.empty();

  var ngMeta = new NgMeta.fromJson(JSON.decode(ngMetaJson));

  if (ngMeta.exports == null) return ngMeta;

  // Recursively add NgMeta files from `exports`.
  return Future.wait(ngMeta.exports.map((uri) {
    if (uri.startsWith('dart:')) return _nullFuture;

    var assetId = uriToAssetId(
        entryPoint, toMetaExtension(uri), logger, null /* span */,
        errorOnAbsolute: false);
    return _linkDirectiveMetadataRecursive(reader, assetId, seen)
        .then((exportedNgMeta) {
      if (exportedNgMeta != null) {
        ngMeta.addAll(exportedNgMeta);
      }
    });
  })).then((_) => ngMeta);
}
