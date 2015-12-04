library angular2.test.router.router_link_transform_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        describe,
        proxy,
        it,
        iit,
        ddescribe,
        expect,
        inject,
        beforeEach,
        beforeEachBindings,
        SpyObject;
import "package:angular2/core.dart" show Injector, provide;
import "package:angular2/src/router/router_link_transform.dart"
    show parseRouterLinkExpression;
import "../core/change_detection/parser/unparser.dart" show Unparser;
import "package:angular2/src/core/change_detection/parser/parser.dart"
    show Parser;

main() {
  check(Parser parser, String input, String expectedValue) {
    var ast = parseRouterLinkExpression(parser, input);
    expect(new Unparser().unparse(ast)).toEqual(expectedValue);
  }
  describe("parseRouterLinkExpression", () {
    it(
        "should parse simple routes",
        inject([Parser], (p) {
          check(p, '''User''', '''["User"]''');
          check(p, '''/User''', '''["/User"]''');
          check(p, '''./User''', '''["./User"]''');
          check(p, '''../../User''', '''["../../User"]''');
        }));
    it(
        "should trim the string",
        inject([Parser], (p) {
          check(p, '''  User  ''', '''["User"]''');
        }));
    it(
        "should parse parameters",
        inject([Parser], (p) {
          check(p, '''./User(id: value, name: \'Bob\')''',
              '''["./User", {id: value, name: "Bob"}]''');
        }));
    it(
        "should parse nested routes",
        inject([Parser], (p) {
          check(p, '''User/Modal''', '''["User", "Modal"]''');
          check(p, '''/User/Modal''', '''["/User", "Modal"]''');
        }));
    it(
        "should parse auxiliary routes",
        inject([Parser], (p) {
          check(p, '''User[Modal]''', '''["User", ["Modal"]]''');
          check(p, '''User[Modal1][Modal2]''',
              '''["User", ["Modal1"], ["Modal2"]]''');
          check(p, '''User[Modal1[Modal2]]''',
              '''["User", ["Modal1", ["Modal2"]]]''');
        }));
    it(
        "should parse combinations",
        inject([Parser], (p) {
          check(p, '''./User(id: value)/Post(title: \'blog\')''',
              '''["./User", {id: value}, "Post", {title: "blog"}]''');
          check(p, '''./User[Modal(param: value)]''',
              '''["./User", ["Modal", {param: value}]]''');
        }));
    it(
        "should error on empty fixed parts",
        inject([Parser], (p) {
          expect(() => parseRouterLinkExpression(
                  p, '''./(id: value, name: \'Bob\')'''))
              .toThrowErrorWith("Invalid router link");
        }));
    it(
        "should error on multiple slashes",
        inject([Parser], (p) {
          expect(() => parseRouterLinkExpression(p, '''//User'''))
              .toThrowErrorWith("Invalid router link");
        }));
  });
}
