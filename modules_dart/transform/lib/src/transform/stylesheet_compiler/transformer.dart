library angular2.transform.stylesheet_compiler.transformer;

import 'dart:async';

import 'package:barback/barback.dart';

import 'package:angular2/src/platform/server/html_adapter.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/zone.dart' as zone;

import 'processor.dart';

/// Pre-compiles CSS stylesheet files to Dart code for Angular 2.
class StylesheetCompiler extends Transformer {
  StylesheetCompiler();

  @override
  bool isPrimary(AssetId id) {
    return id.path.endsWith(CSS_EXTENSION);
  }

  @override
  Future apply(Transform transform) async {
    final reader = new AssetReader.fromTransform(transform);
    return zone.exec(() async {
      Html5LibDomAdapter.makeCurrent();
      var outputs = await processStylesheet(reader, transform.primaryInput.id);
      outputs.forEach((Asset compiledStylesheet) {
        transform.addOutput(compiledStylesheet);
      });
    }, log: transform.logger);
  }
}
