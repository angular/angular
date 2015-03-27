library angular2.test.transform.reflection_remover;

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/reflection_remover/codegen.dart';
import 'package:angular2/src/transform/reflection_remover/rewriter.dart';
import 'package:guinness/guinness.dart';

import 'reflection_remover_files/expected/index.dart' as expected;
import '../common/read_file.dart';

void allTests() {
  var codegen = new Codegen('web/index.dart', 'web/index.ng_deps.dart');

  it('should remove uses of mirrors & insert calls to generated code.', () {
    var code =
        readFile('reflection_remover/reflection_remover_files/index.dart');
    var output =
        new Rewriter(code, codegen).rewrite(parseCompilationUnit(code));
    expect(output).toEqual(expected.code);
  });
}
