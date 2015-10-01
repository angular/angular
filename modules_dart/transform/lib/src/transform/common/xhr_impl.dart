library angular2.transform.template_compiler.xhr_impl;

import 'dart:async';
import 'package:angular2/src/core/render/xhr.dart' show XHR;
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:barback/barback.dart';

class XhrImpl implements XHR {
  final AssetReader _reader;

  XhrImpl(this._reader);

  Future<String> get(String url) async {
    final uri = Uri.parse(url);
    if (uri.scheme != 'asset') {
      throw new FormatException('Unsupported uri encountered: $uri', url);
    }
    final assetId =
        new AssetId(uri.pathSegments.first, uri.pathSegments.skip(1).join('/'));

    if (!await _reader.hasInput(assetId)) {
      throw new ArgumentError.value('Could not read asset at uri $url', 'url');
    }
    return _reader.readAsString(assetId);
  }
}
