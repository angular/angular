/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParsedEvent, ParsedProperty} from '../expression_parser/ast';
import {I18nMessageFactory, createI18nMessageFactory} from '../i18n/i18n_parser';
import {MessageBundle} from '../i18n/message_bundle';
import * as html from '../ml_parser/ast';
import {replaceNgsp} from '../ml_parser/html_whitespaces';
import {DEFAULT_INTERPOLATION_CONFIG} from '../ml_parser/interpolation_config';
import {isNgTemplate} from '../ml_parser/tags';
import {ParseError, ParseErrorLevel, ParseSourceSpan} from '../parse_util';
import {isStyleUrlResolvable} from '../style_url_resolver';
import {BindingParser} from '../template_parser/binding_parser';
import {PreparsedElementType, preparseElement} from '../template_parser/template_preparser';
import * as t from './r3_ast';

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
const CLASS_ATTR = 'class';
// Default selector used by `<ng-content>` if none specified
const DEFAULT_CONTENT_SELECTOR = '*';

/** Name of the i18n attributes **/
const I18N_ATTR = 'i18n';
const I18N_ATTR_PREFIX = 'i18n-';

/** I18n separators for metadata **/
const MEANING_SEPARATOR = '|';
const ID_SEPARATOR = '@@';

export class HtmlToTemplateTransform implements html.Visitor {
  errors: ParseError[];

  // Selectors for the `ng-content` tags. Only non `*` selectors are recorded here
  ngContentSelectors: string[] = [];
  // Any `<ng-content>` in the template ?
  hasNgContent = false;

  // Whether we are inside a translatable element (`<p i18n>... somewhere here ... </p>)
  private inI18nSection: boolean = false;
  private i18nSectionIndex = -1;
  private createI18nMessage: I18nMessageFactory;

  constructor(private bindingParser: BindingParser, private messageBundle?: MessageBundle) {
    if (this.messageBundle) {
      this.createI18nMessage = createI18nMessageFactory(DEFAULT_INTERPOLATION_CONFIG);
    }
  }

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
    const wasInI18nSection = this.inI18nSection;

    const matchableAttributes: [string, string][] = [];
    const parsedProperties: ParsedProperty[] = [];
    const boundEvents: t.BoundEvent[] = [];
    const variables: t.Variable[] = [];
    const references: t.Reference[] = [];
    const attributes: t.TextAttribute[] = [];

    const templateMatchableAttributes: [string, string][] = [];
    let inlineTemplateSourceSpan: ParseSourceSpan;
    const templateParsedProperties: ParsedProperty[] = [];
    const templateVariables: t.Variable[] = [];

    // Whether the element has any *-attribute
    let elementHasInlineTemplate = false;

    const outputAttrs: {[name: string]: html.Attribute} = {};
    const attrI18nMetas: {[name: string]: string} = {};
    let i18nMeta: string|null = null;

    for (const attribute of element.attrs) {
      const normalizedName = normalizeAttributeName(attribute.name);

      // `*attr` defines template bindings
      let i18nAttr = false;

      if (normalizedName.startsWith(TEMPLATE_ATTR_PREFIX)) {
        if (elementHasInlineTemplate) {
          this.reportError(
              `Can't have multiple template bindings on one element. Use only one attribute prefixed with *`,
              attribute.sourceSpan);
        }
        elementHasInlineTemplate = true;
        const templateValue = attribute.value;
        const templateKey = normalizedName.substring(TEMPLATE_ATTR_PREFIX.length);

        inlineTemplateSourceSpan = attribute.valueSpan || attribute.sourceSpan;

        this.bindingParser.parseInlineTemplateBinding(
            templateKey, templateValue, attribute.sourceSpan, templateMatchableAttributes,
            templateParsedProperties, templateVariables);
      } else if (normalizedName === I18N_ATTR) {
        if (this.inI18nSection) {
          throw new Error(
              `Could not mark an element as translatable inside of a translatable section`);
        }
        this.inI18nSection = true;
        this.i18nSectionIndex++;
        i18nMeta = attribute.value;
        i18nAttr = true;
      } else if (normalizedName.startsWith(I18N_ATTR_PREFIX)) {
        attrI18nMetas[normalizedName.slice(I18N_ATTR_PREFIX.length)] = attribute.value;
        i18nAttr = true;
      } else {
        outputAttrs[normalizedName] = attribute;
      }
    }

    Object.getOwnPropertyNames(outputAttrs).forEach(name => {
      const attr = outputAttrs[name];

      // Check for variables, events, property bindings, interpolation
      const hasBinding = this.parseAttribute(
          isTemplateElement, attr, matchableAttributes, parsedProperties, boundEvents, variables,
          references);

      if (!hasBinding) {
        // don't include the bindings as attributes as well in the AST
        attributes.push(this.visitAttribute(attr, attrI18nMetas[name]) as t.TextAttribute);
        matchableAttributes.push([name, attr.value]);
      }
      if (attrI18nMetas.hasOwnProperty(name)) {
        if (this.messageBundle) {
          this.addMessage([attr], attrI18nMetas[name]);
        }
      }
    });

    let children: t.Node[];
    // TODO(ocombe): refactor this when we support more than static i18n text
    if (i18nMeta !== null && element.children.length == 1 &&
        element.children[0] instanceof html.Text) {
      const text = element.children[0] as html.Text;
      children = [this.visitSingleI18nTextChild(text, i18nMeta)];
    } else {
      children = html.visitAll(
          preparsedElement.nonBindable ? NON_BINDABLE_VISITOR : this, element.children);
    }

    let parsedElement: t.Node|undefined;
    if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
      // `<ng-content>`
      this.hasNgContent = true;

      if (element.children && !element.children.every(isEmptyTextNode)) {
        this.reportError(`<ng-content> element cannot have content.`, element.sourceSpan);
      }

      const selector = preparsedElement.selectAttr;

      let attributes: t.TextAttribute[] = element.attrs.map(attribute => {
        return new t.TextAttribute(
            attribute.name, attribute.value, attribute.sourceSpan, attribute.valueSpan);
      });

      const selectorIndex =
          selector === DEFAULT_CONTENT_SELECTOR ? 0 : this.ngContentSelectors.push(selector);
      parsedElement = new t.Content(selectorIndex, attributes, element.sourceSpan);
    } else if (isTemplateElement) {
      // `<ng-template>`
      const boundAttributes = this.createBoundAttributes(element.name, parsedProperties);
      parsedElement = new t.Template(
          attributes, boundAttributes, children, references, variables, element.sourceSpan,
          element.startSourceSpan, element.endSourceSpan);
    } else if (i18nMeta !== null) {
      const boundAttributes = this.createBoundAttributes(element.name, parsedProperties);

      parsedElement = new t.I18nElement(
          element.name, attributes, boundAttributes, boundEvents, children, references,
          element.sourceSpan, element.startSourceSpan, element.endSourceSpan);
    } else {
      const boundAttributes = this.createBoundAttributes(element.name, parsedProperties);

      parsedElement = new t.Element(
          element.name, attributes, boundAttributes, boundEvents, children, references,
          element.sourceSpan, element.startSourceSpan, element.endSourceSpan);
    }

    if (elementHasInlineTemplate) {
      const attributes: t.TextAttribute[] = [];

      templateMatchableAttributes.forEach(
          ([name, value]) =>
              attributes.push(new t.TextAttribute(name, value, inlineTemplateSourceSpan)));

      const boundAttributes = this.createBoundAttributes('ng-template', templateParsedProperties);
      parsedElement = new t.Template(
          attributes, boundAttributes, [parsedElement], [], templateVariables, element.sourceSpan,
          element.startSourceSpan, element.endSourceSpan);
    }

    // Restore the state before exiting this node
    this.inI18nSection = wasInI18nSection;

    return parsedElement;
  }

  visitAttribute(attribute: html.Attribute, i18nMeta?: string): t.Node {
    if (i18nMeta) {
      const meta = this.parseI18nMeta(i18nMeta);
      return new t.I18nTextAttribute(
          attribute.name, attribute.value, meta, attribute.sourceSpan, attribute.valueSpan);
    }
    return new t.TextAttribute(
        attribute.name, attribute.value, attribute.sourceSpan, attribute.valueSpan);
  }

  visitText(text: html.Text): t.Node {
    const valueNoNgsp = replaceNgsp(text.value);
    const expr = this.bindingParser.parseInterpolation(valueNoNgsp, text.sourceSpan);
    return expr ? new t.BoundText(expr, text.sourceSpan) : new t.Text(valueNoNgsp, text.sourceSpan);
  }

  visitSingleI18nTextChild(text: html.Text, i18nMeta: string) {
    if (this.messageBundle) {
      this.addMessage([text], i18nMeta);
    }

    const meta = this.parseI18nMeta(i18nMeta);
    const valueNoNgsp = replaceNgsp(text.value);
    return new t.I18nText(valueNoNgsp, meta, text.sourceSpan);
  }

  visitComment(comment: html.Comment): null { return null; }

  visitExpansion(expansion: html.Expansion): null { return null; }

  visitExpansionCase(expansionCase: html.ExpansionCase): null { return null; }

  private createBoundAttributes(elementName: string, properties: ParsedProperty[]):
      t.BoundAttribute[] {
    return properties.filter(prop => !prop.isLiteral)
        .map(prop => this.bindingParser.createBoundElementProperty(elementName, prop))
        .map(prop => t.BoundAttribute.fromBoundElementProperty(prop));
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
            bindParts[IDENT_KW_IDX], value, srcSpan, matchableAttributes, events);
        addEvents(events, boundEvents);
      } else if (bindParts[KW_BINDON_IDX]) {
        this.bindingParser.parsePropertyBinding(
            bindParts[IDENT_KW_IDX], value, false, srcSpan, matchableAttributes, parsedProperties);
        this.parseAssignmentEvent(
            bindParts[IDENT_KW_IDX], value, srcSpan, matchableAttributes, boundEvents);
      } else if (bindParts[KW_AT_IDX]) {
        this.bindingParser.parseLiteralAttr(
            name, value, srcSpan, matchableAttributes, parsedProperties);

      } else if (bindParts[IDENT_BANANA_BOX_IDX]) {
        this.bindingParser.parsePropertyBinding(
            bindParts[IDENT_BANANA_BOX_IDX], value, false, srcSpan, matchableAttributes,
            parsedProperties);
        this.parseAssignmentEvent(
            bindParts[IDENT_BANANA_BOX_IDX], value, srcSpan, matchableAttributes, boundEvents);

      } else if (bindParts[IDENT_PROPERTY_IDX]) {
        this.bindingParser.parsePropertyBinding(
            bindParts[IDENT_PROPERTY_IDX], value, false, srcSpan, matchableAttributes,
            parsedProperties);

      } else if (bindParts[IDENT_EVENT_IDX]) {
        const events: ParsedEvent[] = [];
        this.bindingParser.parseEvent(
            bindParts[IDENT_EVENT_IDX], value, srcSpan, matchableAttributes, events);
        addEvents(events, boundEvents);
      }
    } else {
      hasBinding = this.bindingParser.parsePropertyInterpolation(
          name, value, srcSpan, matchableAttributes, parsedProperties);
    }

    return hasBinding;
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
      targetMatchableAttrs: string[][], boundEvents: t.BoundEvent[]) {
    const events: ParsedEvent[] = [];
    this.bindingParser.parseEvent(
        `${name}Change`, `${expression}=$event`, sourceSpan, targetMatchableAttrs, events);
    addEvents(events, boundEvents);
  }

  private reportError(
      message: string, sourceSpan: ParseSourceSpan,
      level: ParseErrorLevel = ParseErrorLevel.ERROR) {
    this.errors.push(new ParseError(sourceSpan, message, level));
  }

  // add a translatable message
  private addMessage(ast: html.Node[], i18nMeta: string) {
    if (ast.length == 0 ||
        ast.length == 1 && ast[0] instanceof html.Attribute && !(<html.Attribute>ast[0]).value) {
      // Do not create empty messages
      return null;
    }

    const msgMeta = this.parseI18nMeta(i18nMeta);
    const message = this.createI18nMessage(ast, msgMeta.meaning, msgMeta.description, msgMeta.id);
    this.messageBundle !.addMessages([message]);
  }

  /**
   * Parse i18n metas like:
   * - "@@id",
   * - "description[@@id]",
   * - "meaning|description[@@id]"
   */
  private parseI18nMeta(i18n?: string): t.I18nMeta {
    let meaning = '';
    let description = '';
    let id = '';

    if (i18n) {
      // TODO(vicb): figure out how to force a message ID with closure ?
      const idIndex = i18n.indexOf(ID_SEPARATOR);

      const descIndex = i18n.indexOf(MEANING_SEPARATOR);
      let meaningAndDesc: string;
      [meaningAndDesc, id] =
          (idIndex > -1) ? [i18n.slice(0, idIndex), i18n.slice(idIndex + 2)] : [i18n, ''];
      [meaning, description] = (descIndex > -1) ?
          [meaningAndDesc.slice(0, descIndex), meaningAndDesc.slice(descIndex + 1)] :
          ['', meaningAndDesc];
    }

    return {description, id, meaning};
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
    return new t.TextAttribute(attribute.name, attribute.value, attribute.sourceSpan);
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
