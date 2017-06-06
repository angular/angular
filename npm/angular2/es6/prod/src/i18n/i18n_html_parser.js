import { HtmlParseTreeResult } from 'angular2/src/compiler/html_parser';
import { HtmlElementAst, HtmlAttrAst, HtmlTextAst, htmlVisitAll } from 'angular2/src/compiler/html_ast';
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { RegExpWrapper, NumberWrapper, isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { id } from './message';
import { expandNodes } from './expander';
import { messageFromAttribute, I18nError, I18N_ATTR_PREFIX, I18N_ATTR, partition, getPhNameFromBinding, dedupePhName } from './shared';
const _I18N_ATTR = "i18n";
const _PLACEHOLDER_ELEMENT = "ph";
const _NAME_ATTR = "name";
const _I18N_ATTR_PREFIX = "i18n-";
let _PLACEHOLDER_EXPANDED_REGEXP = RegExpWrapper.create(`\\<ph(\\s)+name=("(\\w)+")\\>\\<\\/ph\\>`);
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
 * 2. Get the translated message. At this point we have two trees: the original tree
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
export class I18nHtmlParser {
    constructor(_htmlParser, _parser, _messagesContent, _messages) {
        this._htmlParser = _htmlParser;
        this._parser = _parser;
        this._messagesContent = _messagesContent;
        this._messages = _messages;
    }
    parse(sourceContent, sourceUrl, parseExpansionForms = false) {
        this.errors = [];
        let res = this._htmlParser.parse(sourceContent, sourceUrl, true);
        if (res.errors.length > 0) {
            return res;
        }
        else {
            let nodes = this._recurse(expandNodes(res.rootNodes).nodes);
            return this.errors.length > 0 ? new HtmlParseTreeResult([], this.errors) :
                new HtmlParseTreeResult(nodes, []);
        }
    }
    _processI18nPart(p) {
        try {
            return p.hasI18n ? this._mergeI18Part(p) : this._recurseIntoI18nPart(p);
        }
        catch (e) {
            if (e instanceof I18nError) {
                this.errors.push(e);
                return [];
            }
            else {
                throw e;
            }
        }
    }
    _mergeI18Part(p) {
        let message = p.createMessage(this._parser);
        let messageId = id(message);
        if (!StringMapWrapper.contains(this._messages, messageId)) {
            throw new I18nError(p.sourceSpan, `Cannot find message for id '${messageId}', content '${message.content}'.`);
        }
        let parsedMessage = this._messages[messageId];
        return this._mergeTrees(p, parsedMessage, p.children);
    }
    _recurseIntoI18nPart(p) {
        // we found an element without an i18n attribute
        // we need to recurse in cause its children may have i18n set
        // we also need to translate its attributes
        if (isPresent(p.rootElement)) {
            let root = p.rootElement;
            let children = this._recurse(p.children);
            let attrs = this._i18nAttributes(root);
            return [
                new HtmlElementAst(root.name, attrs, children, root.sourceSpan, root.startSourceSpan, root.endSourceSpan)
            ];
        }
        else if (isPresent(p.rootTextNode)) {
            return [p.rootTextNode];
        }
        else {
            return this._recurse(p.children);
        }
    }
    _recurse(nodes) {
        let ps = partition(nodes, this.errors);
        return ListWrapper.flatten(ps.map(p => this._processI18nPart(p)));
    }
    _mergeTrees(p, translated, original) {
        let l = new _CreateNodeMapping();
        htmlVisitAll(l, original);
        // merge the translated tree with the original tree.
        // we do it by preserving the source code position of the original tree
        let merged = this._mergeTreesHelper(translated, l.mapping);
        // if the root element is present, we need to create a new root element with its attributes
        // translated
        if (isPresent(p.rootElement)) {
            let root = p.rootElement;
            let attrs = this._i18nAttributes(root);
            return [
                new HtmlElementAst(root.name, attrs, merged, root.sourceSpan, root.startSourceSpan, root.endSourceSpan)
            ];
        }
        else if (isPresent(p.rootTextNode)) {
            throw new BaseException("should not be reached");
        }
        else {
            return merged;
        }
    }
    _mergeTreesHelper(translated, mapping) {
        return translated.map(t => {
            if (t instanceof HtmlElementAst) {
                return this._mergeElementOrInterpolation(t, translated, mapping);
            }
            else if (t instanceof HtmlTextAst) {
                return t;
            }
            else {
                throw new BaseException("should not be reached");
            }
        });
    }
    _mergeElementOrInterpolation(t, translated, mapping) {
        let name = this._getName(t);
        let type = name[0];
        let index = NumberWrapper.parseInt(name.substring(1), 10);
        let originalNode = mapping[index];
        if (type == "t") {
            return this._mergeTextInterpolation(t, originalNode);
        }
        else if (type == "e") {
            return this._mergeElement(t, originalNode, mapping);
        }
        else {
            throw new BaseException("should not be reached");
        }
    }
    _getName(t) {
        if (t.name != _PLACEHOLDER_ELEMENT) {
            throw new I18nError(t.sourceSpan, `Unexpected tag "${t.name}". Only "${_PLACEHOLDER_ELEMENT}" tags are allowed.`);
        }
        let names = t.attrs.filter(a => a.name == _NAME_ATTR);
        if (names.length == 0) {
            throw new I18nError(t.sourceSpan, `Missing "${_NAME_ATTR}" attribute.`);
        }
        return names[0].value;
    }
    _mergeTextInterpolation(t, originalNode) {
        let split = this._parser.splitInterpolation(originalNode.value, originalNode.sourceSpan.toString());
        let exps = isPresent(split) ? split.expressions : [];
        let messageSubstring = this._messagesContent.substring(t.startSourceSpan.end.offset, t.endSourceSpan.start.offset);
        let translated = this._replacePlaceholdersWithExpressions(messageSubstring, exps, originalNode.sourceSpan);
        return new HtmlTextAst(translated, originalNode.sourceSpan);
    }
    _mergeElement(t, originalNode, mapping) {
        let children = this._mergeTreesHelper(t.children, mapping);
        return new HtmlElementAst(originalNode.name, this._i18nAttributes(originalNode), children, originalNode.sourceSpan, originalNode.startSourceSpan, originalNode.endSourceSpan);
    }
    _i18nAttributes(el) {
        let res = [];
        el.attrs.forEach(attr => {
            if (attr.name.startsWith(I18N_ATTR_PREFIX) || attr.name == I18N_ATTR)
                return;
            let i18ns = el.attrs.filter(a => a.name == `i18n-${attr.name}`);
            if (i18ns.length == 0) {
                res.push(attr);
                return;
            }
            let i18n = i18ns[0];
            let message = messageFromAttribute(this._parser, el, i18n);
            let messageId = id(message);
            if (StringMapWrapper.contains(this._messages, messageId)) {
                let updatedMessage = this._replaceInterpolationInAttr(attr, this._messages[messageId]);
                res.push(new HtmlAttrAst(attr.name, updatedMessage, attr.sourceSpan));
            }
            else {
                throw new I18nError(attr.sourceSpan, `Cannot find message for id '${messageId}', content '${message.content}'.`);
            }
        });
        return res;
    }
    _replaceInterpolationInAttr(attr, msg) {
        let split = this._parser.splitInterpolation(attr.value, attr.sourceSpan.toString());
        let exps = isPresent(split) ? split.expressions : [];
        let first = msg[0];
        let last = msg[msg.length - 1];
        let start = first.sourceSpan.start.offset;
        let end = last instanceof HtmlElementAst ? last.endSourceSpan.end.offset : last.sourceSpan.end.offset;
        let messageSubstring = this._messagesContent.substring(start, end);
        return this._replacePlaceholdersWithExpressions(messageSubstring, exps, attr.sourceSpan);
    }
    ;
    _replacePlaceholdersWithExpressions(message, exps, sourceSpan) {
        let expMap = this._buildExprMap(exps);
        return RegExpWrapper.replaceAll(_PLACEHOLDER_EXPANDED_REGEXP, message, (match) => {
            let nameWithQuotes = match[2];
            let name = nameWithQuotes.substring(1, nameWithQuotes.length - 1);
            return this._convertIntoExpression(name, expMap, sourceSpan);
        });
    }
    _buildExprMap(exps) {
        let expMap = new Map();
        let usedNames = new Map();
        for (var i = 0; i < exps.length; i++) {
            let phName = getPhNameFromBinding(exps[i], i);
            expMap.set(dedupePhName(usedNames, phName), exps[i]);
        }
        return expMap;
    }
    _convertIntoExpression(name, expMap, sourceSpan) {
        if (expMap.has(name)) {
            return `{{${expMap.get(name)}}}`;
        }
        else {
            throw new I18nError(sourceSpan, `Invalid interpolation name '${name}'`);
        }
    }
}
class _CreateNodeMapping {
    constructor() {
        this.mapping = [];
    }
    visitElement(ast, context) {
        this.mapping.push(ast);
        htmlVisitAll(this, ast.children);
        return null;
    }
    visitAttr(ast, context) { return null; }
    visitText(ast, context) {
        this.mapping.push(ast);
        return null;
    }
    visitExpansion(ast, context) { return null; }
    visitExpansionCase(ast, context) { return null; }
    visitComment(ast, context) { return ""; }
}
