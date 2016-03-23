import {HtmlParser, HtmlParseTreeResult} from 'angular2/src/compiler/html_parser';
import {ParseSourceSpan, ParseError} from 'angular2/src/compiler/parse_util';
import {
  HtmlAst,
  HtmlAstVisitor,
  HtmlElementAst,
  HtmlAttrAst,
  HtmlTextAst,
  HtmlCommentAst,
  htmlVisitAll
} from 'angular2/src/compiler/html_ast';
import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {RegExpWrapper, NumberWrapper, isPresent} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {Parser} from 'angular2/src/core/change_detection/parser/parser';
import {Message, id} from './message';
import {
  messageFromAttribute,
  I18nError,
  isI18nAttr,
  partition,
  Part,
  stringifyNodes,
  meaning
} from './shared';

const I18N_ATTR = "i18n";
const PLACEHOLDER_ELEMENT = "ph";
const NAME_ATTR = "name";
const I18N_ATTR_PREFIX = "i18n-";
let PLACEHOLDER_REGEXP = RegExpWrapper.create(`\\<ph(\\s)+name=("(\\d)+")\\/\\>`);
let PLACEHOLDER_EXPANDED_REGEXP = RegExpWrapper.create(`\\<ph(\\s)+name=("(\\d)+")\\>\\<\\/ph\\>`);

/**
 * Creates an i18n-ed version of the parsed template.
 *
 * Algorithm:
 *
 * To understand the algorithm, you need to know how partitioning works.
 * Partitioning is required as we can use two i18n comments to group node siblings together.
 * That is why we cannot just use nodes.
 *
 * Partitioning transforms an array of HtmlAst into an array of Part.
 * A part can optionally contain a root element or a root text node. And it can also contain
 * children.
 * A part can contain i18n property, in which case it needs to be transalted.
 *
 * Example:
 *
 * The following array of nodes will be split into four parts:
 *
 * ```
 * <a>A</a>
 * <b i18n>B</b>
 * <!-- i18n -->
 * <c>C</c>
 * D
 * <!-- /i18n -->
 * E
 * ```
 *
 * Part 1 containing the a tag. It should not be translated.
 * Part 2 containing the b tag. It should be translated.
 * Part 3 containing the c tag and the D text node. It should be translated.
 * Part 4 containing the E text node. It should not be translated.
 *
 *
 * It is also important to understand how we stringify nodes to create a message.
 *
 * We walk the tree and replace every element node with a placeholder. We also replace
 * all expressions in interpolation with placeholders. We also insert a placeholder element
 * to wrap a text node containing interpolation.
 *
 * Example:
 *
 * The following tree:
 *
 * ```
 * <a>A{{I}}</a><b>B</b>
 * ```
 *
 * will be stringified into:
 * ```
 * <ph name="e0"><ph name="t1">A<ph name="0"/></ph></ph><ph name="e2">B</ph>
 * ```
 *
 * This is what the algorithm does:
 *
 * 1. Use the provided html parser to get the html AST of the template.
 * 2. Partition the root nodes, and process each part separately.
 * 3. If a part does not have the i18n attribute, recurse to process children and attributes.
 * 4. If a part has the i18n attribute, merge the translated i18n part with the original tree.
 *
 * This is how the merging works:
 *
 * 1. Use the stringify function to get the message id. Look up the message in the map.
 * 2. Parse the translated message. At this point we have two trees: the original tree
 * and the translated tree, where all the elements are replaced with placeholders.
 * 3. Use the original tree to create a mapping Index:number -> HtmlAst.
 * 4. Walk the translated tree.
 * 5. If we encounter a placeholder element, get is name property.
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
  errors: ParseError[];

  constructor(private _htmlParser: HtmlParser, private _parser: Parser,
              private _messages: {[key: string]: string}) {}

  parse(sourceContent: string, sourceUrl: string): HtmlParseTreeResult {
    this.errors = [];

    let res = this._htmlParser.parse(sourceContent, sourceUrl);
    if (res.errors.length > 0) {
      return res;
    } else {
      let nodes = this._recurse(res.rootNodes);
      return this.errors.length > 0 ? new HtmlParseTreeResult([], this.errors) :
                                      new HtmlParseTreeResult(nodes, []);
    }
  }

  private _processI18nPart(p: Part): HtmlAst[] {
    try {
      return p.hasI18n ? this._mergeI18Part(p) : this._recurseIntoI18nPart(p);
    } catch (e) {
      if (e instanceof I18nError) {
        this.errors.push(e);
        return [];
      } else {
        throw e;
      }
    }
  }

  private _mergeI18Part(p: Part): HtmlAst[] {
    let messageId = id(p.createMessage(this._parser));
    if (!StringMapWrapper.contains(this._messages, messageId)) {
      throw new I18nError(p.sourceSpan, `Cannot find message for id '${messageId}'`);
    }

    // get the message and expand a placeholder so <ph/> becomes <ph></ph>
    // we need to do it cause we use HtmlParser to parse the message
    let message = _expandPlaceholder(this._messages[messageId]);
    let parsedMessage = this._htmlParser.parse(message, "source");

    if (parsedMessage.errors.length > 0) {
      this.errors = this.errors.concat(parsedMessage.errors);
      return [];
    } else {
      return this._mergeTrees(p, message, parsedMessage.rootNodes, p.children);
    }
  }

  private _recurseIntoI18nPart(p: Part): HtmlAst[] {
    // we found an element without an i18n attribute
    // we need to recurse in cause its children may have i18n set
    // we also need to translate its attributes
    if (isPresent(p.rootElement)) {
      let root = p.rootElement;
      let children = this._recurse(p.children);
      let attrs = this._i18nAttributes(root);
      return [
        new HtmlElementAst(root.name, attrs, children, root.sourceSpan, root.startSourceSpan,
                           root.endSourceSpan)
      ];

      // a text node without i18n or interpolation, nothing to do
    } else if (isPresent(p.rootTextNode)) {
      return [p.rootTextNode];

    } else {
      return this._recurse(p.children);
    }
  }

  private _recurse(nodes: HtmlAst[]): HtmlAst[] {
    let ps = partition(nodes, this.errors);
    return ListWrapper.flatten(ps.map(p => this._processI18nPart(p)));
  }

  private _mergeTrees(p: Part, translatedSource: string, translated: HtmlAst[],
                      original: HtmlAst[]): HtmlAst[] {
    let l = new _CreateNodeMapping();
    htmlVisitAll(l, original);

    // merge the translated tree with the original tree.
    // we do it by preserving the source code position of the original tree
    let merged = this._mergeTreesHelper(translatedSource, translated, l.mapping);

    // if the root element is present, we need to create a new root element with its attributes
    // translated
    if (isPresent(p.rootElement)) {
      let root = p.rootElement;
      let attrs = this._i18nAttributes(root);
      return [
        new HtmlElementAst(root.name, attrs, merged, root.sourceSpan, root.startSourceSpan,
                           root.endSourceSpan)
      ];

      // this should never happen with a part. Parts that have root text node should not be merged.
    } else if (isPresent(p.rootTextNode)) {
      throw new BaseException("should not be reached");

    } else {
      return merged;
    }
  }

  private _mergeTreesHelper(translatedSource: string, translated: HtmlAst[],
                            mapping: HtmlAst[]): HtmlAst[] {
    return translated.map(t => {
      if (t instanceof HtmlElementAst) {
        return this._mergeElementOrInterpolation(t, translatedSource, translated, mapping);

      } else if (t instanceof HtmlTextAst) {
        return t;

      } else {
        throw new BaseException("should not be reached");
      }
    });
  }

  private _mergeElementOrInterpolation(t: HtmlElementAst, translatedSource: string,
                                       translated: HtmlAst[], mapping: HtmlAst[]): HtmlAst {
    let name = this._getName(t);
    let type = name[0];
    let index = NumberWrapper.parseInt(name.substring(1), 10);
    let originalNode = mapping[index];

    if (type == "t") {
      return this._mergeTextInterpolation(t, <HtmlTextAst>originalNode, translatedSource);
    } else if (type == "e") {
      return this._mergeElement(t, <HtmlElementAst>originalNode, mapping, translatedSource);
    } else {
      throw new BaseException("should not be reached");
    }
  }

  private _getName(t: HtmlElementAst): string {
    if (t.name != PLACEHOLDER_ELEMENT) {
      throw new I18nError(
          t.sourceSpan,
          `Unexpected tag "${t.name}". Only "${PLACEHOLDER_ELEMENT}" tags are allowed.`);
    }
    let names = t.attrs.filter(a => a.name == NAME_ATTR);
    if (names.length == 0) {
      throw new I18nError(t.sourceSpan, `Missing "${NAME_ATTR}" attribute.`);
    }
    return names[0].value;
  }

  private _mergeTextInterpolation(t: HtmlElementAst, originalNode: HtmlTextAst,
                                  translatedSource: string): HtmlTextAst {
    let split =
        this._parser.splitInterpolation(originalNode.value, originalNode.sourceSpan.toString());
    let exps = isPresent(split) ? split.expressions : [];

    let messageSubstring =
        translatedSource.substring(t.startSourceSpan.end.offset, t.endSourceSpan.start.offset);
    let translated =
        this._replacePlaceholdersWithExpressions(messageSubstring, exps, originalNode.sourceSpan);

    return new HtmlTextAst(translated, originalNode.sourceSpan);
  }

  private _mergeElement(t: HtmlElementAst, originalNode: HtmlElementAst, mapping: HtmlAst[],
                        translatedSource: string): HtmlElementAst {
    let children = this._mergeTreesHelper(translatedSource, t.children, mapping);
    return new HtmlElementAst(originalNode.name, this._i18nAttributes(originalNode), children,
                              originalNode.sourceSpan, originalNode.startSourceSpan,
                              originalNode.endSourceSpan);
  }

  private _i18nAttributes(el: HtmlElementAst): HtmlAttrAst[] {
    let res = [];
    el.attrs.forEach(attr => {
      if (isI18nAttr(attr.name)) {
        let messageId = id(messageFromAttribute(this._parser, el, attr));
        let expectedName = attr.name.substring(5);
        let m = el.attrs.filter(a => a.name == expectedName)[0];

        if (StringMapWrapper.contains(this._messages, messageId)) {
          let split = this._parser.splitInterpolation(m.value, m.sourceSpan.toString());
          let exps = isPresent(split) ? split.expressions : [];
          let message = this._replacePlaceholdersWithExpressions(
              _expandPlaceholder(this._messages[messageId]), exps, m.sourceSpan);
          res.push(new HtmlAttrAst(m.name, message, m.sourceSpan));

        } else {
          throw new I18nError(m.sourceSpan, `Cannot find message for id '${messageId}'`);
        }
      }

    });
    return res;
  }

  private _replacePlaceholdersWithExpressions(message: string, exps: string[],
                                              sourceSpan: ParseSourceSpan): string {
    return RegExpWrapper.replaceAll(PLACEHOLDER_EXPANDED_REGEXP, message, (match) => {
      let nameWithQuotes = match[2];
      let name = nameWithQuotes.substring(1, nameWithQuotes.length - 1);
      let index = NumberWrapper.parseInt(name, 10);
      return this._convertIntoExpression(index, exps, sourceSpan);
    });
  }

  private _convertIntoExpression(index: number, exps: string[], sourceSpan: ParseSourceSpan) {
    if (index >= 0 && index < exps.length) {
      return `{{${exps[index]}}}`;
    } else {
      throw new I18nError(sourceSpan, `Invalid interpolation index '${index}'`);
    }
  }
}

class _CreateNodeMapping implements HtmlAstVisitor {
  mapping: HtmlAst[] = [];

  visitElement(ast: HtmlElementAst, context: any): any {
    this.mapping.push(ast);
    htmlVisitAll(this, ast.children);
    return null;
  }

  visitAttr(ast: HtmlAttrAst, context: any): any { return null; }

  visitText(ast: HtmlTextAst, context: any): any {
    this.mapping.push(ast);
    return null;
  }

  visitComment(ast: HtmlCommentAst, context: any): any { return ""; }
}

function _expandPlaceholder(input: string): string {
  return RegExpWrapper.replaceAll(PLACEHOLDER_REGEXP, input, (match) => {
    let nameWithQuotes = match[2];
    return `<ph name=${nameWithQuotes}></ph>`;
  });
}