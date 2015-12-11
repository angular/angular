library angular2.test.compiler.util_spec;

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
import "package:angular2/src/facade/lang.dart" show IS_DART;
import "package:angular2/src/compiler/util.dart"
    show escapeSingleQuoteString, escapeDoubleQuoteString;

main() {
  describe("util", () {
    describe("escapeSingleQuoteString", () {
      it("should escape single quotes", () {
        expect(escapeSingleQuoteString('''\'''')).toEqual('''\'\\\'\'''');
      });
      it("should escape backslash", () {
        expect(escapeSingleQuoteString("\\")).toEqual('''\'\\\\\'''');
      });
      it("should escape newlines", () {
        expect(escapeSingleQuoteString("\n")).toEqual('''\'\\n\'''');
      });
      it("should escape carriage returns", () {
        expect(escapeSingleQuoteString("\r")).toEqual('''\'\\r\'''');
      });
      if (IS_DART) {
        it("should escape \$", () {
          expect(escapeSingleQuoteString("\$")).toEqual('''\'\\\$\'''');
        });
      } else {
        it("should not escape \$", () {
          expect(escapeSingleQuoteString("\$")).toEqual('''\'\$\'''');
        });
      }
    });
    describe("escapeDoubleQuoteString", () {
      it("should escape double quotes", () {
        expect(escapeDoubleQuoteString('''"''')).toEqual('''"\\""''');
      });
      it("should escape backslash", () {
        expect(escapeDoubleQuoteString("\\")).toEqual('''"\\\\"''');
      });
      it("should escape newlines", () {
        expect(escapeDoubleQuoteString("\n")).toEqual('''"\\n"''');
      });
      it("should escape carriage returns", () {
        expect(escapeDoubleQuoteString("\r")).toEqual('''"\\r"''');
      });
      if (IS_DART) {
        it("should escape \$", () {
          expect(escapeDoubleQuoteString("\$")).toEqual('''"\\\$"''');
        });
      } else {
        it("should not escape \$", () {
          expect(escapeDoubleQuoteString("\$")).toEqual('''"\$"''');
        });
      }
    });
  });
}
