library angular2.src.compiler.legacy_template;

import "package:angular2/src/core/di.dart" show Injectable, Provider, provide;
import "package:angular2/src/facade/lang.dart"
    show StringWrapper, RegExpWrapper, isBlank, isPresent;
import "html_ast.dart"
    show HtmlAstVisitor, HtmlAttrAst, HtmlElementAst, HtmlTextAst, HtmlAst;
import "html_parser.dart" show HtmlParser, HtmlParseTreeResult;
import "util.dart" show dashCaseToCamelCase, camelCaseToDashCase;

var LONG_SYNTAX_REGEXP = new RegExp(
    r'^(?:on-(.*)|bindon-(.*)|bind-(.*)|var-(.*))$',
    caseSensitive: false);
var SHORT_SYNTAX_REGEXP = new RegExp(
    r'^(?:\((.*)\)|\[\((.*)\)\]|\[(.*)\]|#(.*))$',
    caseSensitive: false);
var VARIABLE_TPL_BINDING_REGEXP =
    new RegExp(r'(\bvar\s+|#)(\S+)', caseSensitive: false);
var TEMPLATE_SELECTOR_REGEXP = new RegExp(r'^(\S+)');
var SPECIAL_PREFIXES_REGEXP =
    new RegExp(r'^(class|style|attr)\.', caseSensitive: false);
var INTERPOLATION_REGEXP = new RegExp(r'\{\{.*?\}\}');
const SPECIAL_CASES = const [
  "ng-non-bindable",
  "ng-default-control",
  "ng-no-form"
];

/**
 * Convert templates to the case sensitive syntax
 *
 * @internal
 */
class LegacyHtmlAstTransformer implements HtmlAstVisitor {
  List<String> dashCaseSelectors;
  List<HtmlAst> rewrittenAst = [];
  bool visitingTemplateEl = false;
  LegacyHtmlAstTransformer([this.dashCaseSelectors]) {}
  HtmlElementAst visitElement(HtmlElementAst ast, dynamic context) {
    this.visitingTemplateEl = ast.name.toLowerCase() == "template";
    var attrs = ast.attrs.map((attr) => attr.visit(this, null)).toList();
    var children =
        ast.children.map((child) => child.visit(this, null)).toList();
    return new HtmlElementAst(ast.name, attrs, children, ast.sourceSpan);
  }

  HtmlAttrAst visitAttr(HtmlAttrAst originalAst, dynamic context) {
    var ast = originalAst;
    if (this.visitingTemplateEl) {
      if (isPresent(RegExpWrapper.firstMatch(LONG_SYNTAX_REGEXP, ast.name))) {
        // preserve the "-" in the prefix for the long syntax
        ast = this._rewriteLongSyntax(ast);
      } else {
        // rewrite any other attribute
        var name = dashCaseToCamelCase(ast.name);
        ast = name == ast.name
            ? ast
            : new HtmlAttrAst(name, ast.value, ast.sourceSpan);
      }
    } else {
      ast = this._rewriteTemplateAttribute(ast);
      ast = this._rewriteLongSyntax(ast);
      ast = this._rewriteShortSyntax(ast);
      ast = this._rewriteStar(ast);
      ast = this._rewriteInterpolation(ast);
      ast = this._rewriteSpecialCases(ast);
    }
    if (!identical(ast, originalAst)) {
      this.rewrittenAst.add(ast);
    }
    return ast;
  }

  HtmlTextAst visitText(HtmlTextAst ast, dynamic context) {
    return ast;
  }

  HtmlAttrAst _rewriteLongSyntax(HtmlAttrAst ast) {
    var m = RegExpWrapper.firstMatch(LONG_SYNTAX_REGEXP, ast.name);
    var attrName = ast.name;
    var attrValue = ast.value;
    if (isPresent(m)) {
      if (isPresent(m[1])) {
        attrName = '''on-${ dashCaseToCamelCase ( m [ 1 ] )}''';
      } else if (isPresent(m[2])) {
        attrName = '''bindon-${ dashCaseToCamelCase ( m [ 2 ] )}''';
      } else if (isPresent(m[3])) {
        attrName = '''bind-${ dashCaseToCamelCase ( m [ 3 ] )}''';
      } else if (isPresent(m[4])) {
        attrName = '''var-${ dashCaseToCamelCase ( m [ 4 ] )}''';
        attrValue = dashCaseToCamelCase(attrValue);
      }
    }
    return attrName == ast.name && attrValue == ast.value
        ? ast
        : new HtmlAttrAst(attrName, attrValue, ast.sourceSpan);
  }

  HtmlAttrAst _rewriteTemplateAttribute(HtmlAttrAst ast) {
    var name = ast.name;
    var value = ast.value;
    if (name.toLowerCase() == "template") {
      name = "template";
      // rewrite the directive selector
      value = StringWrapper.replaceAllMapped(value, TEMPLATE_SELECTOR_REGEXP,
          (m) {
        return dashCaseToCamelCase(m[1]);
      });
      // rewrite the var declarations
      value = StringWrapper.replaceAllMapped(value, VARIABLE_TPL_BINDING_REGEXP,
          (m) {
        return '''${ m [ 1 ] . toLowerCase ( )}${ dashCaseToCamelCase ( m [ 2 ] )}''';
      });
    }
    if (name == ast.name && value == ast.value) {
      return ast;
    }
    return new HtmlAttrAst(name, value, ast.sourceSpan);
  }

  HtmlAttrAst _rewriteShortSyntax(HtmlAttrAst ast) {
    var m = RegExpWrapper.firstMatch(SHORT_SYNTAX_REGEXP, ast.name);
    var attrName = ast.name;
    var attrValue = ast.value;
    if (isPresent(m)) {
      if (isPresent(m[1])) {
        attrName = '''(${ dashCaseToCamelCase ( m [ 1 ] )})''';
      } else if (isPresent(m[2])) {
        attrName = '''[(${ dashCaseToCamelCase ( m [ 2 ] )})]''';
      } else if (isPresent(m[3])) {
        var prop = StringWrapper.replaceAllMapped(m[3], SPECIAL_PREFIXES_REGEXP,
            (m) {
          return m[1].toLowerCase() + ".";
        });
        if (prop.startsWith("class.") ||
            prop.startsWith("attr.") ||
            prop.startsWith("style.")) {
          attrName = '''[${ prop}]''';
        } else {
          attrName = '''[${ dashCaseToCamelCase ( prop )}]''';
        }
      } else if (isPresent(m[4])) {
        attrName = '''#${ dashCaseToCamelCase ( m [ 4 ] )}''';
        attrValue = dashCaseToCamelCase(attrValue);
      }
    }
    return attrName == ast.name && attrValue == ast.value
        ? ast
        : new HtmlAttrAst(attrName, attrValue, ast.sourceSpan);
  }

  HtmlAttrAst _rewriteStar(HtmlAttrAst ast) {
    var attrName = ast.name;
    var attrValue = ast.value;
    if (attrName[0] == "*") {
      attrName = dashCaseToCamelCase(attrName);
      // rewrite the var declarations
      attrValue = StringWrapper.replaceAllMapped(
          attrValue, VARIABLE_TPL_BINDING_REGEXP, (m) {
        return '''${ m [ 1 ] . toLowerCase ( )}${ dashCaseToCamelCase ( m [ 2 ] )}''';
      });
    }
    return attrName == ast.name && attrValue == ast.value
        ? ast
        : new HtmlAttrAst(attrName, attrValue, ast.sourceSpan);
  }

  HtmlAttrAst _rewriteInterpolation(HtmlAttrAst ast) {
    var hasInterpolation = RegExpWrapper.test(INTERPOLATION_REGEXP, ast.value);
    if (!hasInterpolation) {
      return ast;
    }
    var name = ast.name;
    if (!(name.startsWith("attr.") ||
        name.startsWith("class.") ||
        name.startsWith("style."))) {
      name = dashCaseToCamelCase(ast.name);
    }
    return name == ast.name
        ? ast
        : new HtmlAttrAst(name, ast.value, ast.sourceSpan);
  }

  HtmlAttrAst _rewriteSpecialCases(HtmlAttrAst ast) {
    var attrName = ast.name;
    if (SPECIAL_CASES.indexOf(attrName) > -1) {
      return new HtmlAttrAst(
          dashCaseToCamelCase(attrName), ast.value, ast.sourceSpan);
    }
    if (isPresent(this.dashCaseSelectors) &&
        this.dashCaseSelectors.indexOf(attrName) > -1) {
      return new HtmlAttrAst(
          dashCaseToCamelCase(attrName), ast.value, ast.sourceSpan);
    }
    return ast;
  }
}

@Injectable()
class LegacyHtmlParser extends HtmlParser {
  HtmlParseTreeResult parse(String sourceContent, String sourceUrl) {
    var transformer = new LegacyHtmlAstTransformer();
    var htmlParseTreeResult = super.parse(sourceContent, sourceUrl);
    var rootNodes = htmlParseTreeResult.rootNodes
        .map((node) => node.visit(transformer, null))
        .toList();
    return transformer.rewrittenAst.length > 0
        ? new HtmlParseTreeResult(rootNodes, htmlParseTreeResult.errors)
        : htmlParseTreeResult;
  }
}
