/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Parser as ExpressionParser} from '../expression_parser/parser';
import {ListWrapper, StringMapWrapper} from '../facade/collection';
import {BaseException} from '../facade/exceptions';
import {NumberWrapper, RegExpWrapper, isPresent} from '../facade/lang';
import {HtmlAst, HtmlAstVisitor, HtmlAttrAst, HtmlCommentAst, HtmlElementAst, HtmlExpansionAst, HtmlExpansionCaseAst, HtmlTextAst, htmlVisitAll} from '../html_ast';
import {HtmlParseTreeResult, HtmlParser} from '../html_parser';
import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from '../interpolation_config';
import {ParseError, ParseSourceSpan} from '../parse_util';
import {Message, id} from './message';
import {I18N_ATTR, I18N_ATTR_PREFIX, I18nError, Part, dedupePhName, extractPhNameFromInterpolation, messageFromAttribute, messageFromI18nAttribute, partition} from './shared';

const _PLACEHOLDER_ELEMENT = 'ph';
const _NAME_ATTR = 'name';
const _PLACEHOLDER_EXPANDED_REGEXP = /<ph\s+name="(\w+)"><\/ph>/gi;

/**
 * Creates an i18n-ed version of the parsed template.
 *
 * Algorithm:
 *
 * See `message_extractor.ts` for details on the partitioning algorithm.
 *
 * This is how the merging works:
 *
 * 1. Use the stringify function to get the message id. Look up the message in the map.
 * 2. Get the translated message. At this point we have two trees: the original tree
 * and the translated tree, where all the elements are replaced with placeholders.
 * 3. Use the original tree to create a mapping Index:number -> HtmlAst.
 * 4. Walk the translated tree.
 * 5. If we encounter a placeholder element, get its name property.
 * 6. Get the type and the index of the node using the name property.
 * 7. If the type is 'e', which means element, then:
 *     - translate the attributes of the original element
 *     - recurse to merge the children
 *     - create a new element using the original element name, original position,
 *     and translated children and attributes
 * 8. If the type if 't', which means text, then:
 *     - get the list of expressions from the original node.
 *     - get the string version of the interpolation subtree
 *     - find all the placeholders in the translated message, and replace them with the
 *     corresponding original expressions
 */
export class I18nHtmlParser implements HtmlParser {
  private _errors: ParseError[];
  private _interpolationConfig: InterpolationConfig;

  constructor(
      private _htmlParser: HtmlParser, public _expressionParser: ExpressionParser,
      private _messagesContent: string, private _messages: {[key: string]: HtmlAst[]},
      private _implicitTags: string[], private _implicitAttrs: {[k: string]: string[]}) {}

  parse(
      sourceContent: string, sourceUrl: string, parseExpansionForms: boolean = false,
      interpolationConfig: InterpolationConfig = DEFAULT_INTERPOLATION_CONFIG):
      HtmlParseTreeResult {
    this._errors = [];
    this._interpolationConfig = interpolationConfig;

    let res = this._htmlParser.parse(sourceContent, sourceUrl, true, interpolationConfig);

    if (res.errors.length > 0) {
      return res;
    }

    const nodes = this._recurse(res.rootNodes);

    return this._errors.length > 0 ? new HtmlParseTreeResult([], this._errors) :
                                     new HtmlParseTreeResult(nodes, []);
  }

  // Merge the translation recursively
  private _processI18nPart(part: Part): HtmlAst[] {
    try {
      return part.hasI18n ? this._mergeI18Part(part) : this._recurseIntoI18nPart(part);
    } catch (e) {
      if (e instanceof I18nError) {
        this._errors.push(e);
        return [];
      } else {
        throw e;
      }
    }
  }

  private _recurseIntoI18nPart(p: Part): HtmlAst[] {
    // we found an element without an i18n attribute
    // we need to recurse in case its children may have i18n set
    // we also need to translate its attributes
    if (isPresent(p.rootElement)) {
      const root = p.rootElement;
      const children = this._recurse(p.children);
      const attrs = this._i18nAttributes(root);
      return [new HtmlElementAst(
          root.name, attrs, children, root.sourceSpan, root.startSourceSpan, root.endSourceSpan)];
    }

    if (isPresent(p.rootTextNode)) {
      // a text node without i18n or interpolation, nothing to do
      return [p.rootTextNode];
    }

    return this._recurse(p.children);
  }

  private _recurse(nodes: HtmlAst[]): HtmlAst[] {
    let parts = partition(nodes, this._errors, this._implicitTags);
    return ListWrapper.flatten(parts.map(p => this._processI18nPart(p)));
  }

  // Look for the translated message and merge it back to the tree
  private _mergeI18Part(part: Part): HtmlAst[] {
    let message = part.createMessage(this._expressionParser, this._interpolationConfig);
    let messageId = id(message);

    if (!StringMapWrapper.contains(this._messages, messageId)) {
      throw new I18nError(
          part.sourceSpan,
          `Cannot find message for id '${messageId}', content '${message.content}'.`);
    }

    const translation = this._messages[messageId];
    return this._mergeTrees(part, translation);
  }


  private _mergeTrees(part: Part, translation: HtmlAst[]): HtmlAst[] {
    if (isPresent(part.rootTextNode)) {
      // this should never happen with a part. Parts that have root text node should not be merged.
      throw new BaseException('should not be reached');
    }

    const visitor = new _NodeMappingVisitor();
    htmlVisitAll(visitor, part.children);

    // merge the translated tree with the original tree.
    // we do it by preserving the source code position of the original tree
    const translatedAst = this._expandPlaceholders(translation, visitor.mapping);

    // if the root element is present, we need to create a new root element with its attributes
    // translated
    if (part.rootElement) {
      const root = part.rootElement;
      const attrs = this._i18nAttributes(root);
      return [new HtmlElementAst(
          root.name, attrs, translatedAst, root.sourceSpan, root.startSourceSpan,
          root.endSourceSpan)];
    }

    return translatedAst;
  }

  /**
   * The translation AST is composed on text nodes and placeholder elements
   */
  private _expandPlaceholders(translation: HtmlAst[], mapping: HtmlAst[]): HtmlAst[] {
    return translation.map(node => {
      if (node instanceof HtmlElementAst) {
        // This node is a placeholder, replace with the original content
        return this._expandPlaceholdersInNode(node, mapping);
      }

      if (node instanceof HtmlTextAst) {
        return node;
      }

      throw new BaseException('should not be reached');
    });
  }

  private _expandPlaceholdersInNode(node: HtmlElementAst, mapping: HtmlAst[]): HtmlAst {
    let name = this._getName(node);
    let index = NumberWrapper.parseInt(name.substring(1), 10);
    let originalNode = mapping[index];

    if (originalNode instanceof HtmlTextAst) {
      return this._mergeTextInterpolation(node, originalNode);
    }

    if (originalNode instanceof HtmlElementAst) {
      return this._mergeElement(node, originalNode, mapping);
    }

    throw new BaseException('should not be reached');
  }

  // Extract the value of a <ph> name attribute
  private _getName(node: HtmlElementAst): string {
    if (node.name != _PLACEHOLDER_ELEMENT) {
      throw new I18nError(
          node.sourceSpan,
          `Unexpected tag "${node.name}". Only "${_PLACEHOLDER_ELEMENT}" tags are allowed.`);
    }

    const nameAttr = node.attrs.find(a => a.name == _NAME_ATTR);

    if (nameAttr) {
      return nameAttr.value;
    }

    throw new I18nError(node.sourceSpan, `Missing "${_NAME_ATTR}" attribute.`);
  }

  private _mergeTextInterpolation(node: HtmlElementAst, originalNode: HtmlTextAst): HtmlTextAst {
    const split = this._expressionParser.splitInterpolation(
        originalNode.value, originalNode.sourceSpan.toString(), this._interpolationConfig);

    const exps = split ? split.expressions : [];

    const messageSubstring = this._messagesContent.substring(
        node.startSourceSpan.end.offset, node.endSourceSpan.start.offset);

    let translated = this._replacePlaceholdersWithInterpolations(
        messageSubstring, exps, originalNode.sourceSpan);

    return new HtmlTextAst(translated, originalNode.sourceSpan);
  }

  private _mergeElement(node: HtmlElementAst, originalNode: HtmlElementAst, mapping: HtmlAst[]):
      HtmlElementAst {
    const children = this._expandPlaceholders(node.children, mapping);

    return new HtmlElementAst(
        originalNode.name, this._i18nAttributes(originalNode), children, originalNode.sourceSpan,
        originalNode.startSourceSpan, originalNode.endSourceSpan);
  }

  private _i18nAttributes(el: HtmlElementAst): HtmlAttrAst[] {
    let res: HtmlAttrAst[] = [];
    let implicitAttrs: string[] =
        isPresent(this._implicitAttrs[el.name]) ? this._implicitAttrs[el.name] : [];

    el.attrs.forEach(attr => {
      if (attr.name.startsWith(I18N_ATTR_PREFIX) || attr.name == I18N_ATTR) return;

      let message: Message;

      let i18nAttr = el.attrs.find(a => a.name == `${I18N_ATTR_PREFIX}${attr.name}`);

      if (!i18nAttr) {
        if (implicitAttrs.indexOf(attr.name) == -1) {
          res.push(attr);
          return;
        }
        message = messageFromAttribute(this._expressionParser, this._interpolationConfig, attr);
      } else {
        message = messageFromI18nAttribute(
            this._expressionParser, this._interpolationConfig, el, i18nAttr);
      }

      let messageId = id(message);

      if (StringMapWrapper.contains(this._messages, messageId)) {
        const updatedMessage = this._replaceInterpolationInAttr(attr, this._messages[messageId]);
        res.push(new HtmlAttrAst(attr.name, updatedMessage, attr.sourceSpan));

      } else {
        throw new I18nError(
            attr.sourceSpan,
            `Cannot find message for id '${messageId}', content '${message.content}'.`);
      }
    });

    return res;
  }

  private _replaceInterpolationInAttr(attr: HtmlAttrAst, msg: HtmlAst[]): string {
    const split = this._expressionParser.splitInterpolation(
        attr.value, attr.sourceSpan.toString(), this._interpolationConfig);
    const exps = isPresent(split) ? split.expressions : [];

    const first = msg[0];
    const last = msg[msg.length - 1];

    const start = first.sourceSpan.start.offset;
    const end =
        last instanceof HtmlElementAst ? last.endSourceSpan.end.offset : last.sourceSpan.end.offset;
    const messageSubstring = this._messagesContent.substring(start, end);

    return this._replacePlaceholdersWithInterpolations(messageSubstring, exps, attr.sourceSpan);
  };

  private _replacePlaceholdersWithInterpolations(
      message: string, exps: string[], sourceSpan: ParseSourceSpan): string {
    const expMap = this._buildExprMap(exps);

    return message.replace(
        _PLACEHOLDER_EXPANDED_REGEXP,
        (_: string, name: string) => this._convertIntoExpression(name, expMap, sourceSpan));
  }

  private _buildExprMap(exps: string[]): Map<string, string> {
    const expMap = new Map<string, string>();
    const usedNames = new Map<string, number>();

    for (let i = 0; i < exps.length; i++) {
      const phName = extractPhNameFromInterpolation(exps[i], i);
      expMap.set(dedupePhName(usedNames, phName), exps[i]);
    }

    return expMap;
  }

  private _convertIntoExpression(
      name: string, expMap: Map<string, string>, sourceSpan: ParseSourceSpan) {
    if (expMap.has(name)) {
      return `${this._interpolationConfig.start}${expMap.get(name)}${this._interpolationConfig.end}`;
    }

    throw new I18nError(sourceSpan, `Invalid interpolation name '${name}'`);
  }
}

// Creates a list of elements and text nodes in the AST
// The indexes match the placeholders indexes
class _NodeMappingVisitor implements HtmlAstVisitor {
  mapping: HtmlAst[] = [];

  visitElement(ast: HtmlElementAst, context: any): any {
    this.mapping.push(ast);
    htmlVisitAll(this, ast.children);
  }

  visitText(ast: HtmlTextAst, context: any): any { this.mapping.push(ast); }

  visitAttr(ast: HtmlAttrAst, context: any): any {}
  visitExpansion(ast: HtmlExpansionAst, context: any): any {}
  visitExpansionCase(ast: HtmlExpansionCaseAst, context: any): any {}
  visitComment(ast: HtmlCommentAst, context: any): any {}
}
