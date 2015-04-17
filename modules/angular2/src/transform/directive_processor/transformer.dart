library angular2.transform.directive_processor.transformer;

import 'dart:async';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/classdef_parser.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/options.dart';
import 'package:barback/barback.dart';

import 'rewriter.dart';

/// Transformer responsible for processing all .dart assets and creating
/// .ng_deps.dart files which register @Injectable annotated classes with the
/// reflector.
///
/// This will also create .ng_deps.dart files for classes annotated
/// with @Component, @View, @Decorator, etc.
///
/// This transformer is the first phase in a two-phase transform. It should
/// be followed by {@link DirectiveLinker}.
class DirectiveProcessor extends Transformer {
  final TransformerOptions options;

  DirectiveProcessor(this.options);

  @override
  bool isPrimary(AssetId id) => id.extension.endsWith('dart');

  @override
  Future apply(Transform transform) async {
    log.init(transform);

    try {
      var asset = transform.primaryInput;
      var reader = new AssetReader.fromTransform(transform);
      var defMap = await createTypeMap(reader, asset.id);
      var assetCode = await asset.readAsString();
      var ngDepsSrc = createNgDeps(assetCode, asset.id.path, defMap);
      if (ngDepsSrc != null && ngDepsSrc.isNotEmpty) {
        var ngDepsAssetId =
            transform.primaryInput.id.changeExtension(DEPS_EXTENSION);
        if (await transform.hasInput(ngDepsAssetId)) {
          log.logger.error('Clobbering ${ngDepsAssetId}. '
              'This probably will not end well');
        }
        transform.addOutput(new Asset.fromString(ngDepsAssetId, ngDepsSrc));
      }
    } catch (ex, stackTrace) {
      log.logger.warning('Processing ng directives failed.\n'
          'Exception: $ex\n'
          'Stack Trace: $stackTrace');
    }
  }
}
