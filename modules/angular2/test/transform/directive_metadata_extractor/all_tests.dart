library angular2.test.transform.directive_metadata_extractor.all_tests;

import 'dart:async';
import 'package:angular2/src/render/api.dart';
import 'package:angular2/src/render/dom/convert.dart';
import 'package:angular2/src/transform/common/directive_metadata_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/parser.dart';
import 'package:angular2/src/transform/directive_metadata_extractor/'
    'extractor.dart';
import 'package:barback/barback.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();

void allTests() {
  var reader = new TestAssetReader();
  var parser = new Parser(reader);

  beforeEach(() => setLogger(new PrintLogger()));

  Future<DirectiveMetadata> readMetadata(inputPath) async {
    var ngDeps = await parser.parse(new AssetId('a', inputPath));
    return ngDeps.registeredTypes.first.directiveMetadata;
  }

  describe('readMetadata', () {
    it('should parse selectors', () async {
      var metadata = await readMetadata(
          'directive_metadata_extractor/directive_metadata_files/'
          'selector.ng_deps.dart');
      expect(metadata.selector).toEqual('hello-app');
    });

    it('should parse compile children values', () async {
      var ngDeps = await parser.parse(new AssetId('a',
          'directive_metadata_extractor/'
          'directive_metadata_files/compile_children.ng_deps.dart'));
      var it = ngDeps.registeredTypes.iterator;

      // Unset value defaults to `true`.
      it.moveNext();
      expect('${it.current.typeName}').toEqual('UnsetComp');
      var unsetComp = it.current.directiveMetadata;
      expect(unsetComp.compileChildren).toBeTrue();

      it.moveNext();
      expect('${it.current.typeName}').toEqual('FalseComp');
      var falseComp = it.current.directiveMetadata;
      expect(falseComp.compileChildren).toBeFalse();

      it.moveNext();
      expect('${it.current.typeName}').toEqual('TrueComp');
      var trueComp = it.current.directiveMetadata;
      expect(trueComp.compileChildren).toBeTrue();
    });

    it('should parse properties.', () async {
      var metadata = await readMetadata('directive_metadata_extractor/'
          'directive_metadata_files/properties.ng_deps.dart');
      expect(metadata.properties).toBeNotNull();
      expect(metadata.properties.length).toBe(2);
      expect(metadata.properties).toContain('key1: val1');
      expect(metadata.properties).toContain('key2: val2');
    });

    it('should parse host listeners.', () async {
      var metadata = await readMetadata('directive_metadata_extractor/'
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
      var ngDeps = await parser.parse(new AssetId('a',
          'directive_metadata_extractor/'
          'directive_metadata_files/too_many_directives.ng_deps.dart'));
      expect(() => ngDeps.registeredTypes.first.directiveMetadata).toThrowWith(
          anInstanceOf: PrintLoggerError);
    });
  });

  describe('extractMetadata', () {
    it('should generate `DirectiveMetadata` from .ng_deps.dart files.',
        () async {
      var extracted = await extractDirectiveMetadata(reader, new AssetId(
          'a', 'directive_metadata_extractor/simple_files/foo.ng_deps.dart'));
      expect(extracted).toContain('FooComponent');

      var extractedMeta = extracted['FooComponent'];
      expect(extractedMeta.selector).toEqual('[foo]');
    });

    it('should generate `DirectiveMetadata` from .ng_deps.dart files that use '
        'automatic adjacent string concatenation.', () async {
      var extracted = await extractDirectiveMetadata(reader, new AssetId('a',
          'directive_metadata_extractor/adjacent_strings_files/'
          'foo.ng_deps.dart'));
      expect(extracted).toContain('FooComponent');

      var extractedMeta = extracted['FooComponent'];
      expect(extractedMeta.selector).toEqual('[foo]');
    });

    it('should include `DirectiveMetadata` from exported files.', () async {
      var extracted = await extractDirectiveMetadata(reader, new AssetId(
          'a', 'directive_metadata_extractor/export_files/foo.ng_deps.dart'));
      expect(extracted).toContain('FooComponent');
      expect(extracted).toContain('BarComponent');

      expect(extracted['FooComponent'].selector).toEqual('[foo]');
      expect(extracted['BarComponent'].selector).toEqual('[bar]');
    });

    it('should include `DirectiveMetadata` recursively from exported files.',
        () async {
      var extracted = await extractDirectiveMetadata(reader, new AssetId('a',
          'directive_metadata_extractor/recursive_export_files/foo.ng_deps.dart'));
      expect(extracted).toContain('FooComponent');
      expect(extracted).toContain('BarComponent');
      expect(extracted).toContain('BazComponent');

      expect(extracted['FooComponent'].selector).toEqual('[foo]');
      expect(extracted['BarComponent'].selector).toEqual('[bar]');
      expect(extracted['BazComponent'].selector).toEqual('[baz]');
    });
  });
}
