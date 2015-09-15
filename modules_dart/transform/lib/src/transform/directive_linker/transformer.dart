library angular2.transform.directive_linker.transformer;

import 'dart:async';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/code/ng_deps_code.dart';
import 'package:angular2/src/transform/common/formatter.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:barback/barback.dart';

import 'linker.dart';

/// Transformer responsible for processing `.ng_deps.json` files created by
/// {@link DirectiveProcessor} and ensuring that each imports its dependencies'
/// .ng_deps.dart files.
class DirectiveLinker extends Transformer implements DeclaringTransformer {
  DirectiveLinker();

  @override
  bool isPrimary(AssetId id) => id.path.endsWith(DEPS_JSON_EXTENSION);

  @override
  declareOutputs(DeclaringTransform transform) {
    transform.declareOutput(transform.primaryId);
  }

  @override
  Future apply(Transform transform) async {
    await log.initZoned(transform, () async {
      var reader = new AssetReader.fromTransform(transform);
      var assetId = transform.primaryInput.id;
      var assetPath = assetId.path;
      var ngDepsModel = await linkNgDeps(reader, assetId);
      if (ngDepsModel != null) {
        var buf = new StringBuffer();
        var writer = new NgDepsWriter(buf);
        writer.writeNgDepsModel(ngDepsModel);
        var formattedCode = formatter.format('$buf', uri: assetPath);
        var ngDepsAssetId =
            new AssetId(assetId.package, toDepsExtension(assetPath));
        transform.addOutput(new Asset.fromString(ngDepsAssetId, formattedCode));
      }
    });
  }
}

/// Transformer responsible for removing unnecessary `.ng_deps.json` files
/// created by {@link DirectiveProcessor}.
class EmptyNgDepsRemover extends Transformer implements DeclaringTransformer {
  EmptyNgDepsRemover();

  @override
  bool isPrimary(AssetId id) => id.path.endsWith(DEPS_JSON_EXTENSION);

  /// We occasionally consume the primary input, but that depends on the
  /// contents of the file, so we conservatively do not declare any outputs nor
  /// consumption to ensure that we declare a superset of our actual outputs.
  @override
  declareOutputs(DeclaringTransform transform) => null;

  @override
  Future apply(Transform transform) async {
    await log.initZoned(transform, () async {
      var reader = new AssetReader.fromTransform(transform);
      if (!(await isNecessary(reader, transform.primaryInput.id))) {
        transform.consumePrimary();
      }
    });
  }
}
