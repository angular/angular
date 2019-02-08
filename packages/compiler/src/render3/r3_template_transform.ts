/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParsedEvent, ParsedProperty, ParsedVariable} from '../expression_parser/ast';
import * as i18n from '../i18n/i18n_ast';
import * as html from '../ml_parser/ast';
import {replaceNgsp} from '../ml_parser/html_whitespaces';
import {isNgTemplate} from '../ml_parser/tags';
import {ParseError, ParseErrorLevel, ParseSourceSpan} from '../parse_util';
import {isStyleUrlResolvable} from '../style_url_resolver';
import {BindingParser} from '../template_parser/binding_parser';
import {PreparsedElementType, preparseElement} from '../template_parser/template_preparser';
import {syntaxError} from '../util';

import * as t from './r3_ast';
import {I18N_ICU_VAR_PREFIX} from './view/i18n/util';

const BIND_NAME_REGEXP =
    /^(?:(?:(?:(bind-)|(let-)|(ref-|#)|(on-)|(bindon-)|(@))(.+))|\[\(([^\)]+)\)\]|\[([^\]]+)\]|\(([^\)]+)\))$/;

// Group 1 = "bind-"
const KW_BIND_IDX = 1;
// Group 2 = "let-"
const KW_LET_IDX = 2;
// Group 3 = "ref-/#"
const KW_REF_IDX = 3;
// Group 4 = "on-"
const KW_ON_IDX = 4;
// Group 5 = "bindon-"
const KW_BINDON_IDX = 5;
// Group 6 = "@"
const KW_AT_IDX = 6;
// Group 7 = the identifier after "bind-", "let-", "ref-/#", "on-", "bindon-" or "@"
const IDENT_KW_IDX = 7;
// Group 8 = identifier inside [()]
const IDENT_BANANA_BOX_IDX = 8;
// Group 9 = identifier inside []
const IDENT_PROPERTY_IDX = 9;
// Group 10 = identifier inside ()
const IDENT_EVENT_IDX = 10;

const TEMPLATE_ATTR_PREFIX = '*';

// Result of the html AST to Ivy AST transformation
export type Render3ParseResult = {
  nodes: t.Node[]; errors: ParseError[];
};

export function htmlAstToRender3Ast(
    htmlNodes: html.Node[], bindingParser: BindingParser): Render3ParseResult {
  const transformer = new HtmlAstToIvyAst(bindingParser);
  const ivyNodes = html.visitAll(transformer, htmlNodes);

  // Errors might originate in either the binding parser or the html to ivy transformer
  const allErrors = bindingParser.errors.concat(transformer.errors);
  const errors: ParseError[] = allErrors.filter(e => e.level === ParseErrorLevel.ERROR);

  if (errors.length > 0) {
    const errorString = errors.join('\n');
    throw syntaxError(`Template parse errors:\n${errorString}`, errors);
  }

  return {
    nodes: ivyNodes,
    errors: allErrors,
  };
}

class HtmlAstToIvyAst implements html.Visitor {
  errors: ParseError[] = [];

  constructor(private bindingParser: BindingParser) {}

  // HTML visitor
  visitElement(element: html.Element): t.Node|null {
    const preparsedElement = preparseElement(element);
    if (preparsedElement.type === PreparsedElementType.SCRIPT ||
        preparsedElement.type === PreparsedElementType.STYLE) {
      // Skipping <script> for security reasons
      // Skipping <style> as we already processed them
      // in the StyleCompiler
      return null;
    }
    if (preparsedElement.type === PreparsedElementType.STYLESHEET &&
        isStyleUrlResolvable(preparsedElement.hrefAttr)) {
      // Skipping stylesheets with either relative urls or package scheme as we already processed
      // them in the StyleCompiler
      return null;
    }

    // Whether the element is a `<ng-template>`
    const isTemplateElement = isNgTemplate(element.name);

    const parsedProperties: ParsedProperty[] = [];
    const boundEvents: t.BoundEvent[] = [];
    const variables: t.Variable[] = [];
    const references: t.Reference[] = [];
    const attributes: t.TextAttribute[] = [];
    const i18nAttrsMeta: {[key: string]: i18n.AST} = {};

    const templateParsedProperties: ParsedProperty[] = [];
    const templateVariables: t.Variable[] = [];

    // Whether the element has any *-attribute
    let elementHasInlineTemplate = false;

    for (const attribute of element.attrs) {
      let hasBinding = false;
      const normalizedName = normalizeAttributeName(attribute.name);

      // `*attr` defines template bindings
      let isTemplateBinding = false;

      if (attribute.i18n) {
        i18nAttrsMeta[attribute.name] = attribute.i18n;
      }

      if (normalizedName.startsWith(TEMPLATE_ATTR_PREFIX)) {
        // *-attributes
        if (elementHasInlineTemplate) {
          this.reportError(
              `Can't have multiple template bindings on one element. Use only one attribute prefixed with *`,
              attribute.sourceSpan);
        }
        isTemplateBinding = true;
        elementHasInlineTemplate = true;
        const templateValue = attribute.value;
        const templateKey = normalizedName.substring(TEMPLATE_ATTR_PREFIX.length);

        const parsedVariables: ParsedVariable[] = [];
        this.bindingParser.parseInlineTemplateBinding(
            templateKey, templateValue, attribute.sourceSpan, [], templateParsedProperties,
            parsedVariables);
        templateVariables.push(
            ...parsedVariables.map(v => new t.Variable(v.name, v.value, v.sourceSpan)));
      } else {
        // Check for variables, events, property bindings, interpolation
        hasBinding = this.parseAttribute(
            isTemplateElement, attribute, [], parsedProperties, boundEvents, variables, references);
      }

      if (!hasBinding && !isTemplateBinding) {
        // don't include the bindings as attributes as well in the AST
        attributes.push(this.visitAttribute(attribute) as t.TextAttribute);
      }
    }

    const children: t.Node[] =
        html.visitAll(preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children);

    let parsedElement: t.Node|undefined;
    if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
      // `<ng-content>`
      if (element.children && !element.children.every(isEmptyTextNode)) {
        this.reportError(`<ng-content> element cannot have content.`, element.sourceSpan);
      }
      const selector = preparsedElement.selectAttr;
      const attrs: t.TextAttribute[] = element.attrs.map(attr => this.visitAttribute(attr));
      parsedElement = new t.Content(selector, attrs, element.sourceSpan, element.i18n);
    } else if (isTemplateElement) {
      // `<ng-template>`
      const attrs = this.extractAttributes(element.name, parsedProperties, i18nAttrsMeta);

      parsedElement = new t.Template(
          element.name, attributes, attrs.bound, boundEvents, children, references, variables,
          element.sourceSpan, element.startSourceSpan, element.endSourceSpan, element.i18n);
    } else {
      const attrs = this.extractAttributes(element.name, parsedProperties, i18nAttrsMeta);
      parsedElement = new t.Element(
          element.name, attributes, attrs.bound, boundEvents, children, references,
          element.sourceSpan, element.startSourceSpan, element.endSourceSpan, element.i18n);
    }

    if (elementHasInlineTemplate) {
      const attrs = this.extractAttributes('ng-template', templateParsedProperties, i18nAttrsMeta);
      // TODO(pk): test for this case
      parsedElement = new t.Template(
          (parsedElement as t.Element).name, attrs.literal, attrs.bound, [], [parsedElement], [],
          templateVariables, element.sourceSpan, element.startSourceSpan, element.endSourceSpan,
          element.i18n);
    }
    return parsedElement;
  }

  visitAttribute(attribute: html.Attribute): t.TextAttribute {
    return new t.TextAttribute(
        attribute.name, attribute.value, attribute.sourceSpan, attribute.valueSpan, attribute.i18n);
  }

  visitText(text: html.Text): t.Node {
    return this._visitTextWithInterpolation(text.value, text.sourceSpan, text.i18n);
  }

  visitExpansion(expansion: html.Expansion): t.Icu|null {
    const meta = expansion.i18n as i18n.Message;
    // do not generate Icu in case it was created
    // outside of i18n block in a template
    if (!meta) {
      return null;
    }
    const vars: {[name: string]: t.BoundText} = {};
    const placeholders: {[name: string]: t.Text | t.BoundText} = {};
    // extract VARs from ICUs - we process them separately while
    // assembling resulting message via goog.getMsg function, since
    // we need to pass them to top-level goog.getMsg call
    Object.keys(meta.placeholders).forEach(key => {
      const value = meta.placeholders[key];
      if (key.startsWith(I18N_ICU_VAR_PREFIX)) {
        const config = this.bindingParser.interpolationConfig;
        // ICU expression is a plain string, not wrapped into start
        // and end tags, so we wrap it before passing to binding parser
        const wrapped = `${config.start}${value}${config.end}`;
        vars[key] = this._visitTextWithInterpolation(wrapped, expansion.sourceSpan) as t.BoundText;
      } else {
        placeholders[key] = this._visitTextWithInterpolation(value, expansion.sourceSpan);
      }
    });
    return new t.Icu(vars, placeholders, expansion.sourceSpan, meta);
  }

  visitExpansionCase(expansionCase: html.ExpansionCase): null { return null; }

  visitComment(comment: html.Comment): null { return null; }

  // convert view engine `ParsedProperty` to a format suitable for IVY
  private extractAttributes(
      elementName: string, properties: ParsedProperty[], i18nPropsMeta: {[key: string]: i18n.AST}):
      {bound: t.BoundAttribute[], literal: t.TextAttribute[]} {
    const bound: t.BoundAttribute[] = [];
    const literal: t.TextAttribute[] = [];

    properties.forEach(prop => {
      const i18n = i18nPropsMeta[prop.name];
      if (prop.isLiteral) {
        literal.push(new t.TextAttribute(
            prop.name, prop.expression.source || '', prop.sourceSpan, undefined, i18n));
      } else {
        // we skip validation here, since we do this check at runtime due to the fact that we need
        // to make sure a given prop is not an input of some Directive (thus should not be a subject
        // of this check) and Directive matching happens at runtime
        const bep = this.bindingParser.createBoundElementProperty(
            elementName, prop, /* skipValidation */ true);
        bound.push(t.BoundAttribute.fromBoundElementProperty(bep, i18n));
      }
    });

    return {bound, literal};
  }

  private parseAttribute(
      isTemplateElement: boolean, attribute: html.Attribute, matchableAttributes: string[][],
      parsedProperties: ParsedProperty[], boundEvents: t.BoundEvent[], variables: t.Variable[],
      references: t.Reference[]) {
    const name = normalizeAttributeName(attribute.name);
    const value = attribute.value;
    const srcSpan = attribute.sourceSpan;

    const bindParts = name.match(BIND_NAME_REGEXP);
    let hasBinding = false;

    if (bindParts) {
      hasBinding = true;
      if (bindParts[KW_BIND_IDX] != null) {
        this.bindingParser.parsePropertyBinding(
            bindParts[IDENT_KW_IDX], value, false, srcSpan, matchableAttributes, parsedProperties);

      } else if (bindParts[KW_LET_IDX]) {
        if (isTemplateElement) {
          const identifier = bindParts[IDENT_KW_IDX];
          this.parseVariable(identifier, value, srcSpan, variables);
        } else {
          this.reportError(`"let-" is only supported on ng-template elements.`, srcSpan);
        }

      } else if (bindParts[KW_REF_IDX]) {
        const identifier = bindParts[IDENT_KW_IDX];
        this.parseReference(identifier, value, srcSpan, references);

      } else if (bindParts[KW_ON_IDX]) {
        const events: ParsedEvent[] = [];
        this.bindingParser.parseEvent(
            bindParts[IDENT_KW_IDX], value, srcSpan, attribute.valueSpan || srcSpan,
            matchableAttributes, events);
        addEvents(events, boundEvents);
      } else if (bindParts[KW_BINDON_IDX]) {
        this.bindingParser.parsePropertyBinding(
            bindParts[IDENT_KW_IDX], value, false, srcSpan, matchableAttributes, parsedProperties);
        this.parseAssignmentEvent(
            bindParts[IDENT_KW_IDX], value, srcSpan, attribute.valueSpan, matchableAttributes,
            boundEvents);
      } else if (bindParts[KW_AT_IDX]) {
        this.bindingParser.parseLiteralAttr(
            name, value, srcSpan, matchableAttributes, parsedProperties);

      } else if (bindParts[IDENT_BANANA_BOX_IDX]) {
        this.bindingParser.parsePropertyBinding(
            bindParts[IDENT_BANANA_BOX_IDX], value, false, srcSpan, matchableAttributes,
            parsedProperties);
        this.parseAssignmentEvent(
            bindParts[IDENT_BANANA_BOX_IDX], value, srcSpan, attribute.valueSpan,
            matchableAttributes, boundEvents);

      } else if (bindParts[IDENT_PROPERTY_IDX]) {
        this.bindingParser.parsePropertyBinding(
            bindParts[IDENT_PROPERTY_IDX], value, false, srcSpan, matchableAttributes,
            parsedProperties);

      } else if (bindParts[IDENT_EVENT_IDX]) {
        const events: ParsedEvent[] = [];
        this.bindingParser.parseEvent(
            bindParts[IDENT_EVENT_IDX], value, srcSpan, attribute.valueSpan || srcSpan,
            matchableAttributes, events);
        addEvents(events, boundEvents);
      }
    } else {
      hasBinding = this.bindingParser.parsePropertyInterpolation(
          name, value, srcSpan, matchableAttributes, parsedProperties);
    }

    return hasBinding;
  }

  private _visitTextWithInterpolation(value: string, sourceSpan: ParseSourceSpan, i18n?: i18n.AST):
      t.Text|t.BoundText {
    const valueNoNgsp = replaceNgsp(value);
    const expr = this.bindingParser.parseInterpolation(valueNoNgsp, sourceSpan);
    return expr ? new t.BoundText(expr, sourceSpan, i18n) : new t.Text(valueNoNgsp, sourceSpan);
  }

  private parseVariable(
      identifier: string, value: string, sourceSpan: ParseSourceSpan, variables: t.Variable[]) {
    if (identifier.indexOf('-') > -1) {
      this.reportError(`"-" is not allowed in variable names`, sourceSpan);
    }
    variables.push(new t.Variable(identifier, value, sourceSpan));
  }

  private parseReference(
      identifier: string, value: string, sourceSpan: ParseSourceSpan, references: t.Reference[]) {
    if (identifier.indexOf('-') > -1) {
      this.reportError(`"-" is not allowed in reference names`, sourceSpan);
    }

    references.push(new t.Reference(identifier, value, sourceSpan));
  }

  private parseAssignmentEvent(
      name: string, expression: string, sourceSpan: ParseSourceSpan,
      valueSpan: ParseSourceSpan|undefined, targetMatchableAttrs: string[][],
      boundEvents: t.BoundEvent[]) {
    const events: ParsedEvent[] = [];
    this.bindingParser.parseEvent(
        `${name}Change`, `${expression}=$event`, sourceSpan, valueSpan || sourceSpan,
        targetMatchableAttrs, events);
    addEvents(events, boundEvents);
  }

  private reportError(
      message: string, sourceSpan: ParseSourceSpan,
      level: ParseErrorLevel = ParseErrorLevel.ERROR) {
    this.errors.push(new ParseError(sourceSpan, message, level));
  }
}

class NonBindableVisitor implements html.Visitor {
  visitElement(ast: html.Element): t.Element|null {
    const preparsedElement = preparseElement(ast);
    if (preparsedElement.type === PreparsedElementType.SCRIPT ||
        preparsedElement.type === PreparsedElementType.STYLE ||
        preparsedElement.type === PreparsedElementType.STYLESHEET) {
      // Skipping <script> for security reasons
      // Skipping <style> and stylesheets as we already processed them
      // in the StyleCompiler
      return null;
    }

    const children: t.Node[] = html.visitAll(this, ast.children, null);
    return new t.Element(
        ast.name, html.visitAll(this, ast.attrs) as t.TextAttribute[],
        /* inputs */[], /* outputs */[], children,  /* references */[], ast.sourceSpan,
        ast.startSourceSpan, ast.endSourceSpan);
  }

  visitComment(comment: html.Comment): any { return null; }

  visitAttribute(attribute: html.Attribute): t.TextAttribute {
    return new t.TextAttribute(
        attribute.name, attribute.value, attribute.sourceSpan, undefined, attribute.i18n);
  }

  visitText(text: html.Text): t.Text { return new t.Text(text.value, text.sourceSpan); }

  visitExpansion(expansion: html.Expansion): any { return null; }

  visitExpansionCase(expansionCase: html.ExpansionCase): any { return null; }
}

const NON_BINDABLE_VISITOR = new NonBindableVisitor();

function normalizeAttributeName(attrName: string): string {
  return /^data-/i.test(attrName) ? attrName.substring(5) : attrName;
}

function addEvents(events: ParsedEvent[], boundEvents: t.BoundEvent[]) {
  boundEvents.push(...events.map(e => t.BoundEvent.fromParsedEvent(e)));
}

function isEmptyTextNode(node: html.Node): boolean {
  return node instanceof html.Text && node.value.trim().length == 0;
}
