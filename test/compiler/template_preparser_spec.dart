library angular2.test.compiler.template_preparser_spec;

import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        describe,
        xdescribe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach,
        AsyncTestCompleter,
        inject,
        beforeEachBindings;
import "package:angular2/src/compiler/html_parser.dart" show HtmlParser;
import "package:angular2/src/compiler/template_preparser.dart"
    show preparseElement, PreparsedElementType, PreparsedElement;

main() {
  describe("preparseElement", () {
    var htmlParser;
    beforeEach(inject([HtmlParser], (HtmlParser _htmlParser) {
      htmlParser = _htmlParser;
    }));
    PreparsedElement preparse(String html) {
      return preparseElement(htmlParser.parse(html, "")[0]);
    }
    it(
        "should detect script elements",
        inject([HtmlParser], (HtmlParser htmlParser) {
          expect(preparse("<script>").type).toBe(PreparsedElementType.SCRIPT);
        }));
    it(
        "should detect style elements",
        inject([HtmlParser], (HtmlParser htmlParser) {
          expect(preparse("<style>").type).toBe(PreparsedElementType.STYLE);
        }));
    it(
        "should detect stylesheet elements",
        inject([HtmlParser], (HtmlParser htmlParser) {
          expect(preparse("<link rel=\"stylesheet\">").type)
              .toBe(PreparsedElementType.STYLESHEET);
          expect(preparse("<link rel=\"stylesheet\" href=\"someUrl\">")
              .hrefAttr).toEqual("someUrl");
          expect(preparse("<link rel=\"someRel\">").type)
              .toBe(PreparsedElementType.OTHER);
        }));
    it(
        "should detect ng-content elements",
        inject([HtmlParser], (HtmlParser htmlParser) {
          expect(preparse("<ng-content>").type)
              .toBe(PreparsedElementType.NG_CONTENT);
        }));
    it(
        "should normalize ng-content.select attribute",
        inject([HtmlParser], (HtmlParser htmlParser) {
          expect(preparse("<ng-content>").selectAttr).toEqual("*");
          expect(preparse("<ng-content select>").selectAttr).toEqual("*");
          expect(preparse("<ng-content select=\"*\">").selectAttr).toEqual("*");
        }));
  });
}
