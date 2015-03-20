library angular2.test.transform.directive_processor.all_tests;

import 'package:barback/barback.dart';
import 'package:angular2/src/dom/html5lib_adapter.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/formatter.dart';
import 'package:angular2/src/transform/template_compiler/generator.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();

void allTests() {
  Html5LibDomAdapter.makeCurrent();
  AssetReader reader = new TestAssetReader();

  it('should parse simple expressions in inline templates.', () async {
    var inputPath =
        'template_compiler/inline_expression_files/hello.ng_deps.dart';
    var expected = readFile(
        'template_compiler/inline_expression_files/expected/hello.ng_deps.dart');
    var output = await processTemplates(reader, new AssetId('a', inputPath));
    output = formatter.format(output);
    expected = formatter.format(expected);
    expect(output).toEqual(expected);
  });

  it('should parse simple methods in inline templates.', () async {
    var inputPath = 'template_compiler/inline_method_files/hello.ng_deps.dart';
    var expected = readFile(
        'template_compiler/inline_method_files/expected/hello.ng_deps.dart');
    var output = await processTemplates(reader, new AssetId('a', inputPath));
    output = formatter.format(output);
    expected = formatter.format(expected);
    expect(output).toEqual(expected);
  });
}
