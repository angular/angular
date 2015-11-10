library angular2.test.compiler.source_module_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        describe,
        el,
        expect,
        iit,
        inject,
        it,
        xit,
        TestComponentBuilder;
import "package:angular2/src/compiler/source_module.dart"
    show SourceModule, moduleRef;

main() {
  describe("SourceModule", () {
    describe("getSourceWithImports", () {
      it("should generate named imports for modules", () {
        var sourceWithImports = new SourceModule("package:some/moda",
                '''${ moduleRef ( "package:some/modb" )}A''')
            .getSourceWithImports();
        expect(sourceWithImports.source).toEqual("import0.A");
        expect(sourceWithImports.imports).toEqual([
          ["package:some/modb", "import0"]
        ]);
      });
      it("should dedupe imports", () {
        var sourceWithImports = new SourceModule("package:some/moda",
                '''${ moduleRef ( "package:some/modb" )}A + ${ moduleRef ( "package:some/modb" )}B''')
            .getSourceWithImports();
        expect(sourceWithImports.source).toEqual("import0.A + import0.B");
        expect(sourceWithImports.imports).toEqual([
          ["package:some/modb", "import0"]
        ]);
      });
      it("should not use an import for the moduleUrl of the SourceModule", () {
        var sourceWithImports = new SourceModule("package:some/moda",
                '''${ moduleRef ( "package:some/moda" )}A''')
            .getSourceWithImports();
        expect(sourceWithImports.source).toEqual("A");
        expect(sourceWithImports.imports).toEqual([]);
      });
    });
  });
}
