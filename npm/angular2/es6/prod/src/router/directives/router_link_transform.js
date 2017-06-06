var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ElementAst, BoundDirectivePropertyAst, DirectiveAst } from 'angular2/compiler';
import { AstTransformer, LiteralArray, LiteralPrimitive } from 'angular2/src/compiler/expression_parser/ast';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Injectable } from 'angular2/core';
import { Parser } from 'angular2/src/compiler/expression_parser/parser';
/**
 * e.g., './User', 'Modal' in ./User[Modal(param: value)]
 */
class FixedPart {
    constructor(value) {
        this.value = value;
    }
}
/**
 * The square bracket
 */
class AuxiliaryStart {
    constructor() {
    }
}
/**
 * The square bracket
 */
class AuxiliaryEnd {
    constructor() {
    }
}
/**
 * e.g., param:value in ./User[Modal(param: value)]
 */
class Params {
    constructor(ast) {
        this.ast = ast;
    }
}
class RouterLinkLexer {
    constructor(parser, exp) {
        this.parser = parser;
        this.exp = exp;
        this.index = 0;
    }
    tokenize() {
        let tokens = [];
        while (this.index < this.exp.length) {
            tokens.push(this._parseToken());
        }
        return tokens;
    }
    _parseToken() {
        let c = this.exp[this.index];
        if (c == '[') {
            this.index++;
            return new AuxiliaryStart();
        }
        else if (c == ']') {
            this.index++;
            return new AuxiliaryEnd();
        }
        else if (c == '(') {
            return this._parseParams();
        }
        else if (c == '/' && this.index !== 0) {
            this.index++;
            return this._parseFixedPart();
        }
        else {
            return this._parseFixedPart();
        }
    }
    _parseParams() {
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
    _parseFixedPart() {
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
    constructor(tokens) {
        this.tokens = tokens;
        this.index = 0;
    }
    generate() { return this._genAuxiliary(); }
    _genAuxiliary() {
        let arr = [];
        for (; this.index < this.tokens.length; this.index++) {
            let r = this.tokens[this.index];
            if (r instanceof FixedPart) {
                arr.push(new LiteralPrimitive(r.value));
            }
            else if (r instanceof Params) {
                arr.push(r.ast);
            }
            else if (r instanceof AuxiliaryEnd) {
                break;
            }
            else if (r instanceof AuxiliaryStart) {
                this.index++;
                arr.push(this._genAuxiliary());
            }
        }
        return new LiteralArray(arr);
    }
}
class RouterLinkAstTransformer extends AstTransformer {
    constructor(parser) {
        super();
        this.parser = parser;
    }
    visitQuote(ast, context) {
        if (ast.prefix == "route") {
            return parseRouterLinkExpression(this.parser, ast.uninterpretedExpression);
        }
        else {
            return super.visitQuote(ast, context);
        }
    }
}
export function parseRouterLinkExpression(parser, exp) {
    let tokens = new RouterLinkLexer(parser, exp.trim()).tokenize();
    return new RouterLinkAstGenerator(tokens).generate();
}
/**
 * A compiler plugin that implements the router link DSL.
 */
export let RouterLinkTransform = class RouterLinkTransform {
    constructor(parser) {
        this.astTransformer = new RouterLinkAstTransformer(parser);
    }
    visitNgContent(ast, context) { return ast; }
    visitEmbeddedTemplate(ast, context) { return ast; }
    visitElement(ast, context) {
        let updatedChildren = ast.children.map(c => c.visit(this, context));
        let updatedInputs = ast.inputs.map(c => c.visit(this, context));
        let updatedDirectives = ast.directives.map(c => c.visit(this, context));
        return new ElementAst(ast.name, ast.attrs, updatedInputs, ast.outputs, ast.references, updatedDirectives, ast.providers, ast.hasViewContainer, updatedChildren, ast.ngContentIndex, ast.sourceSpan);
    }
    visitReference(ast, context) { return ast; }
    visitVariable(ast, context) { return ast; }
    visitEvent(ast, context) { return ast; }
    visitElementProperty(ast, context) { return ast; }
    visitAttr(ast, context) { return ast; }
    visitBoundText(ast, context) { return ast; }
    visitText(ast, context) { return ast; }
    visitDirective(ast, context) {
        let updatedInputs = ast.inputs.map(c => c.visit(this, context));
        return new DirectiveAst(ast.directive, updatedInputs, ast.hostProperties, ast.hostEvents, ast.sourceSpan);
    }
    visitDirectiveProperty(ast, context) {
        let transformedValue = ast.value.visit(this.astTransformer);
        return new BoundDirectivePropertyAst(ast.directiveName, ast.templateName, transformedValue, ast.sourceSpan);
    }
};
RouterLinkTransform = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [Parser])
], RouterLinkTransform);
