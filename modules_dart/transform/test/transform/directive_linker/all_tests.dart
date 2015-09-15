library angular2.test.transform.directive_linker.all_tests;

import 'package:barback/barback.dart';
import 'package:angular2/src/transform/common/model/annotation_model.pb.dart';
import 'package:angular2/src/transform/common/model/import_export_model.pb.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';
import 'package:angular2/src/transform/directive_linker/linker.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();

main() => allTests();

void allTests() {
  var reader = new TestAssetReader();

  it('should ensure that dependencies are property chained.', () async {
    for (var inputPath in [
      'bar.ng_deps.dart',
      'foo.ng_deps.dart',
      'index.ng_deps.dart'
    ]) {
      var expected =
          readFile('directive_linker/simple_files/expected/$inputPath');
      inputPath = 'directive_linker/simple_files/$inputPath';
      var actual = formatter
          .format(await linkNgDeps(reader, new AssetId('a', inputPath)));
      expect(actual).toEqual(formatter.format(expected));
    }
  });

  it('should ensure that exported dependencies are property chained.',
      () async {
    for (var inputPath in [
      'bar.ng_deps.dart',
      'foo.ng_deps.dart',
      'index.ng_deps.dart'
    ]) {
      var expected =
          readFile('directive_linker/simple_export_files/expected/$inputPath');
      inputPath = 'directive_linker/simple_export_files/$inputPath';
      var actual = formatter
          .format(await linkNgDeps(reader, new AssetId('a', inputPath)));
      expect(actual).toEqual(formatter.format(expected));
    }
  });
}
