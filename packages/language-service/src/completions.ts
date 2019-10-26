/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, AstPath, Attribute, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, Element, ElementAst, ImplicitReceiver, NAMED_ENTITIES, Node as HtmlAst, NullTemplateVisitor, ParseSpan, PropertyRead, TagContentType, Text, findNode, getHtmlTagDefinition} from '@angular/compiler';
import {getExpressionScope} from '@angular/compiler-cli/src/language_services';

import {AstResult} from './common';
import {getExpressionCompletions} from './expressions';
import {attributeNames, elementNames, eventNames, propertyNames} from './html_info';
import {InlineTemplate} from './template';
import * as ng from './types';
import {diagnosticInfoFromTemplateInfo, findTemplateAstAt, getSelectors, hasTemplateReference, inSpan, spanOf} from './utils';

const TEMPLATE_ATTR_PREFIX = '*';
const HIDDEN_HTML_ELEMENTS: ReadonlySet<string> =
    new Set(['html', 'script', 'noscript', 'base', 'body', 'title', 'head', 'link']);
const HTML_ELEMENTS: ReadonlyArray<ng.CompletionEntry> =
    elementNames().filter(name => !HIDDEN_HTML_ELEMENTS.has(name)).map(name => {
      return {
        name,
        kind: ng.CompletionKind.HTML_ELEMENT,
        sortText: name,
      };
    });
const ANGULAR_ELEMENTS: ReadonlyArray<ng.CompletionEntry> = [
  {
    name: 'ng-container',
    kind: ng.CompletionKind.ANGULAR_ELEMENT,
    sortText: 'ng-container',
  },
  {
    name: 'ng-content',
    kind: ng.CompletionKind.ANGULAR_ELEMENT,
    sortText: 'ng-content',
  },
  {
    name: 'ng-template',
    kind: ng.CompletionKind.ANGULAR_ELEMENT,
    sortText: 'ng-template',
  },
];

/**
 * Gets the span of word in a template that surrounds `position`. If there is no word around
 * `position`, nothing is returned.
 */
function getBoundedWordSpan(templateInfo: AstResult, position: number): ts.TextSpan|undefined {
  const WORD_PART = /[0-9a-zA-Z_]/;

  const {template} = templateInfo;
  const templateSrc = template.source;

  // `templatePosition` represents the right-bound location of a cursor in the template.
  //    key.ent|ry
  //           ^---- cursor, at position `r` is at.
  // A cursor is not itself a character in the template; it has a left (lower) and right (upper)
  // index bound that hugs the cursor itself.
  // To perform word expansion, we want to determine the left and right indeces that hug the cursor.
  // There are three cases here.
  let templatePosition = position - template.span.start;
  // 1. Case like
  //      wo|rd
  //    there is a clear left and right index.
  let left = templatePosition - 1, right = templatePosition;
  // 2. Case like
  //      |rest of template
  //    the cursor is at the start of the template, hugged only by the right side (0-index).
  if (templatePosition === 0) {
    left = right = 0;
  }
  // 2. Case like
  //      rest of template|
  //    the cursor is at the end of the template, hugged only by the left side (last-index).
  if (templatePosition === templateSrc.length) {
    left = right = templateSrc.length - 1;
  }

  if (!templateSrc[left].match(WORD_PART) && !templateSrc[right].match(WORD_PART)) {
    // Case like
    //         .|.
    // left ---^ ^--- right
    // There is no word here.
    return;
  }

  // Expand on the left and right side until a word boundary is hit. Back up one expansion on both
  // side to stay inside the word.
  while (left >= 0 && templateSrc[left].match(WORD_PART)) --left;
  ++left;
  while (right < templateSrc.length && templateSrc[right].match(WORD_PART)) ++right;
  --right;

  const absoluteStartPosition = position - (templatePosition - left);
  const length = right - left + 1;
  return {start: absoluteStartPosition, length};
}

export function getTemplateCompletions(
    templateInfo: AstResult, position: number): ng.CompletionEntry[] {
  let result: ng.CompletionEntry[] = [];
  const {htmlAst, template} = templateInfo;
  // The templateNode starts at the delimiter character so we add 1 to skip it.
  const templatePosition = position - template.span.start;
  const path = findNode(htmlAst, templatePosition);
  const mostSpecific = path.tail;
  if (path.empty || !mostSpecific) {
    result = elementCompletions(templateInfo);
  } else {
    const astPosition = templatePosition - mostSpecific.sourceSpan.start.offset;
    mostSpecific.visit(
        {
          visitElement(ast) {
            const startTagSpan = spanOf(ast.sourceSpan);
            const tagLen = ast.name.length;
            // + 1 for the opening angle bracket
            if (templatePosition <= startTagSpan.start + tagLen + 1) {
              // If we are in the tag then return the element completions.
              result = elementCompletions(templateInfo);
            } else if (templatePosition < startTagSpan.end) {
              // We are in the attribute section of the element (but not in an attribute).
              // Return the attribute completions.
              result = attributeCompletions(templateInfo, path);
            }
          },
          visitAttribute(ast) {
            if (!ast.valueSpan || !inSpan(templatePosition, spanOf(ast.valueSpan))) {
              // We are in the name of an attribute. Show attribute completions.
              result = attributeCompletions(templateInfo, path);
            } else if (ast.valueSpan && inSpan(templatePosition, spanOf(ast.valueSpan))) {
              result = attributeValueCompletions(templateInfo, templatePosition, ast);
            }
          },
          visitText(ast) {
            // Check if we are in a entity.
            result = entityCompletions(getSourceText(template, spanOf(ast)), astPosition);
            if (result.length) return result;
            result = interpolationCompletions(templateInfo, templatePosition);
            if (result.length) return result;
            const element = path.first(Element);
            if (element) {
              const definition = getHtmlTagDefinition(element.name);
              if (definition.contentType === TagContentType.PARSABLE_DATA) {
                result = voidElementAttributeCompletions(templateInfo, path);
                if (!result.length) {
                  // If the element can hold content, show element completions.
                  result = elementCompletions(templateInfo);
                }
              }
            } else {
              // If no element container, implies parsable data so show elements.
              result = voidElementAttributeCompletions(templateInfo, path);
              if (!result.length) {
                result = elementCompletions(templateInfo);
              }
            }
          },
          visitComment(ast) {},
          visitExpansion(ast) {},
          visitExpansionCase(ast) {}
        },
        null);
  }

  return result.map(entry => {
    return {
      ...entry,
      replacementSpan: getBoundedWordSpan(templateInfo, position),
    };
  })
}

function attributeCompletions(info: AstResult, path: AstPath<HtmlAst>): ng.CompletionEntry[] {
  const item = path.tail instanceof Element ? path.tail : path.parentOf(path.tail);
  if (item instanceof Element) {
    return attributeCompletionsForElement(info, item.name);
  }
  return [];
}

function attributeCompletionsForElement(
    info: AstResult, elementName: string): ng.CompletionEntry[] {
  const results: ng.CompletionEntry[] = [];

  if (info.template instanceof InlineTemplate) {
    // Provide HTML attributes completion only for inline templates
    for (const name of attributeNames(elementName)) {
      results.push({
        name,
        kind: ng.CompletionKind.HTML_ATTRIBUTE,
        sortText: name,
      });
    }
  }

  // Add html properties
  for (const name of propertyNames(elementName)) {
    results.push({
      name: `[${name}]`,
      kind: ng.CompletionKind.ATTRIBUTE,
      sortText: name,
    });
  }

  // Add html events
  for (const name of eventNames(elementName)) {
    results.push({
      name: `(${name})`,
      kind: ng.CompletionKind.ATTRIBUTE,
      sortText: name,
    });
  }

  // Add Angular attributes
  results.push(...angularAttributes(info, elementName));

  return results;
}

function attributeValueCompletions(
    info: AstResult, position: number, attr: Attribute): ng.CompletionEntry[] {
  const path = findTemplateAstAt(info.templateAst, position);
  if (!path.tail) {
    return [];
  }
  const dinfo = diagnosticInfoFromTemplateInfo(info);
  const visitor =
      new ExpressionVisitor(info, position, attr, () => getExpressionScope(dinfo, path, false));
  path.tail.visit(visitor, null);
  if (!visitor.result || !visitor.result.length) {
    // Try allwoing widening the path
    const widerPath = findTemplateAstAt(info.templateAst, position, /* allowWidening */ true);
    if (widerPath.tail) {
      const widerVisitor = new ExpressionVisitor(
          info, position, attr, () => getExpressionScope(dinfo, widerPath, false));
      widerPath.tail.visit(widerVisitor, null);
      return widerVisitor.result || [];
    }
  }
  return visitor.result || [];
}

function elementCompletions(info: AstResult): ng.CompletionEntry[] {
  const results: ng.CompletionEntry[] = [...ANGULAR_ELEMENTS];

  if (info.template instanceof InlineTemplate) {
    // Provide HTML elements completion only for inline templates
    results.push(...HTML_ELEMENTS);
  }

  // Collect the elements referenced by the selectors
  const components = new Set<string>();
  for (const selector of getSelectors(info).selectors) {
    const name = selector.element;
    if (name && !components.has(name)) {
      components.add(name);
      results.push({
        name,
        kind: ng.CompletionKind.COMPONENT,
        sortText: name,
      });
    }
  }

  return results;
}

/**
 * Filter the specified `entries` by unique name.
 * @param entries Completion Entries
 */
function uniqueByName(entries: ng.CompletionEntry[]) {
  const results = [];
  const set = new Set();
  for (const entry of entries) {
    if (!set.has(entry.name)) {
      set.add(entry.name);
      results.push(entry);
    }
  }
  return results;
}

function entityCompletions(value: string, position: number): ng.CompletionEntry[] {
  // Look for entity completions
  const re = /&[A-Za-z]*;?(?!\d)/g;
  let found: RegExpExecArray|null;
  let result: ng.CompletionEntry[] = [];
  while (found = re.exec(value)) {
    let len = found[0].length;
    if (position >= found.index && position < (found.index + len)) {
      result = Object.keys(NAMED_ENTITIES).map(name => {
        return {
          name: `&${name};`,
          kind: ng.CompletionKind.ENTITY,
          sortText: name,
        };
      });
      break;
    }
  }
  return result;
}

function interpolationCompletions(info: AstResult, position: number): ng.CompletionEntry[] {
  // Look for an interpolation in at the position.
  const templatePath = findTemplateAstAt(info.templateAst, position);
  if (!templatePath.tail) {
    return [];
  }
  const visitor = new ExpressionVisitor(
      info, position, undefined,
      () => getExpressionScope(diagnosticInfoFromTemplateInfo(info), templatePath, false));
  templatePath.tail.visit(visitor, null);
  return uniqueByName(visitor.result || []);
}

// There is a special case of HTML where text that contains a unclosed tag is treated as
// text. For exaple '<h1> Some <a text </h1>' produces a text nodes inside of the H1
// element "Some <a text". We, however, want to treat this as if the user was requesting
// the attributes of an "a" element, not requesting completion in the a text element. This
// code checks for this case and returns element completions if it is detected or undefined
// if it is not.
function voidElementAttributeCompletions(
    info: AstResult, path: AstPath<HtmlAst>): ng.CompletionEntry[] {
  const tail = path.tail;
  if (tail instanceof Text) {
    const match = tail.value.match(/<(\w(\w|\d|-)*:)?(\w(\w|\d|-)*)\s/);
    // The position must be after the match, otherwise we are still in a place where elements
    // are expected (such as `<|a` or `<a|`; we only want attributes for `<a |` or after).
    if (match &&
        path.position >= (match.index || 0) + match[0].length + tail.sourceSpan.start.offset) {
      return attributeCompletionsForElement(info, match[3]);
    }
  }
  return [];
}

class ExpressionVisitor extends NullTemplateVisitor {
  private getExpressionScope: () => ng.SymbolTable;
  result: ng.CompletionEntry[]|undefined;

  constructor(
      private info: AstResult, private position: number, private attr?: Attribute,
      getExpressionScope?: () => ng.SymbolTable) {
    super();
    this.getExpressionScope = getExpressionScope || (() => info.template.members);
  }

  visitDirectiveProperty(ast: BoundDirectivePropertyAst): void {
    this.attributeValueCompletions(ast.value);
  }

  visitElementProperty(ast: BoundElementPropertyAst): void {
    this.attributeValueCompletions(ast.value);
  }

  visitEvent(ast: BoundEventAst): void { this.attributeValueCompletions(ast.handler); }

  visitElement(ast: ElementAst): void {
    if (this.attr && getSelectors(this.info) && this.attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
      // The value is a template expression but the expression AST was not produced when the
      // TemplateAst was produce so
      // do that now.

      const key = this.attr.name.substr(TEMPLATE_ATTR_PREFIX.length);

      // Find the selector
      const selectorInfo = getSelectors(this.info);
      const selectors = selectorInfo.selectors;
      const selector =
          selectors.filter(s => s.attrs.some((attr, i) => i % 2 === 0 && attr === key))[0];

      const templateBindingResult =
          this.info.expressionParser.parseTemplateBindings(key, this.attr.value, null, 0);

      // find the template binding that contains the position
      if (!this.attr.valueSpan) return;
      const valueRelativePosition = this.position - this.attr.valueSpan.start.offset;
      const bindings = templateBindingResult.templateBindings;
      const binding =
          bindings.find(
              binding => inSpan(valueRelativePosition, binding.span, /* exclusive */ true)) ||
          bindings.find(binding => inSpan(valueRelativePosition, binding.span));

      const keyCompletions = () => {
        let keys: string[] = [];
        if (selector) {
          const attrNames = selector.attrs.filter((_, i) => i % 2 === 0);
          keys = attrNames.filter(name => name.startsWith(key) && name != key)
                     .map(name => lowerName(name.substr(key.length)));
        }
        keys.push('let');
        this.result = keys.map(key => {
          return {
            name: key,
            kind: ng.CompletionKind.KEY,
            sortText: key,
          };
        });
      };

      if (!binding || (binding.key === key && !binding.expression)) {
        // We are in the root binding. We should return `let` and keys that are left in the
        // selector.
        keyCompletions();
      } else if (binding.keyIsVar) {
        const equalLocation = this.attr.value.indexOf('=');
        this.result = [];
        if (equalLocation >= 0 && valueRelativePosition >= equalLocation) {
          // We are after the '=' in a let clause. The valid values here are the members of the
          // template reference's type parameter.
          const directiveMetadata = selectorInfo.map.get(selector);
          if (directiveMetadata) {
            const contextTable =
                this.info.template.query.getTemplateContext(directiveMetadata.type.reference);
            if (contextTable) {
              this.result = this.symbolsToCompletions(contextTable.values());
            }
          }
        } else if (binding.key && valueRelativePosition <= (binding.key.length - key.length)) {
          keyCompletions();
        }
      } else {
        // If the position is in the expression or after the key or there is no key, return the
        // expression completions
        if ((binding.expression && inSpan(valueRelativePosition, binding.expression.ast.span)) ||
            (binding.key &&
             valueRelativePosition > binding.span.start + (binding.key.length - key.length)) ||
            !binding.key) {
          const span = new ParseSpan(0, this.attr.value.length);
          const offset = ast.sourceSpan.start.offset;
          this.attributeValueCompletions(
              binding.expression ? binding.expression.ast :
                                   new PropertyRead(
                                       span, span.toAbsolute(offset),
                                       new ImplicitReceiver(span, span.toAbsolute(offset)), ''),
              this.position);
        } else {
          keyCompletions();
        }
      }
    }
  }

  visitBoundText(ast: BoundTextAst) {
    if (inSpan(this.position, ast.value.sourceSpan)) {
      const completions = getExpressionCompletions(
          this.getExpressionScope(), ast.value, this.position, this.info.template.query);
      if (completions) {
        this.result = this.symbolsToCompletions(completions);
      }
    }
  }

  private attributeValueCompletions(value: AST, position?: number) {
    const symbols = getExpressionCompletions(
        this.getExpressionScope(), value,
        position === undefined ? this.attributeValuePosition : position, this.info.template.query);
    if (symbols) {
      this.result = this.symbolsToCompletions(symbols);
    }
  }

  private symbolsToCompletions(symbols: ng.Symbol[]): ng.CompletionEntry[] {
    return symbols.filter(s => !s.name.startsWith('__') && s.public).map(symbol => {
      return {
        name: symbol.name,
        kind: symbol.kind as ng.CompletionKind,
        sortText: symbol.name,
      };
    });
  }

  private get attributeValuePosition() {
    if (this.attr && this.attr.valueSpan) {
      return this.position;
    }
    return 0;
  }
}

function getSourceText(template: ng.TemplateSource, span: ng.Span): string {
  return template.source.substring(span.start, span.end);
}

function lowerName(name: string): string {
  return name && (name[0].toLowerCase() + name.substr(1));
}

function angularAttributes(info: AstResult, elementName: string): ng.CompletionEntry[] {
  const {selectors, map: selectorMap} = getSelectors(info);
  const templateRefs = new Set<string>();
  const inputs = new Set<string>();
  const outputs = new Set<string>();
  const others = new Set<string>();
  for (const selector of selectors) {
    if (selector.element && selector.element !== elementName) {
      continue;
    }
    const summary = selectorMap.get(selector) !;
    for (const attr of selector.attrs) {
      if (attr) {
        if (hasTemplateReference(summary.type)) {
          templateRefs.add(attr);
        } else {
          others.add(attr);
        }
      }
    }
    for (const input of Object.values(summary.inputs)) {
      inputs.add(input);
    }
    for (const output of Object.values(summary.outputs)) {
      outputs.add(output);
    }
  }

  const results: ng.CompletionEntry[] = [];
  for (const name of templateRefs) {
    results.push({
      name: `*${name}`,
      kind: ng.CompletionKind.ATTRIBUTE,
      sortText: name,
    });
  }
  for (const name of inputs) {
    results.push({
      name: `[${name}]`,
      kind: ng.CompletionKind.ATTRIBUTE,
      sortText: name,
    });
    // Add banana-in-a-box syntax
    // https://angular.io/guide/template-syntax#two-way-binding-
    if (outputs.has(`${name}Change`)) {
      results.push({
        name: `[(${name})]`,
        kind: ng.CompletionKind.ATTRIBUTE,
        sortText: name,
      });
    }
  }
  for (const name of outputs) {
    results.push({
      name: `(${name})`,
      kind: ng.CompletionKind.ATTRIBUTE,
      sortText: name,
    });
  }
  for (const name of others) {
    results.push({
      name,
      kind: ng.CompletionKind.ATTRIBUTE,
      sortText: name,
    });
  }
  return results;
}
