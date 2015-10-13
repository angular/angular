library angular2.transform.directive_metadata_linker.transformer;

import 'dart:async';
import 'dart:convert';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';
import 'package:barback/barback.dart';

import 'ng_meta_linker.dart';

/// Transformer responsible for processing .ng_meta.json files created by
/// {@link DirectiveProcessor} and "linking" them.
///
/// This step ensures that for libraries that export, all `Directive`s reachable
/// from that library are declared in its associated .ng_meta.json file.
///
/// See `common/ng_meta.dart` for the JSON format of these files are serialized
/// to.
class DirectiveMetadataLinker extends Transformer {
  final _encoder = const JsonEncoder.withIndent('  ');

  @override
  bool isPrimary(AssetId id) => id.path.endsWith(META_EXTENSION);

  @override
  Future apply(Transform transform) {
    return log.initZoned(transform, () {
      var primaryId = transform.primaryInput.id;

      return linkDirectiveMetadata(
          new AssetReader.fromTransform(transform), primaryId).then((ngMeta) {
        if (ngMeta != null) {
          if (!ngMeta.isEmpty) {
            transform.addOutput(new Asset.fromString(
                primaryId, _encoder.convert(ngMeta.toJson())));
          } else {
            // Not outputting an asset could confuse barback.
            transform.addOutput(new Asset.fromString(primaryId, ''));
          }
        } });
    });
  }
}
