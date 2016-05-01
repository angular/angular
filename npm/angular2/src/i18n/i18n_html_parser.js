'use strict';"use strict";
var html_parser_1 = require('angular2/src/compiler/html_parser');
var html_ast_1 = require('angular2/src/compiler/html_ast');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var message_1 = require('./message');
var expander_1 = require('./expander');
var shared_1 = require('./shared');
var _I18N_ATTR = "i18n";
var _PLACEHOLDER_ELEMENT = "ph";
var _NAME_ATTR = "name";
var _I18N_ATTR_PREFIX = "i18n-";
var _PLACEHOLDER_EXPANDED_REGEXP = lang_1.RegExpWrapper.create("\\<ph(\\s)+name=(\"(\\w)+\")\\>\\<\\/ph\\>");
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
var I18nHtmlParser = (function () {
    function I18nHtmlParser(_htmlParser, _parser, _messagesContent, _messages) {
        this._htmlParser = _htmlParser;
        this._parser = _parser;
        this._messagesContent = _messagesContent;
        this._messages = _messages;
    }
    I18nHtmlParser.prototype.parse = function (sourceContent, sourceUrl, parseExpansionForms) {
        if (parseExpansionForms === void 0) { parseExpansionForms = false; }
        this.errors = [];
        var res = this._htmlParser.parse(sourceContent, sourceUrl, true);
        if (res.errors.length > 0) {
            return res;
        }
        else {
            var nodes = this._recurse(expander_1.expandNodes(res.rootNodes).nodes);
            return this.errors.length > 0 ? new html_parser_1.HtmlParseTreeResult([], this.errors) :
                new html_parser_1.HtmlParseTreeResult(nodes, []);
        }
    };
    I18nHtmlParser.prototype._processI18nPart = function (p) {
        try {
            return p.hasI18n ? this._mergeI18Part(p) : this._recurseIntoI18nPart(p);
        }
        catch (e) {
            if (e instanceof shared_1.I18nError) {
                this.errors.push(e);
                return [];
            }
            else {
                throw e;
            }
        }
    };
    I18nHtmlParser.prototype._mergeI18Part = function (p) {
        var message = p.createMessage(this._parser);
        var messageId = message_1.id(message);
        if (!collection_1.StringMapWrapper.contains(this._messages, messageId)) {
            throw new shared_1.I18nError(p.sourceSpan, "Cannot find message for id '" + messageId + "', content '" + message.content + "'.");
        }
        var parsedMessage = this._messages[messageId];
        return this._mergeTrees(p, parsedMessage, p.children);
    };
    I18nHtmlParser.prototype._recurseIntoI18nPart = function (p) {
        // we found an element without an i18n attribute
        // we need to recurse in cause its children may have i18n set
        // we also need to translate its attributes
        if (lang_1.isPresent(p.rootElement)) {
            var root = p.rootElement;
            var children = this._recurse(p.children);
            var attrs = this._i18nAttributes(root);
            return [
                new html_ast_1.HtmlElementAst(root.name, attrs, children, root.sourceSpan, root.startSourceSpan, root.endSourceSpan)
            ];
        }
        else if (lang_1.isPresent(p.rootTextNode)) {
            return [p.rootTextNode];
        }
        else {
            return this._recurse(p.children);
        }
    };
    I18nHtmlParser.prototype._recurse = function (nodes) {
        var _this = this;
        var ps = shared_1.partition(nodes, this.errors);
        return collection_1.ListWrapper.flatten(ps.map(function (p) { return _this._processI18nPart(p); }));
    };
    I18nHtmlParser.prototype._mergeTrees = function (p, translated, original) {
        var l = new _CreateNodeMapping();
        html_ast_1.htmlVisitAll(l, original);
        // merge the translated tree with the original tree.
        // we do it by preserving the source code position of the original tree
        var merged = this._mergeTreesHelper(translated, l.mapping);
        // if the root element is present, we need to create a new root element with its attributes
        // translated
        if (lang_1.isPresent(p.rootElement)) {
            var root = p.rootElement;
            var attrs = this._i18nAttributes(root);
            return [
                new html_ast_1.HtmlElementAst(root.name, attrs, merged, root.sourceSpan, root.startSourceSpan, root.endSourceSpan)
            ];
        }
        else if (lang_1.isPresent(p.rootTextNode)) {
            throw new exceptions_1.BaseException("should not be reached");
        }
        else {
            return merged;
        }
    };
    I18nHtmlParser.prototype._mergeTreesHelper = function (translated, mapping) {
        var _this = this;
        return translated.map(function (t) {
            if (t instanceof html_ast_1.HtmlElementAst) {
                return _this._mergeElementOrInterpolation(t, translated, mapping);
            }
            else if (t instanceof html_ast_1.HtmlTextAst) {
                return t;
            }
            else {
                throw new exceptions_1.BaseException("should not be reached");
            }
        });
    };
    I18nHtmlParser.prototype._mergeElementOrInterpolation = function (t, translated, mapping) {
        var name = this._getName(t);
        var type = name[0];
        var index = lang_1.NumberWrapper.parseInt(name.substring(1), 10);
        var originalNode = mapping[index];
        if (type == "t") {
            return this._mergeTextInterpolation(t, originalNode);
        }
        else if (type == "e") {
            return this._mergeElement(t, originalNode, mapping);
        }
        else {
            throw new exceptions_1.BaseException("should not be reached");
        }
    };
    I18nHtmlParser.prototype._getName = function (t) {
        if (t.name != _PLACEHOLDER_ELEMENT) {
            throw new shared_1.I18nError(t.sourceSpan, "Unexpected tag \"" + t.name + "\". Only \"" + _PLACEHOLDER_ELEMENT + "\" tags are allowed.");
        }
        var names = t.attrs.filter(function (a) { return a.name == _NAME_ATTR; });
        if (names.length == 0) {
            throw new shared_1.I18nError(t.sourceSpan, "Missing \"" + _NAME_ATTR + "\" attribute.");
        }
        return names[0].value;
    };
    I18nHtmlParser.prototype._mergeTextInterpolation = function (t, originalNode) {
        var split = this._parser.splitInterpolation(originalNode.value, originalNode.sourceSpan.toString());
        var exps = lang_1.isPresent(split) ? split.expressions : [];
        var messageSubstring = this._messagesContent.substring(t.startSourceSpan.end.offset, t.endSourceSpan.start.offset);
        var translated = this._replacePlaceholdersWithExpressions(messageSubstring, exps, originalNode.sourceSpan);
        return new html_ast_1.HtmlTextAst(translated, originalNode.sourceSpan);
    };
    I18nHtmlParser.prototype._mergeElement = function (t, originalNode, mapping) {
        var children = this._mergeTreesHelper(t.children, mapping);
        return new html_ast_1.HtmlElementAst(originalNode.name, this._i18nAttributes(originalNode), children, originalNode.sourceSpan, originalNode.startSourceSpan, originalNode.endSourceSpan);
    };
    I18nHtmlParser.prototype._i18nAttributes = function (el) {
        var _this = this;
        var res = [];
        el.attrs.forEach(function (attr) {
            if (attr.name.startsWith(shared_1.I18N_ATTR_PREFIX) || attr.name == shared_1.I18N_ATTR)
                return;
            var i18ns = el.attrs.filter(function (a) { return a.name == "i18n-" + attr.name; });
            if (i18ns.length == 0) {
                res.push(attr);
                return;
            }
            var i18n = i18ns[0];
            var message = shared_1.messageFromAttribute(_this._parser, el, i18n);
            var messageId = message_1.id(message);
            if (collection_1.StringMapWrapper.contains(_this._messages, messageId)) {
                var updatedMessage = _this._replaceInterpolationInAttr(attr, _this._messages[messageId]);
                res.push(new html_ast_1.HtmlAttrAst(attr.name, updatedMessage, attr.sourceSpan));
            }
            else {
                throw new shared_1.I18nError(attr.sourceSpan, "Cannot find message for id '" + messageId + "', content '" + message.content + "'.");
            }
        });
        return res;
    };
    I18nHtmlParser.prototype._replaceInterpolationInAttr = function (attr, msg) {
        var split = this._parser.splitInterpolation(attr.value, attr.sourceSpan.toString());
        var exps = lang_1.isPresent(split) ? split.expressions : [];
        var first = msg[0];
        var last = msg[msg.length - 1];
        var start = first.sourceSpan.start.offset;
        var end = last instanceof html_ast_1.HtmlElementAst ? last.endSourceSpan.end.offset : last.sourceSpan.end.offset;
        var messageSubstring = this._messagesContent.substring(start, end);
        return this._replacePlaceholdersWithExpressions(messageSubstring, exps, attr.sourceSpan);
    };
    ;
    I18nHtmlParser.prototype._replacePlaceholdersWithExpressions = function (message, exps, sourceSpan) {
        var _this = this;
        var expMap = this._buildExprMap(exps);
        return lang_1.RegExpWrapper.replaceAll(_PLACEHOLDER_EXPANDED_REGEXP, message, function (match) {
            var nameWithQuotes = match[2];
            var name = nameWithQuotes.substring(1, nameWithQuotes.length - 1);
            return _this._convertIntoExpression(name, expMap, sourceSpan);
        });
    };
    I18nHtmlParser.prototype._buildExprMap = function (exps) {
        var expMap = new Map();
        var usedNames = new Map();
        for (var i = 0; i < exps.length; i++) {
            var phName = shared_1.getPhNameFromBinding(exps[i], i);
            expMap.set(shared_1.dedupePhName(usedNames, phName), exps[i]);
        }
        return expMap;
    };
    I18nHtmlParser.prototype._convertIntoExpression = function (name, expMap, sourceSpan) {
        if (expMap.has(name)) {
            return "{{" + expMap.get(name) + "}}";
        }
        else {
            throw new shared_1.I18nError(sourceSpan, "Invalid interpolation name '" + name + "'");
        }
    };
    return I18nHtmlParser;
}());
exports.I18nHtmlParser = I18nHtmlParser;
var _CreateNodeMapping = (function () {
    function _CreateNodeMapping() {
        this.mapping = [];
    }
    _CreateNodeMapping.prototype.visitElement = function (ast, context) {
        this.mapping.push(ast);
        html_ast_1.htmlVisitAll(this, ast.children);
        return null;
    };
    _CreateNodeMapping.prototype.visitAttr = function (ast, context) { return null; };
    _CreateNodeMapping.prototype.visitText = function (ast, context) {
        this.mapping.push(ast);
        return null;
    };
    _CreateNodeMapping.prototype.visitExpansion = function (ast, context) { return null; };
    _CreateNodeMapping.prototype.visitExpansionCase = function (ast, context) { return null; };
    _CreateNodeMapping.prototype.visitComment = function (ast, context) { return ""; };
    return _CreateNodeMapping;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bl9odG1sX3BhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9pMThuL2kxOG5faHRtbF9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDRCQUE4QyxtQ0FBbUMsQ0FBQyxDQUFBO0FBRWxGLHlCQVVPLGdDQUFnQyxDQUFDLENBQUE7QUFDeEMsMkJBQTRDLGdDQUFnQyxDQUFDLENBQUE7QUFDN0UscUJBQXNELDBCQUEwQixDQUFDLENBQUE7QUFDakYsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFFN0Qsd0JBQTBCLFdBQVcsQ0FBQyxDQUFBO0FBQ3RDLHlCQUEwQixZQUFZLENBQUMsQ0FBQTtBQUN2Qyx1QkFXTyxVQUFVLENBQUMsQ0FBQTtBQUVsQixJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUM7QUFDMUIsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUM7QUFDbEMsSUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDO0FBQzFCLElBQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDO0FBQ2xDLElBQUksNEJBQTRCLEdBQUcsb0JBQWEsQ0FBQyxNQUFNLENBQUMsNENBQTBDLENBQUMsQ0FBQztBQUVwRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQStFRztBQUNIO0lBR0Usd0JBQW9CLFdBQXVCLEVBQVUsT0FBZSxFQUNoRCxnQkFBd0IsRUFBVSxTQUFxQztRQUR2RSxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUFVLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDaEQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFRO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBNEI7SUFBRyxDQUFDO0lBRS9GLDhCQUFLLEdBQUwsVUFBTSxhQUFxQixFQUFF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Z0IsRUFBRSxPQUFZO1FBQ3RDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsMkNBQWMsR0FBZCxVQUFlLEdBQXFCLEVBQUUsT0FBWSxJQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBRXpFLCtDQUFrQixHQUFsQixVQUFtQixHQUF5QixFQUFFLE9BQVksSUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUVqRix5Q0FBWSxHQUFaLFVBQWEsR0FBbUIsRUFBRSxPQUFZLElBQVMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDckUseUJBQUM7QUFBRCxDQUFDLEFBckJELElBcUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtIdG1sUGFyc2VyLCBIdG1sUGFyc2VUcmVlUmVzdWx0fSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF9wYXJzZXInO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW4sIFBhcnNlRXJyb3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9wYXJzZV91dGlsJztcbmltcG9ydCB7XG4gIEh0bWxBc3QsXG4gIEh0bWxBc3RWaXNpdG9yLFxuICBIdG1sRWxlbWVudEFzdCxcbiAgSHRtbEF0dHJBc3QsXG4gIEh0bWxUZXh0QXN0LFxuICBIdG1sQ29tbWVudEFzdCxcbiAgSHRtbEV4cGFuc2lvbkFzdCxcbiAgSHRtbEV4cGFuc2lvbkNhc2VBc3QsXG4gIGh0bWxWaXNpdEFsbFxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF9hc3QnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7UmVnRXhwV3JhcHBlciwgTnVtYmVyV3JhcHBlciwgaXNQcmVzZW50fSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9leHByZXNzaW9uX3BhcnNlci9wYXJzZXInO1xuaW1wb3J0IHtNZXNzYWdlLCBpZH0gZnJvbSAnLi9tZXNzYWdlJztcbmltcG9ydCB7ZXhwYW5kTm9kZXN9IGZyb20gJy4vZXhwYW5kZXInO1xuaW1wb3J0IHtcbiAgbWVzc2FnZUZyb21BdHRyaWJ1dGUsXG4gIEkxOG5FcnJvcixcbiAgSTE4Tl9BVFRSX1BSRUZJWCxcbiAgSTE4Tl9BVFRSLFxuICBwYXJ0aXRpb24sXG4gIFBhcnQsXG4gIHN0cmluZ2lmeU5vZGVzLFxuICBtZWFuaW5nLFxuICBnZXRQaE5hbWVGcm9tQmluZGluZyxcbiAgZGVkdXBlUGhOYW1lXG59IGZyb20gJy4vc2hhcmVkJztcblxuY29uc3QgX0kxOE5fQVRUUiA9IFwiaTE4blwiO1xuY29uc3QgX1BMQUNFSE9MREVSX0VMRU1FTlQgPSBcInBoXCI7XG5jb25zdCBfTkFNRV9BVFRSID0gXCJuYW1lXCI7XG5jb25zdCBfSTE4Tl9BVFRSX1BSRUZJWCA9IFwiaTE4bi1cIjtcbmxldCBfUExBQ0VIT0xERVJfRVhQQU5ERURfUkVHRVhQID0gUmVnRXhwV3JhcHBlci5jcmVhdGUoYFxcXFw8cGgoXFxcXHMpK25hbWU9KFwiKFxcXFx3KStcIilcXFxcPlxcXFw8XFxcXC9waFxcXFw+YCk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBpMThuLWVkIHZlcnNpb24gb2YgdGhlIHBhcnNlZCB0ZW1wbGF0ZS5cbiAqXG4gKiBBbGdvcml0aG06XG4gKlxuICogVG8gdW5kZXJzdGFuZCB0aGUgYWxnb3JpdGhtLCB5b3UgbmVlZCB0byBrbm93IGhvdyBwYXJ0aXRpb25pbmcgd29ya3MuXG4gKiBQYXJ0aXRpb25pbmcgaXMgcmVxdWlyZWQgYXMgd2UgY2FuIHVzZSB0d28gaTE4biBjb21tZW50cyB0byBncm91cCBub2RlIHNpYmxpbmdzIHRvZ2V0aGVyLlxuICogVGhhdCBpcyB3aHkgd2UgY2Fubm90IGp1c3QgdXNlIG5vZGVzLlxuICpcbiAqIFBhcnRpdGlvbmluZyB0cmFuc2Zvcm1zIGFuIGFycmF5IG9mIEh0bWxBc3QgaW50byBhbiBhcnJheSBvZiBQYXJ0LlxuICogQSBwYXJ0IGNhbiBvcHRpb25hbGx5IGNvbnRhaW4gYSByb290IGVsZW1lbnQgb3IgYSByb290IHRleHQgbm9kZS4gQW5kIGl0IGNhbiBhbHNvIGNvbnRhaW5cbiAqIGNoaWxkcmVuLlxuICogQSBwYXJ0IGNhbiBjb250YWluIGkxOG4gcHJvcGVydHksIGluIHdoaWNoIGNhc2UgaXQgbmVlZHMgdG8gYmUgdHJhbnNhbHRlZC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgYXJyYXkgb2Ygbm9kZXMgd2lsbCBiZSBzcGxpdCBpbnRvIGZvdXIgcGFydHM6XG4gKlxuICogYGBgXG4gKiA8YT5BPC9hPlxuICogPGIgaTE4bj5CPC9iPlxuICogPCEtLSBpMThuIC0tPlxuICogPGM+QzwvYz5cbiAqIERcbiAqIDwhLS0gL2kxOG4gLS0+XG4gKiBFXG4gKiBgYGBcbiAqXG4gKiBQYXJ0IDEgY29udGFpbmluZyB0aGUgYSB0YWcuIEl0IHNob3VsZCBub3QgYmUgdHJhbnNsYXRlZC5cbiAqIFBhcnQgMiBjb250YWluaW5nIHRoZSBiIHRhZy4gSXQgc2hvdWxkIGJlIHRyYW5zbGF0ZWQuXG4gKiBQYXJ0IDMgY29udGFpbmluZyB0aGUgYyB0YWcgYW5kIHRoZSBEIHRleHQgbm9kZS4gSXQgc2hvdWxkIGJlIHRyYW5zbGF0ZWQuXG4gKiBQYXJ0IDQgY29udGFpbmluZyB0aGUgRSB0ZXh0IG5vZGUuIEl0IHNob3VsZCBub3QgYmUgdHJhbnNsYXRlZC5cbiAqXG4gKlxuICogSXQgaXMgYWxzbyBpbXBvcnRhbnQgdG8gdW5kZXJzdGFuZCBob3cgd2Ugc3RyaW5naWZ5IG5vZGVzIHRvIGNyZWF0ZSBhIG1lc3NhZ2UuXG4gKlxuICogV2Ugd2FsayB0aGUgdHJlZSBhbmQgcmVwbGFjZSBldmVyeSBlbGVtZW50IG5vZGUgd2l0aCBhIHBsYWNlaG9sZGVyLiBXZSBhbHNvIHJlcGxhY2VcbiAqIGFsbCBleHByZXNzaW9ucyBpbiBpbnRlcnBvbGF0aW9uIHdpdGggcGxhY2Vob2xkZXJzLiBXZSBhbHNvIGluc2VydCBhIHBsYWNlaG9sZGVyIGVsZW1lbnRcbiAqIHRvIHdyYXAgYSB0ZXh0IG5vZGUgY29udGFpbmluZyBpbnRlcnBvbGF0aW9uLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogVGhlIGZvbGxvd2luZyB0cmVlOlxuICpcbiAqIGBgYFxuICogPGE+QXt7SX19PC9hPjxiPkI8L2I+XG4gKiBgYGBcbiAqXG4gKiB3aWxsIGJlIHN0cmluZ2lmaWVkIGludG86XG4gKiBgYGBcbiAqIDxwaCBuYW1lPVwiZTBcIj48cGggbmFtZT1cInQxXCI+QTxwaCBuYW1lPVwiMFwiLz48L3BoPjwvcGg+PHBoIG5hbWU9XCJlMlwiPkI8L3BoPlxuICogYGBgXG4gKlxuICogVGhpcyBpcyB3aGF0IHRoZSBhbGdvcml0aG0gZG9lczpcbiAqXG4gKiAxLiBVc2UgdGhlIHByb3ZpZGVkIGh0bWwgcGFyc2VyIHRvIGdldCB0aGUgaHRtbCBBU1Qgb2YgdGhlIHRlbXBsYXRlLlxuICogMi4gUGFydGl0aW9uIHRoZSByb290IG5vZGVzLCBhbmQgcHJvY2VzcyBlYWNoIHBhcnQgc2VwYXJhdGVseS5cbiAqIDMuIElmIGEgcGFydCBkb2VzIG5vdCBoYXZlIHRoZSBpMThuIGF0dHJpYnV0ZSwgcmVjdXJzZSB0byBwcm9jZXNzIGNoaWxkcmVuIGFuZCBhdHRyaWJ1dGVzLlxuICogNC4gSWYgYSBwYXJ0IGhhcyB0aGUgaTE4biBhdHRyaWJ1dGUsIG1lcmdlIHRoZSB0cmFuc2xhdGVkIGkxOG4gcGFydCB3aXRoIHRoZSBvcmlnaW5hbCB0cmVlLlxuICpcbiAqIFRoaXMgaXMgaG93IHRoZSBtZXJnaW5nIHdvcmtzOlxuICpcbiAqIDEuIFVzZSB0aGUgc3RyaW5naWZ5IGZ1bmN0aW9uIHRvIGdldCB0aGUgbWVzc2FnZSBpZC4gTG9vayB1cCB0aGUgbWVzc2FnZSBpbiB0aGUgbWFwLlxuICogMi4gR2V0IHRoZSB0cmFuc2xhdGVkIG1lc3NhZ2UuIEF0IHRoaXMgcG9pbnQgd2UgaGF2ZSB0d28gdHJlZXM6IHRoZSBvcmlnaW5hbCB0cmVlXG4gKiBhbmQgdGhlIHRyYW5zbGF0ZWQgdHJlZSwgd2hlcmUgYWxsIHRoZSBlbGVtZW50cyBhcmUgcmVwbGFjZWQgd2l0aCBwbGFjZWhvbGRlcnMuXG4gKiAzLiBVc2UgdGhlIG9yaWdpbmFsIHRyZWUgdG8gY3JlYXRlIGEgbWFwcGluZyBJbmRleDpudW1iZXIgLT4gSHRtbEFzdC5cbiAqIDQuIFdhbGsgdGhlIHRyYW5zbGF0ZWQgdHJlZS5cbiAqIDUuIElmIHdlIGVuY291bnRlciBhIHBsYWNlaG9sZGVyIGVsZW1lbnQsIGdldCBpcyBuYW1lIHByb3BlcnR5LlxuICogNi4gR2V0IHRoZSB0eXBlIGFuZCB0aGUgaW5kZXggb2YgdGhlIG5vZGUgdXNpbmcgdGhlIG5hbWUgcHJvcGVydHkuXG4gKiA3LiBJZiB0aGUgdHlwZSBpcyAnZScsIHdoaWNoIG1lYW5zIGVsZW1lbnQsIHRoZW46XG4gKiAgICAgLSB0cmFuc2xhdGUgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIG9yaWdpbmFsIGVsZW1lbnRcbiAqICAgICAtIHJlY3Vyc2UgdG8gbWVyZ2UgdGhlIGNoaWxkcmVuXG4gKiAgICAgLSBjcmVhdGUgYSBuZXcgZWxlbWVudCB1c2luZyB0aGUgb3JpZ2luYWwgZWxlbWVudCBuYW1lLCBvcmlnaW5hbCBwb3NpdGlvbixcbiAqICAgICBhbmQgdHJhbnNsYXRlZCBjaGlsZHJlbiBhbmQgYXR0cmlidXRlc1xuICogOC4gSWYgdGhlIHR5cGUgaWYgJ3QnLCB3aGljaCBtZWFucyB0ZXh0LCB0aGVuOlxuICogICAgIC0gZ2V0IHRoZSBsaXN0IG9mIGV4cHJlc3Npb25zIGZyb20gdGhlIG9yaWdpbmFsIG5vZGUuXG4gKiAgICAgLSBnZXQgdGhlIHN0cmluZyB2ZXJzaW9uIG9mIHRoZSBpbnRlcnBvbGF0aW9uIHN1YnRyZWVcbiAqICAgICAtIGZpbmQgYWxsIHRoZSBwbGFjZWhvbGRlcnMgaW4gdGhlIHRyYW5zbGF0ZWQgbWVzc2FnZSwgYW5kIHJlcGxhY2UgdGhlbSB3aXRoIHRoZVxuICogICAgIGNvcnJlc3BvbmRpbmcgb3JpZ2luYWwgZXhwcmVzc2lvbnNcbiAqL1xuZXhwb3J0IGNsYXNzIEkxOG5IdG1sUGFyc2VyIGltcGxlbWVudHMgSHRtbFBhcnNlciB7XG4gIGVycm9yczogUGFyc2VFcnJvcltdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2h0bWxQYXJzZXI6IEh0bWxQYXJzZXIsIHByaXZhdGUgX3BhcnNlcjogUGFyc2VyLFxuICAgICAgICAgICAgICBwcml2YXRlIF9tZXNzYWdlc0NvbnRlbnQ6IHN0cmluZywgcHJpdmF0ZSBfbWVzc2FnZXM6IHtba2V5OiBzdHJpbmddOiBIdG1sQXN0W119KSB7fVxuXG4gIHBhcnNlKHNvdXJjZUNvbnRlbnQ6IHN0cmluZywgc291cmNlVXJsOiBzdHJpbmcsXG4gICAgICAgIHBhcnNlRXhwYW5zaW9uRm9ybXM6IGJvb2xlYW4gPSBmYWxzZSk6IEh0bWxQYXJzZVRyZWVSZXN1bHQge1xuICAgIHRoaXMuZXJyb3JzID0gW107XG5cbiAgICBsZXQgcmVzID0gdGhpcy5faHRtbFBhcnNlci5wYXJzZShzb3VyY2VDb250ZW50LCBzb3VyY2VVcmwsIHRydWUpO1xuICAgIGlmIChyZXMuZXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBub2RlcyA9IHRoaXMuX3JlY3Vyc2UoZXhwYW5kTm9kZXMocmVzLnJvb3ROb2Rlcykubm9kZXMpO1xuICAgICAgcmV0dXJuIHRoaXMuZXJyb3JzLmxlbmd0aCA+IDAgPyBuZXcgSHRtbFBhcnNlVHJlZVJlc3VsdChbXSwgdGhpcy5lcnJvcnMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEh0bWxQYXJzZVRyZWVSZXN1bHQobm9kZXMsIFtdKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9wcm9jZXNzSTE4blBhcnQocDogUGFydCk6IEh0bWxBc3RbXSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBwLmhhc0kxOG4gPyB0aGlzLl9tZXJnZUkxOFBhcnQocCkgOiB0aGlzLl9yZWN1cnNlSW50b0kxOG5QYXJ0KHApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgSTE4bkVycm9yKSB7XG4gICAgICAgIHRoaXMuZXJyb3JzLnB1c2goZSk7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfbWVyZ2VJMThQYXJ0KHA6IFBhcnQpOiBIdG1sQXN0W10ge1xuICAgIGxldCBtZXNzYWdlID0gcC5jcmVhdGVNZXNzYWdlKHRoaXMuX3BhcnNlcik7XG4gICAgbGV0IG1lc3NhZ2VJZCA9IGlkKG1lc3NhZ2UpO1xuICAgIGlmICghU3RyaW5nTWFwV3JhcHBlci5jb250YWlucyh0aGlzLl9tZXNzYWdlcywgbWVzc2FnZUlkKSkge1xuICAgICAgdGhyb3cgbmV3IEkxOG5FcnJvcihcbiAgICAgICAgICBwLnNvdXJjZVNwYW4sIGBDYW5ub3QgZmluZCBtZXNzYWdlIGZvciBpZCAnJHttZXNzYWdlSWR9JywgY29udGVudCAnJHttZXNzYWdlLmNvbnRlbnR9Jy5gKTtcbiAgICB9XG5cbiAgICBsZXQgcGFyc2VkTWVzc2FnZSA9IHRoaXMuX21lc3NhZ2VzW21lc3NhZ2VJZF07XG4gICAgcmV0dXJuIHRoaXMuX21lcmdlVHJlZXMocCwgcGFyc2VkTWVzc2FnZSwgcC5jaGlsZHJlbik7XG4gIH1cblxuICBwcml2YXRlIF9yZWN1cnNlSW50b0kxOG5QYXJ0KHA6IFBhcnQpOiBIdG1sQXN0W10ge1xuICAgIC8vIHdlIGZvdW5kIGFuIGVsZW1lbnQgd2l0aG91dCBhbiBpMThuIGF0dHJpYnV0ZVxuICAgIC8vIHdlIG5lZWQgdG8gcmVjdXJzZSBpbiBjYXVzZSBpdHMgY2hpbGRyZW4gbWF5IGhhdmUgaTE4biBzZXRcbiAgICAvLyB3ZSBhbHNvIG5lZWQgdG8gdHJhbnNsYXRlIGl0cyBhdHRyaWJ1dGVzXG4gICAgaWYgKGlzUHJlc2VudChwLnJvb3RFbGVtZW50KSkge1xuICAgICAgbGV0IHJvb3QgPSBwLnJvb3RFbGVtZW50O1xuICAgICAgbGV0IGNoaWxkcmVuID0gdGhpcy5fcmVjdXJzZShwLmNoaWxkcmVuKTtcbiAgICAgIGxldCBhdHRycyA9IHRoaXMuX2kxOG5BdHRyaWJ1dGVzKHJvb3QpO1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgbmV3IEh0bWxFbGVtZW50QXN0KHJvb3QubmFtZSwgYXR0cnMsIGNoaWxkcmVuLCByb290LnNvdXJjZVNwYW4sIHJvb3Quc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdC5lbmRTb3VyY2VTcGFuKVxuICAgICAgXTtcblxuICAgICAgLy8gYSB0ZXh0IG5vZGUgd2l0aG91dCBpMThuIG9yIGludGVycG9sYXRpb24sIG5vdGhpbmcgdG8gZG9cbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwLnJvb3RUZXh0Tm9kZSkpIHtcbiAgICAgIHJldHVybiBbcC5yb290VGV4dE5vZGVdO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZWN1cnNlKHAuY2hpbGRyZW4pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3JlY3Vyc2Uobm9kZXM6IEh0bWxBc3RbXSk6IEh0bWxBc3RbXSB7XG4gICAgbGV0IHBzID0gcGFydGl0aW9uKG5vZGVzLCB0aGlzLmVycm9ycyk7XG4gICAgcmV0dXJuIExpc3RXcmFwcGVyLmZsYXR0ZW4ocHMubWFwKHAgPT4gdGhpcy5fcHJvY2Vzc0kxOG5QYXJ0KHApKSk7XG4gIH1cblxuICBwcml2YXRlIF9tZXJnZVRyZWVzKHA6IFBhcnQsIHRyYW5zbGF0ZWQ6IEh0bWxBc3RbXSwgb3JpZ2luYWw6IEh0bWxBc3RbXSk6IEh0bWxBc3RbXSB7XG4gICAgbGV0IGwgPSBuZXcgX0NyZWF0ZU5vZGVNYXBwaW5nKCk7XG4gICAgaHRtbFZpc2l0QWxsKGwsIG9yaWdpbmFsKTtcblxuICAgIC8vIG1lcmdlIHRoZSB0cmFuc2xhdGVkIHRyZWUgd2l0aCB0aGUgb3JpZ2luYWwgdHJlZS5cbiAgICAvLyB3ZSBkbyBpdCBieSBwcmVzZXJ2aW5nIHRoZSBzb3VyY2UgY29kZSBwb3NpdGlvbiBvZiB0aGUgb3JpZ2luYWwgdHJlZVxuICAgIGxldCBtZXJnZWQgPSB0aGlzLl9tZXJnZVRyZWVzSGVscGVyKHRyYW5zbGF0ZWQsIGwubWFwcGluZyk7XG5cbiAgICAvLyBpZiB0aGUgcm9vdCBlbGVtZW50IGlzIHByZXNlbnQsIHdlIG5lZWQgdG8gY3JlYXRlIGEgbmV3IHJvb3QgZWxlbWVudCB3aXRoIGl0cyBhdHRyaWJ1dGVzXG4gICAgLy8gdHJhbnNsYXRlZFxuICAgIGlmIChpc1ByZXNlbnQocC5yb290RWxlbWVudCkpIHtcbiAgICAgIGxldCByb290ID0gcC5yb290RWxlbWVudDtcbiAgICAgIGxldCBhdHRycyA9IHRoaXMuX2kxOG5BdHRyaWJ1dGVzKHJvb3QpO1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgbmV3IEh0bWxFbGVtZW50QXN0KHJvb3QubmFtZSwgYXR0cnMsIG1lcmdlZCwgcm9vdC5zb3VyY2VTcGFuLCByb290LnN0YXJ0U291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3QuZW5kU291cmNlU3BhbilcbiAgICAgIF07XG5cbiAgICAgIC8vIHRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbiB3aXRoIGEgcGFydC4gUGFydHMgdGhhdCBoYXZlIHJvb3QgdGV4dCBub2RlIHNob3VsZCBub3QgYmUgbWVyZ2VkLlxuICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHAucm9vdFRleHROb2RlKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJzaG91bGQgbm90IGJlIHJlYWNoZWRcIik7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1lcmdlZDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9tZXJnZVRyZWVzSGVscGVyKHRyYW5zbGF0ZWQ6IEh0bWxBc3RbXSwgbWFwcGluZzogSHRtbEFzdFtdKTogSHRtbEFzdFtdIHtcbiAgICByZXR1cm4gdHJhbnNsYXRlZC5tYXAodCA9PiB7XG4gICAgICBpZiAodCBpbnN0YW5jZW9mIEh0bWxFbGVtZW50QXN0KSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tZXJnZUVsZW1lbnRPckludGVycG9sYXRpb24odCwgdHJhbnNsYXRlZCwgbWFwcGluZyk7XG5cbiAgICAgIH0gZWxzZSBpZiAodCBpbnN0YW5jZW9mIEh0bWxUZXh0QXN0KSB7XG4gICAgICAgIHJldHVybiB0O1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcInNob3VsZCBub3QgYmUgcmVhY2hlZFwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX21lcmdlRWxlbWVudE9ySW50ZXJwb2xhdGlvbih0OiBIdG1sRWxlbWVudEFzdCwgdHJhbnNsYXRlZDogSHRtbEFzdFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwcGluZzogSHRtbEFzdFtdKTogSHRtbEFzdCB7XG4gICAgbGV0IG5hbWUgPSB0aGlzLl9nZXROYW1lKHQpO1xuICAgIGxldCB0eXBlID0gbmFtZVswXTtcbiAgICBsZXQgaW5kZXggPSBOdW1iZXJXcmFwcGVyLnBhcnNlSW50KG5hbWUuc3Vic3RyaW5nKDEpLCAxMCk7XG4gICAgbGV0IG9yaWdpbmFsTm9kZSA9IG1hcHBpbmdbaW5kZXhdO1xuXG4gICAgaWYgKHR5cGUgPT0gXCJ0XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLl9tZXJnZVRleHRJbnRlcnBvbGF0aW9uKHQsIDxIdG1sVGV4dEFzdD5vcmlnaW5hbE5vZGUpO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcImVcIikge1xuICAgICAgcmV0dXJuIHRoaXMuX21lcmdlRWxlbWVudCh0LCA8SHRtbEVsZW1lbnRBc3Q+b3JpZ2luYWxOb2RlLCBtYXBwaW5nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJzaG91bGQgbm90IGJlIHJlYWNoZWRcIik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TmFtZSh0OiBIdG1sRWxlbWVudEFzdCk6IHN0cmluZyB7XG4gICAgaWYgKHQubmFtZSAhPSBfUExBQ0VIT0xERVJfRUxFTUVOVCkge1xuICAgICAgdGhyb3cgbmV3IEkxOG5FcnJvcihcbiAgICAgICAgICB0LnNvdXJjZVNwYW4sXG4gICAgICAgICAgYFVuZXhwZWN0ZWQgdGFnIFwiJHt0Lm5hbWV9XCIuIE9ubHkgXCIke19QTEFDRUhPTERFUl9FTEVNRU5UfVwiIHRhZ3MgYXJlIGFsbG93ZWQuYCk7XG4gICAgfVxuICAgIGxldCBuYW1lcyA9IHQuYXR0cnMuZmlsdGVyKGEgPT4gYS5uYW1lID09IF9OQU1FX0FUVFIpO1xuICAgIGlmIChuYW1lcy5sZW5ndGggPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEkxOG5FcnJvcih0LnNvdXJjZVNwYW4sIGBNaXNzaW5nIFwiJHtfTkFNRV9BVFRSfVwiIGF0dHJpYnV0ZS5gKTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzWzBdLnZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWVyZ2VUZXh0SW50ZXJwb2xhdGlvbih0OiBIdG1sRWxlbWVudEFzdCwgb3JpZ2luYWxOb2RlOiBIdG1sVGV4dEFzdCk6IEh0bWxUZXh0QXN0IHtcbiAgICBsZXQgc3BsaXQgPVxuICAgICAgICB0aGlzLl9wYXJzZXIuc3BsaXRJbnRlcnBvbGF0aW9uKG9yaWdpbmFsTm9kZS52YWx1ZSwgb3JpZ2luYWxOb2RlLnNvdXJjZVNwYW4udG9TdHJpbmcoKSk7XG4gICAgbGV0IGV4cHMgPSBpc1ByZXNlbnQoc3BsaXQpID8gc3BsaXQuZXhwcmVzc2lvbnMgOiBbXTtcblxuICAgIGxldCBtZXNzYWdlU3Vic3RyaW5nID1cbiAgICAgICAgdGhpcy5fbWVzc2FnZXNDb250ZW50LnN1YnN0cmluZyh0LnN0YXJ0U291cmNlU3Bhbi5lbmQub2Zmc2V0LCB0LmVuZFNvdXJjZVNwYW4uc3RhcnQub2Zmc2V0KTtcbiAgICBsZXQgdHJhbnNsYXRlZCA9XG4gICAgICAgIHRoaXMuX3JlcGxhY2VQbGFjZWhvbGRlcnNXaXRoRXhwcmVzc2lvbnMobWVzc2FnZVN1YnN0cmluZywgZXhwcywgb3JpZ2luYWxOb2RlLnNvdXJjZVNwYW4pO1xuXG4gICAgcmV0dXJuIG5ldyBIdG1sVGV4dEFzdCh0cmFuc2xhdGVkLCBvcmlnaW5hbE5vZGUuc291cmNlU3Bhbik7XG4gIH1cblxuICBwcml2YXRlIF9tZXJnZUVsZW1lbnQodDogSHRtbEVsZW1lbnRBc3QsIG9yaWdpbmFsTm9kZTogSHRtbEVsZW1lbnRBc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBwaW5nOiBIdG1sQXN0W10pOiBIdG1sRWxlbWVudEFzdCB7XG4gICAgbGV0IGNoaWxkcmVuID0gdGhpcy5fbWVyZ2VUcmVlc0hlbHBlcih0LmNoaWxkcmVuLCBtYXBwaW5nKTtcbiAgICByZXR1cm4gbmV3IEh0bWxFbGVtZW50QXN0KG9yaWdpbmFsTm9kZS5uYW1lLCB0aGlzLl9pMThuQXR0cmlidXRlcyhvcmlnaW5hbE5vZGUpLCBjaGlsZHJlbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsTm9kZS5zb3VyY2VTcGFuLCBvcmlnaW5hbE5vZGUuc3RhcnRTb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxOb2RlLmVuZFNvdXJjZVNwYW4pO1xuICB9XG5cbiAgcHJpdmF0ZSBfaTE4bkF0dHJpYnV0ZXMoZWw6IEh0bWxFbGVtZW50QXN0KTogSHRtbEF0dHJBc3RbXSB7XG4gICAgbGV0IHJlcyA9IFtdO1xuICAgIGVsLmF0dHJzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICBpZiAoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoSTE4Tl9BVFRSX1BSRUZJWCkgfHwgYXR0ci5uYW1lID09IEkxOE5fQVRUUikgcmV0dXJuO1xuXG4gICAgICBsZXQgaTE4bnMgPSBlbC5hdHRycy5maWx0ZXIoYSA9PiBhLm5hbWUgPT0gYGkxOG4tJHthdHRyLm5hbWV9YCk7XG4gICAgICBpZiAoaTE4bnMubGVuZ3RoID09IDApIHtcbiAgICAgICAgcmVzLnB1c2goYXR0cik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbGV0IGkxOG4gPSBpMThuc1swXTtcbiAgICAgIGxldCBtZXNzYWdlID0gbWVzc2FnZUZyb21BdHRyaWJ1dGUodGhpcy5fcGFyc2VyLCBlbCwgaTE4bik7XG4gICAgICBsZXQgbWVzc2FnZUlkID0gaWQobWVzc2FnZSk7XG5cbiAgICAgIGlmIChTdHJpbmdNYXBXcmFwcGVyLmNvbnRhaW5zKHRoaXMuX21lc3NhZ2VzLCBtZXNzYWdlSWQpKSB7XG4gICAgICAgIGxldCB1cGRhdGVkTWVzc2FnZSA9IHRoaXMuX3JlcGxhY2VJbnRlcnBvbGF0aW9uSW5BdHRyKGF0dHIsIHRoaXMuX21lc3NhZ2VzW21lc3NhZ2VJZF0pO1xuICAgICAgICByZXMucHVzaChuZXcgSHRtbEF0dHJBc3QoYXR0ci5uYW1lLCB1cGRhdGVkTWVzc2FnZSwgYXR0ci5zb3VyY2VTcGFuKSk7XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBJMThuRXJyb3IoXG4gICAgICAgICAgICBhdHRyLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICBgQ2Fubm90IGZpbmQgbWVzc2FnZSBmb3IgaWQgJyR7bWVzc2FnZUlkfScsIGNvbnRlbnQgJyR7bWVzc2FnZS5jb250ZW50fScuYCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIHByaXZhdGUgX3JlcGxhY2VJbnRlcnBvbGF0aW9uSW5BdHRyKGF0dHI6IEh0bWxBdHRyQXN0LCBtc2c6IEh0bWxBc3RbXSk6IHN0cmluZyB7XG4gICAgbGV0IHNwbGl0ID0gdGhpcy5fcGFyc2VyLnNwbGl0SW50ZXJwb2xhdGlvbihhdHRyLnZhbHVlLCBhdHRyLnNvdXJjZVNwYW4udG9TdHJpbmcoKSk7XG4gICAgbGV0IGV4cHMgPSBpc1ByZXNlbnQoc3BsaXQpID8gc3BsaXQuZXhwcmVzc2lvbnMgOiBbXTtcblxuICAgIGxldCBmaXJzdCA9IG1zZ1swXTtcbiAgICBsZXQgbGFzdCA9IG1zZ1ttc2cubGVuZ3RoIC0gMV07XG5cbiAgICBsZXQgc3RhcnQgPSBmaXJzdC5zb3VyY2VTcGFuLnN0YXJ0Lm9mZnNldDtcbiAgICBsZXQgZW5kID1cbiAgICAgICAgbGFzdCBpbnN0YW5jZW9mIEh0bWxFbGVtZW50QXN0ID8gbGFzdC5lbmRTb3VyY2VTcGFuLmVuZC5vZmZzZXQgOiBsYXN0LnNvdXJjZVNwYW4uZW5kLm9mZnNldDtcbiAgICBsZXQgbWVzc2FnZVN1YnN0cmluZyA9IHRoaXMuX21lc3NhZ2VzQ29udGVudC5zdWJzdHJpbmcoc3RhcnQsIGVuZCk7XG5cbiAgICByZXR1cm4gdGhpcy5fcmVwbGFjZVBsYWNlaG9sZGVyc1dpdGhFeHByZXNzaW9ucyhtZXNzYWdlU3Vic3RyaW5nLCBleHBzLCBhdHRyLnNvdXJjZVNwYW4pO1xuICB9O1xuXG4gIHByaXZhdGUgX3JlcGxhY2VQbGFjZWhvbGRlcnNXaXRoRXhwcmVzc2lvbnMobWVzc2FnZTogc3RyaW5nLCBleHBzOiBzdHJpbmdbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pOiBzdHJpbmcge1xuICAgIGxldCBleHBNYXAgPSB0aGlzLl9idWlsZEV4cHJNYXAoZXhwcyk7XG4gICAgcmV0dXJuIFJlZ0V4cFdyYXBwZXIucmVwbGFjZUFsbChfUExBQ0VIT0xERVJfRVhQQU5ERURfUkVHRVhQLCBtZXNzYWdlLCAobWF0Y2gpID0+IHtcbiAgICAgIGxldCBuYW1lV2l0aFF1b3RlcyA9IG1hdGNoWzJdO1xuICAgICAgbGV0IG5hbWUgPSBuYW1lV2l0aFF1b3Rlcy5zdWJzdHJpbmcoMSwgbmFtZVdpdGhRdW90ZXMubGVuZ3RoIC0gMSk7XG4gICAgICByZXR1cm4gdGhpcy5fY29udmVydEludG9FeHByZXNzaW9uKG5hbWUsIGV4cE1hcCwgc291cmNlU3Bhbik7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZEV4cHJNYXAoZXhwczogc3RyaW5nW10pOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICBsZXQgZXhwTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICBsZXQgdXNlZE5hbWVzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZXhwcy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHBoTmFtZSA9IGdldFBoTmFtZUZyb21CaW5kaW5nKGV4cHNbaV0sIGkpO1xuICAgICAgZXhwTWFwLnNldChkZWR1cGVQaE5hbWUodXNlZE5hbWVzLCBwaE5hbWUpLCBleHBzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIGV4cE1hcDtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnZlcnRJbnRvRXhwcmVzc2lvbihuYW1lOiBzdHJpbmcsIGV4cE1hcDogTWFwPHN0cmluZywgc3RyaW5nPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZVNwYW46IFBhcnNlU291cmNlU3Bhbikge1xuICAgIGlmIChleHBNYXAuaGFzKG5hbWUpKSB7XG4gICAgICByZXR1cm4gYHt7JHtleHBNYXAuZ2V0KG5hbWUpfX19YDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEkxOG5FcnJvcihzb3VyY2VTcGFuLCBgSW52YWxpZCBpbnRlcnBvbGF0aW9uIG5hbWUgJyR7bmFtZX0nYCk7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIF9DcmVhdGVOb2RlTWFwcGluZyBpbXBsZW1lbnRzIEh0bWxBc3RWaXNpdG9yIHtcbiAgbWFwcGluZzogSHRtbEFzdFtdID0gW107XG5cbiAgdmlzaXRFbGVtZW50KGFzdDogSHRtbEVsZW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgdGhpcy5tYXBwaW5nLnB1c2goYXN0KTtcbiAgICBodG1sVmlzaXRBbGwodGhpcywgYXN0LmNoaWxkcmVuKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0QXR0cihhc3Q6IEh0bWxBdHRyQXN0LCBjb250ZXh0OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuXG4gIHZpc2l0VGV4dChhc3Q6IEh0bWxUZXh0QXN0LCBjb250ZXh0OiBhbnkpOiBhbnkge1xuICAgIHRoaXMubWFwcGluZy5wdXNoKGFzdCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEV4cGFuc2lvbihhc3Q6IEh0bWxFeHBhbnNpb25Bc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG5cbiAgdmlzaXRFeHBhbnNpb25DYXNlKGFzdDogSHRtbEV4cGFuc2lvbkNhc2VBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG5cbiAgdmlzaXRDb21tZW50KGFzdDogSHRtbENvbW1lbnRBc3QsIGNvbnRleHQ6IGFueSk6IGFueSB7IHJldHVybiBcIlwiOyB9XG59XG4iXX0=