library angular2.test.symbol_inspector.symbol_inspector_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        describe,
        expect,
        iit,
        inject,
        it,
        xdescribe,
        xit;
import "symbol_inspector.dart" show getSymbolsFromLibrary;
import "symbol_differ.dart" show SymbolsDiff;

main() {
  describe("symbol inspector", () {
    it("should extract symbols", () {
      var symbols = getSymbolsFromLibrary("simple_library");
      expect(new SymbolsDiff(symbols, [
        "A",
        "A#staticField",
        "A#staticField=",
        "A#staticMethod()",
        "A.field",
        "A.field=",
        "A.getter",
        "A.method()",
        "A.methodWithFunc()",
        "ClosureParam",
        "ClosureReturn",
        "ConsParamType",
        "FieldType",
        "Generic",
        "Generic.getter",
        "GetterType",
        "MethodReturnType",
        "ParamType",
        "StaticFieldType",
        "TypedefParam",
        "TypedefReturnType",
        "SomeInterface:dart"
      ]).errors).toEqual([]);
    });
    describe("assert", () {
      it("should assert symbol names are correct", () {
        var diffs =
            new SymbolsDiff(["a()", "c()", "d()"], ["a()", "b()", "d()"]);
        expect(diffs.errors).toEqual(["- b()", "+ c()"]);
      });
    });
  });
}
