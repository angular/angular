library angular2.test.transform.reflection_remover;

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/common/mirror_mode.dart';
import 'package:angular2/src/transform/reflection_remover/codegen.dart';
import 'package:angular2/src/transform/reflection_remover/rewriter.dart';
import 'package:guinness/guinness.dart';

import 'reflection_remover_files/expected/index.dart' as expected;
import 'debug_mirrors_files/expected/index.dart' as debug_mirrors;
import 'log_mirrors_files/expected/index.dart' as log_mirrors;
import 'verbose_files/expected/index.dart' as verbose_mirrors;
import 'bootstrap_files/expected/index.dart' as bootstrap_expected;
import '../common/read_file.dart';

main() => allTests();

void allTests() {
  var codegen = new Codegen('web/index.dart', ['web/index.ng_deps.dart']);
  var code = readFile('reflection_remover/index.dart').replaceAll('\r\n', '\n');
  var bootstrapCode = readFile('reflection_remover/bootstrap_files/index.dart').replaceAll('\r\n', '\n');

  it('should remove uses of mirrors & '
      'insert calls to generated code by default.', () {
    var output =
        new Rewriter(code, codegen).rewrite(parseCompilationUnit(code));
    expect(output).toEqual(expected.code);
  });

  it('should replace uses of mirrors with the debug implementation & '
      'insert calls to generated code in `MirrorMode.debug`.', () {
    var output = new Rewriter(code, codegen, mirrorMode: MirrorMode.debug)
        .rewrite(parseCompilationUnit(code));
    expect(output).toEqual(debug_mirrors.code);
  });

  it('should replace uses of mirrors with the verbose implementation '
      'in `MirrorMode.verbose`.', () {
    var output = new Rewriter(code, codegen, mirrorMode: MirrorMode.verbose)
        .rewrite(parseCompilationUnit(code));
    expect(output).toEqual(verbose_mirrors.code);
  });

  it('should not initialize the reflector when `writeStaticInit` is `false`.',
      () {
    var output = new Rewriter(code, codegen, writeStaticInit: false)
        .rewrite(parseCompilationUnit(code));
    expect(output).toEqual(log_mirrors.code);
  });

  it('should rewrite bootstrap.', () {
    var output = new Rewriter(bootstrapCode, codegen, writeStaticInit: true)
        .rewrite(parseCompilationUnit(bootstrapCode));
    expect(output).toEqual(bootstrap_expected.code);
  });
}
