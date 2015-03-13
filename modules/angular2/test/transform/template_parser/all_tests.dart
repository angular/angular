library angular2.test.transform.directive_processor.all_tests;

import 'dart:io';
import 'package:barback/barback.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/formatter.dart';
import 'package:angular2/src/transform/template_parser/generator.dart';
import 'package:code_transformers/tests.dart';
import 'package:dart_style/dart_style.dart';
import 'package:path/path.dart' as path;
import 'package:unittest/unittest.dart';
import 'package:unittest/vm_config.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();

void allTests() {
  AssetReader reader = new TestAssetReader();

  test('should parse simple inline templates.', () async {
    var inputPath = 'template_parser/basic_files/hello.ngDeps.dart';
    var expected =
        readFile('template_parser/basic_files/expected/hello.ngDeps.dart');
    var output = await processTemplates(reader, new AssetId('a', inputPath));
    output = formatter.format(output);
    expected = formatter.format(expected);
    expect(output, equals(expected));
  });
}
