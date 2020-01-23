/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, Attribute, BoundDirectivePropertyAst, BoundEventAst, CssSelector, DirectiveAst, ElementAst, EmbeddedTemplateAst, RecursiveTemplateAstVisitor, SelectorMatcher, StaticSymbol, TemplateAst, TemplateAstPath, templateVisitAll, tokenReference} from '@angular/compiler';
import * as tss from 'typescript/lib/tsserverlibrary';
import {AstResult} from './common';
import {getExpressionScope} from './expression_diagnostics';
import {getExpressionSymbol} from './expressions';
import {Definition, DirectiveKind, Span, Symbol} from './types';
import {diagnosticInfoFromTemplateInfo, findTemplateAstAt, getPathToNodeAtPosition, inSpan, isNarrower, offsetSpan, spanOf} from './utils';

export interface SymbolInfo {
  symbol: Symbol;
  span: tss.TextSpan;
  staticSymbol?: StaticSymbol;
}

/**
 * Traverses a template AST and locates symbol(s) at a specified position.
 * @param info template AST information set
 * @param position location to locate symbols at
 */
export function locateSymbols(info: AstResult, position: number): SymbolInfo[] {
  const templatePosition = position - info.template.span.start;
  // TODO: update `findTemplateAstAt` to use absolute positions.
  const path = findTemplateAstAt(info.templateAst, templatePosition);
  if (!path.tail) return [];

  const narrowest = spanOf(path.tail);
  const toVisit: TemplateAst[] = [];
  for (let node: TemplateAst|undefined = path.tail;
       node && isNarrower(spanOf(node.sourceSpan), narrowest); node = path.parentOf(node)) {
    toVisit.push(node);
  }

  return toVisit.map(ast => locateSymbol(ast, path, info))
      .filter((sym): sym is SymbolInfo => sym !== undefined);
}

/**
 * Visits a template node and locates the symbol in that node at a path position.
 * @param ast template AST node to visit
 * @param path non-empty set of narrowing AST nodes at a position
 * @param info template AST information set
 */
function locateSymbol(ast: TemplateAst, path: TemplateAstPath, info: AstResult): SymbolInfo|
    undefined {
  const templatePosition = path.position;
  const position = templatePosition + info.template.span.start;
  let symbol: Symbol|undefined;
  let span: Span|undefined;
  let staticSymbol: StaticSymbol|undefined;
  const attributeValueSymbol = (ast: AST): boolean => {
    const attribute = findAttribute(info, position);
    if (attribute) {
      if (inSpan(templatePosition, spanOf(attribute.valueSpan))) {
        const dinfo = diagnosticInfoFromTemplateInfo(info);
        const scope = getExpressionScope(dinfo, path);
        if (attribute.valueSpan) {
          const result = getExpressionSymbol(scope, ast, templatePosition, info.template.query);
          if (result) {
            symbol = result.symbol;
            const expressionOffset = attribute.valueSpan.start.offset;
            span = offsetSpan(result.span, expressionOffset);
          }
        }
        return true;
      }
    }
    return false;
  };
  ast.visit(
      {
        visitNgContent(ast) {},
        visitEmbeddedTemplate(ast) {},
        visitElement(ast) {
          const component = ast.directives.find(d => d.directive.isComponent);
          if (component) {
            // Need to cast because 'reference' is typed as any
            staticSymbol = component.directive.type.reference as StaticSymbol;
            symbol = info.template.query.getTypeSymbol(staticSymbol);
            symbol = symbol && new OverrideKindSymbol(symbol, DirectiveKind.COMPONENT);
            span = spanOf(ast);
          } else {
            // Find a directive that matches the element name
            const directive = ast.directives.find(
                d => d.directive.selector != null && d.directive.selector.indexOf(ast.name) >= 0);
            if (directive) {
              // Need to cast because 'reference' is typed as any
              staticSymbol = directive.directive.type.reference as StaticSymbol;
              symbol = info.template.query.getTypeSymbol(staticSymbol);
              symbol = symbol && new OverrideKindSymbol(symbol, DirectiveKind.DIRECTIVE);
              span = spanOf(ast);
            }
          }
        },
        visitReference(ast) {
          symbol = ast.value && info.template.query.getTypeSymbol(tokenReference(ast.value));
          span = spanOf(ast);
        },
        visitVariable(ast) {},
        visitEvent(ast) {
          if (!attributeValueSymbol(ast.handler)) {
            symbol = findOutputBinding(info, path, ast);
            symbol = symbol && new OverrideKindSymbol(symbol, DirectiveKind.EVENT);
            span = spanOf(ast);
          }
        },
        visitElementProperty(ast) { attributeValueSymbol(ast.value); },
        visitAttr(ast) {
          const element = path.head;
          if (!element || !(element instanceof ElementAst)) return;
          // Create a mapping of all directives applied to the element from their selectors.
          const matcher = new SelectorMatcher<DirectiveAst>();
          for (const dir of element.directives) {
            if (!dir.directive.selector) continue;
            matcher.addSelectables(CssSelector.parse(dir.directive.selector), dir);
          }

          // See if this attribute matches the selector of any directive on the element.
          const attributeSelector = `[${ast.name}=${ast.value}]`;
          const parsedAttribute = CssSelector.parse(attributeSelector);
          if (!parsedAttribute.length) return;
          matcher.match(parsedAttribute[0], (_, {directive}) => {
            // Need to cast because 'reference' is typed as any
            staticSymbol = directive.type.reference as StaticSymbol;
            symbol = info.template.query.getTypeSymbol(staticSymbol);
            symbol = symbol && new OverrideKindSymbol(symbol, DirectiveKind.DIRECTIVE);
            span = spanOf(ast);
          });
        },
        visitBoundText(ast) {
          const expressionPosition = templatePosition - ast.sourceSpan.start.offset;
          if (inSpan(expressionPosition, ast.value.span)) {
            const dinfo = diagnosticInfoFromTemplateInfo(info);
            const scope = getExpressionScope(dinfo, path);
            const result =
                getExpressionSymbol(scope, ast.value, templatePosition, info.template.query);
            if (result) {
              symbol = result.symbol;
              span = offsetSpan(result.span, ast.sourceSpan.start.offset);
            }
          }
        },
        visitText(ast) {},
        visitDirective(ast) {
          // Need to cast because 'reference' is typed as any
          staticSymbol = ast.directive.type.reference as StaticSymbol;
          symbol = info.template.query.getTypeSymbol(staticSymbol);
          span = spanOf(ast);
        },
        visitDirectiveProperty(ast) {
          if (!attributeValueSymbol(ast.value)) {
            symbol = findInputBinding(info, templatePosition, ast);
            span = spanOf(ast);
          }
        }
      },
      null);
  if (symbol && span) {
    const {start, end} = offsetSpan(span, info.template.span.start);
    return {
      symbol,
      span: tss.createTextSpanFromBounds(start, end), staticSymbol,
    };
  }
}

function findAttribute(info: AstResult, position: number): Attribute|undefined {
  const templatePosition = position - info.template.span.start;
  const path = getPathToNodeAtPosition(info.htmlAst, templatePosition);
  return path.first(Attribute);
}

// TODO: remove this function after the path includes 'DirectiveAst'.
// Find the directive that corresponds to the specified 'binding'
// at the specified 'position' in the 'ast'.
function findParentOfBinding(
    ast: TemplateAst[], binding: BoundDirectivePropertyAst, position: number): DirectiveAst|
    undefined {
  let res: DirectiveAst|undefined;
  const visitor = new class extends RecursiveTemplateAstVisitor {
    visit(ast: TemplateAst): any {
      const span = spanOf(ast);
      if (!inSpan(position, span)) {
        // Returning a value here will result in the children being skipped.
        return true;
      }
    }

    visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
      return this.visitChildren(context, visit => {
        visit(ast.directives);
        visit(ast.children);
      });
    }

    visitElement(ast: ElementAst, context: any): any {
      return this.visitChildren(context, visit => {
        visit(ast.directives);
        visit(ast.children);
      });
    }

    visitDirective(ast: DirectiveAst) {
      const result = this.visitChildren(ast, visit => { visit(ast.inputs); });
      return result;
    }

    visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: DirectiveAst) {
      if (ast === binding) {
        res = context;
      }
    }
  };
  templateVisitAll(visitor, ast);
  return res;
}

function findInputBinding(
    info: AstResult, position: number, binding: BoundDirectivePropertyAst): Symbol|undefined {
  const directiveAst = findParentOfBinding(info.templateAst, binding, position);
  if (directiveAst) {
    const invertedInput = invertMap(directiveAst.directive.inputs);
    const fieldName = invertedInput[binding.templateName];
    if (fieldName) {
      const classSymbol = info.template.query.getTypeSymbol(directiveAst.directive.type.reference);
      if (classSymbol) {
        return classSymbol.members().get(fieldName);
      }
    }
  }
}

function findOutputBinding(info: AstResult, path: TemplateAstPath, binding: BoundEventAst): Symbol|
    undefined {
  const element = path.first(ElementAst);
  if (element) {
    for (const directive of element.directives) {
      const invertedOutputs = invertMap(directive.directive.outputs);
      const fieldName = invertedOutputs[binding.name];
      if (fieldName) {
        const classSymbol = info.template.query.getTypeSymbol(directive.directive.type.reference);
        if (classSymbol) {
          return classSymbol.members().get(fieldName);
        }
      }
    }
  }
}

function invertMap(obj: {[name: string]: string}): {[name: string]: string} {
  const result: {[name: string]: string} = {};
  for (const name of Object.keys(obj)) {
    const v = obj[name];
    result[v] = name;
  }
  return result;
}

/**
 * Wrap a symbol and change its kind to component.
 */
class OverrideKindSymbol implements Symbol {
  public readonly kind: DirectiveKind;
  constructor(private sym: Symbol, kindOverride: DirectiveKind) { this.kind = kindOverride; }

  get name(): string { return this.sym.name; }

  get language(): string { return this.sym.language; }

  get type(): Symbol|undefined { return this.sym.type; }

  get container(): Symbol|undefined { return this.sym.container; }

  get public(): boolean { return this.sym.public; }

  get callable(): boolean { return this.sym.callable; }

  get nullable(): boolean { return this.sym.nullable; }

  get definition(): Definition { return this.sym.definition; }

  get documentation(): ts.SymbolDisplayPart[] { return this.sym.documentation; }

  members() { return this.sym.members(); }

  signatures() { return this.sym.signatures(); }

  selectSignature(types: Symbol[]) { return this.sym.selectSignature(types); }

  indexed(argument: Symbol) { return this.sym.indexed(argument); }

  typeArguments(): Symbol[]|undefined { return this.sym.typeArguments(); }
}
