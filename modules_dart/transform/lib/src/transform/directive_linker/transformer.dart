library angular2.transform.directive_linker.transformer;

import 'dart:async';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/formatter.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:barback/barback.dart';

import 'linker.dart';

/// Transformer responsible for processing .ng_deps.dart files created by
/// {@link DirectiveProcessor} and ensuring that the generated calls to
/// `setupReflection` call the necessary `setupReflection` method in all
/// dependencies.
class DirectiveLinker extends Transformer implements DeclaringTransformer {
  DirectiveLinker();

  @override
  bool isPrimary(AssetId id) => id.path.endsWith(DEPS_EXTENSION);

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
      var transformedCode = await linkNgDeps(reader, assetId);
      if (transformedCode != null) {
        var formattedCode = formatter.format(transformedCode, uri: assetPath);
        transform.addOutput(new Asset.fromString(assetId, formattedCode));
      }
    });
  }
}

/// Transformer responsible for removing unnecessary `.ng_deps.dart` files
/// created by {@link DirectiveProcessor}.
class EmptyNgDepsRemover extends Transformer implements DeclaringTransformer {
  EmptyNgDepsRemover();

  @override
  bool isPrimary(AssetId id) => id.path.endsWith(DEPS_EXTENSION);

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
