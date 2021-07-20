/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, Attribute, BoundDirectivePropertyAst, CssSelector, DirectiveAst, ElementAst, EmbeddedTemplateAst, RecursiveTemplateAstVisitor, SelectorMatcher, StaticSymbol, TemplateAst, TemplateAstPath, templateVisitAll, tokenReference, VariableBinding} from '@angular/compiler';
import * as tss from 'typescript/lib/tsserverlibrary';

import {getExpressionScope} from './expression_diagnostics';
import {getExpressionSymbol} from './expressions';
import {AstResult, Definition, DirectiveKind, Span, Symbol, SymbolInfo} from './types';
import {diagnosticInfoFromTemplateInfo, findOutputBinding, findTemplateAstAt, getPathToNodeAtPosition, inSpan, invertMap, isNarrower, offsetSpan, spanOf} from './utils';

/**
 * Traverses a template AST and locates symbol(s) at a specified position.
 * @param info template AST information set
 * @param position location to locate symbols at
 */
export function locateSymbols(info: AstResult, position: number): SymbolInfo[] {
  const templatePosition = position - info.template.span.start;
  // TODO: update `findTemplateAstAt` to use absolute positions.
  const path = findTemplateAstAt(info.templateAst, templatePosition);
  const attribute = findAttribute(info, position);

  if (!path.tail) return [];

  const narrowest = spanOf(path.tail);
  const toVisit: TemplateAst[] = [];
  for (let node: TemplateAst|undefined = path.tail;
       node && isNarrower(spanOf(node.sourceSpan), narrowest); node = path.parentOf(node)) {
    toVisit.push(node);
  }

  // For the structural directive, only care about the last template AST.
  if (attribute?.name.startsWith('*')) {
    toVisit.splice(0, toVisit.length - 1);
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
        let result: {symbol: Symbol, span: Span}|undefined;
        if (attribute.name.startsWith('*')) {
          result = getSymbolInMicrosyntax(info, path, attribute);
        } else {
          const dinfo = diagnosticInfoFromTemplateInfo(info);
          const scope = getExpressionScope(dinfo, path);
          result = getExpressionSymbol(scope, ast, templatePosition, info.template);
        }
        if (result) {
          symbol = result.symbol;
          span = offsetSpan(result.span, attribute.valueSpan!.start.offset);
        }
        return true;
      }
    }
    return false;
  };
  ast.visit(
      {
        visitNgContent(_ast) {},
        visitEmbeddedTemplate(_ast) {},
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
        visitVariable(_ast) {},
        visitEvent(ast) {
          if (!attributeValueSymbol(ast.handler)) {
            symbol = findOutputBinding(ast, path, info.template.query);
            symbol = symbol && new OverrideKindSymbol(symbol, DirectiveKind.EVENT);
            span = spanOf(ast);
          }
        },
        visitElementProperty(ast) {
          attributeValueSymbol(ast.value);
        },
        visitAttr(ast) {
          const element = path.first(ElementAst);
          if (!element) return;
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
            const result = getExpressionSymbol(scope, ast.value, templatePosition, info.template);
            if (result) {
              symbol = result.symbol;
              span = offsetSpan(result.span, ast.sourceSpan.start.offset);
            }
          }
        },
        visitText(_ast) {},
        visitDirective(ast) {
          // Need to cast because 'reference' is typed as any
          staticSymbol = ast.directive.type.reference as StaticSymbol;
          symbol = info.template.query.getTypeSymbol(staticSymbol);
          span = spanOf(ast);
        },
        visitDirectiveProperty(ast) {
          if (!attributeValueSymbol(ast.value)) {
            const directive = findParentOfBinding(info.templateAst, ast, templatePosition);
            const attribute = findAttribute(info, position);
            if (directive && attribute) {
              if (attribute.name.startsWith('*')) {
                const compileTypeSummary = directive.directive;
                symbol = info.template.query.getTypeSymbol(compileTypeSummary.type.reference);
                symbol = symbol && new OverrideKindSymbol(symbol, DirectiveKind.DIRECTIVE);
                // Use 'attribute.sourceSpan' instead of the directive's,
                // because the span of the directive is the whole opening tag of an element.
                span = spanOf(attribute.sourceSpan);
              } else {
                symbol = findInputBinding(info, ast.templateName, directive);
                span = spanOf(ast);
              }
            }
          }
        }
      },
      null);
  if (symbol && span) {
    const {start, end} = offsetSpan(span, info.template.span.start);
    return {
      symbol,
      span: tss.createTextSpanFromBounds(start, end),
      staticSymbol,
    };
  }
}

// Get the symbol in microsyntax at template position.
function getSymbolInMicrosyntax(info: AstResult, path: TemplateAstPath, attribute: Attribute):
    {symbol: Symbol, span: Span}|undefined {
  if (!attribute.valueSpan) {
    return;
  }
  const absValueOffset = attribute.valueSpan.start.offset;
  let result: {symbol: Symbol, span: Span}|undefined;
  const {templateBindings} = info.expressionParser.parseTemplateBindings(
      attribute.name, attribute.value, attribute.sourceSpan.toString(),
      attribute.sourceSpan.start.offset, attribute.valueSpan.start.offset);

  // Find the symbol that contains the position.
  for (const tb of templateBindings) {
    if (tb instanceof VariableBinding) {
      // TODO(kyliau): if binding is variable we should still look for the value
      // of the key. For example, "let i=index" => "index" should point to
      // NgForOfContext.index
      continue;
    }
    if (inSpan(path.position, tb.value?.ast.sourceSpan)) {
      const dinfo = diagnosticInfoFromTemplateInfo(info);
      const scope = getExpressionScope(dinfo, path);
      result = getExpressionSymbol(scope, tb.value!, path.position, info.template);
    } else if (inSpan(path.position, tb.sourceSpan)) {
      const template = path.first(EmbeddedTemplateAst);
      if (template) {
        // One element can only have one template binding.
        const directiveAst = template.directives[0];
        if (directiveAst) {
          const symbol = findInputBinding(info, tb.key.source.substring(1), directiveAst);
          if (symbol) {
            result = {
              symbol,
              // the span here has to be relative to the start of the template
              // value so deduct the absolute offset.
              // TODO(kyliau): Use absolute source span throughout completions.
              span: offsetSpan(tb.key.span, -absValueOffset),
            };
          }
        }
      }
    }
  }
  return result;
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

    override visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
      return this.visitChildren(context, visit => {
        visit(ast.directives);
        visit(ast.children);
      });
    }

    override visitElement(ast: ElementAst, context: any): any {
      return this.visitChildren(context, visit => {
        visit(ast.directives);
        visit(ast.children);
      });
    }

    override visitDirective(ast: DirectiveAst) {
      const result = this.visitChildren(ast, visit => {
        visit(ast.inputs);
      });
      return result;
    }

    override visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: DirectiveAst) {
      if (ast === binding) {
        res = context;
      }
    }
  };
  templateVisitAll(visitor, ast);
  return res;
}

// Find the symbol of input binding in 'directiveAst' by 'name'.
function findInputBinding(info: AstResult, name: string, directiveAst: DirectiveAst): Symbol|
    undefined {
  const invertedInput = invertMap(directiveAst.directive.inputs);
  const fieldName = invertedInput[name];
  if (fieldName) {
    const classSymbol = info.template.query.getTypeSymbol(directiveAst.directive.type.reference);
    if (classSymbol) {
      return classSymbol.members().get(fieldName);
    }
  }
}

/**
 * Wrap a symbol and change its kind to component.
 */
class OverrideKindSymbol implements Symbol {
  public readonly kind: DirectiveKind;
  constructor(private sym: Symbol, kindOverride: DirectiveKind) {
    this.kind = kindOverride;
  }

  get name(): string {
    return this.sym.name;
  }

  get language(): string {
    return this.sym.language;
  }

  get type(): Symbol|undefined {
    return this.sym.type;
  }

  get container(): Symbol|undefined {
    return this.sym.container;
  }

  get public(): boolean {
    return this.sym.public;
  }

  get callable(): boolean {
    return this.sym.callable;
  }

  get nullable(): boolean {
    return this.sym.nullable;
  }

  get definition(): Definition {
    return this.sym.definition;
  }

  get documentation(): ts.SymbolDisplayPart[] {
    return this.sym.documentation;
  }

  members() {
    return this.sym.members();
  }

  signatures() {
    return this.sym.signatures();
  }

  selectSignature(types: Symbol[]) {
    return this.sym.selectSignature(types);
  }

  indexed(argument: Symbol) {
    return this.sym.indexed(argument);
  }

  typeArguments(): Symbol[]|undefined {
    return this.sym.typeArguments();
  }
}
