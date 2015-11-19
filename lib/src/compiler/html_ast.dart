library angular2.src.compiler.html_ast;

import "package:angular2/src/facade/lang.dart" show isPresent;
import "parse_util.dart" show ParseSourceSpan;

abstract class HtmlAst {
  ParseSourceSpan sourceSpan;
  dynamic visit(HtmlAstVisitor visitor, dynamic context);
}

class HtmlTextAst implements HtmlAst {
  String value;
  ParseSourceSpan sourceSpan;
  HtmlTextAst(this.value, this.sourceSpan) {}
  dynamic visit(HtmlAstVisitor visitor, dynamic context) {
    return visitor.visitText(this, context);
  }
}

class HtmlAttrAst implements HtmlAst {
  String name;
  String value;
  ParseSourceSpan sourceSpan;
  HtmlAttrAst(this.name, this.value, this.sourceSpan) {}
  dynamic visit(HtmlAstVisitor visitor, dynamic context) {
    return visitor.visitAttr(this, context);
  }
}

class HtmlElementAst implements HtmlAst {
  String name;
  List<HtmlAttrAst> attrs;
  List<HtmlAst> children;
  ParseSourceSpan sourceSpan;
  HtmlElementAst(this.name, this.attrs, this.children, this.sourceSpan) {}
  dynamic visit(HtmlAstVisitor visitor, dynamic context) {
    return visitor.visitElement(this, context);
  }
}

abstract class HtmlAstVisitor {
  dynamic visitElement(HtmlElementAst ast, dynamic context);
  dynamic visitAttr(HtmlAttrAst ast, dynamic context);
  dynamic visitText(HtmlTextAst ast, dynamic context);
}

List<dynamic> htmlVisitAll(HtmlAstVisitor visitor, List<HtmlAst> asts,
    [dynamic context = null]) {
  var result = [];
  asts.forEach((ast) {
    var astResult = ast.visit(visitor, context);
    if (isPresent(astResult)) {
      result.add(astResult);
    }
  });
  return result;
}
