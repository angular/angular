library angular2.test.transform.directive_processor.all_tests;

import 'dart:io';
import 'package:barback/barback.dart';
import 'package:angular2/src/dom/html5lib_adapter.dart';
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
  Html5LibDomAdapter.makeCurrent();
  AssetReader reader = new TestAssetReader();

  test('should parse simple expressions in inline templates.', () async {
    var inputPath = 'template_parser/inline_expression_files/hello.ngDeps.dart';
    var expected = readFile(
        'template_parser/inline_expression_files/expected/hello.ngDeps.dart');
    var output = await processTemplates(reader, new AssetId('a', inputPath));
    output = formatter.format(output);
    expected = formatter.format(expected);
    expect(output, equals(expected));
  });

  test('should parse simple methods in inline templates.', () async {
    var inputPath = 'template_parser/inline_method_files/hello.ngDeps.dart';
    var expected = readFile(
        'template_parser/inline_method_files/expected/hello.ngDeps.dart');
    var output = await processTemplates(reader, new AssetId('a', inputPath));
    output = formatter.format(output);
    expected = formatter.format(expected);
    expect(output, equals(expected));
  });
}
