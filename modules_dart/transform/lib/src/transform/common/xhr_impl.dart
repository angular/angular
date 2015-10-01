library angular2.transform.template_compiler.xhr_impl;

import 'dart:async';
import 'package:angular2/src/core/render/xhr.dart' show XHR;
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:barback/barback.dart';

/// Transformer-specific implementation of XHR that is backed by an
/// [AssetReader].
///
/// This implementation on supports urls using the asset: scheme.
/// See [src/transform/common/url_resolver.dart] for a way to convert package:
/// and relative urls to asset: urls.
class XhrImpl implements XHR {
  final AssetReader _reader;

  XhrImpl(this._reader);

  Future<String> get(String url) async {
    final assetId = _toAssetId(url);

    if (!await _reader.hasInput(assetId)) {
      throw new ArgumentError.value('Could not read asset at uri $url', 'url');
    }
    return _reader.readAsString(assetId);
  }

  Future<bool> exists(String url) => _reader.hasInput(_toAssetId(url));

  AssetId _toAssetId(String url) {
    final uri = Uri.parse(url);
    if (uri.scheme != 'asset') {
      throw new FormatException('Unsupported uri encountered: $uri', url);
    }
    return new AssetId(uri.pathSegments.first, uri.pathSegments.skip(1).join('/'));
  }
}
