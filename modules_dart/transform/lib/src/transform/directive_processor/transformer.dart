library angular2.transform.directive_processor.transformer;

import 'dart:async';
import 'dart:convert';

import 'package:angular2/src/core/dom/html_adapter.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/options.dart';
import 'package:angular2/src/transform/common/ng_meta.dart';
import 'package:barback/barback.dart';

import 'rewriter.dart';

/// Transformer responsible for processing all .dart assets and creating
/// .ng_deps.dart files which register @Injectable annotated classes with the
/// reflector.
///
/// This will also create .ng_deps.dart files for classes annotated
/// with @Component, @View, @Directive, etc.
///
/// This transformer is the first phase in a two-phase transform. It should
/// be followed by {@link DirectiveLinker}.
class DirectiveProcessor extends Transformer implements DeclaringTransformer {
  final TransformerOptions options;
  final _encoder = const JsonEncoder.withIndent('  ');

  DirectiveProcessor(this.options);

  @override
  bool isPrimary(AssetId id) => id.extension.endsWith('dart');

  /// We don't always output these, but providing a superset of our outputs
  /// should be safe. Barback will just have to wait until `apply` finishes to
  /// determine that one or the other will not be emitted.
  @override
  declareOutputs(DeclaringTransform transform) {
    transform.declareOutput(_ngMetaAssetId(transform.primaryId));
    transform.declareOutput(_ngDepsAssetId(transform.primaryId));
  }

  @override
  Future apply(Transform transform) async {
    Html5LibDomAdapter.makeCurrent();
    await log.initZoned(transform, () async {
      var primaryId = transform.primaryInput.id;
      var reader = new AssetReader.fromTransform(transform);
      var ngMeta = new NgMeta.empty();
      var ngDepsModel = await createNgDeps(
          reader, primaryId, options.annotationMatcher, ngMeta);
      // TODO(kegluneq): Combine NgDepsModel with NgMeta in a single .json file.
      if (ngDepsModel != null) {
        var ngDepsAssetId = _ngDepsAssetId(primaryId);
        transform.addOutput(new Asset.fromString(
            ngDepsAssetId, _encoder.convert(ngDepsModel.writeToJsonMap())));
      }
      var metaOutputId = _ngMetaAssetId(primaryId);
      if (!ngMeta.isEmpty) {
        transform.addOutput(new Asset.fromString(
            metaOutputId, _encoder.convert(ngMeta.toJson())));
      }
    });
  }
}

AssetId _ngMetaAssetId(AssetId primaryInputId) {
  return new AssetId(
      primaryInputId.package, toMetaExtension(primaryInputId.path));
}

AssetId _ngDepsAssetId(AssetId primaryInputId) {
  return new AssetId(
      primaryInputId.package, toJsonExtension(primaryInputId.path));
}
