library angular2.transform.stylesheet_compiler.transformer;

import 'dart:async';

import 'package:angular2/src/core/dom/html_adapter.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/common/names.dart';

import 'package:barback/barback.dart';

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
    await log.initZoned(transform, () async {
      Html5LibDomAdapter.makeCurrent();
      var reader = new AssetReader.fromTransform(transform);
      var outputs = await processStylesheet(reader, transform.primaryInput.id);
      outputs.forEach((Asset compiledStylesheet) {
        transform.addOutput(compiledStylesheet);
      });
    });
  }
}
