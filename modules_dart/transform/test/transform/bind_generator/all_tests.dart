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

  it('should generate a setter for a `properties` property in an annotation.',
      () async {
    var inputPath = 'bind_generator/basic_bind_files/bar.ng_deps.dart';
    var expected = formatter.format(
        readFile('bind_generator/basic_bind_files/expected/bar.ng_deps.dart'));

    var output = formatter.format(
        await createNgSettersAndGetters(reader, new AssetId('a', inputPath)));
    expect(output).toEqual(expected);
  });

  it(
      'should generate a single setter when multiple annotations bind to the '
      'same property.', () async {
    var inputPath =
        'bind_generator/duplicate_bind_name_files/soup.ng_deps.dart';
    var expected = formatter.format(readFile(
        'bind_generator/duplicate_bind_name_files/expected/soup.ng_deps.dart'));

    var output = formatter.format(
        await createNgSettersAndGetters(reader, new AssetId('a', inputPath)));
    expect(output).toEqual(expected);
  });

  it('should generate setters for queries defined in the class annotation.',
      () async {
    var inputPath =
        'bind_generator/queries_class_annotation_files/bar.ng_deps.dart';
    var expected = formatter.format(readFile(
        'bind_generator/queries_class_annotation_files/expected/bar.ng_deps.dart'));

    var output = formatter.format(
        await createNgSettersAndGetters(reader, new AssetId('a', inputPath)));
    expect(output).toEqual(expected);
  });

  it('should generate setters for queries defined via prop annotations.',
      () async {
    var inputPath =
        'bind_generator/queries_prop_annotations_files/bar.ng_deps.dart';
    var expected = formatter.format(readFile(
        'bind_generator/queries_prop_annotations_files/expected/bar.ng_deps.dart'));

    var output = formatter.format(
        await createNgSettersAndGetters(reader, new AssetId('a', inputPath)));
    expect(output).toEqual(expected);
  });
}
