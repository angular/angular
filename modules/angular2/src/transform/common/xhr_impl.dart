library angular2.transform.template_compiler.xhr_impl;

import 'dart:async';
import 'package:angular2/src/render/xhr.dart' show XHR;
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:barback/barback.dart';
import 'package:code_transformers/assets.dart';

class XhrImpl implements XHR {
  final AssetReader _reader;
  final AssetId _entryPoint;

  XhrImpl(this._reader, this._entryPoint);

  Future<String> get(String url) async {
    var assetId = uriToAssetId(_entryPoint, url, logger, null /* span */,
        errorOnAbsolute: false);
    var templateExists = await _reader.hasInput(assetId);
    if (!templateExists) {
      logger.error('Could not read template at uri $url from $_entryPoint');
      return null;
    }
    return await _reader.readAsString(assetId);
  }
}
