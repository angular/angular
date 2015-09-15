library angular2.test.transform.directive_linker.all_tests;

import 'package:barback/barback.dart';
import 'package:angular2/src/transform/common/model/annotation_model.pb.dart';
import 'package:angular2/src/transform/common/model/import_export_model.pb.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';
import 'package:angular2/src/transform/common/model/reflection_info_model.pb.dart';
import 'package:angular2/src/transform/directive_linker/linker.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();

main() => allTests();

void allTests() {
  var reader;

  beforeEach(() {
    reader = new TestAssetReader();
  });

  it('should chain imported dependencies.', () async {
    var fooModel = new NgDepsModel()
      ..libraryUri = 'test.foo'
      ..imports.add(new ImportModel()
        ..uri = 'bar.dart'
        ..prefix = 'dep');
    var barModel = new NgDepsModel()..libraryUri = 'test.bar';

    var fooAssetId = new AssetId('a', 'lib/foo.ng_deps.json');
    reader
      ..addAsset(fooAssetId, fooModel.writeToJson())
      ..addAsset(
          new AssetId('a', 'lib/bar.ng_deps.json'), barModel.writeToJson());

    var linked = await linkNgDeps(reader, fooAssetId);
    expect(linked).toBeNotNull();
    var linkedImport =
        linked.imports.firstWhere((i) => i.uri.endsWith('bar.ng_deps.dart'));
    expect(linkedImport).toBeNotNull();
    expect(linkedImport.isNgDeps).toBeTrue();
    expect(linkedImport.prefix.startsWith('i')).toBeTrue();
  });

  it('should chain exported dependencies.', () async {
    var fooModel = new NgDepsModel()
      ..libraryUri = 'test.foo'
      ..exports.add(new ExportModel()..uri = 'bar.dart');
    var barModel = new NgDepsModel()..libraryUri = 'test.bar';

    var fooAssetId = new AssetId('a', 'lib/foo.ng_deps.json');
    reader
      ..addAsset(fooAssetId, fooModel.writeToJson())
      ..addAsset(
          new AssetId('a', 'lib/bar.ng_deps.json'), barModel.writeToJson());

    var linked = await linkNgDeps(reader, fooAssetId);
    expect(linked).toBeNotNull();
    var linkedImport =
        linked.imports.firstWhere((i) => i.uri.endsWith('bar.ng_deps.dart'));
    expect(linkedImport).toBeNotNull();
    expect(linkedImport.isNgDeps).toBeTrue();
    expect(linkedImport.prefix.startsWith('i')).toBeTrue();
  });

  describe('isNecessary', () {
    it('should drop deps that do no registration and do not import.', () async {
      var fooModel = new NgDepsModel()..libraryUri = 'test.foo';

      var fooAssetId = new AssetId('a', 'lib/foo.ng_deps.json');
      reader.addAsset(fooAssetId, fooModel.writeToJson());
      expect(await isNecessary(reader, fooAssetId)).toBeFalse();
    });

    it('should retain deps that import other deps.', () async {
      var fooModel = new NgDepsModel()
        ..libraryUri = 'test.foo'
        ..imports.add(new ImportModel()..uri = 'bar.dart');
      var barModel = new NgDepsModel()..libraryUri = 'test.bar';

      var fooAssetId = new AssetId('a', 'lib/foo.ng_deps.json');
      reader
        ..addAsset(fooAssetId, fooModel.writeToJson())
        ..addAsset(
            new AssetId('a', 'lib/bar.ng_deps.json'), barModel.writeToJson());

      expect(await isNecessary(reader, fooAssetId)).toBeTrue();
    });

    it('should retain deps that export other deps.', () async {
      var fooModel = new NgDepsModel()
        ..libraryUri = 'test.foo'
        ..exports.add(new ExportModel()..uri = 'bar.dart');
      var barModel = new NgDepsModel()..libraryUri = 'test.bar';

      var fooAssetId = new AssetId('a', 'lib/foo.ng_deps.json');
      reader
        ..addAsset(fooAssetId, fooModel.writeToJson())
        ..addAsset(
            new AssetId('a', 'lib/bar.ng_deps.json'), barModel.writeToJson());

      expect(await isNecessary(reader, fooAssetId)).toBeTrue();
    });

    it('should retain deps that register injectable types.', () async {
      var fooModel = new NgDepsModel()
        ..libraryUri = 'test.foo'
        ..reflectables.add(new ReflectionInfoModel()
          ..name = 'MyInjectable'
          ..annotations.add(new AnnotationModel()
            ..name = 'Injectable'
            ..isInjectable = true));

      var fooAssetId = new AssetId('a', 'lib/foo.ng_deps.json');
      reader.addAsset(fooAssetId, fooModel.writeToJson());
      expect(await isNecessary(reader, fooAssetId)).toBeTrue();
    });

    it('should retain deps that register injectable functions.', () async {
      var fooModel = new NgDepsModel()
        ..libraryUri = 'test.foo'
        ..reflectables.add(new ReflectionInfoModel()
          ..name = 'injectableFunction'
          ..isFunction = true
          ..annotations.add(new AnnotationModel()
            ..name = 'Injectable'
            ..isInjectable = true));

      var fooAssetId = new AssetId('a', 'lib/foo.ng_deps.json');
      reader.addAsset(fooAssetId, fooModel.writeToJson());
      expect(await isNecessary(reader, fooAssetId)).toBeTrue();
    });
  });
}
