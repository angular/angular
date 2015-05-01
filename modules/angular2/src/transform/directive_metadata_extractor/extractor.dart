library angular2.transform.directive_metadata_extractor.extractor;

import 'dart:async';

import 'package:angular2/src/render/api.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/directive_metadata_reader.dart';
import 'package:angular2/src/transform/common/parser.dart';
import 'package:barback/barback.dart';

/// Returns a map from a class name (that is, its `Identifier` stringified)
/// to its [DirectiveMetadata].
/// Will return `null` if there are no `Directive`-annotated classes in
/// `entryPoint`.
Future<Map<String, DirectiveMetadata>> extractDirectiveMetadata(
    AssetReader reader, AssetId entryPoint) async {
  var parser = new Parser(reader);
  NgDeps ngDeps = await parser.parse(entryPoint);
  if (ngDeps == null || ngDeps.registeredTypes.isEmpty) return null;
  var retVal = <String, DirectiveMetadata>{};
  ngDeps.registeredTypes.forEach((rType) {
    var meta = readDirectiveMetadata(rType);
    if (meta != null) {
      retVal['${rType.typeName}'] = meta;
    }
  });
  return retVal;
}
