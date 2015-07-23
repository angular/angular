library angular2.transform.artifact_consumer.transformer;

import 'package:angular2/src/transform/common/options.dart';
import 'package:barback/barback.dart';

const _ARTIFACT_EXTENSIONS = const ['.ng_meta.json', '.aliases.json'];

/// Transformer responsible for cleaning up build artifacts.
class ArtifactConsumer extends Transformer {
  final TransformerOptions options;

  ArtifactConsumer(this.options);

  @override
  bool isPrimary(AssetId id) => options.cleanupBuildArtifacts &&
      _ARTIFACT_EXTENSIONS.any((ext) => id.path.endsWith(ext));

  @override
  apply(Transform transform) {
    transform.consumePrimary();
  }
}
