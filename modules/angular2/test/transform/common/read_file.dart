library angular2.test.transform.common.read_file;

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:barback/barback.dart';

/// Smooths over differences in CWD between IDEs and running tests in Travis.
String readFile(String path) {
  for (var myPath in [path, 'test/transform/${path}']) {
    var file = new File(myPath);
    if (file.existsSync()) {
      return file.readAsStringSync();
    }
  }
  return null;
}

class TestAssetReader implements AssetReader {
  Future<String> readAsString(AssetId id, {Encoding encoding}) =>
      new Future.value(readFile(id.path));

  Future<bool> hasInput(AssetId id) {
    var exists = false;
    for (var myPath in [id.path, 'test/transform/${id.path}']) {
      var file = new File(myPath);
      exists = exists || file.existsSync();
    }
    return new Future.value(exists);
  }
}
