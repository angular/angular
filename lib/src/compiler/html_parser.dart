library angular2.src.compiler.html_parser;

import "package:angular2/src/facade/lang.dart"
    show isPresent, StringWrapper, stringify, assertionsEnabled, StringJoiner;
import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;
import "html_ast.dart"
    show
        HtmlAst,
        HtmlAttrAst,
        HtmlTextAst,
        HtmlElementAst,
        HtmlAstVisitor,
        htmlVisitAll;
import "util.dart" show escapeDoubleQuoteString;
import "package:angular2/src/core/di.dart" show Injectable;

@Injectable()
class HtmlParser {
  List<HtmlAst> parse(String template, String sourceInfo) {
    var root = DOM.createTemplate(template);
    return parseChildNodes(root, sourceInfo);
  }

  String unparse(List<HtmlAst> nodes) {
    var visitor = new UnparseVisitor();
    var parts = [];
    htmlVisitAll(visitor, nodes, parts);
    return parts.join("");
  }
}

HtmlTextAst parseText(
    dynamic text, num indexInParent, String parentSourceInfo) {
  // TODO(tbosch): add source row/column source info from parse5 / package:html
  var value = DOM.getText(text);
  return new HtmlTextAst(value,
      '''${ parentSourceInfo} > #text(${ value}):nth-child(${ indexInParent})''');
}

HtmlAttrAst parseAttr(dynamic element, String parentSourceInfo, String attrName,
    String attrValue) {
  // TODO(tbosch): add source row/column source info from parse5 / package:html
  return new HtmlAttrAst(attrName, attrValue,
      '''${ parentSourceInfo}[${ attrName}=${ attrValue}]''');
}

HtmlElementAst parseElement(
    dynamic element, num indexInParent, String parentSourceInfo) {
  // normalize nodename always as lower case so that following build steps

  // can rely on this
  var nodeName = DOM.nodeName(element).toLowerCase();
  // TODO(tbosch): add source row/column source info from parse5 / package:html
  var sourceInfo =
      '''${ parentSourceInfo} > ${ nodeName}:nth-child(${ indexInParent})''';
  var attrs = parseAttrs(element, sourceInfo);
  var childNodes = parseChildNodes(element, sourceInfo);
  return new HtmlElementAst(nodeName, attrs, childNodes, sourceInfo);
}

List<HtmlAttrAst> parseAttrs(dynamic element, String elementSourceInfo) {
  // Note: sort the attributes early in the pipeline to get

  // consistent results throughout the pipeline, as attribute order is not defined

  // in DOM parsers!
  var attrMap = DOM.attributeMap(element);
  List<List<String>> attrList = [];
  attrMap.forEach((name, value) => attrList.add([name, value]));
  attrList
      .sort((entry1, entry2) => StringWrapper.compare(entry1[0], entry2[0]));
  return attrList
      .map((entry) => parseAttr(element, elementSourceInfo, entry[0], entry[1]))
      .toList();
}

List<HtmlAst> parseChildNodes(dynamic element, String parentSourceInfo) {
  var root = DOM.templateAwareRoot(element);
  var childNodes = DOM.childNodesAsList(root);
  var result = [];
  var index = 0;
  childNodes.forEach((childNode) {
    var childResult = null;
    if (DOM.isTextNode(childNode)) {
      var text = (childNode as dynamic);
      childResult = parseText(text, index, parentSourceInfo);
    } else if (DOM.isElementNode(childNode)) {
      var el = (childNode as dynamic);
      childResult = parseElement(el, index, parentSourceInfo);
    }
    if (isPresent(childResult)) {
      // Won't have a childResult for e.g. comment nodes
      result.add(childResult);
    }
    index++;
  });
  return result;
}

class UnparseVisitor implements HtmlAstVisitor {
  dynamic visitElement(HtmlElementAst ast, List<String> parts) {
    parts.add('''<${ ast . name}''');
    var attrs = [];
    htmlVisitAll(this, ast.attrs, attrs);
    if (ast.attrs.length > 0) {
      parts.add(" ");
      parts.add(attrs.join(" "));
    }
    parts.add('''>''');
    htmlVisitAll(this, ast.children, parts);
    parts.add('''</${ ast . name}>''');
    return null;
  }

  dynamic visitAttr(HtmlAttrAst ast, List<String> parts) {
    parts.add('''${ ast . name}=${ escapeDoubleQuoteString ( ast . value )}''');
    return null;
  }

  dynamic visitText(HtmlTextAst ast, List<String> parts) {
    parts.add(ast.value);
    return null;
  }
}
