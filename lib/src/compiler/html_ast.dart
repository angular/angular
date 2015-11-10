library angular2.src.compiler.html_ast;

import "package:angular2/src/facade/lang.dart" show isPresent;

abstract class HtmlAst {
  String sourceInfo;
  dynamic visit(HtmlAstVisitor visitor, dynamic context);
}

class HtmlTextAst implements HtmlAst {
  String value;
  String sourceInfo;
  HtmlTextAst(this.value, this.sourceInfo) {}
  dynamic visit(HtmlAstVisitor visitor, dynamic context) {
    return visitor.visitText(this, context);
  }
}

class HtmlAttrAst implements HtmlAst {
  String name;
  String value;
  String sourceInfo;
  HtmlAttrAst(this.name, this.value, this.sourceInfo) {}
  dynamic visit(HtmlAstVisitor visitor, dynamic context) {
    return visitor.visitAttr(this, context);
  }
}

class HtmlElementAst implements HtmlAst {
  String name;
  List<HtmlAttrAst> attrs;
  List<HtmlAst> children;
  String sourceInfo;
  HtmlElementAst(this.name, this.attrs, this.children, this.sourceInfo) {}
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
