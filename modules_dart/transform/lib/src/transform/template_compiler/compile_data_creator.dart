library angular2.transform.template_compiler.compile_data_creator;

import 'dart:async';
import 'dart:convert';

import 'package:angular2/src/core/compiler/directive_metadata.dart';
import 'package:angular2/src/core/compiler/template_compiler.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';
import 'package:angular2/src/transform/common/model/reflection_info_model.pb.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:angular2/src/transform/common/url_resolver.dart';
import 'package:barback/barback.dart';

/// Creates [NormalizedComponentWithViewDirectives] objects for all `View`
/// `Directive`s defined in `assetId`.
///
/// The returned value wraps the [NgDepsModel] at `assetId` as well as these
/// created objects.
Future<CompileDataResults> createCompileData(
    AssetReader reader, AssetId assetId) async {
  return logElapsedAsync(() async {
    return (await _CompileDataCreator.create(reader, assetId))
        .createCompileData();
  }, operationName: 'createCompileData', assetId: assetId);
}

class CompileDataResults {
  final NgMeta ngMeta;
  final Map<ReflectionInfoModel,
      NormalizedComponentWithViewDirectives> viewDefinitions;

  CompileDataResults._(this.ngMeta, this.viewDefinitions);
}

/// Creates [ViewDefinition] objects for all `View` `Directive`s defined in
/// `entryPoint`.
class _CompileDataCreator {
  final AssetReader reader;
  final AssetId entryPoint;
  final NgMeta ngMeta;

  _CompileDataCreator(this.reader, this.entryPoint, this.ngMeta);

  static Future<_CompileDataCreator> create(
      AssetReader reader, AssetId assetId) async {
    if (!(await reader.hasInput(assetId))) return null;
    final json = await reader.readAsString(assetId);
    if (json == null || json.isEmpty) return null;

    final ngMeta = new NgMeta.fromJson(JSON.decode(json));
    return new _CompileDataCreator(reader, assetId, ngMeta);
  }

  NgDepsModel get ngDeps => ngMeta.ngDeps;

  Future<CompileDataResults> createCompileData() async {
    if (ngDeps == null || ngDeps.reflectables == null) {
      return new CompileDataResults._(ngMeta, const {});
    }

    final compileData =
        <ReflectionInfoModel, NormalizedComponentWithViewDirectives>{};
    final ngMetaMap = await _extractNgMeta();

    for (var reflectable in ngDeps.reflectables) {
      if (ngMeta.types.containsKey(reflectable.name)) {
        final compileDirectiveMetadata = ngMeta.types[reflectable.name];
        if (compileDirectiveMetadata.template != null) {
          final compileDatum = new NormalizedComponentWithViewDirectives(
              compileDirectiveMetadata, <CompileDirectiveMetadata>[]);
          for (var dep in reflectable.directives) {
            if (!ngMetaMap.containsKey(dep.prefix)) {
              logger.warning(
                  'Missing prefix "${dep.prefix}" '
                  'needed by "${dep}" from metadata map',
                  asset: entryPoint);
              continue;
            }
            final depNgMeta = ngMetaMap[dep.prefix];

            if (depNgMeta.types.containsKey(dep.name)) {
              compileDatum.directives.add(depNgMeta.types[dep.name]);
            } else if (depNgMeta.aliases.containsKey(dep.name)) {
              compileDatum.directives.addAll(depNgMeta.flatten(dep.name));
            } else {
              logger.warning('Could not find Directive entry for $dep. '
                  'Please be aware that Dart transformers have limited support for '
                  'reusable, pre-defined lists of Directives (aka '
                  '"directive aliases"). See https://goo.gl/d8XPt0 for details.');
            }
          }
          compileData[reflectable] = compileDatum;
        }
      }
    }
    return new CompileDataResults._(ngMeta, compileData);
  }

  /// Creates a map from import prefix to the asset: uris of all `.dart`
  /// libraries visible from `entryPoint`, excluding `dart:` and `.ng_deps.dart`
  /// files it imports. Unprefixed imports have the empty string as their key.
  /// `entryPoint` is included in the map with no prefix.
  Map<String, Iterable<String>> _createPrefixToImportsMap() {
    final baseUri = toAssetUri(entryPoint);
    final map = <String, Set<String>>{'': new Set<String>()..add(baseUri)};
    if (ngDeps == null || ngDeps.imports == null || ngDeps.imports.isEmpty) {
      return map;
    }
    final resolver = const TransformerUrlResolver();

    ngMeta.ngDeps.imports
        .where((model) => !model.isNgDeps && !isDartCoreUri(model.uri))
        .forEach((model) {
      var prefix = model.prefix == null ? '' : model.prefix;
      map
          .putIfAbsent(prefix, () => new Set<String>())
          .add(resolver.resolve(baseUri, model.uri));
    });
    return map;
  }

  /// Reads the `.ng_meta.json` files associated with all of `entryPoint`'s
  /// imports and creates a map of prefix (or blank) to the
  /// associated [NgMeta] object.
  ///
  /// For example, if in `entryPoint` we have:
  ///
  /// ```
  /// import 'component.dart' as prefix;
  /// ```
  ///
  /// and in 'component.dart' we have:
  ///
  /// ```
  /// @Component(...)
  /// class MyComponent {...}
  /// ```
  ///
  /// This method will look for `component.ng_meta.json`to contain the
  /// serialized [NgMeta] for `MyComponent` and any other
  /// `Directive`s declared in `component.dart`. We use this information to
  /// build a map:
  ///
  /// ```
  /// {
  ///   "prefix": [NgMeta with CompileDirectiveMetadata for MyComponent],
  ///   ...<any other entries>...
  /// }
  /// ```
  Future<Map<String, NgMeta>> _extractNgMeta() async {
    var prefixToImports = _createPrefixToImportsMap();

    final retVal = <String, NgMeta>{};
    for (var prefix in prefixToImports.keys) {
      var ngMeta = retVal[prefix] = new NgMeta.empty();
      for (var importAssetUri in prefixToImports[prefix]) {
        var metaAssetId = fromUri(toMetaExtension(importAssetUri));
        if (await reader.hasInput(metaAssetId)) {
          try {
            var jsonString = await reader.readAsString(metaAssetId);
            if (jsonString != null && jsonString.isNotEmpty) {
              var newMetadata = new NgMeta.fromJson(JSON.decode(jsonString));
              ngMeta.addAll(newMetadata);
            }
          } catch (ex, stackTrace) {
            logger.warning('Failed to decode: $ex, $stackTrace',
                asset: metaAssetId);
          }
        }
      }
    }
    return retVal;
  }
}
