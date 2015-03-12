library angular2.test.transform.directive_processor.all_tests;

import 'dart:io';
import 'package:barback/barback.dart';
import 'package:angular2/src/transform/directive_processor/rewriter.dart';
import 'package:angular2/src/transform/common/formatter.dart';
import 'package:code_transformers/tests.dart';
import 'package:dart_style/dart_style.dart';
import 'package:path/path.dart' as path;
import 'package:unittest/unittest.dart';
import 'package:unittest/vm_config.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();

void allTests() {
  test('should preserve parameter annotations as const instances.', () {
    var inputPath = 'parameter_metadata/soup.dart';
    var expected = _readFile('parameter_metadata/expected/soup.ngDeps.dart');
    var output =
        formatter.format(createNgDeps(_readFile(inputPath), inputPath));
    expect(output, equals(expected));
  });
}

var pathBase = 'directive_processor';

/// Smooths over differences in CWD between IDEs and running tests in Travis.
String _readFile(String path) => readFile('$pathBase/$path');
