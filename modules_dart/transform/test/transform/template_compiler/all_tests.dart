library angular2.test.transform.template_compiler.all_tests;

import 'dart:async';
import 'dart:convert';

import 'package:barback/barback.dart';
import 'package:angular2/src/core/dom/html_adapter.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart' as log;
import 'package:angular2/src/transform/template_compiler/generator.dart';
import 'package:dart_style/dart_style.dart';
import 'package:path/path.dart' as path;
import 'package:guinness/guinness.dart';

import '../common/compile_directive_metadata/ng_for.ng_meta.dart' as ngMeta;
import '../common/read_file.dart';
import '../common/recording_logger.dart';

var formatter = new DartFormatter();
AssetReader reader;

main() => allTests();

void allTests() {
  Html5LibDomAdapter.makeCurrent();

  beforeEach(() async {
    reader = new TestAssetReader()
      ..addAsset(
          new AssetId('angular2', 'lib/src/directives/ng_for.ng_meta.json'),
          JSON.encode(ngMeta.ngFor));
  });

  describe('registrations', () {
    noChangeDetectorTests();
    changeDetectorTests();
  });
}

void changeDetectorTests() {
  Future<Outputs> process(AssetId assetId) {
    return log.setZoned(
        new RecordingLogger(), () => processTemplates(reader, assetId));
  }

  // TODO(tbosch): This is just a temporary test that makes sure that the dart server and
  // dart browser is in sync. Change this to "not contains notifyBinding"
  // when https://github.com/angular/angular/issues/3019 is solved.
  it('should not always notifyDispatcher for template variables', () async {
    var inputPath = 'template_compiler/ng_for_files/hello.ng_deps.dart';
    var output = await (process(new AssetId('a', inputPath)));
    expect(output.templatesCode).not.toContain('notifyDispatcher');
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
    var output1 = (await process(new AssetId('a', input1Path)))
        .ngDepsCode
        .replaceFirst(
            'directives: const [alias1]', 'directives: const [GoodbyeCmp]')
        .replaceFirst('hello1', 'hello2');
    var output2 = (await process(new AssetId('a', input2Path))).ngDepsCode;
    _formatThenExpectEquals(output1, output2);
  });
}

void noChangeDetectorTests() {
  Future<String> process(AssetId assetId) {
    return log.setZoned(
        new RecordingLogger(),
        () => processTemplates(reader, assetId)
            .then((outputs) => outputs.ngDepsCode));
  }

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

  it('should generate getters for Component#outputs.', () async {
    var inputPath = 'template_compiler/event_files/hello.ng_deps.dart';
    var expected =
        readFile('template_compiler/event_files/expected/hello.ng_deps.dart');
    var output = await process(new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
    output = await process(new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
  });

  it('should generate getters for Directive#outputs.', () async {
    var inputPath =
        'template_compiler/directive_event_files/hello.ng_deps.dart';
    var expected = readFile(
        'template_compiler/directive_event_files/expected/hello.ng_deps.dart');
    var output = await process(new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
    output = await process(new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
  });

  it('should generate setters for Component#inputs.', () async {
    var inputPath = 'template_compiler/component_inputs_files/bar.ng_deps.dart';
    var expected = readFile(
        'template_compiler/component_inputs_files/expected/bar.ng_deps.dart');
    var output = await process(new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
    output = await process(new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
  });

  it('should generate setters for Directive#inputs.', () async {
    var inputPath = 'template_compiler/directive_inputs_files/bar.ng_deps.dart';
    var expected = readFile(
        'template_compiler/directive_inputs_files/expected/bar.ng_deps.dart');
    var output = await process(new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
    output = await process(new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
  });

  it(
      'should generate a single setter for two `Directive`s '
      'with the same inputs.', () async {
    var inputPath =
        'template_compiler/duplicate_input_name_files/soup.ng_deps.dart';
    var expected = readFile(
        'template_compiler/duplicate_input_name_files/expected/soup.ng_deps.dart');
    var output = await process(new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
    output = await process(new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
  });

  // TODO(kegluenq): Before committing, should this test be removed or just
  // modified to check something different, maybe the created template code?
  xit('should generate all expected getters, setters, & methods.', () async {
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
