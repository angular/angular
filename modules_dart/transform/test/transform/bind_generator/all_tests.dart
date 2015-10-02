library angular2.test.transform.bind_generator.all_tests;

import 'package:barback/barback.dart';
import 'package:angular2/src/transform/bind_generator/generator.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();

main() => allTests();

void allTests() {
  var reader = new TestAssetReader();

  it('should generate a setter for an `inputs` property in an annotation.',
      () async {
    var inputPath = 'basic_bind_files/bar.ng_deps.dart';
    var expected = _readFile('basic_bind_files/expected/bar.ng_deps.dart');

    var output = formatter
        .format(await createNgSettersAndGetters(reader, _assetId(inputPath)));
    expect(output).toEqual(expected);
  });

  it(
      'should generate a single setter when multiple annotations bind to the '
      'same `inputs` property.', () async {
    var inputPath = 'duplicate_bind_name_files/soup.ng_deps.dart';
    var expected =
        _readFile('duplicate_bind_name_files/expected/soup.ng_deps.dart');

    var output = formatter
        .format(await createNgSettersAndGetters(reader, _assetId(inputPath)));
    expect(output).toEqual(expected);
  });

  it('should generate setters for queries defined in the class annotation.',
      () async {
    var inputPath = 'queries_class_annotation_files/bar.ng_deps.dart';
    var expected =
        _readFile('queries_class_annotation_files/expected/bar.ng_deps.dart');

    var output = formatter
        .format(await createNgSettersAndGetters(reader, _assetId(inputPath)));
    expect(output).toEqual(expected);
  });

  it('should generate setters for queries defined via prop annotations.',
      () async {
    var inputPath = 'queries_prop_annotations_files/bar.ng_deps.dart';
    var expected =
        _readFile('queries_prop_annotations_files/expected/bar.ng_deps.dart');

    var output = formatter
        .format(await createNgSettersAndGetters(reader, _assetId(inputPath)));
    expect(output).toEqual(expected);
  });

  it('should gracefully handle const objects as prop annotations.', () async {
    var inputPath = 'queries_override_annotation_files/bar.ng_deps.dart';
    var expected = formatter.format(_readFile(
        'queries_override_annotation_files/expected/bar.ng_deps.dart'));

    var output = formatter
        .format(await createNgSettersAndGetters(reader, _assetId(inputPath)));
    expect(output).toEqual(expected);
  });
}

AssetId _assetId(String path) => new AssetId('a', 'bind_generator/$path');

String _readFile(String path) {
  var code = readFile('bind_generator/$path');
  if (path.endsWith('.dart')) {
    code = formatter.format(code);
  }
  return code;
}
