library angular2.test.transform.deferred_rewriter.all_tests;

import 'package:barback/barback.dart';
import 'package:angular2/src/transform/deferred_rewriter/transformer.dart';
import 'package:angular2/src/transform/common/annotation_matcher.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:code_transformers/messages/build_logger.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';
import 'package:path/path.dart' as path;
import '../common/read_file.dart';

var formatter = new DartFormatter();

main() {
  allTests();
}

void allTests() {
  _testRewriteDeferredLibraries(
      'should return null when no deferred libraries found.',
      'no_deferred_libraries/index.dart');
  _testRewriteDeferredLibraries(
      'should return null when deferred libraries with no ng_deps.',
      'no_ng_deps_libraries/index.dart');
  _testRewriteDeferredLibraries(
      'should rewrite deferred libraries with ng_deps.',
      'simple_deferred_example/index.dart');
  _testRewriteDeferredLibraries(
      'should not rewrite deferred libraries without ng_deps.',
      'deferred_example_no_ng_deps/index.dart');
  _testRewriteDeferredLibraries(
      'should rewrite deferred libraries with ng_deps leave other deferred library alone.',
      'complex_deferred_example/index.dart');
}

void _testRewriteDeferredLibraries(String name, String inputPath) {
  it(name, () async {
    var inputId = _assetIdForPath(inputPath);
    var reader = new TestAssetReader();
    var expectedPath = path.join(
        path.dirname(inputPath), 'expected', path.basename(inputPath));
    var expectedId = _assetIdForPath(expectedPath);

    var output = await rewriteDeferredLibraries(reader, inputId);
    var input = await reader.readAsString(expectedId);
    if (input == null) {
      // Null input signals no output. Ensure that is true.
      expect(output).toBeNull();
    } else {
      expect(formatter.format(output)).toEqual(formatter.format(input));
    }
  });
}

AssetId _assetIdForPath(String path) =>
    new AssetId('angular2', 'test/transform/deferred_rewriter/$path');
