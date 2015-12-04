library angular2.src.router.router_link_transform;

import "package:angular2/compiler.dart"
    show
        TemplateAstVisitor,
        ElementAst,
        BoundDirectivePropertyAst,
        DirectiveAst,
        BoundElementPropertyAst;
import "package:angular2/src/core/change_detection/parser/ast.dart"
    show
        AstTransformer,
        Quote,
        AST,
        EmptyExpr,
        LiteralArray,
        LiteralPrimitive,
        ASTWithSource;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/core.dart" show Injectable;
import "package:angular2/src/core/change_detection/parser/parser.dart"
    show Parser;

/**
 * e.g., './User', 'Modal' in ./User[Modal(param: value)]
 */
class FixedPart {
  String value;
  FixedPart(this.value) {}
}

/**
 * The square bracket
 */
class AuxiliaryStart {
  AuxiliaryStart() {}
}

/**
 * The square bracket
 */
class AuxiliaryEnd {
  AuxiliaryEnd() {}
}

/**
 * e.g., param:value in ./User[Modal(param: value)]
 */
class Params {
  AST ast;
  Params(this.ast) {}
}

class RouterLinkLexer {
  Parser parser;
  String exp;
  num index = 0;
  RouterLinkLexer(this.parser, this.exp) {}
  List<
      dynamic /* FixedPart | AuxiliaryStart | AuxiliaryEnd | Params */ > tokenize() {
    var tokens = [];
    while (this.index < this.exp.length) {
      tokens.add(this._parseToken());
    }
    return tokens;
  }

  _parseToken() {
    var c = this.exp[this.index];
    if (c == "[") {
      this.index++;
      return new AuxiliaryStart();
    } else if (c == "]") {
      this.index++;
      return new AuxiliaryEnd();
    } else if (c == "(") {
      return this._parseParams();
    } else if (c == "/" && !identical(this.index, 0)) {
      this.index++;
      return this._parseFixedPart();
    } else {
      return this._parseFixedPart();
    }
  }

  _parseParams() {
    var start = this.index;
    for (; this.index < this.exp.length; ++this.index) {
      var c = this.exp[this.index];
      if (c == ")") {
        var paramsContent = this.exp.substring(start + 1, this.index);
        this.index++;
        return new Params(
            this.parser.parseBinding('''{${ paramsContent}}''', null).ast);
      }
    }
    throw new BaseException("Cannot find ')'");
  }

  _parseFixedPart() {
    var start = this.index;
    var sawNonSlash = false;
    for (; this.index < this.exp.length; ++this.index) {
      var c = this.exp[this.index];
      if (c == "(" || c == "[" || c == "]" || (c == "/" && sawNonSlash)) {
        break;
      }
      if (c != "." && c != "/") {
        sawNonSlash = true;
      }
    }
    var fixed = this.exp.substring(start, this.index);
    if (identical(start, this.index) ||
        !sawNonSlash ||
        fixed.startsWith("//")) {
      throw new BaseException("Invalid router link");
    }
    return new FixedPart(fixed);
  }
}

class RouterLinkAstGenerator {
  List<dynamic> tokens;
  num index = 0;
  RouterLinkAstGenerator(this.tokens) {}
  AST generate() {
    return this._genAuxiliary();
  }

  AST _genAuxiliary() {
    var arr = [];
    for (; this.index < this.tokens.length; this.index++) {
      var r = this.tokens[this.index];
      if (r is FixedPart) {
        arr.add(new LiteralPrimitive(r.value));
      } else if (r is Params) {
        arr.add(r.ast);
      } else if (r is AuxiliaryEnd) {
        break;
      } else if (r is AuxiliaryStart) {
        this.index++;
        arr.add(this._genAuxiliary());
      }
    }
    return new LiteralArray(arr);
  }
}

class RouterLinkAstTransformer extends AstTransformer {
  Parser parser;
  RouterLinkAstTransformer(this.parser) : super() {
    /* super call moved to initializer */;
  }
  AST visitQuote(Quote ast) {
    if (ast.prefix == "route") {
      return parseRouterLinkExpression(
          this.parser, ast.uninterpretedExpression);
    } else {
      return super.visitQuote(ast);
    }
  }
}

AST parseRouterLinkExpression(Parser parser, String exp) {
  var tokens = new RouterLinkLexer(parser, exp.trim()).tokenize();
  return new RouterLinkAstGenerator(tokens).generate();
}

/**
 * A compiler plugin that implements the router link DSL.
 */
@Injectable()
class RouterLinkTransform implements TemplateAstVisitor {
  var astTransformer;
  RouterLinkTransform(Parser parser) {
    this.astTransformer = new RouterLinkAstTransformer(parser);
  }
  dynamic visitNgContent(dynamic ast, dynamic context) {
    return ast;
  }

  dynamic visitEmbeddedTemplate(dynamic ast, dynamic context) {
    return ast;
  }

  dynamic visitElement(ElementAst ast, dynamic context) {
    var updatedChildren =
        ast.children.map((c) => c.visit(this, context)).toList();
    var updatedInputs = ast.inputs.map((c) => c.visit(this, context)).toList();
    var updatedDirectives =
        ast.directives.map((c) => c.visit(this, context)).toList();
    return new ElementAst(
        ast.name,
        ast.attrs,
        updatedInputs,
        ast.outputs,
        ast.exportAsVars,
        updatedDirectives,
        updatedChildren,
        ast.ngContentIndex,
        ast.sourceSpan);
  }

  dynamic visitVariable(dynamic ast, dynamic context) {
    return ast;
  }

  dynamic visitEvent(dynamic ast, dynamic context) {
    return ast;
  }

  dynamic visitElementProperty(dynamic ast, dynamic context) {
    return ast;
  }

  dynamic visitAttr(dynamic ast, dynamic context) {
    return ast;
  }

  dynamic visitBoundText(dynamic ast, dynamic context) {
    return ast;
  }

  dynamic visitText(dynamic ast, dynamic context) {
    return ast;
  }

  dynamic visitDirective(DirectiveAst ast, dynamic context) {
    var updatedInputs = ast.inputs.map((c) => c.visit(this, context)).toList();
    return new DirectiveAst(ast.directive, updatedInputs, ast.hostProperties,
        ast.hostEvents, ast.exportAsVars, ast.sourceSpan);
  }

  dynamic visitDirectiveProperty(
      BoundDirectivePropertyAst ast, dynamic context) {
    var transformedValue = ast.value.visit(this.astTransformer);
    return new BoundDirectivePropertyAst(
        ast.directiveName, ast.templateName, transformedValue, ast.sourceSpan);
  }
}
