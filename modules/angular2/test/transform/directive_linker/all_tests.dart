library angular2.test.transform.directive_linker.all_tests;

import 'package:barback/barback.dart';
import 'package:angular2/src/transform/common/logging.dart' hide init;
import 'package:angular2/src/transform/common/formatter.dart' hide init;
import 'package:angular2/src/transform/directive_linker/linker.dart';
import 'package:code_transformers/tests.dart';
import 'package:dart_style/dart_style.dart';
import 'package:path/path.dart' as path;
import 'package:unittest/unittest.dart';
import 'package:unittest/vm_config.dart';

import '../common/logger.dart';
import '../common/read_file.dart';

var formatter = new DartFormatter();

void allTests() {
  var reader = new TestAssetReader();
  setLogger(new NullLogger());

  test('should ensure that dependencies are property chained.', () async {
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
      expect(actual, equals(expected));
    }
  });

  test('should ensure that exported dependencies are property chained.',
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
      expect(actual, equals(expected));
    }
  });
}
