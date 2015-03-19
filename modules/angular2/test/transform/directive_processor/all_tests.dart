library angular2.test.transform.directive_processor.all_tests;

import 'package:barback/barback.dart';
import 'package:angular2/src/transform/directive_processor/rewriter.dart';
import '../common/read_file.dart';
import 'package:angular2/src/transform/common/classdef_parser.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';
import 'package:path/path.dart' as path;

var formatter = new DartFormatter();

main() {
  allTests();
}

void allTests() {
  _testNgDeps('should preserve parameter annotations as const instances.',
      'parameter_metadata/soup.dart');

  _testNgDeps('should recognize annotations which extend Injectable.',
      'custom_metadata/tortilla_soup.dart');

  _testNgDeps('should recognize annotations which implement Injectable.',
      'custom_metadata/chicken_soup.dart');

  _testNgDeps(
      'should recognize annotations which implement a class that extends '
      'Injectable.', 'custom_metadata/chicken_soup.dart');
}

void _testNgDeps(String name, String inputPath) {
  it(name, () async {
    var inputId = _assetIdForPath(inputPath);
    var reader = new TestAssetReader();
    var defMap = await createTypeMap(reader, inputId);
    var input = await reader.readAsString(inputId);
    var output = formatter.format(createNgDeps(input, inputPath, defMap));
    var expectedPath = path.join(path.dirname(inputPath), 'expected',
        path.basename(inputPath).replaceFirst('.dart', '.ng_deps.dart'));
    var expected = await reader.readAsString(_assetIdForPath(expectedPath));
    expect(output).toEqual(expected);
  });
}

AssetId _assetIdForPath(String path) =>
    new AssetId('angular2', 'test/transform/directive_processor/$path');
