library angular2.transform.directive_metadata_linker.ng_deps_linker;

import 'dart:async';

import 'package:angular2/src/core/services.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/model/import_export_model.pb.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';
import 'package:angular2/src/transform/common/url_resolver.dart';
import 'package:barback/barback.dart';

/// Modifies the [NgDepsModel] represented by `entryPoint` to import its
/// dependencies' associated `.ng_deps.dart` files.
///
/// For example, if entry_point.ng_deps.dart imports dependency.dart, this
/// will check if dependency.ng_meta.json exists. If it does, we add an import
/// to dependency.ng_deps.dart to the entry_point [NgDepsModel] and set
/// `isNgDeps` to `true` to signify that it is a dependency on which we need to
/// call `initReflector`.
Future<NgDepsModel> linkNgDeps(NgDepsModel ngDepsModel, AssetReader reader,
    AssetId assetId, UrlResolver resolver) async {
  if (ngDepsModel == null) return null;
  return logElapsedAsync(() async {
    var linkedDepsMap =
        await _processNgImports(ngDepsModel, reader, assetId, resolver);

    if (linkedDepsMap.isEmpty) {
      // We are not calling `initReflector` on any other libraries, but we still
      // return the model to ensure it is written to code.
      // TODO(kegluneq): Continue using the protobuf format after this phase.
      return ngDepsModel;
    }

    final seen = new Set<String>();
    for (var i = ngDepsModel.imports.length - 1; i >= 0; --i) {
      var import = ngDepsModel.imports[i];
      if (linkedDepsMap.containsKey(import.uri) && !seen.contains(import.uri)) {
        seen.add(import.uri);
        var linkedModel = new ImportModel()
          ..isNgDeps = true
          ..uri = toDepsExtension(import.uri)
          ..prefix = 'i$i';
        // TODO(kegluneq): Preserve combinators?
        ngDepsModel.imports.insert(i + 1, linkedModel);
      }
    }
    for (var i = 0, iLen = ngDepsModel.exports.length; i < iLen; ++i) {
      var export = ngDepsModel.exports[i];
      if (linkedDepsMap.containsKey(export.uri) && !seen.contains(export.uri)) {
        seen.add(export.uri);
        var linkedModel = new ImportModel()
          ..isNgDeps = true
          ..uri = toDepsExtension(export.uri)
          ..prefix = 'i${ngDepsModel.imports.length}';
        // TODO(kegluneq): Preserve combinators?
        ngDepsModel.imports.add(linkedModel);
      }
    }
    return ngDepsModel;
  }, operationName: 'linkNgDeps', assetId: assetId);
}

bool _isNotDartDirective(dynamic model) => !isDartCoreUri(model.uri);

/// Maps the `uri` of each input [ImportModel] or [ExportModel] to its
/// associated `.ng_deps.json` file, if one exists.
Future<Map<String, String>> _processNgImports(NgDepsModel model,
    AssetReader reader, AssetId assetId, UrlResolver resolver) async {
  final importsAndExports =
      new List.from(model.imports.where((i) => !i.isDeferred))
        ..addAll(model.exports);
  final retVal = <String, String>{};
  final assetUri = toAssetUri(assetId);
  return Future
      .wait(
          importsAndExports.where(_isNotDartDirective).map((dynamic directive) {
    // Check whether the import or export generated summary NgMeta information.
    final summaryJsonUri =
        resolver.resolve(assetUri, toSummaryExtension(directive.uri));
    return reader.hasInput(fromUri(summaryJsonUri)).then((hasInput) {
      if (hasInput) {
        retVal[directive.uri] = summaryJsonUri;
      }
    }, onError: (err, stack) {
      log.warning('Error while looking for $summaryJsonUri. '
          'Message: $err\n'
          'Stack: $stack');
    });
  }))
      .then((_) => retVal);
}
