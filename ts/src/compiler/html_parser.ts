import {
  isPresent,
  StringWrapper,
  stringify,
  assertionsEnabled,
  StringJoiner
} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/core/dom/dom_adapter';

import {
  HtmlAst,
  HtmlAttrAst,
  HtmlTextAst,
  HtmlElementAst,
  HtmlAstVisitor,
  htmlVisitAll
} from './html_ast';

import {escapeDoubleQuoteString} from './util';
import {Injectable} from 'angular2/src/core/di';

@Injectable()
export class HtmlParser {
  parse(template: string, sourceInfo: string): HtmlAst[] {
    var root = DOM.createTemplate(template);
    return parseChildNodes(root, sourceInfo);
  }
  unparse(nodes: HtmlAst[]): string {
    var visitor = new UnparseVisitor();
    var parts = [];
    htmlVisitAll(visitor, nodes, parts);
    return parts.join('');
  }
}

function parseText(text: Text, indexInParent: number, parentSourceInfo: string): HtmlTextAst {
  // TODO(tbosch): add source row/column source info from parse5 / package:html
  var value = DOM.getText(text);
  return new HtmlTextAst(value,
                         `${parentSourceInfo} > #text(${value}):nth-child(${indexInParent})`);
}

function parseAttr(element: Element, parentSourceInfo: string, attrName: string,
                   attrValue: string): HtmlAttrAst {
  // TODO(tbosch): add source row/column source info from parse5 / package:html
  return new HtmlAttrAst(attrName, attrValue, `${parentSourceInfo}[${attrName}=${attrValue}]`);
}

function parseElement(element: Element, indexInParent: number,
                      parentSourceInfo: string): HtmlElementAst {
  // normalize nodename always as lower case so that following build steps
  // can rely on this
  var nodeName = DOM.nodeName(element).toLowerCase();
  // TODO(tbosch): add source row/column source info from parse5 / package:html
  var sourceInfo = `${parentSourceInfo} > ${nodeName}:nth-child(${indexInParent})`;
  var attrs = parseAttrs(element, sourceInfo);

  var childNodes = parseChildNodes(element, sourceInfo);
  return new HtmlElementAst(nodeName, attrs, childNodes, sourceInfo);
}

function parseAttrs(element: Element, elementSourceInfo: string): HtmlAttrAst[] {
  // Note: sort the attributes early in the pipeline to get
  // consistent results throughout the pipeline, as attribute order is not defined
  // in DOM parsers!
  var attrMap = DOM.attributeMap(element);
  var attrList: string[][] = [];
  attrMap.forEach((value, name) => attrList.push([name, value]));
  attrList.sort((entry1, entry2) => StringWrapper.compare(entry1[0], entry2[0]));
  return attrList.map(entry => parseAttr(element, elementSourceInfo, entry[0], entry[1]));
}

function parseChildNodes(element: Element, parentSourceInfo: string): HtmlAst[] {
  var root = DOM.templateAwareRoot(element);
  var childNodes = DOM.childNodesAsList(root);
  var result = [];
  var index = 0;
  childNodes.forEach(childNode => {
    var childResult = null;
    if (DOM.isTextNode(childNode)) {
      var text = <Text>childNode;
      childResult = parseText(text, index, parentSourceInfo);
    } else if (DOM.isElementNode(childNode)) {
      var el = <Element>childNode;
      childResult = parseElement(el, index, parentSourceInfo);
    }
    if (isPresent(childResult)) {
      // Won't have a childResult for e.g. comment nodes
      result.push(childResult);
    }
    index++;
  });
  return result;
}

class UnparseVisitor implements HtmlAstVisitor {
  visitElement(ast: HtmlElementAst, parts: string[]): any {
    parts.push(`<${ast.name}`);
    var attrs = [];
    htmlVisitAll(this, ast.attrs, attrs);
    if (ast.attrs.length > 0) {
      parts.push(' ');
      parts.push(attrs.join(' '));
    }
    parts.push(`>`);
    htmlVisitAll(this, ast.children, parts);
    parts.push(`</${ast.name}>`);
    return null;
  }
  visitAttr(ast: HtmlAttrAst, parts: string[]): any {
    parts.push(`${ast.name}=${escapeDoubleQuoteString(ast.value)}`);
    return null;
  }
  visitText(ast: HtmlTextAst, parts: string[]): any {
    parts.push(ast.value);
    return null;
  }
}
