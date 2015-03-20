library angular2.transform.common.asset_reader;

import 'dart:async';
import 'dart:convert';

import 'package:barback/barback.dart';

/// A class that allows fetching code using [AssetId]s without all the
/// additional baggage of a [Transform].
abstract class AssetReader {
  Future<String> readAsString(AssetId id, {Encoding encoding});
  Future<bool> hasInput(AssetId id);

  /// Creates an [AssetReader] using the `transform`, which should be a
  /// [Transform] or [AggregateTransform].
  factory AssetReader.fromTransform(dynamic transform) =>
      new _TransformAssetReader(transform);
}

class _TransformAssetReader implements AssetReader {
  final dynamic t;
  _TransformAssetReader(this.t);

  Future<String> readAsString(AssetId id, {Encoding encoding}) =>
      t.readInputAsString(id, encoding: encoding);

  Future<bool> hasInput(AssetId id) => t.hasInput(id);
}
