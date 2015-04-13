library angular2.test.transform.directive_processor.all_tests;

import 'package:angular2/src/transform/directive_processor/rewriter.dart';
import 'package:dart_style/dart_style.dart';
import 'package:guinness/guinness.dart';

import '../common/read_file.dart';

var formatter = new DartFormatter();

void allTests() {
  it('should preserve parameter annotations as const instances.', () {
    var inputPath = 'parameter_metadata/soup.dart';
    var expected = _readFile('parameter_metadata/expected/soup.ng_deps.dart');
    var output =
        formatter.format(createNgDeps(_readFile(inputPath), inputPath));
    expect(output).toEqual(expected);
  });
}

var pathBase = 'directive_processor';

/// Smooths over differences in CWD between IDEs and running tests in Travis.
String _readFile(String path) => readFile('$pathBase/$path');
