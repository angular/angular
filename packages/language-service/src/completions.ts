/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, AstPath, Attribute, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, CssSelector, Element, ElementAst, ImplicitReceiver, NAMED_ENTITIES, Node as HtmlAst, NullTemplateVisitor, ParseSpan, PropertyRead, SelectorMatcher, TagContentType, Text, findNode, getHtmlTagDefinition, splitNsName} from '@angular/compiler';
import {getExpressionScope} from '@angular/compiler-cli/src/language_services';

import {AstResult, AttrInfo} from './common';
import {getExpressionCompletions} from './expressions';
import {attributeNames, elementNames, eventNames, propertyNames} from './html_info';
import {CompletionKind, Span, Symbol, SymbolTable, TemplateSource} from './types';
import {diagnosticInfoFromTemplateInfo, findTemplateAstAt, flatten, getSelectors, hasTemplateReference, inSpan, removeSuffix, spanOf} from './utils';

const TEMPLATE_ATTR_PREFIX = '*';

const hiddenHtmlElements = {
  html: true,
  script: true,
  noscript: true,
  base: true,
  body: true,
  title: true,
  head: true,
  link: true,
};

export function getTemplateCompletions(
    templateInfo: AstResult, position: number): ts.CompletionEntry[] {
  let result: ts.CompletionEntry[] = [];
  const {htmlAst, template} = templateInfo;
  // The templateNode starts at the delimiter character so we add 1 to skip it.
  const templatePosition = position - template.span.start;
  const path = findNode(htmlAst, templatePosition);
  const mostSpecific = path.tail;
  if (path.empty || !mostSpecific) {
    result = elementCompletions(templateInfo, path);
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
              result = elementCompletions(templateInfo, path);
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
                  result = elementCompletions(templateInfo, path);
                }
              }
            } else {
              // If no element container, implies parsable data so show elements.
              result = voidElementAttributeCompletions(templateInfo, path);
              if (!result.length) {
                result = elementCompletions(templateInfo, path);
              }
            }
          },
          visitComment(ast) {},
          visitExpansion(ast) {},
          visitExpansionCase(ast) {}
        },
        null);
  }
  return result;
}

function attributeCompletions(info: AstResult, path: AstPath<HtmlAst>): ts.CompletionEntry[] {
  const item = path.tail instanceof Element ? path.tail : path.parentOf(path.tail);
  if (item instanceof Element) {
    return attributeCompletionsForElement(info, item.name, item);
  }
  return [];
}

function attributeCompletionsForElement(
    info: AstResult, elementName: string, element?: Element): ts.CompletionEntry[] {
  const attributes = getAttributeInfosForElement(info, elementName, element);

  // Map all the attributes to a completion
  return attributes.map(attr => {
    const kind = attr.fromHtml ? CompletionKind.HTML_ATTRIBUTE : CompletionKind.ATTRIBUTE;
    return {
      name: nameOfAttr(attr),
      // Need to cast to unknown because Angular's CompletionKind includes HTML
      // entites.
      kind: kind as unknown as ts.ScriptElementKind,
      sortText: attr.name,
    };
  });
}

function getAttributeInfosForElement(
    info: AstResult, elementName: string, element?: Element): AttrInfo[] {
  const attributes: AttrInfo[] = [];

  // Add html attributes
  const htmlAttributes = attributeNames(elementName) || [];
  if (htmlAttributes) {
    attributes.push(...htmlAttributes.map<AttrInfo>(name => ({name, fromHtml: true})));
  }

  // Add html properties
  const htmlProperties = propertyNames(elementName);
  if (htmlProperties) {
    attributes.push(...htmlProperties.map<AttrInfo>(name => ({name, input: true})));
  }

  // Add html events
  const htmlEvents = eventNames(elementName);
  if (htmlEvents) {
    attributes.push(...htmlEvents.map<AttrInfo>(name => ({name, output: true})));
  }

  const {selectors, map: selectorMap} = getSelectors(info);
  if (selectors && selectors.length) {
    // All the attributes that are selectable should be shown.
    const applicableSelectors =
        selectors.filter(selector => !selector.element || selector.element == elementName);
    const selectorAndAttributeNames =
        applicableSelectors.map(selector => ({selector, attrs: selector.attrs.filter(a => !!a)}));
    let attrs = flatten(selectorAndAttributeNames.map<AttrInfo[]>(selectorAndAttr => {
      const directive = selectorMap.get(selectorAndAttr.selector) !;
      const result = selectorAndAttr.attrs.map<AttrInfo>(
          name => ({name, input: name in directive.inputs, output: name in directive.outputs}));
      return result;
    }));

    // Add template attribute if a directive contains a template reference
    selectorAndAttributeNames.forEach(selectorAndAttr => {
      const selector = selectorAndAttr.selector;
      const directive = selectorMap.get(selector);
      if (directive && hasTemplateReference(directive.type) && selector.attrs.length &&
          selector.attrs[0]) {
        attrs.push({name: selector.attrs[0], template: true});
      }
    });

    // All input and output properties of the matching directives should be added.
    const elementSelector = element ?
        createElementCssSelector(element) :
        createElementCssSelector(new Element(elementName, [], [], null !, null, null));

    const matcher = new SelectorMatcher();
    matcher.addSelectables(selectors);
    matcher.match(elementSelector, selector => {
      const directive = selectorMap.get(selector);
      if (directive) {
        const {inputs, outputs} = directive;
        attrs.push(...Object.keys(inputs).map(name => ({name: inputs[name], input: true})));
        attrs.push(...Object.keys(outputs).map(name => ({name: outputs[name], output: true})));
      }
    });

    // If a name shows up twice, fold it into a single value.
    attrs = foldAttrs(attrs);

    // Now expand them back out to ensure that input/output shows up as well as input and
    // output.
    attributes.push(...flatten(attrs.map(expandedAttr)));
  }
  return attributes;
}

function attributeValueCompletions(
    info: AstResult, position: number, attr: Attribute): ts.CompletionEntry[] {
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

function elementCompletions(info: AstResult, path: AstPath<HtmlAst>): ts.CompletionEntry[] {
  const htmlNames = elementNames().filter(name => !(name in hiddenHtmlElements));

  // Collect the elements referenced by the selectors
  const directiveElements = getSelectors(info)
                                .selectors.map(selector => selector.element)
                                .filter(name => !!name) as string[];

  const components = directiveElements.map(name => {
    return {
      name,
      // Need to cast to unknown because Angular's CompletionKind includes HTML
      // entites.
      kind: CompletionKind.COMPONENT as unknown as ts.ScriptElementKind,
      sortText: name,
    };
  });
  const htmlElements = htmlNames.map(name => {
    return {
      name,
      // Need to cast to unknown because Angular's CompletionKind includes HTML
      // entites.
      kind: CompletionKind.ELEMENT as unknown as ts.ScriptElementKind,
      sortText: name,
    };
  });

  // Return components and html elements
  return uniqueByName(htmlElements.concat(components));
}

/**
 * Filter the specified `entries` by unique name.
 * @param entries Completion Entries
 */
function uniqueByName(entries: ts.CompletionEntry[]) {
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

function entityCompletions(value: string, position: number): ts.CompletionEntry[] {
  // Look for entity completions
  const re = /&[A-Za-z]*;?(?!\d)/g;
  let found: RegExpExecArray|null;
  let result: ts.CompletionEntry[] = [];
  while (found = re.exec(value)) {
    let len = found[0].length;
    if (position >= found.index && position < (found.index + len)) {
      result = Object.keys(NAMED_ENTITIES).map(name => {
        return {
          name: `&${name};`,
          // Need to cast to unknown because Angular's CompletionKind includes
          // HTML entites.
          kind: CompletionKind.ENTITY as unknown as ts.ScriptElementKind,
          sortText: name,
        };
      });
      break;
    }
  }
  return result;
}

function interpolationCompletions(info: AstResult, position: number): ts.CompletionEntry[] {
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
    info: AstResult, path: AstPath<HtmlAst>): ts.CompletionEntry[] {
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
  private getExpressionScope: () => SymbolTable;
  result: ts.CompletionEntry[]|undefined;

  constructor(
      private info: AstResult, private position: number, private attr?: Attribute,
      getExpressionScope?: () => SymbolTable) {
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
          selectors.filter(s => s.attrs.some((attr, i) => i % 2 == 0 && attr == key))[0];

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
          const attrNames = selector.attrs.filter((_, i) => i % 2 == 0);
          keys = attrNames.filter(name => name.startsWith(key) && name != key)
                     .map(name => lowerName(name.substr(key.length)));
        }
        keys.push('let');
        this.result = keys.map(key => {
          return {
            name: key,
            // Need to cast to unknown because Angular's CompletionKind includes
            // HTML entites.
            kind: CompletionKind.KEY as unknown as ts.ScriptElementKind,
            sortText: key,
          };
        });
      };

      if (!binding || (binding.key == key && !binding.expression)) {
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
          this.attributeValueCompletions(
              binding.expression ? binding.expression.ast :
                                   new PropertyRead(span, new ImplicitReceiver(span), ''),
              valueRelativePosition);
        } else {
          keyCompletions();
        }
      }
    }
  }

  visitBoundText(ast: BoundTextAst) {
    const expressionPosition = this.position - ast.sourceSpan.start.offset;
    if (inSpan(expressionPosition, ast.value.span)) {
      const completions = getExpressionCompletions(
          this.getExpressionScope(), ast.value, expressionPosition, this.info.template.query);
      if (completions) {
        this.result = this.symbolsToCompletions(completions);
      }
    }
  }

  private attributeValueCompletions(value: AST, position?: number) {
    const symbols = getExpressionCompletions(
        this.getExpressionScope(), value, position == null ? this.attributeValuePosition : position,
        this.info.template.query);
    if (symbols) {
      this.result = this.symbolsToCompletions(symbols);
    }
  }

  private symbolsToCompletions(symbols: Symbol[]): ts.CompletionEntry[] {
    return symbols.filter(s => !s.name.startsWith('__') && s.public).map(symbol => {
      return {
        name: symbol.name,
        kind: symbol.kind as ts.ScriptElementKind,
        sortText: symbol.name,
      };
    });
  }

  private get attributeValuePosition() {
    if (this.attr && this.attr.valueSpan) {
      return this.position - this.attr.valueSpan.start.offset;
    }
    return 0;
  }
}

function getSourceText(template: TemplateSource, span: Span): string {
  return template.source.substring(span.start, span.end);
}

function nameOfAttr(attr: AttrInfo): string {
  let name = attr.name;
  if (attr.output) {
    name = removeSuffix(name, 'Events');
    name = removeSuffix(name, 'Changed');
  }
  const result = [name];
  if (attr.input) {
    result.unshift('[');
    result.push(']');
  }
  if (attr.output) {
    result.unshift('(');
    result.push(')');
  }
  if (attr.template) {
    result.unshift('*');
  }
  return result.join('');
}

const templateAttr = /^(\w+:)?(template$|^\*)/;
function createElementCssSelector(element: Element): CssSelector {
  const cssSelector = new CssSelector();
  const elNameNoNs = splitNsName(element.name)[1];

  cssSelector.setElement(elNameNoNs);

  for (const attr of element.attrs) {
    if (!attr.name.match(templateAttr)) {
      const [_, attrNameNoNs] = splitNsName(attr.name);
      cssSelector.addAttribute(attrNameNoNs, attr.value);
      if (attr.name.toLowerCase() == 'class') {
        const classes = attr.value.split(/s+/g);
        classes.forEach(className => cssSelector.addClassName(className));
      }
    }
  }
  return cssSelector;
}

function foldAttrs(attrs: AttrInfo[]): AttrInfo[] {
  const inputOutput = new Map<string, AttrInfo>();
  const templates = new Map<string, AttrInfo>();
  const result: AttrInfo[] = [];
  attrs.forEach(attr => {
    if (attr.fromHtml) {
      return attr;
    }
    if (attr.template) {
      const duplicate = templates.get(attr.name);
      if (!duplicate) {
        result.push({name: attr.name, template: true});
        templates.set(attr.name, attr);
      }
    }
    if (attr.input || attr.output) {
      const duplicate = inputOutput.get(attr.name);
      if (duplicate) {
        duplicate.input = duplicate.input || attr.input;
        duplicate.output = duplicate.output || attr.output;
      } else {
        const cloneAttr: AttrInfo = {name: attr.name};
        if (attr.input) cloneAttr.input = true;
        if (attr.output) cloneAttr.output = true;
        result.push(cloneAttr);
        inputOutput.set(attr.name, cloneAttr);
      }
    }
  });
  return result;
}

function expandedAttr(attr: AttrInfo): AttrInfo[] {
  if (attr.input && attr.output) {
    return [
      attr, {name: attr.name, input: true, output: false},
      {name: attr.name, input: false, output: true}
    ];
  }
  return [attr];
}

function lowerName(name: string): string {
  return name && (name[0].toLowerCase() + name.substr(1));
}
