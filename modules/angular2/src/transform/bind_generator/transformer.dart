library angular2.transform.bind_generator.transformer;

import 'dart:async';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/formatter.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/options.dart';
import 'package:barback/barback.dart';

import 'generator.dart';

/// Transformer responsible for reading .ng_deps.dart files and generating
/// setters from the "annotations" information in the generated
/// `registerType` calls.
///
/// These setters are registered in the same `setupReflection` function with
/// the `registerType` calls.
class BindGenerator extends Transformer {
  final TransformerOptions options;

  BindGenerator(this.options);

  @override
  bool isPrimary(AssetId id) => id.path.endsWith(DEPS_EXTENSION);

  @override
  Future apply(Transform transform) async {
    log.init(transform);

    try {
      var id = transform.primaryInput.id;
      var reader = new AssetReader.fromTransform(transform);
      var transformedCode = await createNgSetters(reader, id);
      transform.addOutput(new Asset.fromString(
          id, formatter.format(transformedCode, uri: id.path)));
    } catch (ex, stackTrace) {
      log.logger.error('Creating ng setters failed.\n'
          'Exception: $ex\n'
          'Stack Trace: $stackTrace');
    }
  }
}
