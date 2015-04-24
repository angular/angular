library angular2.test.transform.template_compiler.all_tests;

import 'dart:async';
import 'package:barback/barback.dart';
import 'package:angular2/src/dom/html_adapter.dart';
import 'package:angular2/src/render/api.dart';
import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/parser.dart';
import 'package:angular2/src/transform/template_compiler/directive_metadata_reader.dart';
import 'package:angular2/src/transform/template_compiler/generator.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();

void allTests() {
  Html5LibDomAdapter.makeCurrent();
  AssetReader reader = new TestAssetReader();
  var parser = new Parser(reader);

  beforeEach(() => setLogger(new PrintLogger()));

  it('should parse simple expressions in inline templates.', () async {
    var inputPath =
        'template_compiler/inline_expression_files/hello.ng_deps.dart';
    var expected = readFile(
        'template_compiler/inline_expression_files/expected/hello.ng_deps.dart');
    var output = await processTemplates(reader, new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
  });

  it('should parse simple methods in inline templates.', () async {
    var inputPath = 'template_compiler/inline_method_files/hello.ng_deps.dart';
    var expected = readFile(
        'template_compiler/inline_method_files/expected/hello.ng_deps.dart');
    var output = await processTemplates(reader, new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
  });

  it('should parse simple expressions in linked templates.', () async {
    var inputPath = 'template_compiler/url_expression_files/hello.ng_deps.dart';
    var expected = readFile(
        'template_compiler/url_expression_files/expected/hello.ng_deps.dart');
    var output = await processTemplates(reader, new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
  });

  it('should parse simple methods in linked templates.', () async {
    var inputPath = 'template_compiler/url_method_files/hello.ng_deps.dart';
    var expected = readFile(
        'template_compiler/url_method_files/expected/hello.ng_deps.dart');
    var output = await processTemplates(reader, new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
  });

  it('should not generated duplicate getters/setters', () async {
    var inputPath = 'template_compiler/duplicate_files/hello.ng_deps.dart';
    var expected = readFile(
        'template_compiler/duplicate_files/expected/hello.ng_deps.dart');
    var output = await processTemplates(reader, new AssetId('a', inputPath));
    _formatThenExpectEquals(output, expected);
  });

  describe('DirectiveMetadataReader', () {
    Future<DirectiveMetadata> readMetadata(inputPath) async {
      var ngDeps = await parser.parse(new AssetId('a', inputPath));
      return readDirectiveMetadata(ngDeps.registeredTypes.first);
    }

    it('should parse selectors', () async {
      var metadata = await readMetadata(
          'template_compiler/directive_metadata_files/selector.ng_deps.dart');
      expect(metadata.selector).toEqual('hello-app');
    });

    it('should parse compile children values', () async {
      var metadata = await readMetadata('template_compiler/'
          'directive_metadata_files/compile_children.ng_deps.dart');
      expect(metadata.compileChildren).toBeTrue();

      metadata = await readMetadata(
          'template_compiler/directive_metadata_files/selector.ng_deps.dart');
      expect(metadata.compileChildren).toBeFalse();
    });

    it('should parse properties.', () async {
      var metadata = await readMetadata('template_compiler/'
          'directive_metadata_files/properties.ng_deps.dart');
      expect(metadata.properties).toBeNotNull();
      expect(metadata.properties.length).toBe(2);
      expect(metadata.properties).toContain('key1');
      expect(metadata.properties['key1']).toEqual('val1');
      expect(metadata.properties).toContain('key2');
      expect(metadata.properties['key2']).toEqual('val2');
    });

    it('should parse host listeners.', () async {
      var metadata = await readMetadata('template_compiler/'
          'directive_metadata_files/host_listeners.ng_deps.dart');
      expect(metadata.hostListeners).toBeNotNull();
      expect(metadata.hostListeners.length).toBe(2);
      expect(metadata.hostListeners).toContain('change');
      expect(metadata.hostListeners['change']).toEqual('onChange(\$event)');
      expect(metadata.hostListeners).toContain('keyDown');
      expect(metadata.hostListeners['keyDown']).toEqual('onKeyDown(\$event)');
    });

    it('should fail when a class is annotated with multiple Directives.',
        () async {
      var ngDeps = await parser.parse(new AssetId('a', 'template_compiler/'
          'directive_metadata_files/too_many_directives.ng_deps.dart'));
      expect(() => readDirectiveMetadata(ngDeps.registeredTypes.first))
          .toThrowWith(anInstanceOf: PrintLoggerError);
    });
  });
}

void _formatThenExpectEquals(String actual, String expected) {
  expect(formatter.format(actual)).toEqual(formatter.format(expected));
}
