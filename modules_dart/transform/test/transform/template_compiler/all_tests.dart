library angular2.test.transform.template_compiler.all_tests;

import 'dart:async';
import 'package:barback/barback.dart';
import 'package:angular2/src/core/dom/html_adapter.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/template_compiler/generator.dart';
import 'package:dart_style/dart_style.dart';
import 'package:path/path.dart' as path;
import 'package:guinness/guinness.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();
AssetReader reader = new TestAssetReader();

main() => allTests();

void allTests() {
  Html5LibDomAdapter.makeCurrent();

  describe('registrations', () {
    noChangeDetectorTests();
    changeDetectorTests();
  });
}

void changeDetectorTests() {
  Future<String> process(AssetId assetId) => processTemplates(reader, assetId);

  // TODO(tbosch): This is just a temporary test that makes sure that the dart server and
  // dart browser is in sync. Change this to "not contains notifyBinding"
  // when https://github.com/angular/angular/issues/3019 is solved.
  it('should not always notifyDispatcher for template variables', () async {
    var inputPath = 'template_compiler/ng_for_files/hello.ng_deps.dart';
    var output = await (process(new AssetId('a', inputPath)));
    expect(output).toContain('notifyDispatcher');
  });

  it('should include directives mentioned in directive aliases.', () async {
    // Input 2 is the same as input1, but contains the directive aliases
    // inlined.
    var input1Path =
        'template_compiler/directive_aliases_files/hello1.ng_deps.dart';
    var input2Path =
        'template_compiler/directive_aliases_files/hello2.ng_deps.dart';
    // Except for the directive argument in the View annotation, the generated
    // change detectors are identical.
    var output1 = (await process(new AssetId('a', input1Path))).replaceFirst(
        'directives: const [alias1]', 'directives: const [GoodbyeCmp]');
    var output2 = await process(new AssetId('a', input2Path));
    _formatThenExpectEquals(output1, output2);
  });
}

void noChangeDetectorTests() {
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
    var inputPath = 'template_compiler/inline_method_files/hello.ng_deps.dart';
    var expected = readFile(
        'template_compiler/inline_method_files/expected/hello.ng_deps.dart');
    var output = await process(new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
  });

  it('should parse simple expressions in linked templates.', () async {
    var inputPath = 'template_compiler/url_expression_files/hello.ng_deps.dart';
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

  it('should not generate duplicate getters/setters', () async {
    var inputPath = 'template_compiler/duplicate_files/hello.ng_deps.dart';
    var expected = readFile(
        'template_compiler/duplicate_files/expected/hello.ng_deps.dart');
    var output = await process(new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
  });

  it('should parse `View` directives with a single dependency.', () async {
    var inputPath = 'template_compiler/one_directive_files/hello.ng_deps.dart';
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

  it('should parse angular directives with a prefix', () async {
    var inputPath =
        'template_compiler/with_prefix_files/ng2_prefix.ng_deps.dart';
    var expected = readFile(
        'template_compiler/with_prefix_files/expected/ng2_prefix.ng_deps.dart');

    var output = await process(new AssetId('a', inputPath));
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

  it('should generate all expected getters, setters, & methods.', () async {
    var base = 'template_compiler/registrations_files';
    var inputPath = path.join(base, 'registrations.ng_deps.dart');
    var expected =
        readFile(path.join(base, 'expected/registrations.ng_deps.dart'));
    var output = await process(new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
  });
}

void _formatThenExpectEquals(String actual, String expected) {
  expect(formatter.format(actual)).toEqual(formatter.format(expected));
}
