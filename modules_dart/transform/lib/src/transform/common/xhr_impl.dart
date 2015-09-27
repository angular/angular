library angular2.transform.template_compiler.xhr_impl;

import 'dart:async';
import 'package:angular2/src/core/render/xhr.dart' show XHR;
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:barback/barback.dart';

class XhrImpl implements XHR {
  final AssetReader _reader;

  XhrImpl(this._reader);

  Future<String> get(String url) async {
    final assetId = new AssetId.parse(url);
    var templateExists = await _reader.hasInput(assetId);
    if (!templateExists) {
      logger.error('Could not read asset at uri $url');
      return null;
    }
    return await _reader.readAsString(assetId);
  }
}
