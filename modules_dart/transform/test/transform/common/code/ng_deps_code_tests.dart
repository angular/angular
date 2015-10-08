library angular2.test.transform.common.code.ng_deps_code_tests;

import 'package:analyzer/analyzer.dart';
import 'package:angular2/src/transform/common/code/ng_deps_code.dart';
import 'package:angular2/src/transform/common/model/import_export_model.pb.dart';
import 'package:angular2/src/transform/common/model/ng_deps_model.pb.dart';
import 'package:guinness/guinness.dart';

main() => allTests();

void allTests() {
  describe('writeNgDepsModel', () {
    it('should output parsable code', () async {
      final ngDeps = new NgDepsModel()
        ..libraryUri = 'test.foo'
        ..imports.add(new ImportModel()
          ..uri = 'bar.dart'
          ..prefix = 'dep');

      final buf = new StringBuffer();
      final writer = new NgDepsWriter(buf);
      writer.writeNgDepsModel(ngDeps);

      var compilationUnit = parseCompilationUnit(buf.toString());

      expect(compilationUnit).toBeNotNull();
      expect(compilationUnit.declarations).toBeNotNull();
      expect(compilationUnit.declarations.length > 0).toBeTrue();
    });

    it('should output parsable code with deferred imports', () async {
      // Regression test for i/4587.
      final ngDeps = new NgDepsModel()
        ..libraryUri = 'test.foo'
        ..imports.add(new ImportModel()
          ..uri = 'bar.dart'
          ..isDeferred = true
          ..prefix = 'dep');

      final buf = new StringBuffer();
      final writer = new NgDepsWriter(buf);
      writer.writeNgDepsModel(ngDeps);

      var compilationUnit = parseCompilationUnit(buf.toString());

      expect(compilationUnit).toBeNotNull();
      expect(compilationUnit.declarations).toBeNotNull();
      expect(compilationUnit.declarations.length > 0).toBeTrue();
    });
  });
}
