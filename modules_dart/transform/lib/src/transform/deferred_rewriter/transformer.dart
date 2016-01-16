library angular2.transform.deferred_rewriter.transformer;

import 'dart:async';

import 'package:barback/barback.dart';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/options.dart';
import 'package:angular2/src/transform/common/zone.dart' as zone;

import 'rewriter.dart';

/// Transformer responsible for rewriting deferred library loads to enable
/// initializing the reflector in a deferred way to keep the code with the
/// deferred library.
class DeferredRewriter extends Transformer implements LazyTransformer {
  final TransformerOptions options;

  DeferredRewriter(this.options);

  @override
  declareOutputs(DeclaringTransform transform) {
    transform.declareOutput(transform.primaryId);
  }

  @override
  bool isPrimary(AssetId id) =>
      id.extension.endsWith('dart') && _isNotGenerated(id);

  @override
  Future apply(Transform transform) async {
    return zone.exec(() async {
      var asset = transform.primaryInput;
      var reader = new AssetReader.fromTransform(transform);
      var transformedCode = await rewriteDeferredLibraries(reader, asset.id);
      if (transformedCode != null) {
        transform.addOutput(new Asset.fromString(asset.id, transformedCode));
      }
    }, log: transform.logger);
  }
}

bool _isNotGenerated(AssetId id) => !isGenerated(id.path);

// Visible for testing
Future<String> rewriteDeferredLibraries(AssetReader reader, AssetId id) async {
  var rewriter = new Rewriter(id, reader);
  return await rewriter.rewrite();
}
