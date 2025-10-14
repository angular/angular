/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {BindingType, EmptyExpr} from '../expression_parser/ast';
import * as html from '../ml_parser/ast';
import {replaceNgsp} from '../ml_parser/html_whitespaces';
import {isNgTemplate} from '../ml_parser/tags';
import {ParseError, ParseErrorLevel, ParseSourceSpan} from '../parse_util';
import {isStyleUrlResolvable} from '../style_url_resolver';
import {isI18nRootNode} from '../template/pipeline/src/ingest';
import {PreparsedElementType, preparseElement} from '../template_parser/template_preparser';
import * as t from './r3_ast';
import {
  createForLoop,
  createIfBlock,
  createSwitchBlock,
  isConnectedForLoopBlock,
  isConnectedIfLoopBlock,
} from './r3_control_flow';
import {createDeferredBlock, isConnectedDeferLoopBlock} from './r3_deferred_blocks';
import {I18N_ICU_VAR_PREFIX} from './view/i18n/util';
const BIND_NAME_REGEXP = /^(?:(bind-)|(let-)|(ref-|#)|(on-)|(bindon-)|(@))(.*)$/;
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
const BINDING_DELIMS = {
  BANANA_BOX: {start: '[(', end: ')]'},
  PROPERTY: {start: '[', end: ']'},
  EVENT: {start: '(', end: ')'},
};
const TEMPLATE_ATTR_PREFIX = '*';
// TODO(crisbeto): any other tag names that shouldn't be allowed here?
const UNSUPPORTED_SELECTORLESS_TAGS = new Set([
  'link',
  'style',
  'script',
  'ng-template',
  'ng-container',
  'ng-content',
]);
// TODO(crisbeto): any other attributes that should not be allowed here?
const UNSUPPORTED_SELECTORLESS_DIRECTIVE_ATTRS = new Set(['ngProjectAs', 'ngNonBindable']);
export function htmlAstToRender3Ast(htmlNodes, bindingParser, options) {
  const transformer = new HtmlAstToIvyAst(bindingParser, options);
  const ivyNodes = html.visitAll(transformer, htmlNodes, htmlNodes);
  // Errors might originate in either the binding parser or the html to ivy transformer
  const allErrors = bindingParser.errors.concat(transformer.errors);
  const result = {
    nodes: ivyNodes,
    errors: allErrors,
    styleUrls: transformer.styleUrls,
    styles: transformer.styles,
    ngContentSelectors: transformer.ngContentSelectors,
  };
  if (options.collectCommentNodes) {
    result.commentNodes = transformer.commentNodes;
  }
  return result;
}
class HtmlAstToIvyAst {
  constructor(bindingParser, options) {
    this.bindingParser = bindingParser;
    this.options = options;
    this.errors = [];
    this.styles = [];
    this.styleUrls = [];
    this.ngContentSelectors = [];
    // This array will be populated if `Render3ParseOptions['collectCommentNodes']` is true
    this.commentNodes = [];
    this.inI18nBlock = false;
    /**
     * Keeps track of the nodes that have been processed already when previous nodes were visited.
     * These are typically blocks connected to other blocks or text nodes between connected blocks.
     */
    this.processedNodes = new Set();
  }
  // HTML visitor
  visitElement(element) {
    const isI18nRootElement = isI18nRootNode(element.i18n);
    if (isI18nRootElement) {
      if (this.inI18nBlock) {
        this.reportError(
          'Cannot mark an element as translatable inside of a translatable section. Please remove the nested i18n marker.',
          element.sourceSpan,
        );
      }
      this.inI18nBlock = true;
    }
    const preparsedElement = preparseElement(element);
    if (preparsedElement.type === PreparsedElementType.SCRIPT) {
      return null;
    } else if (preparsedElement.type === PreparsedElementType.STYLE) {
      const contents = textContents(element);
      if (contents !== null) {
        this.styles.push(contents);
      }
      return null;
    } else if (
      preparsedElement.type === PreparsedElementType.STYLESHEET &&
      isStyleUrlResolvable(preparsedElement.hrefAttr)
    ) {
      this.styleUrls.push(preparsedElement.hrefAttr);
      return null;
    }
    // Whether the element is a `<ng-template>`
    const isTemplateElement = isNgTemplate(element.name);
    const {
      attributes,
      boundEvents,
      references,
      variables,
      templateVariables,
      elementHasInlineTemplate,
      parsedProperties,
      templateParsedProperties,
      i18nAttrsMeta,
    } = this.prepareAttributes(element.attrs, isTemplateElement);
    const directives = this.extractDirectives(element);
    let children;
    if (preparsedElement.nonBindable) {
      // The `NonBindableVisitor` may need to return an array of nodes for blocks so we need
      // to flatten the array here. Avoid doing this for the `HtmlAstToIvyAst` since `flat` creates
      // a new array.
      children = html.visitAll(NON_BINDABLE_VISITOR, element.children).flat(Infinity);
    } else {
      children = html.visitAll(this, element.children, element.children);
    }
    let parsedElement;
    if (preparsedElement.type === PreparsedElementType.NG_CONTENT) {
      const selector = preparsedElement.selectAttr;
      const attrs = element.attrs.map((attr) => this.visitAttribute(attr));
      parsedElement = new t.Content(
        selector,
        attrs,
        children,
        element.isSelfClosing,
        element.sourceSpan,
        element.startSourceSpan,
        element.endSourceSpan,
        element.i18n,
      );
      this.ngContentSelectors.push(selector);
    } else if (isTemplateElement) {
      // `<ng-template>`
      const attrs = this.categorizePropertyAttributes(
        element.name,
        parsedProperties,
        i18nAttrsMeta,
      );
      parsedElement = new t.Template(
        element.name,
        attributes,
        attrs.bound,
        boundEvents,
        directives,
        [
          /* no template attributes */
        ],
        children,
        references,
        variables,
        element.isSelfClosing,
        element.sourceSpan,
        element.startSourceSpan,
        element.endSourceSpan,
        element.i18n,
      );
    } else {
      const attrs = this.categorizePropertyAttributes(
        element.name,
        parsedProperties,
        i18nAttrsMeta,
      );
      if (element.name === 'ng-container') {
        for (const bound of attrs.bound) {
          if (bound.type === BindingType.Attribute) {
            this.reportError(
              `Attribute bindings are not supported on ng-container. Use property bindings instead.`,
              bound.sourceSpan,
            );
          }
        }
      }
      parsedElement = new t.Element(
        element.name,
        attributes,
        attrs.bound,
        boundEvents,
        directives,
        children,
        references,
        element.isSelfClosing,
        element.sourceSpan,
        element.startSourceSpan,
        element.endSourceSpan,
        element.isVoid,
        element.i18n,
      );
    }
    if (elementHasInlineTemplate) {
      // If this node is an inline-template (e.g. has *ngFor) then we need to create a template
      // node that contains this node.
      parsedElement = this.wrapInTemplate(
        parsedElement,
        templateParsedProperties,
        templateVariables,
        i18nAttrsMeta,
        isTemplateElement,
        isI18nRootElement,
      );
    }
    if (isI18nRootElement) {
      this.inI18nBlock = false;
    }
    return parsedElement;
  }
  visitAttribute(attribute) {
    return new t.TextAttribute(
      attribute.name,
      attribute.value,
      attribute.sourceSpan,
      attribute.keySpan,
      attribute.valueSpan,
      attribute.i18n,
    );
  }
  visitText(text) {
    return this.processedNodes.has(text)
      ? null
      : this._visitTextWithInterpolation(text.value, text.sourceSpan, text.tokens, text.i18n);
  }
  visitExpansion(expansion) {
    if (!expansion.i18n) {
      // do not generate Icu in case it was created
      // outside of i18n block in a template
      return null;
    }
    if (!isI18nRootNode(expansion.i18n)) {
      throw new Error(
        `Invalid type "${expansion.i18n.constructor}" for "i18n" property of ${expansion.sourceSpan.toString()}. Expected a "Message"`,
      );
    }
    const message = expansion.i18n;
    const vars = {};
    const placeholders = {};
    // extract VARs from ICUs - we process them separately while
    // assembling resulting message via goog.getMsg function, since
    // we need to pass them to top-level goog.getMsg call
    Object.keys(message.placeholders).forEach((key) => {
      const value = message.placeholders[key];
      if (key.startsWith(I18N_ICU_VAR_PREFIX)) {
        // Currently when the `plural` or `select` keywords in an ICU contain trailing spaces (e.g.
        // `{count, select , ...}`), these spaces are also included into the key names in ICU vars
        // (e.g. "VAR_SELECT "). These trailing spaces are not desirable, since they will later be
        // converted into `_` symbols while normalizing placeholder names, which might lead to
        // mismatches at runtime (i.e. placeholder will not be replaced with the correct value).
        const formattedKey = key.trim();
        const ast = this.bindingParser.parseInterpolationExpression(value.text, value.sourceSpan);
        vars[formattedKey] = new t.BoundText(ast, value.sourceSpan);
      } else {
        placeholders[key] = this._visitTextWithInterpolation(value.text, value.sourceSpan, null);
      }
    });
    return new t.Icu(vars, placeholders, expansion.sourceSpan, message);
  }
  visitExpansionCase(expansionCase) {
    return null;
  }
  visitComment(comment) {
    if (this.options.collectCommentNodes) {
      this.commentNodes.push(new t.Comment(comment.value || '', comment.sourceSpan));
    }
    return null;
  }
  visitLetDeclaration(decl, context) {
    const value = this.bindingParser.parseBinding(
      decl.value,
      false,
      decl.valueSpan,
      decl.valueSpan.start.offset,
    );
    if (value.errors.length === 0 && value.ast instanceof EmptyExpr) {
      this.reportError('@let declaration value cannot be empty', decl.valueSpan);
    }
    return new t.LetDeclaration(decl.name, value, decl.sourceSpan, decl.nameSpan, decl.valueSpan);
  }
  visitComponent(component) {
    const isI18nRootElement = isI18nRootNode(component.i18n);
    if (isI18nRootElement) {
      if (this.inI18nBlock) {
        this.reportError(
          'Cannot mark a component as translatable inside of a translatable section. Please remove the nested i18n marker.',
          component.sourceSpan,
        );
      }
      this.inI18nBlock = true;
    }
    if (component.tagName !== null && UNSUPPORTED_SELECTORLESS_TAGS.has(component.tagName)) {
      this.reportError(
        `Tag name "${component.tagName}" cannot be used as a component tag`,
        component.startSourceSpan,
      );
      return null;
    }
    const {
      attributes,
      boundEvents,
      references,
      templateVariables,
      elementHasInlineTemplate,
      parsedProperties,
      templateParsedProperties,
      i18nAttrsMeta,
    } = this.prepareAttributes(component.attrs, false);
    this.validateSelectorlessReferences(references);
    const directives = this.extractDirectives(component);
    let children;
    if (component.attrs.find((attr) => attr.name === 'ngNonBindable')) {
      // The `NonBindableVisitor` may need to return an array of nodes for blocks so we need
      // to flatten the array here. Avoid doing this for the `HtmlAstToIvyAst` since `flat` creates
      // a new array.
      children = html.visitAll(NON_BINDABLE_VISITOR, component.children).flat(Infinity);
    } else {
      children = html.visitAll(this, component.children, component.children);
    }
    const attrs = this.categorizePropertyAttributes(
      component.tagName,
      parsedProperties,
      i18nAttrsMeta,
    );
    let node = new t.Component(
      component.componentName,
      component.tagName,
      component.fullName,
      attributes,
      attrs.bound,
      boundEvents,
      directives,
      children,
      references,
      component.isSelfClosing,
      component.sourceSpan,
      component.startSourceSpan,
      component.endSourceSpan,
      component.i18n,
    );
    if (elementHasInlineTemplate) {
      node = this.wrapInTemplate(
        node,
        templateParsedProperties,
        templateVariables,
        i18nAttrsMeta,
        false,
        isI18nRootElement,
      );
    }
    if (isI18nRootElement) {
      this.inI18nBlock = false;
    }
    return node;
  }
  visitDirective() {
    return null;
  }
  visitBlockParameter() {
    return null;
  }
  visitBlock(block, context) {
    const index = Array.isArray(context) ? context.indexOf(block) : -1;
    if (index === -1) {
      throw new Error(
        'Visitor invoked incorrectly. Expecting visitBlock to be invoked siblings array as its context',
      );
    }
    // Connected blocks may have been processed as a part of the previous block.
    if (this.processedNodes.has(block)) {
      return null;
    }
    let result = null;
    switch (block.name) {
      case 'defer':
        result = createDeferredBlock(
          block,
          this.findConnectedBlocks(index, context, isConnectedDeferLoopBlock),
          this,
          this.bindingParser,
        );
        break;
      case 'switch':
        result = createSwitchBlock(block, this, this.bindingParser);
        break;
      case 'for':
        result = createForLoop(
          block,
          this.findConnectedBlocks(index, context, isConnectedForLoopBlock),
          this,
          this.bindingParser,
        );
        break;
      case 'if':
        result = createIfBlock(
          block,
          this.findConnectedBlocks(index, context, isConnectedIfLoopBlock),
          this,
          this.bindingParser,
        );
        break;
      default:
        let errorMessage;
        if (isConnectedDeferLoopBlock(block.name)) {
          errorMessage = `@${block.name} block can only be used after an @defer block.`;
          this.processedNodes.add(block);
        } else if (isConnectedForLoopBlock(block.name)) {
          errorMessage = `@${block.name} block can only be used after an @for block.`;
          this.processedNodes.add(block);
        } else if (isConnectedIfLoopBlock(block.name)) {
          errorMessage = `@${block.name} block can only be used after an @if or @else if block.`;
          this.processedNodes.add(block);
        } else {
          errorMessage = `Unrecognized block @${block.name}.`;
        }
        result = {
          node: new t.UnknownBlock(block.name, block.sourceSpan, block.nameSpan),
          errors: [new ParseError(block.sourceSpan, errorMessage)],
        };
        break;
    }
    this.errors.push(...result.errors);
    return result.node;
  }
  findConnectedBlocks(primaryBlockIndex, siblings, predicate) {
    const relatedBlocks = [];
    for (let i = primaryBlockIndex + 1; i < siblings.length; i++) {
      const node = siblings[i];
      // Skip over comments.
      if (node instanceof html.Comment) {
        continue;
      }
      // Ignore empty text nodes between blocks.
      if (node instanceof html.Text && node.value.trim().length === 0) {
        // Add the text node to the processed nodes since we don't want
        // it to be generated between the connected nodes.
        this.processedNodes.add(node);
        continue;
      }
      // Stop searching as soon as we hit a non-block node or a block that is unrelated.
      if (!(node instanceof html.Block) || !predicate(node.name)) {
        break;
      }
      relatedBlocks.push(node);
      this.processedNodes.add(node);
    }
    return relatedBlocks;
  }
  /** Splits up the property attributes depending on whether they're static or bound. */
  categorizePropertyAttributes(elementName, properties, i18nPropsMeta) {
    const bound = [];
    const literal = [];
    properties.forEach((prop) => {
      const i18n = i18nPropsMeta[prop.name];
      if (prop.isLiteral) {
        literal.push(
          new t.TextAttribute(
            prop.name,
            prop.expression.source || '',
            prop.sourceSpan,
            prop.keySpan,
            prop.valueSpan,
            i18n,
          ),
        );
      } else {
        // Note that validation is skipped and property mapping is disabled
        // due to the fact that we need to make sure a given prop is not an
        // input of a directive and directive matching happens at runtime.
        const bep = this.bindingParser.createBoundElementProperty(
          elementName,
          prop,
          /* skipValidation */ true,
          /* mapPropertyName */ false,
        );
        bound.push(t.BoundAttribute.fromBoundElementProperty(bep, i18n));
      }
    });
    return {bound, literal};
  }
  prepareAttributes(attrs, isTemplateElement) {
    const parsedProperties = [];
    const boundEvents = [];
    const variables = [];
    const references = [];
    const attributes = [];
    const i18nAttrsMeta = {};
    const templateParsedProperties = [];
    const templateVariables = [];
    // Whether the element has any *-attribute
    let elementHasInlineTemplate = false;
    for (const attribute of attrs) {
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
            attribute.sourceSpan,
          );
        }
        isTemplateBinding = true;
        elementHasInlineTemplate = true;
        const templateValue = attribute.value;
        const templateKey = normalizedName.substring(TEMPLATE_ATTR_PREFIX.length);
        const parsedVariables = [];
        const absoluteValueOffset = attribute.valueSpan
          ? attribute.valueSpan.fullStart.offset
          : // If there is no value span the attribute does not have a value, like `attr` in
            //`<div attr></div>`. In this case, point to one character beyond the last character of
            // the attribute name.
            attribute.sourceSpan.fullStart.offset + attribute.name.length;
        this.bindingParser.parseInlineTemplateBinding(
          templateKey,
          templateValue,
          attribute.sourceSpan,
          absoluteValueOffset,
          [],
          templateParsedProperties,
          parsedVariables,
          true /* isIvyAst */,
        );
        templateVariables.push(
          ...parsedVariables.map(
            (v) => new t.Variable(v.name, v.value, v.sourceSpan, v.keySpan, v.valueSpan),
          ),
        );
      } else {
        // Check for variables, events, property bindings, interpolation
        hasBinding = this.parseAttribute(
          isTemplateElement,
          attribute,
          [],
          parsedProperties,
          boundEvents,
          variables,
          references,
        );
      }
      if (!hasBinding && !isTemplateBinding) {
        // don't include the bindings as attributes as well in the AST
        attributes.push(this.visitAttribute(attribute));
      }
    }
    return {
      attributes,
      boundEvents,
      references,
      variables,
      templateVariables,
      elementHasInlineTemplate,
      parsedProperties,
      templateParsedProperties,
      i18nAttrsMeta,
    };
  }
  parseAttribute(
    isTemplateElement,
    attribute,
    matchableAttributes,
    parsedProperties,
    boundEvents,
    variables,
    references,
  ) {
    const name = normalizeAttributeName(attribute.name);
    const value = attribute.value;
    const srcSpan = attribute.sourceSpan;
    const absoluteOffset = attribute.valueSpan
      ? attribute.valueSpan.fullStart.offset
      : srcSpan.fullStart.offset;
    function createKeySpan(srcSpan, prefix, identifier) {
      // We need to adjust the start location for the keySpan to account for the removed 'data-'
      // prefix from `normalizeAttributeName`.
      const normalizationAdjustment = attribute.name.length - name.length;
      const keySpanStart = srcSpan.start.moveBy(prefix.length + normalizationAdjustment);
      const keySpanEnd = keySpanStart.moveBy(identifier.length);
      return new ParseSourceSpan(keySpanStart, keySpanEnd, keySpanStart, identifier);
    }
    const bindParts = name.match(BIND_NAME_REGEXP);
    if (bindParts) {
      if (bindParts[KW_BIND_IDX] != null) {
        const identifier = bindParts[IDENT_KW_IDX];
        const keySpan = createKeySpan(srcSpan, bindParts[KW_BIND_IDX], identifier);
        this.bindingParser.parsePropertyBinding(
          identifier,
          value,
          false,
          false,
          srcSpan,
          absoluteOffset,
          attribute.valueSpan,
          matchableAttributes,
          parsedProperties,
          keySpan,
        );
      } else if (bindParts[KW_LET_IDX]) {
        if (isTemplateElement) {
          const identifier = bindParts[IDENT_KW_IDX];
          const keySpan = createKeySpan(srcSpan, bindParts[KW_LET_IDX], identifier);
          this.parseVariable(identifier, value, srcSpan, keySpan, attribute.valueSpan, variables);
        } else {
          this.reportError(`"let-" is only supported on ng-template elements.`, srcSpan);
        }
      } else if (bindParts[KW_REF_IDX]) {
        const identifier = bindParts[IDENT_KW_IDX];
        const keySpan = createKeySpan(srcSpan, bindParts[KW_REF_IDX], identifier);
        this.parseReference(identifier, value, srcSpan, keySpan, attribute.valueSpan, references);
      } else if (bindParts[KW_ON_IDX]) {
        const events = [];
        const identifier = bindParts[IDENT_KW_IDX];
        const keySpan = createKeySpan(srcSpan, bindParts[KW_ON_IDX], identifier);
        this.bindingParser.parseEvent(
          identifier,
          value,
          /* isAssignmentEvent */ false,
          srcSpan,
          attribute.valueSpan || srcSpan,
          matchableAttributes,
          events,
          keySpan,
        );
        addEvents(events, boundEvents);
      } else if (bindParts[KW_BINDON_IDX]) {
        const identifier = bindParts[IDENT_KW_IDX];
        const keySpan = createKeySpan(srcSpan, bindParts[KW_BINDON_IDX], identifier);
        this.bindingParser.parsePropertyBinding(
          identifier,
          value,
          false,
          true,
          srcSpan,
          absoluteOffset,
          attribute.valueSpan,
          matchableAttributes,
          parsedProperties,
          keySpan,
        );
        this.parseAssignmentEvent(
          identifier,
          value,
          srcSpan,
          attribute.valueSpan,
          matchableAttributes,
          boundEvents,
          keySpan,
          absoluteOffset,
        );
      } else if (bindParts[KW_AT_IDX]) {
        const keySpan = createKeySpan(srcSpan, '', name);
        this.bindingParser.parseLiteralAttr(
          name,
          value,
          srcSpan,
          absoluteOffset,
          attribute.valueSpan,
          matchableAttributes,
          parsedProperties,
          keySpan,
        );
      }
      return true;
    }
    // We didn't see a kw-prefixed property binding, but we have not yet checked
    // for the []/()/[()] syntax.
    let delims = null;
    if (name.startsWith(BINDING_DELIMS.BANANA_BOX.start)) {
      delims = BINDING_DELIMS.BANANA_BOX;
    } else if (name.startsWith(BINDING_DELIMS.PROPERTY.start)) {
      delims = BINDING_DELIMS.PROPERTY;
    } else if (name.startsWith(BINDING_DELIMS.EVENT.start)) {
      delims = BINDING_DELIMS.EVENT;
    }
    if (
      delims !== null &&
      // NOTE: older versions of the parser would match a start/end delimited
      // binding iff the property name was terminated by the ending delimiter
      // and the identifier in the binding was non-empty.
      // TODO(ayazhafiz): update this to handle malformed bindings.
      name.endsWith(delims.end) &&
      name.length > delims.start.length + delims.end.length
    ) {
      const identifier = name.substring(delims.start.length, name.length - delims.end.length);
      const keySpan = createKeySpan(srcSpan, delims.start, identifier);
      if (delims.start === BINDING_DELIMS.BANANA_BOX.start) {
        this.bindingParser.parsePropertyBinding(
          identifier,
          value,
          false,
          true,
          srcSpan,
          absoluteOffset,
          attribute.valueSpan,
          matchableAttributes,
          parsedProperties,
          keySpan,
        );
        this.parseAssignmentEvent(
          identifier,
          value,
          srcSpan,
          attribute.valueSpan,
          matchableAttributes,
          boundEvents,
          keySpan,
          absoluteOffset,
        );
      } else if (delims.start === BINDING_DELIMS.PROPERTY.start) {
        this.bindingParser.parsePropertyBinding(
          identifier,
          value,
          false,
          false,
          srcSpan,
          absoluteOffset,
          attribute.valueSpan,
          matchableAttributes,
          parsedProperties,
          keySpan,
        );
      } else {
        const events = [];
        this.bindingParser.parseEvent(
          identifier,
          value,
          /* isAssignmentEvent */ false,
          srcSpan,
          attribute.valueSpan || srcSpan,
          matchableAttributes,
          events,
          keySpan,
        );
        addEvents(events, boundEvents);
      }
      return true;
    }
    // No explicit binding found.
    const keySpan = createKeySpan(srcSpan, '' /* prefix */, name);
    const hasBinding = this.bindingParser.parsePropertyInterpolation(
      name,
      value,
      srcSpan,
      attribute.valueSpan,
      matchableAttributes,
      parsedProperties,
      keySpan,
      attribute.valueTokens ?? null,
    );
    return hasBinding;
  }
  extractDirectives(node) {
    const elementName = node instanceof html.Component ? node.tagName : node.name;
    const directives = [];
    const seenDirectives = new Set();
    for (const directive of node.directives) {
      let invalid = false;
      for (const attr of directive.attrs) {
        if (attr.name.startsWith(TEMPLATE_ATTR_PREFIX)) {
          invalid = true;
          this.reportError(
            `Shorthand template syntax "${attr.name}" is not supported inside a directive context`,
            attr.sourceSpan,
          );
        } else if (UNSUPPORTED_SELECTORLESS_DIRECTIVE_ATTRS.has(attr.name)) {
          invalid = true;
          this.reportError(
            `Attribute "${attr.name}" is not supported in a directive context`,
            attr.sourceSpan,
          );
        }
      }
      if (!invalid && seenDirectives.has(directive.name)) {
        invalid = true;
        this.reportError(
          `Cannot apply directive "${directive.name}" multiple times on the same element`,
          directive.sourceSpan,
        );
      }
      if (invalid) {
        continue;
      }
      const {attributes, parsedProperties, boundEvents, references, i18nAttrsMeta} =
        this.prepareAttributes(directive.attrs, false);
      this.validateSelectorlessReferences(references);
      const {bound: inputs} = this.categorizePropertyAttributes(
        elementName,
        parsedProperties,
        i18nAttrsMeta,
      );
      for (const input of inputs) {
        if (input.type !== BindingType.Property && input.type !== BindingType.TwoWay) {
          invalid = true;
          this.reportError('Binding is not supported in a directive context', input.sourceSpan);
        }
      }
      if (invalid) {
        continue;
      }
      seenDirectives.add(directive.name);
      directives.push(
        new t.Directive(
          directive.name,
          attributes,
          inputs,
          boundEvents,
          references,
          directive.sourceSpan,
          directive.startSourceSpan,
          directive.endSourceSpan,
          undefined,
        ),
      );
    }
    return directives;
  }
  filterAnimationAttributes(attributes) {
    return attributes.filter((a) => !a.name.startsWith('animate.'));
  }
  filterAnimationInputs(attributes) {
    return attributes.filter((a) => a.type !== BindingType.Animation);
  }
  wrapInTemplate(
    node,
    templateProperties,
    templateVariables,
    i18nAttrsMeta,
    isTemplateElement,
    isI18nRootElement,
  ) {
    // We need to hoist the attributes of the node to the template for content projection purposes.
    const attrs = this.categorizePropertyAttributes(
      'ng-template',
      templateProperties,
      i18nAttrsMeta,
    );
    const templateAttrs = [];
    attrs.literal.forEach((attr) => templateAttrs.push(attr));
    attrs.bound.forEach((attr) => templateAttrs.push(attr));
    const hoistedAttrs = {
      attributes: [],
      inputs: [],
      outputs: [],
    };
    if (node instanceof t.Element || node instanceof t.Component) {
      hoistedAttrs.attributes.push(...this.filterAnimationAttributes(node.attributes));
      hoistedAttrs.inputs.push(...this.filterAnimationInputs(node.inputs));
      hoistedAttrs.outputs.push(...node.outputs);
    }
    // For <ng-template>s with structural directives on them, avoid passing i18n information to
    // the wrapping template to prevent unnecessary i18n instructions from being generated. The
    // necessary i18n meta information will be extracted from child elements.
    const i18n = isTemplateElement && isI18nRootElement ? undefined : node.i18n;
    let name;
    if (node instanceof t.Component) {
      name = node.tagName;
    } else if (node instanceof t.Template) {
      name = null;
    } else {
      name = node.name;
    }
    return new t.Template(
      name,
      hoistedAttrs.attributes,
      hoistedAttrs.inputs,
      hoistedAttrs.outputs,
      [
        // Do not copy over the directives.
      ],
      templateAttrs,
      [node],
      [
        // Do not copy over the references.
      ],
      templateVariables,
      false,
      node.sourceSpan,
      node.startSourceSpan,
      node.endSourceSpan,
      i18n,
    );
  }
  _visitTextWithInterpolation(value, sourceSpan, interpolatedTokens, i18n) {
    const valueNoNgsp = replaceNgsp(value);
    const expr = this.bindingParser.parseInterpolation(valueNoNgsp, sourceSpan, interpolatedTokens);
    return expr ? new t.BoundText(expr, sourceSpan, i18n) : new t.Text(valueNoNgsp, sourceSpan);
  }
  parseVariable(identifier, value, sourceSpan, keySpan, valueSpan, variables) {
    if (identifier.indexOf('-') > -1) {
      this.reportError(`"-" is not allowed in variable names`, sourceSpan);
    } else if (identifier.length === 0) {
      this.reportError(`Variable does not have a name`, sourceSpan);
    }
    variables.push(new t.Variable(identifier, value, sourceSpan, keySpan, valueSpan));
  }
  parseReference(identifier, value, sourceSpan, keySpan, valueSpan, references) {
    if (identifier.indexOf('-') > -1) {
      this.reportError(`"-" is not allowed in reference names`, sourceSpan);
    } else if (identifier.length === 0) {
      this.reportError(`Reference does not have a name`, sourceSpan);
    } else if (references.some((reference) => reference.name === identifier)) {
      this.reportError(`Reference "#${identifier}" is defined more than once`, sourceSpan);
    }
    references.push(new t.Reference(identifier, value, sourceSpan, keySpan, valueSpan));
  }
  parseAssignmentEvent(
    name,
    expression,
    sourceSpan,
    valueSpan,
    targetMatchableAttrs,
    boundEvents,
    keySpan,
    absoluteOffset,
  ) {
    const events = [];
    this.bindingParser.parseEvent(
      `${name}Change`,
      expression,
      /* isAssignmentEvent */ true,
      sourceSpan,
      valueSpan || sourceSpan,
      targetMatchableAttrs,
      events,
      keySpan,
    );
    addEvents(events, boundEvents);
  }
  validateSelectorlessReferences(references) {
    if (references.length === 0) {
      return;
    }
    const seenNames = new Set();
    for (const ref of references) {
      if (ref.value.length > 0) {
        this.reportError(
          'Cannot specify a value for a local reference in this context',
          ref.valueSpan || ref.sourceSpan,
        );
      } else if (seenNames.has(ref.name)) {
        this.reportError('Duplicate reference names are not allowed', ref.sourceSpan);
      } else {
        seenNames.add(ref.name);
      }
    }
  }
  reportError(message, sourceSpan, level = ParseErrorLevel.ERROR) {
    this.errors.push(new ParseError(sourceSpan, message, level));
  }
}
class NonBindableVisitor {
  visitElement(ast) {
    const preparsedElement = preparseElement(ast);
    if (
      preparsedElement.type === PreparsedElementType.SCRIPT ||
      preparsedElement.type === PreparsedElementType.STYLE ||
      preparsedElement.type === PreparsedElementType.STYLESHEET
    ) {
      // Skipping <script> for security reasons
      // Skipping <style> and stylesheets as we already processed them
      // in the StyleCompiler
      return null;
    }
    const children = html.visitAll(this, ast.children, null);
    return new t.Element(
      ast.name,
      html.visitAll(this, ast.attrs),
      /* inputs */ [],
      /* outputs */ [],
      /* directives */ [],
      children,
      /* references */ [],
      ast.isSelfClosing,
      ast.sourceSpan,
      ast.startSourceSpan,
      ast.endSourceSpan,
      ast.isVoid,
    );
  }
  visitComment(comment) {
    return null;
  }
  visitAttribute(attribute) {
    return new t.TextAttribute(
      attribute.name,
      attribute.value,
      attribute.sourceSpan,
      attribute.keySpan,
      attribute.valueSpan,
      attribute.i18n,
    );
  }
  visitText(text) {
    return new t.Text(text.value, text.sourceSpan);
  }
  visitExpansion(expansion) {
    return null;
  }
  visitExpansionCase(expansionCase) {
    return null;
  }
  visitBlock(block, context) {
    const nodes = [
      // In an ngNonBindable context we treat the opening/closing tags of block as plain text.
      // This is the as if the `tokenizeBlocks` option was disabled.
      new t.Text(block.startSourceSpan.toString(), block.startSourceSpan),
      ...html.visitAll(this, block.children),
    ];
    if (block.endSourceSpan !== null) {
      nodes.push(new t.Text(block.endSourceSpan.toString(), block.endSourceSpan));
    }
    return nodes;
  }
  visitBlockParameter(parameter, context) {
    return null;
  }
  visitLetDeclaration(decl, context) {
    return new t.Text(`@let ${decl.name} = ${decl.value};`, decl.sourceSpan);
  }
  visitComponent(ast, context) {
    const children = html.visitAll(this, ast.children, null);
    return new t.Element(
      ast.fullName,
      html.visitAll(this, ast.attrs),
      /* inputs */ [],
      /* outputs */ [],
      /* directives */ [],
      children,
      /* references */ [],
      ast.isSelfClosing,
      ast.sourceSpan,
      ast.startSourceSpan,
      ast.endSourceSpan,
      false,
    );
  }
  visitDirective(directive, context) {
    return null;
  }
}
const NON_BINDABLE_VISITOR = new NonBindableVisitor();
function normalizeAttributeName(attrName) {
  return /^data-/i.test(attrName) ? attrName.substring(5) : attrName;
}
function addEvents(events, boundEvents) {
  boundEvents.push(...events.map((e) => t.BoundEvent.fromParsedEvent(e)));
}
function textContents(node) {
  if (node.children.length !== 1 || !(node.children[0] instanceof html.Text)) {
    return null;
  } else {
    return node.children[0].value;
  }
}
//# sourceMappingURL=r3_template_transform.js.map
