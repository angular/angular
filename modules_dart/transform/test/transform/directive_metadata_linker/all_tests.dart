library angular2.test.transform.directive_metadata_linker.all_tests;

import 'dart:async';
import 'dart:convert';

import 'package:angular2/src/core/render/api.dart';
import 'package:angular2/src/transform/common/convert.dart';
import 'package:angular2/src/transform/common/directive_metadata_reader.dart';
import 'package:angular2/src/transform/common/logging.dart';
import 'package:angular2/src/transform/common/model/import_export_model.pb.dart';
import 'package:angular2/src/transform/common/ng_deps.dart';
import 'package:angular2/src/transform/directive_metadata_linker/ng_deps_linker.dart';
import 'package:angular2/src/transform/directive_metadata_linker/ng_meta_linker.dart';
import 'package:barback/barback.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';

import '../common/ng_meta_helper.dart';
import '../common/read_file.dart';

var formatter = new DartFormatter();

main() => allTests();

void allTests() {
  TestAssetReader reader = null;
  final moduleBase = 'asset:a';
  var fooNgMeta, fooAssetId;
  var barNgMeta, barAssetId;
  var bazNgMeta, bazAssetId;

  /// Call after making changes to `fooNgMeta`, `barNgMeta`, or `bazNgMeta` and
  /// before trying to read them from `reader`.
  final updateReader = () => reader
    ..addAsset(fooAssetId, JSON.encode(fooNgMeta.toJson()))
    ..addAsset(barAssetId, JSON.encode(barNgMeta.toJson()))
    ..addAsset(bazAssetId, JSON.encode(bazNgMeta.toJson()));

  beforeEach(() {
    reader = new TestAssetReader();

    // Establish some test NgMeta objects with one Component each.
    var fooName = 'FooComponent';
    var fooComponentMeta = createComponentMetadataForTest(
        name: fooName,
        moduleUrl: '$moduleBase/export_cycle_files/foo.dart',
        selector: '[foo]',
        template: 'Foo');
    fooNgMeta = new NgMeta(ngDeps: new NgDepsModel());
    fooNgMeta.types[fooName] = fooComponentMeta;

    var barName = 'BarComponent';
    var barComponentMeta = createComponentMetadataForTest(
        name: barName,
        moduleUrl: '$moduleBase/export_cycle_files/bar.dart',
        selector: '[bar]',
        template: 'Bar');
    barNgMeta = new NgMeta(ngDeps: new NgDepsModel());
    barNgMeta.types[barName] = barComponentMeta;

    var bazName = 'BazComponent';
    var bazComponentMeta = createComponentMetadataForTest(
        name: bazName,
        moduleUrl: '$moduleBase/export_cycle_files/baz.dart',
        selector: '[baz]',
        template: 'Baz');
    bazNgMeta = new NgMeta(ngDeps: new NgDepsModel());
    barNgMeta.types[bazName] = bazComponentMeta;

    fooAssetId = new AssetId('a', 'lib/foo.ng_meta.json');
    barAssetId = new AssetId('a', 'lib/bar.ng_meta.json');
    bazAssetId = new AssetId('a', 'lib/baz.ng_meta.json');
    updateReader();
  });

  describe('NgMeta linker', () {
    it('should include `DirectiveMetadata` from exported files.', () async {
      fooNgMeta.ngDeps.exports.add(new ExportModel()..uri = 'bar.dart');
      updateReader();

      var extracted = await linkDirectiveMetadata(reader, fooAssetId);
      expect(extracted.types).toContain('FooComponent');
      expect(extracted.types).toContain('BarComponent');

      expect(extracted.types['FooComponent'].selector).toEqual('[foo]');
      expect(extracted.types['BarComponent'].selector).toEqual('[bar]');
    });

    it('should include `DirectiveMetadata` recursively from exported files.',
        () async {
      fooNgMeta.ngDeps.exports.add(new ExportModel()..uri = 'bar.dart');
      barNgMeta.ngDeps.exports.add(new ExportModel()..uri = 'baz.dart');
      updateReader();

      var extracted = await linkDirectiveMetadata(reader, fooAssetId);
      expect(extracted.types).toContain('FooComponent');
      expect(extracted.types).toContain('BarComponent');
      expect(extracted.types).toContain('BazComponent');

      expect(extracted.types['FooComponent'].selector).toEqual('[foo]');
      expect(extracted.types['BarComponent'].selector).toEqual('[bar]');
      expect(extracted.types['BazComponent'].selector).toEqual('[baz]');
    });

    it('should handle `DirectiveMetadata` export cycles gracefully.', () async {
      fooNgMeta.ngDeps.exports.add(new ExportModel()..uri = 'bar.dart');
      barNgMeta.ngDeps.exports.add(new ExportModel()..uri = 'baz.dart');
      bazNgMeta.ngDeps.exports.add(new ExportModel()..uri = 'foo.dart');
      updateReader();

      var extracted = await linkDirectiveMetadata(reader, bazAssetId);
      expect(extracted.types).toContain('FooComponent');
      expect(extracted.types).toContain('BarComponent');
      expect(extracted.types).toContain('BazComponent');
    });

    it(
        'should include `DirectiveMetadata` from exported files '
        'expressed as absolute uris', () async {
      fooNgMeta.ngDeps.exports
          .add(new ExportModel()..uri = 'package:bar/bar.dart');
      updateReader();
      reader.addAsset(new AssetId('bar', 'lib/bar.ng_meta.json'),
          JSON.encode(barNgMeta.toJson()));

      var extracted = await linkDirectiveMetadata(reader, fooAssetId);

      expect(extracted.types).toContain('FooComponent');
      expect(extracted.types).toContain('BarComponent');

      expect(extracted.types['FooComponent'].selector).toEqual('[foo]');
      expect(extracted.types['BarComponent'].selector).toEqual('[bar]');
    });
  });

  describe('NgDeps linker', () {
    it('should chain imported dependencies.', () async {
      fooNgMeta.ngDeps
        ..libraryUri = 'test.foo'
        ..imports.add(new ImportModel()
          ..uri = 'bar.dart'
          ..prefix = 'dep');
      barNgMeta.ngDeps.libraryUri = 'test.bar';
      updateReader();

      var linked = (await linkDirectiveMetadata(reader, fooAssetId)).ngDeps;
      expect(linked).toBeNotNull();
      var linkedImport =
          linked.imports.firstWhere((i) => i.uri.endsWith('bar.ng_deps.dart'));
      expect(linkedImport).toBeNotNull();
      expect(linkedImport.isNgDeps).toBeTrue();
      expect(linkedImport.prefix.startsWith('i')).toBeTrue();
    });

    it('should chain exported dependencies.', () async {
      fooNgMeta.ngDeps
        ..libraryUri = 'test.foo'
        ..exports.add(new ExportModel()..uri = 'bar.dart');
      barNgMeta.ngDeps.libraryUri = 'test.bar';
      updateReader();

      var linked = (await linkDirectiveMetadata(reader, fooAssetId)).ngDeps;
      expect(linked).toBeNotNull();
      var linkedImport =
          linked.imports.firstWhere((i) => i.uri.endsWith('bar.ng_deps.dart'));
      expect(linkedImport).toBeNotNull();
      expect(linkedImport.isNgDeps).toBeTrue();
      expect(linkedImport.prefix.startsWith('i')).toBeTrue();
    });
  });
}
