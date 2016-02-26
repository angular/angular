import {
  TemplateAstVisitor,
  ElementAst,
  BoundDirectivePropertyAst,
  DirectiveAst,
  BoundElementPropertyAst
} from 'angular2/compiler';
import {
  AstTransformer,
  Quote,
  AST,
  EmptyExpr,
  LiteralArray,
  LiteralPrimitive,
  ASTWithSource
} from 'angular2/src/core/change_detection/parser/ast';
import {BaseException} from 'angular2/src/facade/exceptions';
import {Injectable} from 'angular2/core';
import {Parser} from 'angular2/src/core/change_detection/parser/parser';

/**
 * e.g., './User', 'Modal' in ./User[Modal(param: value)]
 */
class FixedPart {
  constructor(public value: string) {}
}

/**
 * The square bracket
 */
class AuxiliaryStart {
  constructor() {}
}

/**
 * The square bracket
 */
class AuxiliaryEnd {
  constructor() {}
}

/**
 * e.g., param:value in ./User[Modal(param: value)]
 */
class Params {
  constructor(public ast: AST) {}
}

class RouterLinkLexer {
  index: number = 0;

  constructor(private parser: Parser, private exp: string) {}

  tokenize(): Array<FixedPart | AuxiliaryStart | AuxiliaryEnd | Params> {
    let tokens = [];
    while (this.index < this.exp.length) {
      tokens.push(this._parseToken());
    }
    return tokens;
  }

  private _parseToken() {
    let c = this.exp[this.index];
    if (c == '[') {
      this.index++;
      return new AuxiliaryStart();

    } else if (c == ']') {
      this.index++;
      return new AuxiliaryEnd();

    } else if (c == '(') {
      return this._parseParams();

    } else if (c == '/' && this.index !== 0) {
      this.index++;
      return this._parseFixedPart();

    } else {
      return this._parseFixedPart();
    }
  }

  private _parseParams() {
    let start = this.index;
    for (; this.index < this.exp.length; ++this.index) {
      let c = this.exp[this.index];
      if (c == ')') {
        let paramsContent = this.exp.substring(start + 1, this.index);
        this.index++;
        return new Params(this.parser.parseBinding(`{${paramsContent}}`, null).ast);
      }
    }
    throw new BaseException("Cannot find ')'");
  }

  private _parseFixedPart() {
    let start = this.index;
    let sawNonSlash = false;


    for (; this.index < this.exp.length; ++this.index) {
      let c = this.exp[this.index];

      if (c == '(' || c == '[' || c == ']' || (c == '/' && sawNonSlash)) {
        break;
      }

      if (c != '.' && c != '/') {
        sawNonSlash = true;
      }
    }

    let fixed = this.exp.substring(start, this.index);

    if (start === this.index || !sawNonSlash || fixed.startsWith('//')) {
      throw new BaseException("Invalid router link");
    }

    return new FixedPart(fixed);
  }
}

class RouterLinkAstGenerator {
  index: number = 0;
  constructor(private tokens: any[]) {}

  generate(): AST { return this._genAuxiliary(); }

  private _genAuxiliary(): AST {
    let arr = [];
    for (; this.index < this.tokens.length; this.index++) {
      let r = this.tokens[this.index];

      if (r instanceof FixedPart) {
        arr.push(new LiteralPrimitive(r.value));

      } else if (r instanceof Params) {
        arr.push(r.ast);

      } else if (r instanceof AuxiliaryEnd) {
        break;

      } else if (r instanceof AuxiliaryStart) {
        this.index++;
        arr.push(this._genAuxiliary());
      }
    }

    return new LiteralArray(arr);
  }
}

class RouterLinkAstTransformer extends AstTransformer {
  constructor(private parser: Parser) { super(); }

  visitQuote(ast: Quote): AST {
    if (ast.prefix == "route") {
      return parseRouterLinkExpression(this.parser, ast.uninterpretedExpression);
    } else {
      return super.visitQuote(ast);
    }
  }
}

export function parseRouterLinkExpression(parser: Parser, exp: string): AST {
  let tokens = new RouterLinkLexer(parser, exp.trim()).tokenize();
  return new RouterLinkAstGenerator(tokens).generate();
}

/**
 * A compiler plugin that implements the router link DSL.
 */
@Injectable()
export class RouterLinkTransform implements TemplateAstVisitor {
  private astTransformer;

  constructor(parser: Parser) { this.astTransformer = new RouterLinkAstTransformer(parser); }

  visitNgContent(ast: any, context: any): any { return ast; }

  visitEmbeddedTemplate(ast: any, context: any): any { return ast; }

  visitElement(ast: ElementAst, context: any): any {
    let updatedChildren = ast.children.map(c => c.visit(this, context));
    let updatedInputs = ast.inputs.map(c => c.visit(this, context));
    let updatedDirectives = ast.directives.map(c => c.visit(this, context));
    return new ElementAst(ast.name, ast.attrs, updatedInputs, ast.outputs, ast.exportAsVars,
                          updatedDirectives, updatedChildren, ast.ngContentIndex, ast.sourceSpan);
  }

  visitVariable(ast: any, context: any): any { return ast; }

  visitEvent(ast: any, context: any): any { return ast; }

  visitElementProperty(ast: any, context: any): any { return ast; }

  visitAttr(ast: any, context: any): any { return ast; }

  visitBoundText(ast: any, context: any): any { return ast; }

  visitText(ast: any, context: any): any { return ast; }

  visitDirective(ast: DirectiveAst, context: any): any {
    let updatedInputs = ast.inputs.map(c => c.visit(this, context));
    return new DirectiveAst(ast.directive, updatedInputs, ast.hostProperties, ast.hostEvents,
                            ast.exportAsVars, ast.sourceSpan);
  }

  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {
    let transformedValue = ast.value.visit(this.astTransformer);
    return new BoundDirectivePropertyAst(ast.directiveName, ast.templateName, transformedValue,
                                         ast.sourceSpan);
  }
}