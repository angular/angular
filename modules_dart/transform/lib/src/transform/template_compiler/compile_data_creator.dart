library angular2.transform.template_compiler.compile_data_creator;

import 'dart:async';
import 'dart:convert';

import 'package:angular2/src/core/compiler/directive_metadata.dart';
import 'package:angular2/src/core/compiler/template_compiler.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/model/import_export_model.pb.dart';
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
  final List<CompileDirectiveMetadata> directiveMetadatas;

  CompileDataResults._(
      this.ngMeta, this.viewDefinitions, this.directiveMetadatas);
}

/// Creates [ViewDefinition] objects for all `View` `Directive`s defined in
/// `entryPoint`.
class _CompileDataCreator {
  final AssetReader reader;
  final AssetId entryPoint;
  final NgMeta ngMeta;
  final directiveMetadatas = <CompileDirectiveMetadata>[];

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
      return new CompileDataResults._(ngMeta, const {}, directiveMetadatas);
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
    return new CompileDataResults._(ngMeta, compileData, directiveMetadatas);
  }

  /// Creates a map from [AssetId] to import prefix for `.dart` libraries
  /// imported by `entryPoint`, excluding any `.ng_deps.dart` files it imports.
  /// Unprefixed imports have `null` as their value. `entryPoint` is included
  /// in the map with no prefix.
  Future<Map<AssetId, String>> _createImportAssetToPrefixMap() async {
    final importAssetToPrefix = <AssetId, String>{entryPoint: null};
    if (ngDeps == null || ngDeps.imports == null || ngDeps.imports.isEmpty) {
      return importAssetToPrefix;
    }
    final baseUri = toAssetUri(entryPoint);
    final resolver = const TransformerUrlResolver();

    for (ImportModel model in ngMeta.ngDeps.imports) {
      if (model.uri.endsWith('.dart') && !model.isNgDeps) {
        var prefix =
            model.prefix != null && model.prefix.isEmpty ? null : model.prefix;
        importAssetToPrefix[fromUri(resolver.resolve(baseUri, model.uri))] =
            prefix;
      }
    }
    return importAssetToPrefix;
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
    var importAssetToPrefix = await _createImportAssetToPrefixMap();

    var retVal = <String, NgMeta>{};
    for (var importAssetId in importAssetToPrefix.keys) {
      var prefix = importAssetToPrefix[importAssetId];
      if (prefix == null) prefix = '';
      var ngMeta = retVal.putIfAbsent(prefix, () => new NgMeta.empty());
      var metaAssetId = new AssetId(
          importAssetId.package, toMetaExtension(importAssetId.path));
      if (await reader.hasInput(metaAssetId)) {
        try {
          var jsonString = await reader.readAsString(metaAssetId);
          if (jsonString != null && jsonString.isNotEmpty) {
            var json = JSON.decode(jsonString);
            var newMetadata = new NgMeta.fromJson(json);
            if (importAssetId == entryPoint) {
              this.directiveMetadatas.addAll(newMetadata.types.values);
            }
            ngMeta.addAll(newMetadata);
          }
        } catch (ex, stackTrace) {
          logger.warning('Failed to decode: $ex, $stackTrace',
              asset: metaAssetId);
        }
      }
    }
    return retVal;
  }
}
