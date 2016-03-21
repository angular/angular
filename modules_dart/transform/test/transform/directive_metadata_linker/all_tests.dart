library angular2.test.transform.directive_metadata_linker.all_tests;

import 'dart:async';
import 'dart:convert';

import 'package:barback/barback.dart';
import 'package:dart_style/dart_style.dart';
import 'package:test/test.dart';

import 'package:angular2/src/transform/common/asset_reader.dart';
import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/model/import_export_model.pb.dart';
import 'package:angular2/src/transform/common/zone.dart' as zone;
import 'package:angular2/src/transform/directive_metadata_linker/ng_meta_linker.dart';

import '../common/ng_meta_helper.dart';
import '../common/read_file.dart';
import '../common/recording_logger.dart';

var formatter = new DartFormatter();

main() => allTests();

void allTests() {
  TestAssetReader reader = null;
  final moduleBase = 'asset:a';
  var fooNgMeta, fooAssetId;
  var barNgMeta, barAssetId;
  var bazNgMeta, bazAssetId;
  var aliasNgMeta, aliasAssetId;

  /// Call after making changes to `fooNgMeta`, `barNgMeta`, or `bazNgMeta` and
  /// before trying to read them from `reader`.
  final updateReader = () => reader
    ..addAsset(fooAssetId, JSON.encode(fooNgMeta.toJson()))
    ..addAsset(barAssetId, JSON.encode(barNgMeta.toJson()))
    ..addAsset(bazAssetId, JSON.encode(bazNgMeta.toJson()))
    ..addAsset(aliasAssetId, JSON.encode(aliasNgMeta.toJson()));

  setUp(() {
    reader = new TestAssetReader();

    // Establish some test NgMeta objects with one Component each.
    var fooComponentMeta = createFoo(moduleBase);
    fooNgMeta = new NgMeta(ngDeps: new NgDepsModel());
    fooNgMeta.identifiers[fooComponentMeta.type.name] = fooComponentMeta;

    var barComponentMeta = createBar(moduleBase);
    barNgMeta = new NgMeta(ngDeps: new NgDepsModel());
    barNgMeta.identifiers[barComponentMeta.type.name] = barComponentMeta;

    var bazComponentMeta = createBaz(moduleBase);
    bazNgMeta = new NgMeta(ngDeps: new NgDepsModel());
    barNgMeta.identifiers[bazComponentMeta.type.name] = bazComponentMeta;

    aliasNgMeta = new NgMeta(ngDeps: new NgDepsModel());
    aliasNgMeta.aliases["Providers"] = ["someAlias"];
    aliasNgMeta.definesAlias = true;

    fooAssetId = new AssetId('a', toSummaryExtension('lib/foo.dart'));
    barAssetId = new AssetId('a', toSummaryExtension('lib/bar.dart'));
    bazAssetId = new AssetId('a', toSummaryExtension('lib/baz.dart'));
    aliasAssetId = new AssetId('a', toSummaryExtension('lib/alais.dart'));
    updateReader();
  });

  group('NgMeta linker', () {
    test('should include `DirectiveMetadata` from exported files.', () async {
      fooNgMeta.ngDeps.exports.add(new ExportModel()..uri = 'bar.dart');
      updateReader();

      var extracted = await _testLink(reader, fooAssetId);
      expect(extracted.identifiers, contains('FooComponent'));
      expect(extracted.identifiers, contains('BarComponent'));

      expect(extracted.identifiers['FooComponent'].selector, equals('foo'));
      expect(extracted.identifiers['BarComponent'].selector, equals('bar'));
    });

    test('should include `DirectiveMetadata` recursively from exported files.',
        () async {
      fooNgMeta.ngDeps.exports.add(new ExportModel()..uri = 'bar.dart');
      barNgMeta.ngDeps.exports.add(new ExportModel()..uri = 'baz.dart');
      updateReader();

      var extracted = await _testLink(reader, fooAssetId);
      expect(extracted.identifiers, contains('FooComponent'));
      expect(extracted.identifiers, contains('BarComponent'));
      expect(extracted.identifiers, contains('BazComponent'));

      expect(extracted.identifiers['FooComponent'].selector, equals('foo'));
      expect(extracted.identifiers['BarComponent'].selector, equals('bar'));
      expect(extracted.identifiers['BazComponent'].selector, equals('baz'));
    });

    test(
        'should include metadata recursively from imported files when they are aliases.',
        () async {
      aliasNgMeta.ngDeps.imports.add(new ImportModel()..uri = 'bar.dart');
      updateReader();

      var extracted = await _testLink(reader, aliasAssetId);
      expect(extracted.identifiers, contains('BarComponent'));
    });

    test(
        'should NOT include metadata recursively from imported files when no aliases defined.',
        () async {
      fooNgMeta.ngDeps.imports.add(new ImportModel()..uri = 'bar.dart');
      barNgMeta.ngDeps.imports.add(new ImportModel()..uri = 'baz.dart');
      updateReader();

      var extracted = await _testLink(reader, fooAssetId);
      expect(extracted.identifiers, isNot(contains('BarComponent')));
      expect(extracted.identifiers, isNot(contains('BazComponent')));
    });

    test('should handle `DirectiveMetadata` export cycles gracefully.',
        () async {
      fooNgMeta.ngDeps.exports.add(new ExportModel()..uri = 'bar.dart');
      barNgMeta.ngDeps.exports.add(new ExportModel()..uri = 'baz.dart');
      bazNgMeta.ngDeps.exports.add(new ExportModel()..uri = 'foo.dart');
      updateReader();

      var extracted = await _testLink(reader, bazAssetId);
      expect(extracted.identifiers, contains('FooComponent'));
      expect(extracted.identifiers, contains('BarComponent'));
      expect(extracted.identifiers, contains('BazComponent'));
    });

    test(
        'should include `DirectiveMetadata` from exported files '
        'expressed as absolute uris', () async {
      fooNgMeta.ngDeps.exports
          .add(new ExportModel()..uri = 'package:bar/bar.dart');
      updateReader();
      reader.addAsset(new AssetId('bar', toSummaryExtension('lib/bar.dart')),
          JSON.encode(barNgMeta.toJson()));

      var extracted = await _testLink(reader, fooAssetId);

      expect(extracted.identifiers, contains('FooComponent'));
      expect(extracted.identifiers, contains('BarComponent'));

      expect(extracted.identifiers['FooComponent'].selector, equals('foo'));
      expect(extracted.identifiers['BarComponent'].selector, equals('bar'));
    });
  });

  group('NgDeps linker', () {
    test('should chain imported dependencies.', () async {
      fooNgMeta.ngDeps
        ..libraryUri = 'test.foo'
        ..imports.add(new ImportModel()
          ..uri = 'bar.dart'
          ..prefix = 'dep');
      barNgMeta.ngDeps.libraryUri = 'test.bar';
      updateReader();

      var linked = (await _testLink(reader, fooAssetId)).ngDeps;
      expect(linked, isNotNull);
      var linkedImport = linked.depImports
          .firstWhere((i) => i.uri.endsWith('bar.template.dart'));
      expect(linkedImport, isNotNull);
      expect(linkedImport.prefix.startsWith('i'), isTrue);
    });

    test('should chain exported dependencies.', () async {
      fooNgMeta.ngDeps
        ..libraryUri = 'test.foo'
        ..exports.add(new ExportModel()..uri = 'bar.dart');
      barNgMeta.ngDeps.libraryUri = 'test.bar';
      updateReader();

      var linked = (await _testLink(reader, fooAssetId)).ngDeps;
      expect(linked, isNotNull);
      var linkedImport = linked.depImports
          .firstWhere((i) => i.uri.endsWith('bar.template.dart'));
      expect(linkedImport, isNotNull);
      expect(linkedImport.prefix.startsWith('i'), isTrue);
    });

    test('should not chain `deferred` libraries.', () async {
      fooNgMeta.ngDeps
        ..libraryUri = 'test.foo'
        ..imports.add(new ImportModel()
          ..uri = 'bar.dart'
          ..isDeferred = true
          ..prefix = 'dep');
      barNgMeta.ngDeps.libraryUri = 'test.bar';
      updateReader();

      var linked = (await _testLink(reader, fooAssetId)).ngDeps;
      expect(linked, isNotNull);
      var linkedImport = linked.depImports.firstWhere(
          (i) => i.uri.endsWith('bar.template.dart'),
          orElse: () => null);
      expect(linkedImport, isNull);
    });
  });
}

Future<NgMeta> _testLink(AssetReader reader, AssetId assetId) {
  return zone.exec(() => linkDirectiveMetadata(reader, assetId),
      log: new RecordingLogger());
}
