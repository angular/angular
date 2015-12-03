library angular2.test.compiler.html_parser_spec;

import "package:angular2/testing_internal.dart"
    show ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach;
import "package:angular2/src/compiler/html_lexer.dart" show HtmlTokenType;
import "package:angular2/src/compiler/html_parser.dart"
    show HtmlParser, HtmlParseTreeResult, HtmlTreeError;
import "package:angular2/src/compiler/html_ast.dart"
    show
        HtmlAst,
        HtmlAstVisitor,
        HtmlElementAst,
        HtmlAttrAst,
        HtmlTextAst,
        htmlVisitAll;
import "package:angular2/src/compiler/parse_util.dart"
    show ParseError, ParseLocation, ParseSourceSpan;
import "package:angular2/src/facade/exceptions.dart" show BaseException;

main() {
  describe("HtmlParser", () {
    HtmlParser parser;
    beforeEach(() {
      parser = new HtmlParser();
    });
    describe("parse", () {
      describe("text nodes", () {
        it("should parse root level text nodes", () {
          expect(humanizeDom(parser.parse("a", "TestComp"))).toEqual([
            [HtmlTextAst, "a", 0]
          ]);
        });
        it("should parse text nodes inside regular elements", () {
          expect(humanizeDom(parser.parse("<div>a</div>", "TestComp")))
              .toEqual([
            [HtmlElementAst, "div", 0],
            [HtmlTextAst, "a", 1]
          ]);
        });
        it("should parse text nodes inside template elements", () {
          expect(humanizeDom(
              parser.parse("<template>a</template>", "TestComp"))).toEqual([
            [HtmlElementAst, "template", 0],
            [HtmlTextAst, "a", 1]
          ]);
        });
        it("should parse CDATA", () {
          expect(humanizeDom(parser.parse("<![CDATA[text]]>", "TestComp")))
              .toEqual([
            [HtmlTextAst, "text", 0]
          ]);
        });
      });
      describe("elements", () {
        it("should parse root level elements", () {
          expect(humanizeDom(parser.parse("<div></div>", "TestComp"))).toEqual([
            [HtmlElementAst, "div", 0]
          ]);
        });
        it("should parse elements inside of regular elements", () {
          expect(humanizeDom(
              parser.parse("<div><span></span></div>", "TestComp"))).toEqual([
            [HtmlElementAst, "div", 0],
            [HtmlElementAst, "span", 1]
          ]);
        });
        it("should parse elements inside of template elements", () {
          expect(humanizeDom(parser.parse(
              "<template><span></span></template>", "TestComp"))).toEqual([
            [HtmlElementAst, "template", 0],
            [HtmlElementAst, "span", 1]
          ]);
        });
        it("should support void elements", () {
          expect(humanizeDom(parser.parse(
                  "<link rel=\"author license\" href=\"/about\">", "TestComp")))
              .toEqual([
            [HtmlElementAst, "link", 0],
            [HtmlAttrAst, "rel", "author license"],
            [HtmlAttrAst, "href", "/about"]
          ]);
        });
        it("should close void elements on text nodes", () {
          expect(humanizeDom(
              parser.parse("<p>before<br>after</p>", "TestComp"))).toEqual([
            [HtmlElementAst, "p", 0],
            [HtmlTextAst, "before", 1],
            [HtmlElementAst, "br", 1],
            [HtmlTextAst, "after", 1]
          ]);
        });
        it("should tolerate end tags for void elements when they have no content",
            () {
          expect(humanizeDom(parser.parse("<input></input>", "TestComp")))
              .toEqual([
            [HtmlElementAst, "input", 0]
          ]);
        });
        it("should support optional end tags", () {
          expect(humanizeDom(parser.parse("<div><p>1<p>2</div>", "TestComp")))
              .toEqual([
            [HtmlElementAst, "div", 0],
            [HtmlElementAst, "p", 1],
            [HtmlTextAst, "1", 2],
            [HtmlElementAst, "p", 1],
            [HtmlTextAst, "2", 2]
          ]);
        });
        it("should support nested elements", () {
          expect(humanizeDom(parser.parse(
              "<ul><li><ul><li></li></ul></li></ul>", "TestComp"))).toEqual([
            [HtmlElementAst, "ul", 0],
            [HtmlElementAst, "li", 1],
            [HtmlElementAst, "ul", 2],
            [HtmlElementAst, "li", 3]
          ]);
        });
        it("should add the requiredParent", () {
          expect(humanizeDom(parser.parse(
              "<table><thead><tr head></tr></thead><tr noparent></tr><tbody><tr body></tr></tbody><tfoot><tr foot></tr></tfoot></table>",
              "TestComp"))).toEqual([
            [HtmlElementAst, "table", 0],
            [HtmlElementAst, "thead", 1],
            [HtmlElementAst, "tr", 2],
            [HtmlAttrAst, "head", ""],
            [HtmlElementAst, "tbody", 1],
            [HtmlElementAst, "tr", 2],
            [HtmlAttrAst, "noparent", ""],
            [HtmlElementAst, "tbody", 1],
            [HtmlElementAst, "tr", 2],
            [HtmlAttrAst, "body", ""],
            [HtmlElementAst, "tfoot", 1],
            [HtmlElementAst, "tr", 2],
            [HtmlAttrAst, "foot", ""]
          ]);
        });
        it("should support explicit mamespace", () {
          expect(humanizeDom(parser.parse("<myns:div></myns:div>", "TestComp")))
              .toEqual([
            [HtmlElementAst, "@myns:div", 0]
          ]);
        });
        it("should support implicit mamespace", () {
          expect(humanizeDom(parser.parse("<svg></svg>", "TestComp"))).toEqual([
            [HtmlElementAst, "@svg:svg", 0]
          ]);
        });
        it("should propagate the namespace", () {
          expect(humanizeDom(
                  parser.parse("<myns:div><p></p></myns:div>", "TestComp")))
              .toEqual([
            [HtmlElementAst, "@myns:div", 0],
            [HtmlElementAst, "@myns:p", 1]
          ]);
        });
        it("should match closing tags case insensitive", () {
          expect(humanizeDom(parser.parse("<DiV><P></p></dIv>", "TestComp")))
              .toEqual([
            [HtmlElementAst, "DiV", 0],
            [HtmlElementAst, "P", 1]
          ]);
        });
      });
      describe("attributes", () {
        it("should parse attributes on regular elements case sensitive", () {
          expect(humanizeDom(
                  parser.parse("<div kEy=\"v\" key2=v2></div>", "TestComp")))
              .toEqual([
            [HtmlElementAst, "div", 0],
            [HtmlAttrAst, "kEy", "v"],
            [HtmlAttrAst, "key2", "v2"]
          ]);
        });
        it("should parse attributes without values", () {
          expect(humanizeDom(parser.parse("<div k></div>", "TestComp")))
              .toEqual([
            [HtmlElementAst, "div", 0],
            [HtmlAttrAst, "k", ""]
          ]);
        });
        it("should parse attributes on svg elements case sensitive", () {
          expect(humanizeDom(
              parser.parse("<svg viewBox=\"0\"></svg>", "TestComp"))).toEqual([
            [HtmlElementAst, "@svg:svg", 0],
            [HtmlAttrAst, "viewBox", "0"]
          ]);
        });
        it("should parse attributes on template elements", () {
          expect(humanizeDom(
                  parser.parse("<template k=\"v\"></template>", "TestComp")))
              .toEqual([
            [HtmlElementAst, "template", 0],
            [HtmlAttrAst, "k", "v"]
          ]);
        });
        it("should support mamespace", () {
          expect(humanizeDom(
                  parser.parse("<use xlink:href=\"Port\" />", "TestComp")))
              .toEqual([
            [HtmlElementAst, "use", 0],
            [HtmlAttrAst, "@xlink:href", "Port"]
          ]);
        });
      });
      describe("comments", () {
        it("should ignore comments", () {
          expect(humanizeDom(
                  parser.parse("<!-- comment --><div></div>", "TestComp")))
              .toEqual([
            [HtmlElementAst, "div", 0]
          ]);
        });
      });
      describe("source spans", () {
        it("should store the location", () {
          expect(humanizeDomSourceSpans(parser.parse(
              "<div [prop]=\"v1\" (e)=\"do()\" attr=\"v2\" noValue>\na\n</div>",
              "TestComp"))).toEqual([
            [
              HtmlElementAst,
              "div",
              0,
              "<div [prop]=\"v1\" (e)=\"do()\" attr=\"v2\" noValue>"
            ],
            [HtmlAttrAst, "[prop]", "v1", "[prop]=\"v1\""],
            [HtmlAttrAst, "(e)", "do()", "(e)=\"do()\""],
            [HtmlAttrAst, "attr", "v2", "attr=\"v2\""],
            [HtmlAttrAst, "noValue", "", "noValue"],
            [HtmlTextAst, "\na\n", 1, "\na\n"]
          ]);
        });
      });
      describe("errors", () {
        it("should report unexpected closing tags", () {
          var errors = parser.parse("<div></p></div>", "TestComp").errors;
          expect(errors.length).toEqual(1);
          expect(humanizeErrors(errors)).toEqual([
            ["p", "Unexpected closing tag \"p\"", "0:5"]
          ]);
        });
        it("should report text content in void elements", () {
          var errors =
              parser.parse("<input>content</input>", "TestComp").errors;
          expect(errors.length).toEqual(1);
          expect(humanizeErrors(errors)).toEqual([
            [
              "input",
              "Void elements do not have end tags (they can not have content) \"input\"",
              "0:14"
            ]
          ]);
        });
        it("should report html content in void elements", () {
          var errors =
              parser.parse("<input><p></p></input>", "TestComp").errors;
          expect(errors.length).toEqual(1);
          expect(humanizeErrors(errors)).toEqual([
            [
              "input",
              "Void elements do not have end tags (they can not have content) \"input\"",
              "0:14"
            ]
          ]);
        });
        it("should also report lexer errors", () {
          var errors =
              parser.parse("<!-err--><div></p></div>", "TestComp").errors;
          expect(errors.length).toEqual(2);
          expect(humanizeErrors(errors)).toEqual([
            [HtmlTokenType.COMMENT_START, "Unexpected character \"e\"", "0:3"],
            ["p", "Unexpected closing tag \"p\"", "0:14"]
          ]);
        });
      });
    });
  });
}

List<dynamic> humanizeDom(HtmlParseTreeResult parseResult) {
  if (parseResult.errors.length > 0) {
    var errorString = parseResult.errors.join("\n");
    throw new BaseException('''Unexpected parse errors:
${ errorString}''');
  }
  var humanizer = new Humanizer(false);
  htmlVisitAll(humanizer, parseResult.rootNodes);
  return humanizer.result;
}

List<dynamic> humanizeDomSourceSpans(HtmlParseTreeResult parseResult) {
  if (parseResult.errors.length > 0) {
    var errorString = parseResult.errors.join("\n");
    throw new BaseException('''Unexpected parse errors:
${ errorString}''');
  }
  var humanizer = new Humanizer(true);
  htmlVisitAll(humanizer, parseResult.rootNodes);
  return humanizer.result;
}

String humanizeLineColumn(ParseLocation location) {
  return '''${ location . line}:${ location . col}''';
}

List<dynamic> humanizeErrors(List<ParseError> errors) {
  return errors.map((error) {
    if (error is HtmlTreeError) {
      // Parser errors
      return [
        (error.elementName as dynamic),
        error.msg,
        humanizeLineColumn(error.location)
      ];
    }
    // Tokenizer errors
    return [
      ((error as dynamic)).tokenType,
      error.msg,
      humanizeLineColumn(error.location)
    ];
  }).toList();
}

class Humanizer implements HtmlAstVisitor {
  bool includeSourceSpan;
  List<dynamic> result = [];
  num elDepth = 0;
  Humanizer(this.includeSourceSpan) {}
  dynamic visitElement(HtmlElementAst ast, dynamic context) {
    var res =
        this._appendContext(ast, [HtmlElementAst, ast.name, this.elDepth++]);
    this.result.add(res);
    htmlVisitAll(this, ast.attrs);
    htmlVisitAll(this, ast.children);
    this.elDepth--;
    return null;
  }

  dynamic visitAttr(HtmlAttrAst ast, dynamic context) {
    var res = this._appendContext(ast, [HtmlAttrAst, ast.name, ast.value]);
    this.result.add(res);
    return null;
  }

  dynamic visitText(HtmlTextAst ast, dynamic context) {
    var res = this._appendContext(ast, [HtmlTextAst, ast.value, this.elDepth]);
    this.result.add(res);
    return null;
  }

  List<dynamic> _appendContext(HtmlAst ast, List<dynamic> input) {
    if (!this.includeSourceSpan) return input;
    input.add(ast.sourceSpan.toString());
    return input;
  }
}
