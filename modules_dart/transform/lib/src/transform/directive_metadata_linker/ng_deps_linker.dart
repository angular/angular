library angular2.transform.directive_metadata_linker.ng_deps_linker;

import 'dart:async';

import 'package:angular2/src/core/services/url_resolver.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/model/import_export_model.pb.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';
import 'package:angular2/src/transform/common/url_resolver.dart';
import 'package:angular2/src/transform/common/xhr_impl.dart';

/// Modifies the [NgDepsModel] represented by `entryPoint` to import its
/// dependencies' associated `.ng_deps.dart` files.
///
/// For example, if entry_point.ng_deps.dart imports dependency.dart, this
/// will check if dependency.ng_deps.json exists. If it does, we add an import
/// to dependency.ng_deps.dart to the entry_point [NgDepsModel] and set
/// `isNgDeps` to `true` to signify that it is a dependency on which we need to
/// call `initReflector`.
Future<NgDepsModel> linkNgDeps(XhrImpl xhr, UrlResolver resolver,
    String assetUri, NgDepsModel ngDepsModel) async {
  if (ngDepsModel == null) return null;
  var linkedDepsMap =
      await _processNgImports(xhr, resolver, assetUri, ngDepsModel);

  if (linkedDepsMap.isEmpty) {
    // We are not calling `initReflector` on any other libraries, but we still
    // return the model to ensure it is written to code.
    // TODO(kegluneq): Continue using the protobuf format after this phase.
    return ngDepsModel;
  }

  for (var i = ngDepsModel.imports.length - 1; i >= 0; --i) {
    var import = ngDepsModel.imports[i];
    if (linkedDepsMap.containsKey(import.uri)) {
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
    if (linkedDepsMap.containsKey(export.uri)) {
      var linkedModel = new ImportModel()
        ..isNgDeps = true
        ..uri = toDepsExtension(export.uri)
        ..prefix = 'i${ngDepsModel.imports.length}';
      // TODO(kegluneq): Preserve combinators?
      ngDepsModel.imports.add(linkedModel);
    }
  }

  return ngDepsModel;
}

bool _isNotDartDirective(dynamic model) => !isDartCoreUri(model.uri);

/// Maps the `uri` of each input [ImportModel] or [ExportModel] to its
/// associated `.ng_deps.json` file, if one exists.
Future<Map<String, String>> _processNgImports(XhrImpl xhr, UrlResolver resolver,
    String assetUri, NgDepsModel model) async {
  final importsAndExports = new List.from(model.imports)..addAll(model.exports);
  final retVal = <String, String>{};
  return Future
      .wait(
          importsAndExports.where(_isNotDartDirective).map((dynamic directive) {
    // The uri of the import or export with .dart replaced with .ng_meta.json.
    // This is the json file containing Angular 2 codegen info, if one exists.
    var linkedJsonUri =
        resolver.resolve(assetUri, toMetaExtension(directive.uri));
    return xhr.exists(linkedJsonUri).then((hasInput) {
      if (hasInput) {
        retVal[directive.uri] = linkedJsonUri;
      }
    }, onError: (err, stack) {
      logger.warning('Error while looking for $linkedJsonUri. '
          'Message: $err\n'
          'Stack: $stack');
    });
  }))
      .then((_) => retVal);
}
