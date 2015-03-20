library angular2.transform.directive_linker.transformer;

import 'dart:async';

import 'package:angular2/src/transform/common/formatter.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/options.dart';
import 'package:barback/barback.dart';

import 'linker.dart';

/// Transformer responsible for processing .ng_deps.dart files created by
/// [DirectiveProcessor] and ensuring that the generated calls to
/// `setupReflection` call the necessary `setupReflection` method in all
/// dependencies.
class DirectiveLinker extends Transformer {
  final TransformerOptions options;

  DirectiveLinker(this.options);

  @override
  bool isPrimary(AssetId id) => id.path.endsWith(DEPS_EXTENSION);

  @override
  Future apply(Transform transform) async {
    log.init(transform);

    try {
      var assetCode = await transform.primaryInput.readAsString();
      var assetPath = transform.primaryInput.id.path;
      var transformedCode = await linkNgDeps(transform, assetCode, assetPath);
      var formattedCode = formatter.format(transformedCode, uri: assetPath);
      transform.addOutput(
          new Asset.fromString(transform.primaryInput.id, formattedCode));
    } catch (ex, stackTrace) {
      log.logger.error('Linking ng directives failed.\n'
          'Exception: $ex\n'
          'Stack Trace: $stackTrace');
    }
    return null;
  }
}
