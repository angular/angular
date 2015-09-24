library angular2.transform.directive_metadata_extractor.extractor;

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
  return _extractDirectiveMetadataRecursive(reader, entryPoint);
}

var _nullFuture = new Future.value(null);

Future<NgMeta> _extractDirectiveMetadataRecursive(
    AssetReader reader, AssetId entryPoint) async {
  var ngMeta = new NgMeta.empty();
  if (!(await reader.hasInput(entryPoint))) return ngMeta;

  var ngDepsJson = await reader.readAsString(entryPoint);
  var ngDepsModel = new NgDepsModel.fromJson(ngDepsJson);
  _extractMetadata(ngDeps, ngMeta);

  var aliasesFile =
      new AssetId(entryPoint.package, toAliasExtension(entryPoint.path));

  if (await reader.hasInput(aliasesFile)) {
    ngMeta.addAll(new NgMeta.fromJson(
        JSON.decode(await reader.readAsString(aliasesFile))));
  }

  var ngDepsFile =
      new AssetId(entryPoint.package, toDepsExtension(entryPoint.path));

  return Future.wait(ngDepsModel.exports.map((export) {
    var uri = export.uri;
    if (uri.startsWith('dart:')) return _nullFuture;

    uri = toJsonExtension(uri);
    var assetId = uriToAssetId(ngDepsFile, uri, logger, null /* span */,
        errorOnAbsolute: false);
    if (assetId == entryPoint) return _nullFuture;
    return _extractDirectiveMetadataRecursive(reader, assetId)
        .then(ngMeta.addAll);
  })).then((_) => ngMeta);
}

// TODO(sigmund): rather than having to parse it from generated code. we should
// be able to produce directly all information we need for ngMeta.
void _extractMetadata(NgDepsModel ngDeps, NgMeta ngMeta) {
  if (ngDeps == null) return;
  for (var reflectable in ngDeps.reflectables) {
    var directiveMetadata = reflectable.annotations
        .firstWhere((meta) => meta.isComponent, orElse: _returnNull);
    var isComponent = directiveMetadata != null;
    if (directiveMetadata == null) {
      directiveMetadata = reflectable.annotations
          .firstWhere((meta) => meta.isDirective, orElse: _returnNull);
    }
    if (directiveMetadata != null) {
      var typeMetadata = new CompileTypeMetadata(name: reflectable.name);

      var changeDetection = null;
      var cdStrategyString =
          _findNamedParamValue(directiveMetadata, 'changeDetection');
      if (cdStrategyString != null &&
          _changeDetectionStrategies.containsKey(cdStrategyString)) {
        changeDetection = _changeDetectionStrategies[cdStrategyString];
      }

      ngMeta.types[reflectable.name] = CompileDirectiveMetadata.create(
          type: typeMetadata,
          isComponent: isComponent,
          dynamicLoadable: _isDynamicLoadable(directiveMetadata),
          selector: _findNamedParamValue(directiveMetadata, 'selector'),
          exportAs: _findNamedParamValue(directiveMetadata, 'exportAs'),
          changeDetection: changeDetection,
          properties: _findNamedParamValue(directiveMetadata, 'properties'),
          events: _findNamedParamValue(directiveMetadata, 'events'),
          host: _findNamedParamValue(directiveMetadata, 'host'),
          lifecycleHooks: _lifecycleHooks(reflectable),
          template: null);
    }
  }
}

Function _returnNull() => null;

// TODO(kegluneq): This will be an optimization later on, for now
bool _isDynamicLoadable(AnnotationModel componentMeta) => true;

dynamic _findNamedParamValue(AnnotationModel model, String paramName) {
  if (model == null) return null;
  var namedParam = model.namedParameters
      .firstWhere((p) => p.name == paramName, orElse: _returnNull);
  return namedParam != null ? namedParam.value : null;
}

String _selector(AnnotationModel componentMeta) {
  var selectorParam = _findNamedParam(componentMeta, 'selector');
  return selectorParam != null ? selectorParam.value : null;
}

List<LifecycleHooks> _lifecycleHooks(ReflectionInfoModel model) {
  var lifecycleHooks = [];
  for (var iface in model.interfaces) {
    // TODO(kegluneq): Handle prefixes & name collisions
    iface = iface.split('.').last;
    if (_lifecycleHookValues.containsKey(iface)) {
      lifecycleHooks.add(_lifecycleHookValues[iface]);
    }
  }
  return lifecycleHooks;
}

final Map<String, ChangeDetectionStrategy> _changeDetectionStrategies =
    new Map.fromIterable(ChangeDetectionStrategy.values,
        key: (v) => v.toString());
