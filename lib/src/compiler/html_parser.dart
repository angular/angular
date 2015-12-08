library angular2.src.compiler.html_parser;

import "package:angular2/src/facade/lang.dart"
    show
        isPresent,
        isBlank,
        StringWrapper,
        stringify,
        assertionsEnabled,
        StringJoiner,
        serializeEnum;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "html_ast.dart" show HtmlAst, HtmlAttrAst, HtmlTextAst, HtmlElementAst;
import "package:angular2/src/core/di.dart" show Injectable;
import "html_lexer.dart" show HtmlToken, HtmlTokenType, tokenizeHtml;
import "parse_util.dart" show ParseError, ParseLocation, ParseSourceSpan;
import "html_tags.dart"
    show HtmlTagDefinition, getHtmlTagDefinition, getHtmlTagNamespacePrefix;

class HtmlTreeError extends ParseError {
  String elementName;
  static HtmlTreeError create(
      String elementName, ParseLocation location, String msg) {
    return new HtmlTreeError(elementName, location, msg);
  }

  HtmlTreeError(this.elementName, ParseLocation location, String msg)
      : super(location, msg) {
    /* super call moved to initializer */;
  }
}

class HtmlParseTreeResult {
  List<HtmlAst> rootNodes;
  List<ParseError> errors;
  HtmlParseTreeResult(this.rootNodes, this.errors) {}
}

@Injectable()
class HtmlParser {
  HtmlParseTreeResult parse(String sourceContent, String sourceUrl) {
    var tokensAndErrors = tokenizeHtml(sourceContent, sourceUrl);
    var treeAndErrors = new TreeBuilder(tokensAndErrors.tokens).build();
    return new HtmlParseTreeResult(
        treeAndErrors.rootNodes,
        (new List.from(((tokensAndErrors.errors as List<ParseError>)))
          ..addAll(treeAndErrors.errors)));
  }
}

class TreeBuilder {
  List<HtmlToken> tokens;
  num index = -1;
  HtmlToken peek;
  List<HtmlAst> rootNodes = [];
  List<HtmlTreeError> errors = [];
  List<HtmlElementAst> elementStack = [];
  TreeBuilder(this.tokens) {
    this._advance();
  }
  HtmlParseTreeResult build() {
    while (!identical(this.peek.type, HtmlTokenType.EOF)) {
      if (identical(this.peek.type, HtmlTokenType.TAG_OPEN_START)) {
        this._consumeStartTag(this._advance());
      } else if (identical(this.peek.type, HtmlTokenType.TAG_CLOSE)) {
        this._consumeEndTag(this._advance());
      } else if (identical(this.peek.type, HtmlTokenType.CDATA_START)) {
        this._closeVoidElement();
        this._consumeCdata(this._advance());
      } else if (identical(this.peek.type, HtmlTokenType.COMMENT_START)) {
        this._closeVoidElement();
        this._consumeComment(this._advance());
      } else if (identical(this.peek.type, HtmlTokenType.TEXT) ||
          identical(this.peek.type, HtmlTokenType.RAW_TEXT) ||
          identical(this.peek.type, HtmlTokenType.ESCAPABLE_RAW_TEXT)) {
        this._closeVoidElement();
        this._consumeText(this._advance());
      } else {
        // Skip all other tokens...
        this._advance();
      }
    }
    return new HtmlParseTreeResult(this.rootNodes, this.errors);
  }

  HtmlToken _advance() {
    var prev = this.peek;
    if (this.index < this.tokens.length - 1) {
      // Note: there is always an EOF token at the end
      this.index++;
    }
    this.peek = this.tokens[this.index];
    return prev;
  }

  HtmlToken _advanceIf(HtmlTokenType type) {
    if (identical(this.peek.type, type)) {
      return this._advance();
    }
    return null;
  }

  _consumeCdata(HtmlToken startToken) {
    this._consumeText(this._advance());
    this._advanceIf(HtmlTokenType.CDATA_END);
  }

  _consumeComment(HtmlToken startToken) {
    this._advanceIf(HtmlTokenType.RAW_TEXT);
    this._advanceIf(HtmlTokenType.COMMENT_END);
  }

  _consumeText(HtmlToken token) {
    var text = token.parts[0];
    if (text.length > 0 && text[0] == "\n") {
      var parent = this._getParentElement();
      if (isPresent(parent) &&
          parent.children.length == 0 &&
          getHtmlTagDefinition(parent.name).ignoreFirstLf) {
        text = text.substring(1);
      }
    }
    if (text.length > 0) {
      this._addToParent(new HtmlTextAst(text, token.sourceSpan));
    }
  }

  void _closeVoidElement() {
    if (this.elementStack.length > 0) {
      var el = ListWrapper.last(this.elementStack);
      if (getHtmlTagDefinition(el.name).isVoid) {
        this.elementStack.removeLast();
      }
    }
  }

  _consumeStartTag(HtmlToken startTagToken) {
    var prefix = startTagToken.parts[0];
    var name = startTagToken.parts[1];
    var attrs = [];
    while (identical(this.peek.type, HtmlTokenType.ATTR_NAME)) {
      attrs.add(this._consumeAttr(this._advance()));
    }
    var fullName = getElementFullName(prefix, name, this._getParentElement());
    var selfClosing = false;
    // Note: There could have been a tokenizer error

    // so that we don't get a token for the end tag...
    if (identical(this.peek.type, HtmlTokenType.TAG_OPEN_END_VOID)) {
      this._advance();
      selfClosing = true;
      if (getHtmlTagNamespacePrefix(fullName) == null &&
          !getHtmlTagDefinition(fullName).isVoid) {
        this.errors.add(HtmlTreeError.create(
            fullName,
            startTagToken.sourceSpan.start,
            '''Only void and foreign elements can be self closed "${ startTagToken . parts [ 1 ]}"'''));
      }
    } else if (identical(this.peek.type, HtmlTokenType.TAG_OPEN_END)) {
      this._advance();
      selfClosing = false;
    }
    var end = this.peek.sourceSpan.start;
    var el = new HtmlElementAst(fullName, attrs, [],
        new ParseSourceSpan(startTagToken.sourceSpan.start, end));
    this._pushElement(el);
    if (selfClosing) {
      this._popElement(fullName);
    }
  }

  _pushElement(HtmlElementAst el) {
    if (this.elementStack.length > 0) {
      var parentEl = ListWrapper.last(this.elementStack);
      if (getHtmlTagDefinition(parentEl.name).isClosedByChild(el.name)) {
        this.elementStack.removeLast();
      }
    }
    var tagDef = getHtmlTagDefinition(el.name);
    var parentEl = this._getParentElement();
    if (tagDef.requireExtraParent(isPresent(parentEl) ? parentEl.name : null)) {
      var newParent =
          new HtmlElementAst(tagDef.parentToAdd, [], [el], el.sourceSpan);
      this._addToParent(newParent);
      this.elementStack.add(newParent);
      this.elementStack.add(el);
    } else {
      this._addToParent(el);
      this.elementStack.add(el);
    }
  }

  _consumeEndTag(HtmlToken endTagToken) {
    var fullName = getElementFullName(
        endTagToken.parts[0], endTagToken.parts[1], this._getParentElement());
    if (getHtmlTagDefinition(fullName).isVoid) {
      this.errors.add(HtmlTreeError.create(
          fullName,
          endTagToken.sourceSpan.start,
          '''Void elements do not have end tags "${ endTagToken . parts [ 1 ]}"'''));
    } else if (!this._popElement(fullName)) {
      this.errors.add(HtmlTreeError.create(
          fullName,
          endTagToken.sourceSpan.start,
          '''Unexpected closing tag "${ endTagToken . parts [ 1 ]}"'''));
    }
  }

  bool _popElement(String fullName) {
    for (var stackIndex = this.elementStack.length - 1;
        stackIndex >= 0;
        stackIndex--) {
      var el = this.elementStack[stackIndex];
      if (el.name.toLowerCase() == fullName.toLowerCase()) {
        ListWrapper.splice(this.elementStack, stackIndex,
            this.elementStack.length - stackIndex);
        return true;
      }
      if (!getHtmlTagDefinition(el.name).closedByParent) {
        return false;
      }
    }
    return false;
  }

  HtmlAttrAst _consumeAttr(HtmlToken attrName) {
    var fullName = mergeNsAndName(attrName.parts[0], attrName.parts[1]);
    var end = attrName.sourceSpan.end;
    var value = "";
    if (identical(this.peek.type, HtmlTokenType.ATTR_VALUE)) {
      var valueToken = this._advance();
      value = valueToken.parts[0];
      end = valueToken.sourceSpan.end;
    }
    return new HtmlAttrAst(
        fullName, value, new ParseSourceSpan(attrName.sourceSpan.start, end));
  }

  HtmlElementAst _getParentElement() {
    return this.elementStack.length > 0
        ? ListWrapper.last(this.elementStack)
        : null;
  }

  _addToParent(HtmlAst node) {
    var parent = this._getParentElement();
    if (isPresent(parent)) {
      parent.children.add(node);
    } else {
      this.rootNodes.add(node);
    }
  }
}

String mergeNsAndName(String prefix, String localName) {
  return isPresent(prefix) ? '''@${ prefix}:${ localName}''' : localName;
}

String getElementFullName(
    String prefix, String localName, HtmlElementAst parentElement) {
  if (isBlank(prefix)) {
    prefix = getHtmlTagDefinition(localName).implicitNamespacePrefix;
    if (isBlank(prefix) && isPresent(parentElement)) {
      prefix = getHtmlTagNamespacePrefix(parentElement.name);
    }
  }
  return mergeNsAndName(prefix, localName);
}
