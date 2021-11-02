/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan, AST, AstPath, AttrAst, Attribute, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, Element, ElementAst, EmptyExpr, ExpressionBinding, getHtmlTagDefinition, HtmlAstPath, Node as HtmlAst, NullTemplateVisitor, ParseSpan, ReferenceAst, TagContentType, TemplateBinding, Text, VariableBinding, Visitor} from '@angular/compiler';
import {$$, $_, isAsciiLetter, isDigit} from '@angular/compiler/src/chars';

import {ATTR, getBindingDescriptor} from './binding_utils';
import {getExpressionScope} from './expression_diagnostics';
import {getExpressionCompletions} from './expressions';
import {attributeNames, elementNames, eventNames, propertyNames} from './html_info';
import {InlineTemplate} from './template';
import * as ng from './types';
import {diagnosticInfoFromTemplateInfo, findTemplateAstAt, getPathToNodeAtPosition, getSelectors, inSpan, isStructuralDirective, spanOf} from './utils';

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

function isIdentifierPart(code: number) {
  // Identifiers consist of alphanumeric characters, '_', or '$'.
  return isAsciiLetter(code) || isDigit(code) || code == $$ || code == $_;
}

/**
 * Gets the span of word in a template that surrounds `position`. If there is no word around
 * `position`, nothing is returned.
 */
function getBoundedWordSpan(
    templateInfo: ng.AstResult, position: number, ast: HtmlAst|undefined): ts.TextSpan|undefined {
  const {template} = templateInfo;
  const templateSrc = template.source;

  if (!templateSrc) return;

  if (ast instanceof Element) {
    // The HTML tag may include `-` (e.g. `app-root`),
    // so use the HtmlAst to get the span before ayazhafiz refactor the code.
    return {
      start: templateInfo.template.span.start + ast.startSourceSpan.start.offset + 1,
      length: ast.name.length
    };
  }

  // TODO(ayazhafiz): A solution based on word expansion will always be expensive compared to one
  // based on ASTs. Whatever penalty we incur is probably manageable for small-length (i.e. the
  // majority of) identifiers, but the current solution involes a number of branchings and we can't
  // control potentially very long identifiers. Consider moving to an AST-based solution once
  // existing difficulties with AST spans are more clearly resolved (see #31898 for discussion of
  // known problems, and #33091 for how they affect text replacement).
  //
  // `templatePosition` represents the right-bound location of a cursor in the template.
  //    key.ent|ry
  //           ^---- cursor, at position `r` is at.
  // A cursor is not itself a character in the template; it has a left (lower) and right (upper)
  // index bound that hugs the cursor itself.
  let templatePosition = position - template.span.start;
  // To perform word expansion, we want to determine the left and right indices that hug the cursor.
  // There are three cases here.
  let left, right;
  if (templatePosition === 0) {
    // 1. Case like
    //      |rest of template
    //    the cursor is at the start of the template, hugged only by the right side (0-index).
    left = right = 0;
  } else if (templatePosition === templateSrc.length) {
    // 2. Case like
    //      rest of template|
    //    the cursor is at the end of the template, hugged only by the left side (last-index).
    left = right = templateSrc.length - 1;
  } else {
    // 3. Case like
    //      wo|rd
    //    there is a clear left and right index.
    left = templatePosition - 1;
    right = templatePosition;
  }

  if (!isIdentifierPart(templateSrc.charCodeAt(left)) &&
      !isIdentifierPart(templateSrc.charCodeAt(right))) {
    // Case like
    //         .|.
    // left ---^ ^--- right
    // There is no word here.
    return;
  }

  // Expand on the left and right side until a word boundary is hit. Back up one expansion on both
  // side to stay inside the word.
  while (left >= 0 && isIdentifierPart(templateSrc.charCodeAt(left))) --left;
  ++left;
  while (right < templateSrc.length && isIdentifierPart(templateSrc.charCodeAt(right))) ++right;
  --right;

  const absoluteStartPosition = position - (templatePosition - left);
  const length = right - left + 1;
  return {start: absoluteStartPosition, length};
}

export function getTemplateCompletions(
    templateInfo: ng.AstResult, position: number): ng.CompletionEntry[] {
  const {htmlAst, template} = templateInfo;
  // Calculate the position relative to the start of the template. This is needed
  // because spans in HTML AST are relative. Inline template has non-zero start position.
  const templatePosition = position - template.span.start;
  const htmlPath: HtmlAstPath = getPathToNodeAtPosition(htmlAst, templatePosition);
  const mostSpecific = htmlPath.tail;
  const visitor = new HtmlVisitor(templateInfo, htmlPath);
  const results: ng.CompletionEntry[] = mostSpecific ?
      mostSpecific.visit(visitor, null /* context */) :
      elementCompletions(templateInfo);
  const replacementSpan = getBoundedWordSpan(templateInfo, position, mostSpecific);
  return results.map(entry => {
    return {
      ...entry,
      replacementSpan,
    };
  });
}

class HtmlVisitor implements Visitor {
  /**
   * Position relative to the start of the template.
   */
  private readonly relativePosition: number;
  constructor(private readonly templateInfo: ng.AstResult, private readonly htmlPath: HtmlAstPath) {
    this.relativePosition = htmlPath.position;
  }
  // Note that every visitor method must explicitly specify return type because
  // Visitor returns `any` for all methods.
  visitElement(ast: Element): ng.CompletionEntry[] {
    const startTagSpan = spanOf(ast.sourceSpan);
    const tagLen = ast.name.length;
    // + 1 for the opening angle bracket
    if (this.relativePosition <= startTagSpan.start + tagLen + 1) {
      // If we are in the tag then return the element completions.
      return elementCompletions(this.templateInfo);
    }
    if (this.relativePosition < startTagSpan.end) {
      // We are in the attribute section of the element (but not in an attribute).
      // Return the attribute completions.
      return attributeCompletionsForElement(this.templateInfo, ast.name);
    }
    return [];
  }
  visitAttribute(ast: Attribute): ng.CompletionEntry[] {
    // An attribute consists of two parts, LHS="RHS".
    // Determine if completions are requested for LHS or RHS
    if (ast.valueSpan && inSpan(this.relativePosition, spanOf(ast.valueSpan))) {
      // RHS completion
      return attributeValueCompletions(this.templateInfo, this.htmlPath);
    }
    // LHS completion
    return attributeCompletions(this.templateInfo, this.htmlPath);
  }
  visitText(): ng.CompletionEntry[] {
    const templatePath = findTemplateAstAt(this.templateInfo.templateAst, this.relativePosition);
    if (templatePath.tail instanceof BoundTextAst) {
      // If we know that this is an interpolation then do not try other scenarios.
      const visitor = new ExpressionVisitor(
          this.templateInfo, this.relativePosition,
          () =>
              getExpressionScope(diagnosticInfoFromTemplateInfo(this.templateInfo), templatePath));
      templatePath.tail?.visit(visitor, null);
      return visitor.results;
    }
    // TODO(kyliau): Not sure if this check is really needed since we don't have
    // any test cases for it.
    const element = this.htmlPath.first(Element);
    if (element &&
        getHtmlTagDefinition(element.name).getContentType() !== TagContentType.PARSABLE_DATA) {
      return [];
    }
    // This is to account for cases like <h1> <a> text | </h1> where the
    // closest element has no closing tag and thus is considered plain text.
    const results = voidElementAttributeCompletions(this.templateInfo, this.htmlPath);
    if (results.length) {
      return results;
    }
    return elementCompletions(this.templateInfo);
  }
  visitComment(): ng.CompletionEntry[] {
    return [];
  }
  visitExpansion(): ng.CompletionEntry[] {
    return [];
  }
  visitExpansionCase(): ng.CompletionEntry[] {
    return [];
  }
}

function attributeCompletions(info: ng.AstResult, path: AstPath<HtmlAst>): ng.CompletionEntry[] {
  const attr = path.tail;
  const elem = path.parentOf(attr);
  if (!(attr instanceof Attribute) || !(elem instanceof Element)) {
    return [];
  }

  // TODO: Consider parsing the attrinute name to a proper AST instead of
  // matching using regex. This is because the regexp would incorrectly identify
  // bind parts for cases like [()|]
  //                              ^ cursor is here
  const binding = getBindingDescriptor(attr.name);
  if (!binding) {
    // This is a normal HTML attribute, not an Angular attribute.
    return attributeCompletionsForElement(info, elem.name);
  }

  const results: string[] = [];
  const ngAttrs = angularAttributes(info, elem.name);
  switch (binding.kind) {
    case ATTR.KW_MICROSYNTAX:
      // template reference attribute: *attrName
      results.push(...ngAttrs.templateRefs);
      break;

    case ATTR.KW_BIND:
    case ATTR.IDENT_PROPERTY:
      // property binding via bind- or []
      results.push(...propertyNames(elem.name), ...ngAttrs.inputs);
      break;

    case ATTR.KW_ON:
    case ATTR.IDENT_EVENT:
      // event binding via on- or ()
      results.push(...eventNames(elem.name), ...ngAttrs.outputs);
      break;

    case ATTR.KW_BINDON:
    case ATTR.IDENT_BANANA_BOX:
      // banana-in-a-box binding via bindon- or [()]
      results.push(...ngAttrs.bananas);
      break;
  }

  return results.map(name => {
    return {
      name,
      kind: ng.CompletionKind.ATTRIBUTE,
      sortText: name,
    };
  });
}

function attributeCompletionsForElement(
    info: ng.AstResult, elementName: string): ng.CompletionEntry[] {
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

  // Add Angular attributes
  const ngAttrs = angularAttributes(info, elementName);
  for (const name of ngAttrs.others) {
    results.push({
      name,
      kind: ng.CompletionKind.ATTRIBUTE,
      sortText: name,
    });
  }

  return results;
}

/**
 * Provide completions to the RHS of an attribute, which is of the form
 * LHS="RHS". The template path is computed from the specified `info` whereas
 * the context is determined from the specified `htmlPath`.
 * @param info Object that contains the template AST
 * @param htmlPath Path to the HTML node
 */
function attributeValueCompletions(
    info: ng.AstResult, htmlPath: HtmlAstPath): ng.CompletionEntry[] {
  // Find the corresponding Template AST path.
  const templatePath = findTemplateAstAt(info.templateAst, htmlPath.position);
  const visitor = new ExpressionVisitor(info, htmlPath.position, () => {
    const dinfo = diagnosticInfoFromTemplateInfo(info);
    return getExpressionScope(dinfo, templatePath);
  });
  if (templatePath.tail instanceof AttrAst ||
      templatePath.tail instanceof BoundElementPropertyAst ||
      templatePath.tail instanceof BoundEventAst) {
    templatePath.tail.visit(visitor, null);
    return visitor.results;
  }
  // In order to provide accurate attribute value completion, we need to know
  // what the LHS is, and construct the proper AST if it is missing.
  const htmlAttr = htmlPath.tail as Attribute;
  const binding = getBindingDescriptor(htmlAttr.name);
  if (binding && binding.kind === ATTR.KW_REF) {
    let refAst: ReferenceAst|undefined;
    let elemAst: ElementAst|undefined;
    if (templatePath.tail instanceof ReferenceAst) {
      refAst = templatePath.tail;
      const parent = templatePath.parentOf(refAst);
      if (parent instanceof ElementAst) {
        elemAst = parent;
      }
    } else if (templatePath.tail instanceof ElementAst) {
      refAst = new ReferenceAst(htmlAttr.name, null!, htmlAttr.value, htmlAttr.valueSpan!);
      elemAst = templatePath.tail;
    }
    if (refAst && elemAst) {
      refAst.visit(visitor, elemAst);
    }
  } else {
    // HtmlAst contains the `Attribute` node, however the corresponding `AttrAst`
    // node is missing from the TemplateAst.
    const attrAst = new AttrAst(htmlAttr.name, htmlAttr.value, htmlAttr.valueSpan!);
    attrAst.visit(visitor, null);
  }
  return visitor.results;
}

function elementCompletions(info: ng.AstResult): ng.CompletionEntry[] {
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

// There is a special case of HTML where text that contains a unclosed tag is treated as
// text. For exaple '<h1> Some <a text </h1>' produces a text nodes inside of the H1
// element "Some <a text". We, however, want to treat this as if the user was requesting
// the attributes of an "a" element, not requesting completion in the a text element. This
// code checks for this case and returns element completions if it is detected or undefined
// if it is not.
function voidElementAttributeCompletions(
    info: ng.AstResult, path: AstPath<HtmlAst>): ng.CompletionEntry[] {
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
  private readonly completions = new Map<string, ng.CompletionEntry>();

  constructor(
      private readonly info: ng.AstResult, private readonly position: number,
      private readonly getExpressionScope: () => ng.SymbolTable) {
    super();
  }

  get results(): ng.CompletionEntry[] {
    return Array.from(this.completions.values());
  }

  override visitDirectiveProperty(ast: BoundDirectivePropertyAst): void {
    this.processExpressionCompletions(ast.value);
  }

  override visitElementProperty(ast: BoundElementPropertyAst): void {
    this.processExpressionCompletions(ast.value);
  }

  override visitEvent(ast: BoundEventAst): void {
    this.processExpressionCompletions(ast.handler);
  }

  override visitElement(): void {
    // no-op for now
  }

  override visitAttr(ast: AttrAst) {
    const binding = getBindingDescriptor(ast.name);
    if (binding && binding.kind === ATTR.KW_MICROSYNTAX) {
      // This a template binding given by micro syntax expression.
      // First, verify the attribute consists of some binding we can give completions for.
      // The sourceSpan of AttrAst points to the RHS of the attribute
      const templateKey = binding.name;
      const templateValue = ast.sourceSpan.toString();
      const templateUrl = ast.sourceSpan.start.file.url;
      // TODO(kyliau): We are unable to determine the absolute offset of the key
      // but it is okay here, because we are only looking at the RHS of the attr
      const absKeyOffset = 0;
      const absValueOffset = ast.sourceSpan.start.offset;
      const {templateBindings} = this.info.expressionParser.parseTemplateBindings(
          templateKey, templateValue, templateUrl, absKeyOffset, absValueOffset);
      // Find the nearest template binding to the position.
      const lastBindingEnd = templateBindings.length > 0 &&
          templateBindings[templateBindings.length - 1].sourceSpan.end;
      const normalizedPositionToBinding =
          lastBindingEnd && this.position > lastBindingEnd ? lastBindingEnd : this.position;
      const templateBinding =
          templateBindings.find(b => inSpan(normalizedPositionToBinding, b.sourceSpan));

      if (!templateBinding) {
        return;
      }

      this.microSyntaxInAttributeValue(ast, templateBinding);
    } else {
      const expressionAst = this.info.expressionParser.parseBinding(
          ast.value, ast.sourceSpan.toString(), ast.sourceSpan.start.offset);
      this.processExpressionCompletions(expressionAst);
    }
  }

  override visitReference(_ast: ReferenceAst, context: ElementAst) {
    context.directives.forEach(dir => {
      const {exportAs} = dir.directive;
      if (exportAs) {
        this.completions.set(
            exportAs, {name: exportAs, kind: ng.CompletionKind.REFERENCE, sortText: exportAs});
      }
    });
  }

  override visitBoundText(ast: BoundTextAst) {
    if (inSpan(this.position, ast.value.sourceSpan)) {
      const completions = getExpressionCompletions(
          this.getExpressionScope(), ast.value, this.position, this.info.template);
      if (completions) {
        this.addSymbolsToCompletions(completions);
      }
    }
  }

  private processExpressionCompletions(value: AST) {
    const symbols = getExpressionCompletions(
        this.getExpressionScope(), value, this.position, this.info.template);
    if (symbols) {
      this.addSymbolsToCompletions(symbols);
    }
  }

  private addSymbolsToCompletions(symbols: ng.Symbol[]) {
    for (const s of symbols) {
      if (s.name.startsWith('__') || !s.public || this.completions.has(s.name)) {
        continue;
      }

      // The pipe method should not include parentheses.
      // e.g. {{ value_expression | slice : start [ : end ] }}
      const shouldInsertParentheses = s.callable && s.kind !== ng.CompletionKind.PIPE;
      this.completions.set(s.name, {
        name: s.name,
        kind: s.kind as ng.CompletionKind,
        sortText: s.name,
        insertText: shouldInsertParentheses ? `${s.name}()` : s.name,
      });
    }
  }

  /**
   * This method handles the completions of attribute values for directives that
   * support the microsyntax format. Examples are *ngFor and *ngIf.
   * These directives allows declaration of "let" variables, adds context-specific
   * symbols like $implicit, index, count, among other behaviors.
   * For a complete description of such format, see
   * https://angular.io/guide/structural-directives#asterisk
   *
   * @param attr descriptor for attribute name and value pair
   * @param binding template binding for the expression in the attribute
   */
  private microSyntaxInAttributeValue(attr: AttrAst, binding: TemplateBinding) {
    const key = attr.name.substring(1);  // remove leading asterisk

    // Find the selector - eg ngFor, ngIf, etc
    const selectorInfo = getSelectors(this.info);
    const selector = selectorInfo.selectors.find(s => {
      // attributes are listed in (attribute, value) pairs
      for (let i = 0; i < s.attrs.length; i += 2) {
        if (s.attrs[i] === key) {
          return true;
        }
      }
    });

    if (!selector) {
      return;
    }

    const valueRelativePosition = this.position - attr.sourceSpan.start.offset;

    if (binding instanceof VariableBinding) {
      // TODO(kyliau): With expression sourceSpan we shouldn't have to search
      // the attribute value string anymore. Just check if position is in the
      // expression source span.
      const equalLocation = attr.value.indexOf('=');
      if (equalLocation > 0 && valueRelativePosition > equalLocation) {
        // We are after the '=' in a let clause. The valid values here are the members of the
        // template reference's type parameter.
        const directiveMetadata = selectorInfo.map.get(selector);
        if (directiveMetadata) {
          const contextTable =
              this.info.template.query.getTemplateContext(directiveMetadata.type.reference);
          if (contextTable) {
            // This adds symbols like $implicit, index, count, etc.
            this.addSymbolsToCompletions(contextTable.values());
            return;
          }
        }
      }
    } else if (binding instanceof ExpressionBinding) {
      if (inSpan(this.position, binding.value?.ast.sourceSpan)) {
        this.processExpressionCompletions(binding.value!.ast);
        return;
      } else if (!binding.value && this.position > binding.key.span.end) {
        // No expression is defined for the value of the key expression binding, but the cursor is
        // in a location where the expression would be defined. This can happen in a case like
        //   let i of |
        //            ^-- cursor
        // In this case, backfill the value to be an empty expression and retrieve completions.
        this.processExpressionCompletions(new EmptyExpr(
            new ParseSpan(valueRelativePosition, valueRelativePosition),
            new AbsoluteSourceSpan(this.position, this.position)));
        return;
      }
    }
  }
}

interface AngularAttributes {
  /**
   * Attributes that support the * syntax. See https://angular.io/api/core/TemplateRef
   */
  templateRefs: Set<string>;
  /**
   * Attributes with the @Input annotation.
   */
  inputs: Set<string>;
  /**
   * Attributes with the @Output annotation.
   */
  outputs: Set<string>;
  /**
   * Attributes that support the [()] or bindon- syntax.
   */
  bananas: Set<string>;
  /**
   * General attributes that match the specified element.
   */
  others: Set<string>;
}

/**
 * Return all Angular-specific attributes for the element with `elementName`.
 * @param info
 * @param elementName
 */
function angularAttributes(info: ng.AstResult, elementName: string): AngularAttributes {
  const {selectors, map: selectorMap} = getSelectors(info);
  const templateRefs = new Set<string>();
  const inputs = new Set<string>();
  const outputs = new Set<string>();
  const bananas = new Set<string>();
  const others = new Set<string>();
  for (const selector of selectors) {
    if (selector.element && selector.element !== elementName) {
      continue;
    }
    const summary = selectorMap.get(selector)!;
    const hasTemplateRef = isStructuralDirective(summary.type);
    // attributes are listed in (attribute, value) pairs
    for (let i = 0; i < selector.attrs.length; i += 2) {
      const attr = selector.attrs[i];
      if (hasTemplateRef) {
        templateRefs.add(attr);
      } else {
        others.add(attr);
      }
    }
    for (const input of Object.values(summary.inputs)) {
      inputs.add(input);
    }
    for (const output of Object.values(summary.outputs)) {
      outputs.add(output);
    }
  }
  for (const name of inputs) {
    // Add banana-in-a-box syntax
    // https://angular.io/guide/template-syntax#two-way-binding-
    if (outputs.has(`${name}Change`)) {
      bananas.add(name);
    }
  }
  return {templateRefs, inputs, outputs, bananas, others};
}
