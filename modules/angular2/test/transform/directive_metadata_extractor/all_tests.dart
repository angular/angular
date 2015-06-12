library angular2.test.transform.directive_metadata_extractor.all_tests;

import 'dart:async';
import 'package:angular2/src/render/api.dart';
import 'package:angular2/src/render/dom/convert.dart';
import 'package:angular2/src/transform/common/directive_metadata_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/ng_deps.dart';
import 'package:angular2/src/transform/directive_metadata_extractor/'
    'extractor.dart';
import 'package:barback/barback.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();

void allTests() {
  TestAssetReader reader = null;

  beforeEach(() {
    setLogger(new PrintLogger());
    reader = new TestAssetReader();
  });

  Future<DirectiveMetadata> readMetadata(inputPath) async {
    var ngDeps = await NgDeps.parse(reader, new AssetId('a', inputPath));
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
      var ngDeps = await NgDeps.parse(reader, new AssetId('a',
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

    it('should parse exportAs.', () async {
      var metadata = await readMetadata('directive_metadata_extractor/'
          'directive_metadata_files/directive_export_as.ng_deps.dart');
      expect(metadata.exportAs).toEqual('exportAsName');
    });

    it('should parse host.', () async {
      var metadata = await readMetadata('directive_metadata_extractor/'
          'directive_metadata_files/host_listeners.ng_deps.dart');
      expect(metadata.hostListeners).toBeNotNull();
      expect(metadata.hostListeners.length).toBe(1);
      expect(metadata.hostListeners).toContain('change');
      expect(metadata.hostListeners['change']).toEqual('onChange(\$event)');

      expect(metadata.hostProperties).toBeNotNull();
      expect(metadata.hostProperties.length).toBe(1);
      expect(metadata.hostProperties).toContain('value');
      expect(metadata.hostProperties['value']).toEqual('value');

      expect(metadata.hostAttributes).toBeNotNull();
      expect(metadata.hostAttributes.length).toBe(1);
      expect(metadata.hostAttributes).toContain('attName');
      expect(metadata.hostAttributes['attName']).toEqual('attValue');

      expect(metadata.hostActions).toBeNotNull();
      expect(metadata.hostActions.length).toBe(1);
      expect(metadata.hostActions).toContain('actionName');
      expect(metadata.hostActions['actionName']).toEqual('actionValue');
    });

    it('should parse lifecycle events.', () async {
      var metadata = await readMetadata('directive_metadata_extractor/'
          'directive_metadata_files/lifecycle.ng_deps.dart');
      expect(metadata.callOnDestroy).toBe(true);
      expect(metadata.callOnChange).toBe(true);
      expect(metadata.callOnCheck).toBe(true);
      expect(metadata.callOnInit).toBe(true);
      expect(metadata.callOnAllChangesDone).toBe(true);
    });

    it('should parse events.', () async {
      var metadata = await readMetadata('directive_metadata_extractor/'
          'directive_metadata_files/events.ng_deps.dart');
      expect(metadata.events).toEqual(['onFoo', 'onBar']);
    });

    it('should parse changeDetection.', () async {
      var metadata = await readMetadata('directive_metadata_extractor/'
          'directive_metadata_files/changeDetection.ng_deps.dart');
      expect(metadata.changeDetection).toEqual('CHECK_ONCE');
    });

    it('should fail when a class is annotated with multiple Directives.',
        () async {
      var ngDeps = await NgDeps.parse(reader, new AssetId('a',
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

    it('should include `DirectiveMetadata` from exported files '
        'expressed as absolute uris', () async {
      reader.addAsset(new AssetId('bar', 'lib/bar.ng_deps.dart'), readFile(
          'directive_metadata_extractor/absolute_export_files/bar.ng_deps.dart'));

      var extracted = await extractDirectiveMetadata(reader, new AssetId('a',
          'directive_metadata_extractor/absolute_export_files/foo.ng_deps.dart'));
      expect(extracted).toContain('FooComponent');
      expect(extracted).toContain('BarComponent');

      expect(extracted['FooComponent'].selector).toEqual('[foo]');
      expect(extracted['BarComponent'].selector).toEqual('[bar]');
    });
  });
}
