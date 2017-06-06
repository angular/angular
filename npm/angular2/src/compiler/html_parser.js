'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var html_ast_1 = require('./html_ast');
var di_1 = require('angular2/src/core/di');
var html_lexer_1 = require('./html_lexer');
var parse_util_1 = require('./parse_util');
var html_tags_1 = require('./html_tags');
var HtmlTreeError = (function (_super) {
    __extends(HtmlTreeError, _super);
    function HtmlTreeError(elementName, span, msg) {
        _super.call(this, span, msg);
        this.elementName = elementName;
    }
    HtmlTreeError.create = function (elementName, span, msg) {
        return new HtmlTreeError(elementName, span, msg);
    };
    return HtmlTreeError;
}(parse_util_1.ParseError));
exports.HtmlTreeError = HtmlTreeError;
var HtmlParseTreeResult = (function () {
    function HtmlParseTreeResult(rootNodes, errors) {
        this.rootNodes = rootNodes;
        this.errors = errors;
    }
    return HtmlParseTreeResult;
}());
exports.HtmlParseTreeResult = HtmlParseTreeResult;
var HtmlParser = (function () {
    function HtmlParser() {
    }
    HtmlParser.prototype.parse = function (sourceContent, sourceUrl, parseExpansionForms) {
        if (parseExpansionForms === void 0) { parseExpansionForms = false; }
        var tokensAndErrors = html_lexer_1.tokenizeHtml(sourceContent, sourceUrl, parseExpansionForms);
        var treeAndErrors = new TreeBuilder(tokensAndErrors.tokens).build();
        return new HtmlParseTreeResult(treeAndErrors.rootNodes, tokensAndErrors.errors
            .concat(treeAndErrors.errors));
    };
    HtmlParser = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], HtmlParser);
    return HtmlParser;
}());
exports.HtmlParser = HtmlParser;
var TreeBuilder = (function () {
    function TreeBuilder(tokens) {
        this.tokens = tokens;
        this.index = -1;
        this.rootNodes = [];
        this.errors = [];
        this.elementStack = [];
        this._advance();
    }
    TreeBuilder.prototype.build = function () {
        while (this.peek.type !== html_lexer_1.HtmlTokenType.EOF) {
            if (this.peek.type === html_lexer_1.HtmlTokenType.TAG_OPEN_START) {
                this._consumeStartTag(this._advance());
            }
            else if (this.peek.type === html_lexer_1.HtmlTokenType.TAG_CLOSE) {
                this._consumeEndTag(this._advance());
            }
            else if (this.peek.type === html_lexer_1.HtmlTokenType.CDATA_START) {
                this._closeVoidElement();
                this._consumeCdata(this._advance());
            }
            else if (this.peek.type === html_lexer_1.HtmlTokenType.COMMENT_START) {
                this._closeVoidElement();
                this._consumeComment(this._advance());
            }
            else if (this.peek.type === html_lexer_1.HtmlTokenType.TEXT ||
                this.peek.type === html_lexer_1.HtmlTokenType.RAW_TEXT ||
                this.peek.type === html_lexer_1.HtmlTokenType.ESCAPABLE_RAW_TEXT) {
                this._closeVoidElement();
                this._consumeText(this._advance());
            }
            else if (this.peek.type === html_lexer_1.HtmlTokenType.EXPANSION_FORM_START) {
                this._consumeExpansion(this._advance());
            }
            else {
                // Skip all other tokens...
                this._advance();
            }
        }
        return new HtmlParseTreeResult(this.rootNodes, this.errors);
    };
    TreeBuilder.prototype._advance = function () {
        var prev = this.peek;
        if (this.index < this.tokens.length - 1) {
            // Note: there is always an EOF token at the end
            this.index++;
        }
        this.peek = this.tokens[this.index];
        return prev;
    };
    TreeBuilder.prototype._advanceIf = function (type) {
        if (this.peek.type === type) {
            return this._advance();
        }
        return null;
    };
    TreeBuilder.prototype._consumeCdata = function (startToken) {
        this._consumeText(this._advance());
        this._advanceIf(html_lexer_1.HtmlTokenType.CDATA_END);
    };
    TreeBuilder.prototype._consumeComment = function (token) {
        var text = this._advanceIf(html_lexer_1.HtmlTokenType.RAW_TEXT);
        this._advanceIf(html_lexer_1.HtmlTokenType.COMMENT_END);
        var value = lang_1.isPresent(text) ? text.parts[0].trim() : null;
        this._addToParent(new html_ast_1.HtmlCommentAst(value, token.sourceSpan));
    };
    TreeBuilder.prototype._consumeExpansion = function (token) {
        var switchValue = this._advance();
        var type = this._advance();
        var cases = [];
        // read =
        while (this.peek.type === html_lexer_1.HtmlTokenType.EXPANSION_CASE_VALUE) {
            var expCase = this._parseExpansionCase();
            if (lang_1.isBlank(expCase))
                return; // error
            cases.push(expCase);
        }
        // read the final }
        if (this.peek.type !== html_lexer_1.HtmlTokenType.EXPANSION_FORM_END) {
            this.errors.push(HtmlTreeError.create(null, this.peek.sourceSpan, "Invalid expansion form. Missing '}'."));
            return;
        }
        this._advance();
        var mainSourceSpan = new parse_util_1.ParseSourceSpan(token.sourceSpan.start, this.peek.sourceSpan.end);
        this._addToParent(new html_ast_1.HtmlExpansionAst(switchValue.parts[0], type.parts[0], cases, mainSourceSpan, switchValue.sourceSpan));
    };
    TreeBuilder.prototype._parseExpansionCase = function () {
        var value = this._advance();
        // read {
        if (this.peek.type !== html_lexer_1.HtmlTokenType.EXPANSION_CASE_EXP_START) {
            this.errors.push(HtmlTreeError.create(null, this.peek.sourceSpan, "Invalid expansion form. Missing '{'.,"));
            return null;
        }
        // read until }
        var start = this._advance();
        var exp = this._collectExpansionExpTokens(start);
        if (lang_1.isBlank(exp))
            return null;
        var end = this._advance();
        exp.push(new html_lexer_1.HtmlToken(html_lexer_1.HtmlTokenType.EOF, [], end.sourceSpan));
        // parse everything in between { and }
        var parsedExp = new TreeBuilder(exp).build();
        if (parsedExp.errors.length > 0) {
            this.errors = this.errors.concat(parsedExp.errors);
            return null;
        }
        var sourceSpan = new parse_util_1.ParseSourceSpan(value.sourceSpan.start, end.sourceSpan.end);
        var expSourceSpan = new parse_util_1.ParseSourceSpan(start.sourceSpan.start, end.sourceSpan.end);
        return new html_ast_1.HtmlExpansionCaseAst(value.parts[0], parsedExp.rootNodes, sourceSpan, value.sourceSpan, expSourceSpan);
    };
    TreeBuilder.prototype._collectExpansionExpTokens = function (start) {
        var exp = [];
        var expansionFormStack = [html_lexer_1.HtmlTokenType.EXPANSION_CASE_EXP_START];
        while (true) {
            if (this.peek.type === html_lexer_1.HtmlTokenType.EXPANSION_FORM_START ||
                this.peek.type === html_lexer_1.HtmlTokenType.EXPANSION_CASE_EXP_START) {
                expansionFormStack.push(this.peek.type);
            }
            if (this.peek.type === html_lexer_1.HtmlTokenType.EXPANSION_CASE_EXP_END) {
                if (lastOnStack(expansionFormStack, html_lexer_1.HtmlTokenType.EXPANSION_CASE_EXP_START)) {
                    expansionFormStack.pop();
                    if (expansionFormStack.length == 0)
                        return exp;
                }
                else {
                    this.errors.push(HtmlTreeError.create(null, start.sourceSpan, "Invalid expansion form. Missing '}'."));
                    return null;
                }
            }
            if (this.peek.type === html_lexer_1.HtmlTokenType.EXPANSION_FORM_END) {
                if (lastOnStack(expansionFormStack, html_lexer_1.HtmlTokenType.EXPANSION_FORM_START)) {
                    expansionFormStack.pop();
                }
                else {
                    this.errors.push(HtmlTreeError.create(null, start.sourceSpan, "Invalid expansion form. Missing '}'."));
                    return null;
                }
            }
            if (this.peek.type === html_lexer_1.HtmlTokenType.EOF) {
                this.errors.push(HtmlTreeError.create(null, start.sourceSpan, "Invalid expansion form. Missing '}'."));
                return null;
            }
            exp.push(this._advance());
        }
    };
    TreeBuilder.prototype._consumeText = function (token) {
        var text = token.parts[0];
        if (text.length > 0 && text[0] == '\n') {
            var parent_1 = this._getParentElement();
            if (lang_1.isPresent(parent_1) && parent_1.children.length == 0 &&
                html_tags_1.getHtmlTagDefinition(parent_1.name).ignoreFirstLf) {
                text = text.substring(1);
            }
        }
        if (text.length > 0) {
            this._addToParent(new html_ast_1.HtmlTextAst(text, token.sourceSpan));
        }
    };
    TreeBuilder.prototype._closeVoidElement = function () {
        if (this.elementStack.length > 0) {
            var el = collection_1.ListWrapper.last(this.elementStack);
            if (html_tags_1.getHtmlTagDefinition(el.name).isVoid) {
                this.elementStack.pop();
            }
        }
    };
    TreeBuilder.prototype._consumeStartTag = function (startTagToken) {
        var prefix = startTagToken.parts[0];
        var name = startTagToken.parts[1];
        var attrs = [];
        while (this.peek.type === html_lexer_1.HtmlTokenType.ATTR_NAME) {
            attrs.push(this._consumeAttr(this._advance()));
        }
        var fullName = getElementFullName(prefix, name, this._getParentElement());
        var selfClosing = false;
        // Note: There could have been a tokenizer error
        // so that we don't get a token for the end tag...
        if (this.peek.type === html_lexer_1.HtmlTokenType.TAG_OPEN_END_VOID) {
            this._advance();
            selfClosing = true;
            if (html_tags_1.getNsPrefix(fullName) == null && !html_tags_1.getHtmlTagDefinition(fullName).isVoid) {
                this.errors.push(HtmlTreeError.create(fullName, startTagToken.sourceSpan, "Only void and foreign elements can be self closed \"" + startTagToken.parts[1] + "\""));
            }
        }
        else if (this.peek.type === html_lexer_1.HtmlTokenType.TAG_OPEN_END) {
            this._advance();
            selfClosing = false;
        }
        var end = this.peek.sourceSpan.start;
        var span = new parse_util_1.ParseSourceSpan(startTagToken.sourceSpan.start, end);
        var el = new html_ast_1.HtmlElementAst(fullName, attrs, [], span, span, null);
        this._pushElement(el);
        if (selfClosing) {
            this._popElement(fullName);
            el.endSourceSpan = span;
        }
    };
    TreeBuilder.prototype._pushElement = function (el) {
        if (this.elementStack.length > 0) {
            var parentEl = collection_1.ListWrapper.last(this.elementStack);
            if (html_tags_1.getHtmlTagDefinition(parentEl.name).isClosedByChild(el.name)) {
                this.elementStack.pop();
            }
        }
        var tagDef = html_tags_1.getHtmlTagDefinition(el.name);
        var parentEl = this._getParentElement();
        if (tagDef.requireExtraParent(lang_1.isPresent(parentEl) ? parentEl.name : null)) {
            var newParent = new html_ast_1.HtmlElementAst(tagDef.parentToAdd, [], [el], el.sourceSpan, el.startSourceSpan, el.endSourceSpan);
            this._addToParent(newParent);
            this.elementStack.push(newParent);
            this.elementStack.push(el);
        }
        else {
            this._addToParent(el);
            this.elementStack.push(el);
        }
    };
    TreeBuilder.prototype._consumeEndTag = function (endTagToken) {
        var fullName = getElementFullName(endTagToken.parts[0], endTagToken.parts[1], this._getParentElement());
        this._getParentElement().endSourceSpan = endTagToken.sourceSpan;
        if (html_tags_1.getHtmlTagDefinition(fullName).isVoid) {
            this.errors.push(HtmlTreeError.create(fullName, endTagToken.sourceSpan, "Void elements do not have end tags \"" + endTagToken.parts[1] + "\""));
        }
        else if (!this._popElement(fullName)) {
            this.errors.push(HtmlTreeError.create(fullName, endTagToken.sourceSpan, "Unexpected closing tag \"" + endTagToken.parts[1] + "\""));
        }
    };
    TreeBuilder.prototype._popElement = function (fullName) {
        for (var stackIndex = this.elementStack.length - 1; stackIndex >= 0; stackIndex--) {
            var el = this.elementStack[stackIndex];
            if (el.name == fullName) {
                collection_1.ListWrapper.splice(this.elementStack, stackIndex, this.elementStack.length - stackIndex);
                return true;
            }
            if (!html_tags_1.getHtmlTagDefinition(el.name).closedByParent) {
                return false;
            }
        }
        return false;
    };
    TreeBuilder.prototype._consumeAttr = function (attrName) {
        var fullName = html_tags_1.mergeNsAndName(attrName.parts[0], attrName.parts[1]);
        var end = attrName.sourceSpan.end;
        var value = '';
        if (this.peek.type === html_lexer_1.HtmlTokenType.ATTR_VALUE) {
            var valueToken = this._advance();
            value = valueToken.parts[0];
            end = valueToken.sourceSpan.end;
        }
        return new html_ast_1.HtmlAttrAst(fullName, value, new parse_util_1.ParseSourceSpan(attrName.sourceSpan.start, end));
    };
    TreeBuilder.prototype._getParentElement = function () {
        return this.elementStack.length > 0 ? collection_1.ListWrapper.last(this.elementStack) : null;
    };
    TreeBuilder.prototype._addToParent = function (node) {
        var parent = this._getParentElement();
        if (lang_1.isPresent(parent)) {
            parent.children.push(node);
        }
        else {
            this.rootNodes.push(node);
        }
    };
    return TreeBuilder;
}());
function getElementFullName(prefix, localName, parentElement) {
    if (lang_1.isBlank(prefix)) {
        prefix = html_tags_1.getHtmlTagDefinition(localName).implicitNamespacePrefix;
        if (lang_1.isBlank(prefix) && lang_1.isPresent(parentElement)) {
            prefix = html_tags_1.getNsPrefix(parentElement.name);
        }
    }
    return html_tags_1.mergeNsAndName(prefix, localName);
}
function lastOnStack(stack, element) {
    return stack.length > 0 && stack[stack.length - 1] === element;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF9wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEscUJBUU8sMEJBQTBCLENBQUMsQ0FBQTtBQUVsQywyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUUzRCx5QkFRTyxZQUFZLENBQUMsQ0FBQTtBQUVwQixtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCwyQkFBcUQsY0FBYyxDQUFDLENBQUE7QUFDcEUsMkJBQXlELGNBQWMsQ0FBQyxDQUFBO0FBQ3hFLDBCQUFtRixhQUFhLENBQUMsQ0FBQTtBQUVqRztJQUFtQyxpQ0FBVTtJQUszQyx1QkFBbUIsV0FBbUIsRUFBRSxJQUFxQixFQUFFLEdBQVc7UUFBSSxrQkFBTSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFBNUUsZ0JBQVcsR0FBWCxXQUFXLENBQVE7SUFBMEQsQ0FBQztJQUoxRixvQkFBTSxHQUFiLFVBQWMsV0FBbUIsRUFBRSxJQUFxQixFQUFFLEdBQVc7UUFDbkUsTUFBTSxDQUFDLElBQUksYUFBYSxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUdILG9CQUFDO0FBQUQsQ0FBQyxBQU5ELENBQW1DLHVCQUFVLEdBTTVDO0FBTlkscUJBQWEsZ0JBTXpCLENBQUE7QUFFRDtJQUNFLDZCQUFtQixTQUFvQixFQUFTLE1BQW9CO1FBQWpELGNBQVMsR0FBVCxTQUFTLENBQVc7UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFjO0lBQUcsQ0FBQztJQUMxRSwwQkFBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBRlksMkJBQW1CLHNCQUUvQixDQUFBO0FBR0Q7SUFBQTtJQVFBLENBQUM7SUFQQywwQkFBSyxHQUFM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LENBQUMsQ0FBQyxjQUFPLENBQUMsTUFBTSxDQUFDLElBQUksZ0JBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsTUFBTSxHQUFHLHVCQUFXLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLENBQUM7SUFDSCxDQUFDO0lBRUQsTUFBTSxDQUFDLDBCQUFjLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQzNDLENBQUM7QUFFRCxxQkFBcUIsS0FBWSxFQUFFLE9BQVk7SUFDN0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLE9BQU8sQ0FBQztBQUNqRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBTdHJpbmdXcmFwcGVyLFxuICBzdHJpbmdpZnksXG4gIGFzc2VydGlvbnNFbmFibGVkLFxuICBTdHJpbmdKb2luZXIsXG4gIHNlcmlhbGl6ZUVudW0sXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7XG4gIEh0bWxBc3QsXG4gIEh0bWxBdHRyQXN0LFxuICBIdG1sVGV4dEFzdCxcbiAgSHRtbENvbW1lbnRBc3QsXG4gIEh0bWxFbGVtZW50QXN0LFxuICBIdG1sRXhwYW5zaW9uQXN0LFxuICBIdG1sRXhwYW5zaW9uQ2FzZUFzdFxufSBmcm9tICcuL2h0bWxfYXN0JztcblxuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0h0bWxUb2tlbiwgSHRtbFRva2VuVHlwZSwgdG9rZW5pemVIdG1sfSBmcm9tICcuL2h0bWxfbGV4ZXInO1xuaW1wb3J0IHtQYXJzZUVycm9yLCBQYXJzZUxvY2F0aW9uLCBQYXJzZVNvdXJjZVNwYW59IGZyb20gJy4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge0h0bWxUYWdEZWZpbml0aW9uLCBnZXRIdG1sVGFnRGVmaW5pdGlvbiwgZ2V0TnNQcmVmaXgsIG1lcmdlTnNBbmROYW1lfSBmcm9tICcuL2h0bWxfdGFncyc7XG5cbmV4cG9ydCBjbGFzcyBIdG1sVHJlZUVycm9yIGV4dGVuZHMgUGFyc2VFcnJvciB7XG4gIHN0YXRpYyBjcmVhdGUoZWxlbWVudE5hbWU6IHN0cmluZywgc3BhbjogUGFyc2VTb3VyY2VTcGFuLCBtc2c6IHN0cmluZyk6IEh0bWxUcmVlRXJyb3Ige1xuICAgIHJldHVybiBuZXcgSHRtbFRyZWVFcnJvcihlbGVtZW50TmFtZSwgc3BhbiwgbXNnKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50TmFtZTogc3RyaW5nLCBzcGFuOiBQYXJzZVNvdXJjZVNwYW4sIG1zZzogc3RyaW5nKSB7IHN1cGVyKHNwYW4sIG1zZyk7IH1cbn1cblxuZXhwb3J0IGNsYXNzIEh0bWxQYXJzZVRyZWVSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcm9vdE5vZGVzOiBIdG1sQXN0W10sIHB1YmxpYyBlcnJvcnM6IFBhcnNlRXJyb3JbXSkge31cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0bWxQYXJzZXIge1xuICBwYXJzZShzb3VyY2VDb250ZW50OiBzdHJpbmcsIHNvdXJjZVVybDogc3RyaW5nLFxuICAgICAgICBwYXJzZUV4cGFuc2lvbkZvcm1zOiBib29sZWFuID0gZmFsc2UpOiBIdG1sUGFyc2VUcmVlUmVzdWx0IHtcbiAgICB2YXIgdG9rZW5zQW5kRXJyb3JzID0gdG9rZW5pemVIdG1sKHNvdXJjZUNvbnRlbnQsIHNvdXJjZVVybCwgcGFyc2VFeHBhbnNpb25Gb3Jtcyk7XG4gICAgdmFyIHRyZWVBbmRFcnJvcnMgPSBuZXcgVHJlZUJ1aWxkZXIodG9rZW5zQW5kRXJyb3JzLnRva2VucykuYnVpbGQoKTtcbiAgICByZXR1cm4gbmV3IEh0bWxQYXJzZVRyZWVSZXN1bHQodHJlZUFuZEVycm9ycy5yb290Tm9kZXMsICg8UGFyc2VFcnJvcltdPnRva2Vuc0FuZEVycm9ycy5lcnJvcnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNvbmNhdCh0cmVlQW5kRXJyb3JzLmVycm9ycykpO1xuICB9XG59XG5cbmNsYXNzIFRyZWVCdWlsZGVyIHtcbiAgcHJpdmF0ZSBpbmRleDogbnVtYmVyID0gLTE7XG4gIHByaXZhdGUgcGVlazogSHRtbFRva2VuO1xuXG4gIHByaXZhdGUgcm9vdE5vZGVzOiBIdG1sQXN0W10gPSBbXTtcbiAgcHJpdmF0ZSBlcnJvcnM6IEh0bWxUcmVlRXJyb3JbXSA9IFtdO1xuXG4gIHByaXZhdGUgZWxlbWVudFN0YWNrOiBIdG1sRWxlbWVudEFzdFtdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB0b2tlbnM6IEh0bWxUb2tlbltdKSB7IHRoaXMuX2FkdmFuY2UoKTsgfVxuXG4gIGJ1aWxkKCk6IEh0bWxQYXJzZVRyZWVSZXN1bHQge1xuICAgIHdoaWxlICh0aGlzLnBlZWsudHlwZSAhPT0gSHRtbFRva2VuVHlwZS5FT0YpIHtcbiAgICAgIGlmICh0aGlzLnBlZWsudHlwZSA9PT0gSHRtbFRva2VuVHlwZS5UQUdfT1BFTl9TVEFSVCkge1xuICAgICAgICB0aGlzLl9jb25zdW1lU3RhcnRUYWcodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuVEFHX0NMT1NFKSB7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVFbmRUYWcodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuQ0RBVEFfU1RBUlQpIHtcbiAgICAgICAgdGhpcy5fY2xvc2VWb2lkRWxlbWVudCgpO1xuICAgICAgICB0aGlzLl9jb25zdW1lQ2RhdGEodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuQ09NTUVOVF9TVEFSVCkge1xuICAgICAgICB0aGlzLl9jbG9zZVZvaWRFbGVtZW50KCk7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVDb21tZW50KHRoaXMuX2FkdmFuY2UoKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLlRFWFQgfHxcbiAgICAgICAgICAgICAgICAgdGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuUkFXX1RFWFQgfHxcbiAgICAgICAgICAgICAgICAgdGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuRVNDQVBBQkxFX1JBV19URVhUKSB7XG4gICAgICAgIHRoaXMuX2Nsb3NlVm9pZEVsZW1lbnQoKTtcbiAgICAgICAgdGhpcy5fY29uc3VtZVRleHQodGhpcy5fYWR2YW5jZSgpKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuRVhQQU5TSU9OX0ZPUk1fU1RBUlQpIHtcbiAgICAgICAgdGhpcy5fY29uc3VtZUV4cGFuc2lvbih0aGlzLl9hZHZhbmNlKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gU2tpcCBhbGwgb3RoZXIgdG9rZW5zLi4uXG4gICAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBIdG1sUGFyc2VUcmVlUmVzdWx0KHRoaXMucm9vdE5vZGVzLCB0aGlzLmVycm9ycyk7XG4gIH1cblxuICBwcml2YXRlIF9hZHZhbmNlKCk6IEh0bWxUb2tlbiB7XG4gICAgdmFyIHByZXYgPSB0aGlzLnBlZWs7XG4gICAgaWYgKHRoaXMuaW5kZXggPCB0aGlzLnRva2Vucy5sZW5ndGggLSAxKSB7XG4gICAgICAvLyBOb3RlOiB0aGVyZSBpcyBhbHdheXMgYW4gRU9GIHRva2VuIGF0IHRoZSBlbmRcbiAgICAgIHRoaXMuaW5kZXgrKztcbiAgICB9XG4gICAgdGhpcy5wZWVrID0gdGhpcy50b2tlbnNbdGhpcy5pbmRleF07XG4gICAgcmV0dXJuIHByZXY7XG4gIH1cblxuICBwcml2YXRlIF9hZHZhbmNlSWYodHlwZTogSHRtbFRva2VuVHlwZSk6IEh0bWxUb2tlbiB7XG4gICAgaWYgKHRoaXMucGVlay50eXBlID09PSB0eXBlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWR2YW5jZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVDZGF0YShzdGFydFRva2VuOiBIdG1sVG9rZW4pIHtcbiAgICB0aGlzLl9jb25zdW1lVGV4dCh0aGlzLl9hZHZhbmNlKCkpO1xuICAgIHRoaXMuX2FkdmFuY2VJZihIdG1sVG9rZW5UeXBlLkNEQVRBX0VORCk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lQ29tbWVudCh0b2tlbjogSHRtbFRva2VuKSB7XG4gICAgdmFyIHRleHQgPSB0aGlzLl9hZHZhbmNlSWYoSHRtbFRva2VuVHlwZS5SQVdfVEVYVCk7XG4gICAgdGhpcy5fYWR2YW5jZUlmKEh0bWxUb2tlblR5cGUuQ09NTUVOVF9FTkQpO1xuICAgIHZhciB2YWx1ZSA9IGlzUHJlc2VudCh0ZXh0KSA/IHRleHQucGFydHNbMF0udHJpbSgpIDogbnVsbDtcbiAgICB0aGlzLl9hZGRUb1BhcmVudChuZXcgSHRtbENvbW1lbnRBc3QodmFsdWUsIHRva2VuLnNvdXJjZVNwYW4pKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVFeHBhbnNpb24odG9rZW46IEh0bWxUb2tlbikge1xuICAgIGxldCBzd2l0Y2hWYWx1ZSA9IHRoaXMuX2FkdmFuY2UoKTtcblxuICAgIGxldCB0eXBlID0gdGhpcy5fYWR2YW5jZSgpO1xuICAgIGxldCBjYXNlcyA9IFtdO1xuXG4gICAgLy8gcmVhZCA9XG4gICAgd2hpbGUgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLkVYUEFOU0lPTl9DQVNFX1ZBTFVFKSB7XG4gICAgICBsZXQgZXhwQ2FzZSA9IHRoaXMuX3BhcnNlRXhwYW5zaW9uQ2FzZSgpO1xuICAgICAgaWYgKGlzQmxhbmsoZXhwQ2FzZSkpIHJldHVybjsgIC8vIGVycm9yXG4gICAgICBjYXNlcy5wdXNoKGV4cENhc2UpO1xuICAgIH1cblxuICAgIC8vIHJlYWQgdGhlIGZpbmFsIH1cbiAgICBpZiAodGhpcy5wZWVrLnR5cGUgIT09IEh0bWxUb2tlblR5cGUuRVhQQU5TSU9OX0ZPUk1fRU5EKSB7XG4gICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICAgIEh0bWxUcmVlRXJyb3IuY3JlYXRlKG51bGwsIHRoaXMucGVlay5zb3VyY2VTcGFuLCBgSW52YWxpZCBleHBhbnNpb24gZm9ybS4gTWlzc2luZyAnfScuYCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9hZHZhbmNlKCk7XG5cbiAgICBsZXQgbWFpblNvdXJjZVNwYW4gPSBuZXcgUGFyc2VTb3VyY2VTcGFuKHRva2VuLnNvdXJjZVNwYW4uc3RhcnQsIHRoaXMucGVlay5zb3VyY2VTcGFuLmVuZCk7XG4gICAgdGhpcy5fYWRkVG9QYXJlbnQobmV3IEh0bWxFeHBhbnNpb25Bc3Qoc3dpdGNoVmFsdWUucGFydHNbMF0sIHR5cGUucGFydHNbMF0sIGNhc2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1haW5Tb3VyY2VTcGFuLCBzd2l0Y2hWYWx1ZS5zb3VyY2VTcGFuKSk7XG4gIH1cblxuICBwcml2YXRlIF9wYXJzZUV4cGFuc2lvbkNhc2UoKTogSHRtbEV4cGFuc2lvbkNhc2VBc3Qge1xuICAgIGxldCB2YWx1ZSA9IHRoaXMuX2FkdmFuY2UoKTtcblxuICAgIC8vIHJlYWQge1xuICAgIGlmICh0aGlzLnBlZWsudHlwZSAhPT0gSHRtbFRva2VuVHlwZS5FWFBBTlNJT05fQ0FTRV9FWFBfU1RBUlQpIHtcbiAgICAgIHRoaXMuZXJyb3JzLnB1c2goSHRtbFRyZWVFcnJvci5jcmVhdGUobnVsbCwgdGhpcy5wZWVrLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBJbnZhbGlkIGV4cGFuc2lvbiBmb3JtLiBNaXNzaW5nICd7Jy4sYCkpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gcmVhZCB1bnRpbCB9XG4gICAgbGV0IHN0YXJ0ID0gdGhpcy5fYWR2YW5jZSgpO1xuXG4gICAgbGV0IGV4cCA9IHRoaXMuX2NvbGxlY3RFeHBhbnNpb25FeHBUb2tlbnMoc3RhcnQpO1xuICAgIGlmIChpc0JsYW5rKGV4cCkpIHJldHVybiBudWxsO1xuXG4gICAgbGV0IGVuZCA9IHRoaXMuX2FkdmFuY2UoKTtcbiAgICBleHAucHVzaChuZXcgSHRtbFRva2VuKEh0bWxUb2tlblR5cGUuRU9GLCBbXSwgZW5kLnNvdXJjZVNwYW4pKTtcblxuICAgIC8vIHBhcnNlIGV2ZXJ5dGhpbmcgaW4gYmV0d2VlbiB7IGFuZCB9XG4gICAgbGV0IHBhcnNlZEV4cCA9IG5ldyBUcmVlQnVpbGRlcihleHApLmJ1aWxkKCk7XG4gICAgaWYgKHBhcnNlZEV4cC5lcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5lcnJvcnMgPSB0aGlzLmVycm9ycy5jb25jYXQoPEh0bWxUcmVlRXJyb3JbXT5wYXJzZWRFeHAuZXJyb3JzKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCBzb3VyY2VTcGFuID0gbmV3IFBhcnNlU291cmNlU3Bhbih2YWx1ZS5zb3VyY2VTcGFuLnN0YXJ0LCBlbmQuc291cmNlU3Bhbi5lbmQpO1xuICAgIGxldCBleHBTb3VyY2VTcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihzdGFydC5zb3VyY2VTcGFuLnN0YXJ0LCBlbmQuc291cmNlU3Bhbi5lbmQpO1xuICAgIHJldHVybiBuZXcgSHRtbEV4cGFuc2lvbkNhc2VBc3QodmFsdWUucGFydHNbMF0sIHBhcnNlZEV4cC5yb290Tm9kZXMsIHNvdXJjZVNwYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5zb3VyY2VTcGFuLCBleHBTb3VyY2VTcGFuKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbGxlY3RFeHBhbnNpb25FeHBUb2tlbnMoc3RhcnQ6IEh0bWxUb2tlbik6IEh0bWxUb2tlbltdIHtcbiAgICBsZXQgZXhwID0gW107XG4gICAgbGV0IGV4cGFuc2lvbkZvcm1TdGFjayA9IFtIdG1sVG9rZW5UeXBlLkVYUEFOU0lPTl9DQVNFX0VYUF9TVEFSVF07XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLkVYUEFOU0lPTl9GT1JNX1NUQVJUIHx8XG4gICAgICAgICAgdGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuRVhQQU5TSU9OX0NBU0VfRVhQX1NUQVJUKSB7XG4gICAgICAgIGV4cGFuc2lvbkZvcm1TdGFjay5wdXNoKHRoaXMucGVlay50eXBlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLkVYUEFOU0lPTl9DQVNFX0VYUF9FTkQpIHtcbiAgICAgICAgaWYgKGxhc3RPblN0YWNrKGV4cGFuc2lvbkZvcm1TdGFjaywgSHRtbFRva2VuVHlwZS5FWFBBTlNJT05fQ0FTRV9FWFBfU1RBUlQpKSB7XG4gICAgICAgICAgZXhwYW5zaW9uRm9ybVN0YWNrLnBvcCgpO1xuICAgICAgICAgIGlmIChleHBhbnNpb25Gb3JtU3RhY2subGVuZ3RoID09IDApIHJldHVybiBleHA7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICAgICAgICBIdG1sVHJlZUVycm9yLmNyZWF0ZShudWxsLCBzdGFydC5zb3VyY2VTcGFuLCBgSW52YWxpZCBleHBhbnNpb24gZm9ybS4gTWlzc2luZyAnfScuYCkpO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnBlZWsudHlwZSA9PT0gSHRtbFRva2VuVHlwZS5FWFBBTlNJT05fRk9STV9FTkQpIHtcbiAgICAgICAgaWYgKGxhc3RPblN0YWNrKGV4cGFuc2lvbkZvcm1TdGFjaywgSHRtbFRva2VuVHlwZS5FWFBBTlNJT05fRk9STV9TVEFSVCkpIHtcbiAgICAgICAgICBleHBhbnNpb25Gb3JtU3RhY2sucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChcbiAgICAgICAgICAgICAgSHRtbFRyZWVFcnJvci5jcmVhdGUobnVsbCwgc3RhcnQuc291cmNlU3BhbiwgYEludmFsaWQgZXhwYW5zaW9uIGZvcm0uIE1pc3NpbmcgJ30nLmApKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuRU9GKSB7XG4gICAgICAgIHRoaXMuZXJyb3JzLnB1c2goXG4gICAgICAgICAgICBIdG1sVHJlZUVycm9yLmNyZWF0ZShudWxsLCBzdGFydC5zb3VyY2VTcGFuLCBgSW52YWxpZCBleHBhbnNpb24gZm9ybS4gTWlzc2luZyAnfScuYCkpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgZXhwLnB1c2godGhpcy5fYWR2YW5jZSgpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lVGV4dCh0b2tlbjogSHRtbFRva2VuKSB7XG4gICAgbGV0IHRleHQgPSB0b2tlbi5wYXJ0c1swXTtcbiAgICBpZiAodGV4dC5sZW5ndGggPiAwICYmIHRleHRbMF0gPT0gJ1xcbicpIHtcbiAgICAgIGxldCBwYXJlbnQgPSB0aGlzLl9nZXRQYXJlbnRFbGVtZW50KCk7XG4gICAgICBpZiAoaXNQcmVzZW50KHBhcmVudCkgJiYgcGFyZW50LmNoaWxkcmVuLmxlbmd0aCA9PSAwICYmXG4gICAgICAgICAgZ2V0SHRtbFRhZ0RlZmluaXRpb24ocGFyZW50Lm5hbWUpLmlnbm9yZUZpcnN0TGYpIHtcbiAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX2FkZFRvUGFyZW50KG5ldyBIdG1sVGV4dEFzdCh0ZXh0LCB0b2tlbi5zb3VyY2VTcGFuKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY2xvc2VWb2lkRWxlbWVudCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5lbGVtZW50U3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgbGV0IGVsID0gTGlzdFdyYXBwZXIubGFzdCh0aGlzLmVsZW1lbnRTdGFjayk7XG5cbiAgICAgIGlmIChnZXRIdG1sVGFnRGVmaW5pdGlvbihlbC5uYW1lKS5pc1ZvaWQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50U3RhY2sucG9wKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVN0YXJ0VGFnKHN0YXJ0VGFnVG9rZW46IEh0bWxUb2tlbikge1xuICAgIHZhciBwcmVmaXggPSBzdGFydFRhZ1Rva2VuLnBhcnRzWzBdO1xuICAgIHZhciBuYW1lID0gc3RhcnRUYWdUb2tlbi5wYXJ0c1sxXTtcbiAgICB2YXIgYXR0cnMgPSBbXTtcbiAgICB3aGlsZSAodGhpcy5wZWVrLnR5cGUgPT09IEh0bWxUb2tlblR5cGUuQVRUUl9OQU1FKSB7XG4gICAgICBhdHRycy5wdXNoKHRoaXMuX2NvbnN1bWVBdHRyKHRoaXMuX2FkdmFuY2UoKSkpO1xuICAgIH1cbiAgICB2YXIgZnVsbE5hbWUgPSBnZXRFbGVtZW50RnVsbE5hbWUocHJlZml4LCBuYW1lLCB0aGlzLl9nZXRQYXJlbnRFbGVtZW50KCkpO1xuICAgIHZhciBzZWxmQ2xvc2luZyA9IGZhbHNlO1xuICAgIC8vIE5vdGU6IFRoZXJlIGNvdWxkIGhhdmUgYmVlbiBhIHRva2VuaXplciBlcnJvclxuICAgIC8vIHNvIHRoYXQgd2UgZG9uJ3QgZ2V0IGEgdG9rZW4gZm9yIHRoZSBlbmQgdGFnLi4uXG4gICAgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLlRBR19PUEVOX0VORF9WT0lEKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBzZWxmQ2xvc2luZyA9IHRydWU7XG4gICAgICBpZiAoZ2V0TnNQcmVmaXgoZnVsbE5hbWUpID09IG51bGwgJiYgIWdldEh0bWxUYWdEZWZpbml0aW9uKGZ1bGxOYW1lKS5pc1ZvaWQpIHtcbiAgICAgICAgdGhpcy5lcnJvcnMucHVzaChIdG1sVHJlZUVycm9yLmNyZWF0ZShcbiAgICAgICAgICAgIGZ1bGxOYW1lLCBzdGFydFRhZ1Rva2VuLnNvdXJjZVNwYW4sXG4gICAgICAgICAgICBgT25seSB2b2lkIGFuZCBmb3JlaWduIGVsZW1lbnRzIGNhbiBiZSBzZWxmIGNsb3NlZCBcIiR7c3RhcnRUYWdUb2tlbi5wYXJ0c1sxXX1cImApKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLlRBR19PUEVOX0VORCkge1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgc2VsZkNsb3NpbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGVuZCA9IHRoaXMucGVlay5zb3VyY2VTcGFuLnN0YXJ0O1xuICAgIGxldCBzcGFuID0gbmV3IFBhcnNlU291cmNlU3BhbihzdGFydFRhZ1Rva2VuLnNvdXJjZVNwYW4uc3RhcnQsIGVuZCk7XG4gICAgdmFyIGVsID0gbmV3IEh0bWxFbGVtZW50QXN0KGZ1bGxOYW1lLCBhdHRycywgW10sIHNwYW4sIHNwYW4sIG51bGwpO1xuICAgIHRoaXMuX3B1c2hFbGVtZW50KGVsKTtcbiAgICBpZiAoc2VsZkNsb3NpbmcpIHtcbiAgICAgIHRoaXMuX3BvcEVsZW1lbnQoZnVsbE5hbWUpO1xuICAgICAgZWwuZW5kU291cmNlU3BhbiA9IHNwYW47XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcHVzaEVsZW1lbnQoZWw6IEh0bWxFbGVtZW50QXN0KSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudFN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBwYXJlbnRFbCA9IExpc3RXcmFwcGVyLmxhc3QodGhpcy5lbGVtZW50U3RhY2spO1xuICAgICAgaWYgKGdldEh0bWxUYWdEZWZpbml0aW9uKHBhcmVudEVsLm5hbWUpLmlzQ2xvc2VkQnlDaGlsZChlbC5uYW1lKSkge1xuICAgICAgICB0aGlzLmVsZW1lbnRTdGFjay5wb3AoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgdGFnRGVmID0gZ2V0SHRtbFRhZ0RlZmluaXRpb24oZWwubmFtZSk7XG4gICAgdmFyIHBhcmVudEVsID0gdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpO1xuICAgIGlmICh0YWdEZWYucmVxdWlyZUV4dHJhUGFyZW50KGlzUHJlc2VudChwYXJlbnRFbCkgPyBwYXJlbnRFbC5uYW1lIDogbnVsbCkpIHtcbiAgICAgIHZhciBuZXdQYXJlbnQgPSBuZXcgSHRtbEVsZW1lbnRBc3QodGFnRGVmLnBhcmVudFRvQWRkLCBbXSwgW2VsXSwgZWwuc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuc3RhcnRTb3VyY2VTcGFuLCBlbC5lbmRTb3VyY2VTcGFuKTtcbiAgICAgIHRoaXMuX2FkZFRvUGFyZW50KG5ld1BhcmVudCk7XG4gICAgICB0aGlzLmVsZW1lbnRTdGFjay5wdXNoKG5ld1BhcmVudCk7XG4gICAgICB0aGlzLmVsZW1lbnRTdGFjay5wdXNoKGVsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYWRkVG9QYXJlbnQoZWwpO1xuICAgICAgdGhpcy5lbGVtZW50U3RhY2sucHVzaChlbCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUVuZFRhZyhlbmRUYWdUb2tlbjogSHRtbFRva2VuKSB7XG4gICAgdmFyIGZ1bGxOYW1lID1cbiAgICAgICAgZ2V0RWxlbWVudEZ1bGxOYW1lKGVuZFRhZ1Rva2VuLnBhcnRzWzBdLCBlbmRUYWdUb2tlbi5wYXJ0c1sxXSwgdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpKTtcblxuICAgIHRoaXMuX2dldFBhcmVudEVsZW1lbnQoKS5lbmRTb3VyY2VTcGFuID0gZW5kVGFnVG9rZW4uc291cmNlU3BhbjtcblxuICAgIGlmIChnZXRIdG1sVGFnRGVmaW5pdGlvbihmdWxsTmFtZSkuaXNWb2lkKSB7XG4gICAgICB0aGlzLmVycm9ycy5wdXNoKFxuICAgICAgICAgIEh0bWxUcmVlRXJyb3IuY3JlYXRlKGZ1bGxOYW1lLCBlbmRUYWdUb2tlbi5zb3VyY2VTcGFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBWb2lkIGVsZW1lbnRzIGRvIG5vdCBoYXZlIGVuZCB0YWdzIFwiJHtlbmRUYWdUb2tlbi5wYXJ0c1sxXX1cImApKTtcbiAgICB9IGVsc2UgaWYgKCF0aGlzLl9wb3BFbGVtZW50KGZ1bGxOYW1lKSkge1xuICAgICAgdGhpcy5lcnJvcnMucHVzaChIdG1sVHJlZUVycm9yLmNyZWF0ZShmdWxsTmFtZSwgZW5kVGFnVG9rZW4uc291cmNlU3BhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgY2xvc2luZyB0YWcgXCIke2VuZFRhZ1Rva2VuLnBhcnRzWzFdfVwiYCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BvcEVsZW1lbnQoZnVsbE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGZvciAobGV0IHN0YWNrSW5kZXggPSB0aGlzLmVsZW1lbnRTdGFjay5sZW5ndGggLSAxOyBzdGFja0luZGV4ID49IDA7IHN0YWNrSW5kZXgtLSkge1xuICAgICAgbGV0IGVsID0gdGhpcy5lbGVtZW50U3RhY2tbc3RhY2tJbmRleF07XG4gICAgICBpZiAoZWwubmFtZSA9PSBmdWxsTmFtZSkge1xuICAgICAgICBMaXN0V3JhcHBlci5zcGxpY2UodGhpcy5lbGVtZW50U3RhY2ssIHN0YWNrSW5kZXgsIHRoaXMuZWxlbWVudFN0YWNrLmxlbmd0aCAtIHN0YWNrSW5kZXgpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFnZXRIdG1sVGFnRGVmaW5pdGlvbihlbC5uYW1lKS5jbG9zZWRCeVBhcmVudCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVBdHRyKGF0dHJOYW1lOiBIdG1sVG9rZW4pOiBIdG1sQXR0ckFzdCB7XG4gICAgdmFyIGZ1bGxOYW1lID0gbWVyZ2VOc0FuZE5hbWUoYXR0ck5hbWUucGFydHNbMF0sIGF0dHJOYW1lLnBhcnRzWzFdKTtcbiAgICB2YXIgZW5kID0gYXR0ck5hbWUuc291cmNlU3Bhbi5lbmQ7XG4gICAgdmFyIHZhbHVlID0gJyc7XG4gICAgaWYgKHRoaXMucGVlay50eXBlID09PSBIdG1sVG9rZW5UeXBlLkFUVFJfVkFMVUUpIHtcbiAgICAgIHZhciB2YWx1ZVRva2VuID0gdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgdmFsdWUgPSB2YWx1ZVRva2VuLnBhcnRzWzBdO1xuICAgICAgZW5kID0gdmFsdWVUb2tlbi5zb3VyY2VTcGFuLmVuZDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBIdG1sQXR0ckFzdChmdWxsTmFtZSwgdmFsdWUsIG5ldyBQYXJzZVNvdXJjZVNwYW4oYXR0ck5hbWUuc291cmNlU3Bhbi5zdGFydCwgZW5kKSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRQYXJlbnRFbGVtZW50KCk6IEh0bWxFbGVtZW50QXN0IHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50U3RhY2subGVuZ3RoID4gMCA/IExpc3RXcmFwcGVyLmxhc3QodGhpcy5lbGVtZW50U3RhY2spIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZFRvUGFyZW50KG5vZGU6IEh0bWxBc3QpIHtcbiAgICB2YXIgcGFyZW50ID0gdGhpcy5fZ2V0UGFyZW50RWxlbWVudCgpO1xuICAgIGlmIChpc1ByZXNlbnQocGFyZW50KSkge1xuICAgICAgcGFyZW50LmNoaWxkcmVuLnB1c2gobm9kZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucm9vdE5vZGVzLnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldEVsZW1lbnRGdWxsTmFtZShwcmVmaXg6IHN0cmluZywgbG9jYWxOYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudDogSHRtbEVsZW1lbnRBc3QpOiBzdHJpbmcge1xuICBpZiAoaXNCbGFuayhwcmVmaXgpKSB7XG4gICAgcHJlZml4ID0gZ2V0SHRtbFRhZ0RlZmluaXRpb24obG9jYWxOYW1lKS5pbXBsaWNpdE5hbWVzcGFjZVByZWZpeDtcbiAgICBpZiAoaXNCbGFuayhwcmVmaXgpICYmIGlzUHJlc2VudChwYXJlbnRFbGVtZW50KSkge1xuICAgICAgcHJlZml4ID0gZ2V0TnNQcmVmaXgocGFyZW50RWxlbWVudC5uYW1lKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWVyZ2VOc0FuZE5hbWUocHJlZml4LCBsb2NhbE5hbWUpO1xufVxuXG5mdW5jdGlvbiBsYXN0T25TdGFjayhzdGFjazogYW55W10sIGVsZW1lbnQ6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gc3RhY2subGVuZ3RoID4gMCAmJiBzdGFja1tzdGFjay5sZW5ndGggLSAxXSA9PT0gZWxlbWVudDtcbn1cbiJdfQ==