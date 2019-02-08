/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, AstPath, AttrAst, Attribute, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, CssSelector, DirectiveAst, Element, ElementAst, EmbeddedTemplateAst, ImplicitReceiver, NAMED_ENTITIES, NgContentAst, Node as HtmlAst, NullTemplateVisitor, ParseSpan, PropertyRead, ReferenceAst, SelectorMatcher, TagContentType, TemplateAst, TemplateAstVisitor, Text, TextAst, VariableAst, findNode, getHtmlTagDefinition, splitNsName, templateVisitAll} from '@angular/compiler';
import {DiagnosticTemplateInfo, getExpressionScope} from '@angular/compiler-cli/src/language_services';

import {AstResult, AttrInfo, SelectorInfo, TemplateInfo} from './common';
import {getExpressionCompletions} from './expressions';
import {attributeNames, elementNames, eventNames, propertyNames} from './html_info';
import {BuiltinType, Completion, Completions, Span, Symbol, SymbolDeclaration, SymbolTable, TemplateSource} from './types';
import {diagnosticInfoFromTemplateInfo, findTemplateAstAt, flatten, getSelectors, hasTemplateReference, inSpan, removeSuffix, spanOf, uniqueByName} from './utils';

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

export function getTemplateCompletions(templateInfo: TemplateInfo): Completions|undefined {
  let result: Completions|undefined = undefined;
  let {htmlAst, templateAst, template} = templateInfo;
  // The templateNode starts at the delimiter character so we add 1 to skip it.
  if (templateInfo.position != null) {
    let templatePosition = templateInfo.position - template.span.start;
    let path = findNode(htmlAst, templatePosition);
    let mostSpecific = path.tail;
    if (path.empty || !mostSpecific) {
      result = elementCompletions(templateInfo, path);
    } else {
      let astPosition = templatePosition - mostSpecific.sourceSpan.start.offset;
      mostSpecific.visit(
          {
            visitElement(ast) {
              let startTagSpan = spanOf(ast.sourceSpan);
              let tagLen = ast.name.length;
              if (templatePosition <=
                  startTagSpan.start + tagLen + 1 /* 1 for the opening angle bracked */) {
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
              if (result) return result;
              result = interpolationCompletions(templateInfo, templatePosition);
              if (result) return result;
              let element = path.first(Element);
              if (element) {
                let definition = getHtmlTagDefinition(element.name);
                if (definition.contentType === TagContentType.PARSABLE_DATA) {
                  result = voidElementAttributeCompletions(templateInfo, path);
                  if (!result) {
                    // If the element can hold content Show element completions.
                    result = elementCompletions(templateInfo, path);
                  }
                }
              } else {
                // If no element container, implies parsable data so show elements.
                result = voidElementAttributeCompletions(templateInfo, path);
                if (!result) {
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
  }
  return result;
}

function attributeCompletions(info: TemplateInfo, path: AstPath<HtmlAst>): Completions|undefined {
  let item = path.tail instanceof Element ? path.tail : path.parentOf(path.tail);
  if (item instanceof Element) {
    return attributeCompletionsForElement(info, item.name, item);
  }
  return undefined;
}

function attributeCompletionsForElement(
    info: TemplateInfo, elementName: string, element?: Element): Completions {
  const attributes = getAttributeInfosForElement(info, elementName, element);

  // Map all the attributes to a completion
  return attributes.map<Completion>(attr => ({
                                      kind: attr.fromHtml ? 'html attribute' : 'attribute',
                                      name: nameOfAttr(attr),
                                      sort: attr.name
                                    }));
}

function getAttributeInfosForElement(
    info: TemplateInfo, elementName: string, element?: Element): AttrInfo[] {
  let attributes: AttrInfo[] = [];

  // Add html attributes
  let htmlAttributes = attributeNames(elementName) || [];
  if (htmlAttributes) {
    attributes.push(...htmlAttributes.map<AttrInfo>(name => ({name, fromHtml: true})));
  }

  // Add html properties
  let htmlProperties = propertyNames(elementName);
  if (htmlProperties) {
    attributes.push(...htmlProperties.map<AttrInfo>(name => ({name, input: true})));
  }

  // Add html events
  let htmlEvents = eventNames(elementName);
  if (htmlEvents) {
    attributes.push(...htmlEvents.map<AttrInfo>(name => ({name, output: true})));
  }

  let {selectors, map: selectorMap} = getSelectors(info);
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
    let elementSelector = element ?
        createElementCssSelector(element) :
        createElementCssSelector(new Element(elementName, [], [], null !, null, null));

    let matcher = new SelectorMatcher();
    matcher.addSelectables(selectors);
    matcher.match(elementSelector, selector => {
      let directive = selectorMap.get(selector);
      if (directive) {
        attrs.push(...Object.keys(directive.inputs).map(name => ({name, input: true})));
        attrs.push(...Object.keys(directive.outputs).map(name => ({name, output: true})));
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
    info: TemplateInfo, position: number, attr: Attribute): Completions|undefined {
  const path = findTemplateAstAt(info.templateAst, position);
  const mostSpecific = path.tail;
  const dinfo = diagnosticInfoFromTemplateInfo(info);
  if (mostSpecific) {
    const visitor =
        new ExpressionVisitor(info, position, attr, () => getExpressionScope(dinfo, path, false));
    mostSpecific.visit(visitor, null);
    if (!visitor.result || !visitor.result.length) {
      // Try allwoing widening the path
      const widerPath = findTemplateAstAt(info.templateAst, position, /* allowWidening */ true);
      if (widerPath.tail) {
        const widerVisitor = new ExpressionVisitor(
            info, position, attr, () => getExpressionScope(dinfo, widerPath, false));
        widerPath.tail.visit(widerVisitor, null);
        return widerVisitor.result;
      }
    }
    return visitor.result;
  }
}

function elementCompletions(info: TemplateInfo, path: AstPath<HtmlAst>): Completions|undefined {
  let htmlNames = elementNames().filter(name => !(name in hiddenHtmlElements));

  // Collect the elements referenced by the selectors
  let directiveElements = getSelectors(info)
                              .selectors.map(selector => selector.element)
                              .filter(name => !!name) as string[];

  let components =
      directiveElements.map<Completion>(name => ({kind: 'component', name, sort: name}));
  let htmlElements = htmlNames.map<Completion>(name => ({kind: 'element', name: name, sort: name}));

  // Return components and html elements
  return uniqueByName(htmlElements.concat(components));
}

function entityCompletions(value: string, position: number): Completions|undefined {
  // Look for entity completions
  const re = /&[A-Za-z]*;?(?!\d)/g;
  let found: RegExpExecArray|null;
  let result: Completions|undefined = undefined;
  while (found = re.exec(value)) {
    let len = found[0].length;
    if (position >= found.index && position < (found.index + len)) {
      result = Object.keys(NAMED_ENTITIES)
                   .map<Completion>(name => ({kind: 'entity', name: `&${name};`, sort: name}));
      break;
    }
  }
  return result;
}

function interpolationCompletions(info: TemplateInfo, position: number): Completions|undefined {
  // Look for an interpolation in at the position.
  const templatePath = findTemplateAstAt(info.templateAst, position);
  const mostSpecific = templatePath.tail;
  if (mostSpecific) {
    let visitor = new ExpressionVisitor(
        info, position, undefined,
        () => getExpressionScope(diagnosticInfoFromTemplateInfo(info), templatePath, false));
    mostSpecific.visit(visitor, null);
    return uniqueByName(visitor.result);
  }
}

// There is a special case of HTML where text that contains a unclosed tag is treated as
// text. For exaple '<h1> Some <a text </h1>' produces a text nodes inside of the H1
// element "Some <a text". We, however, want to treat this as if the user was requesting
// the attributes of an "a" element, not requesting completion in the a text element. This
// code checks for this case and returns element completions if it is detected or undefined
// if it is not.
function voidElementAttributeCompletions(info: TemplateInfo, path: AstPath<HtmlAst>): Completions|
    undefined {
  let tail = path.tail;
  if (tail instanceof Text) {
    let match = tail.value.match(/<(\w(\w|\d|-)*:)?(\w(\w|\d|-)*)\s/);
    // The position must be after the match, otherwise we are still in a place where elements
    // are expected (such as `<|a` or `<a|`; we only want attributes for `<a |` or after).
    if (match &&
        path.position >= (match.index || 0) + match[0].length + tail.sourceSpan.start.offset) {
      return attributeCompletionsForElement(info, match[3]);
    }
  }
}

class ExpressionVisitor extends NullTemplateVisitor {
  private getExpressionScope: () => SymbolTable;
  result: Completions;

  constructor(
      private info: TemplateInfo, private position: number, private attr?: Attribute,
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
          this.info.expressionParser.parseTemplateBindings(key, this.attr.value, null);

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
        this.result = keys.map(key => <Completion>{kind: 'key', name: key, sort: key});
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

  private symbolsToCompletions(symbols: Symbol[]): Completions {
    return symbols.filter(s => !s.name.startsWith('__') && s.public)
        .map(symbol => <Completion>{kind: symbol.kind, name: symbol.name, sort: symbol.name});
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
  let result = [name];
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
  let elNameNoNs = splitNsName(element.name)[1];

  cssSelector.setElement(elNameNoNs);

  for (let attr of element.attrs) {
    if (!attr.name.match(templateAttr)) {
      let [_, attrNameNoNs] = splitNsName(attr.name);
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
  let inputOutput = new Map<string, AttrInfo>();
  let templates = new Map<string, AttrInfo>();
  let result: AttrInfo[] = [];
  attrs.forEach(attr => {
    if (attr.fromHtml) {
      return attr;
    }
    if (attr.template) {
      let duplicate = templates.get(attr.name);
      if (!duplicate) {
        result.push({name: attr.name, template: true});
        templates.set(attr.name, attr);
      }
    }
    if (attr.input || attr.output) {
      let duplicate = inputOutput.get(attr.name);
      if (duplicate) {
        duplicate.input = duplicate.input || attr.input;
        duplicate.output = duplicate.output || attr.output;
      } else {
        let cloneAttr: AttrInfo = {name: attr.name};
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
