library angular2.test.transform.template_compiler.all_tests;

import 'dart:async';
import 'package:barback/barback.dart';
import 'package:angular2/src/dom/html_adapter.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/template_compiler/generator.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();

void allTests() {
  Html5LibDomAdapter.makeCurrent();
  AssetReader reader = new TestAssetReader();

  beforeEach(() => setLogger(new PrintLogger()));

  describe('registrations', () {
    Future<String> process(AssetId assetId) =>
        processTemplates(reader, assetId, generateChangeDetectors: false);

    it('should parse simple expressions in inline templates.', () async {
      var inputPath =
          'template_compiler/inline_expression_files/hello.ng_deps.dart';
      var expected = readFile(
          'template_compiler/inline_expression_files/expected/hello.ng_deps.dart');
      var output = await process(new AssetId('a', inputPath));
      _formatThenExpectEquals(output, expected);
    });

    it('should parse simple methods in inline templates.', () async {
      var inputPath =
          'template_compiler/inline_method_files/hello.ng_deps.dart';
      var expected = readFile(
          'template_compiler/inline_method_files/expected/hello.ng_deps.dart');
      var output = await process(new AssetId('a', inputPath));
      _formatThenExpectEquals(output, expected);
    });

    it('should parse simple expressions in linked templates.', () async {
      var inputPath =
          'template_compiler/url_expression_files/hello.ng_deps.dart';
      var expected = readFile(
          'template_compiler/url_expression_files/expected/hello.ng_deps.dart');
      var output = await process(new AssetId('a', inputPath));
      _formatThenExpectEquals(output, expected);
    });

    it('should parse simple methods in linked templates.', () async {
      var inputPath = 'template_compiler/url_method_files/hello.ng_deps.dart';
      var expected = readFile(
          'template_compiler/url_method_files/expected/hello.ng_deps.dart');
      var output = await process(new AssetId('a', inputPath));
      _formatThenExpectEquals(output, expected);
    });

    it('should not generated duplicate getters/setters', () async {
      var inputPath = 'template_compiler/duplicate_files/hello.ng_deps.dart';
      var expected = readFile(
          'template_compiler/duplicate_files/expected/hello.ng_deps.dart');
      var output = await process(new AssetId('a', inputPath));
      _formatThenExpectEquals(output, expected);
    });

    it('should parse `View` directives with a single dependency.', () async {
      var inputPath =
          'template_compiler/one_directive_files/hello.ng_deps.dart';
      var expected = readFile(
          'template_compiler/one_directive_files/expected/hello.ng_deps.dart');

      var output = await process(new AssetId('a', inputPath));
      _formatThenExpectEquals(output, expected);
    });

    it('should parse `View` directives with a single prefixed dependency.',
        () async {
      var inputPath = 'template_compiler/with_prefix_files/hello.ng_deps.dart';
      var expected = readFile(
          'template_compiler/with_prefix_files/expected/hello.ng_deps.dart');

      var output = await process(new AssetId('a', inputPath));
      _formatThenExpectEquals(output, expected);

      inputPath = 'template_compiler/with_prefix_files/goodbye.ng_deps.dart';
      expected = readFile(
          'template_compiler/with_prefix_files/expected/goodbye.ng_deps.dart');

      output = await process(new AssetId('a', inputPath));
      _formatThenExpectEquals(output, expected);
    });

    it('should create the same output for multiple calls.', () async {
      var inputPath =
          'template_compiler/inline_expression_files/hello.ng_deps.dart';
      var expected = readFile(
          'template_compiler/inline_expression_files/expected/hello.ng_deps.dart');
      var output = await process(new AssetId('a', inputPath));
      _formatThenExpectEquals(output, expected);
      output = await process(new AssetId('a', inputPath));
      _formatThenExpectEquals(output, expected);
    });
  });
}

void _formatThenExpectEquals(String actual, String expected) {
  expect(formatter.format(actual)).toEqual(formatter.format(expected));
}
