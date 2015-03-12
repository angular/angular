library angular2.test.transform.bind_generator.all_tests;

import 'dart:io';
import 'package:barback/barback.dart';
import 'package:angular2/src/transform/bind_generator/generator.dart';
import 'package:angular2/src/transform/common/formatter.dart';
import 'package:code_transformers/tests.dart';
import 'package:dart_style/dart_style.dart';
import 'package:path/path.dart' as path;
import 'package:unittest/unittest.dart';
import 'package:unittest/vm_config.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();

void allTests() {
  var reader = new TestAssetReader();

  test('should generate a setter for a `bind` property in an annotation.',
      () async {
    var inputPath = 'bind_generator/basic_bind_files/bar.ngDeps.dart';
    var expected = formatter.format(
        readFile('bind_generator/basic_bind_files/expected/bar.ngDeps.dart'));

    var output = formatter
        .format(await createNgSetters(reader, new AssetId('a', inputPath)));
    expect(output, equals(expected));
  });

  test('should generate a single setter when multiple annotations bind to the '
      'same property.', () async {
    var inputPath = 'bind_generator/duplicate_bind_name_files/soup.ngDeps.dart';
    var expected = formatter.format(readFile(
        'bind_generator/duplicate_bind_name_files/expected/soup.ngDeps.dart'));

    var output = formatter
        .format(await createNgSetters(reader, new AssetId('a', inputPath)));
    expect(output, equals(expected));
  });
}
