import {UrlSegment, Tree, TreeNode, rootNode} from './segments';
import {BaseException} from 'angular2/src/facade/exceptions';
import {isBlank, isPresent, RegExpWrapper} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';

export abstract class RouterUrlSerializer {
  abstract parse(url: string): Tree<UrlSegment>;
  abstract serialize(tree: Tree<UrlSegment>): string;
}

export class DefaultRouterUrlSerializer extends RouterUrlSerializer {
  parse(url: string): Tree<UrlSegment> {
    if (url.length === 0) {
      throw new BaseException(`Invalid url '${url}'`);
    }
    let root = new _UrlParser().parse(url);
    return new Tree<UrlSegment>(root);
  }

  serialize(tree: Tree<UrlSegment>): string { return _serializeUrlTreeNode(rootNode(tree)); }
}

function _serializeUrlTreeNode(node: TreeNode<UrlSegment>): string {
  return `${node.value}${_serializeChildren(node)}`;
}

function _serializeUrlTreeNodes(nodes: TreeNode<UrlSegment>[]): string {
  let main = nodes[0].value.toString();
  let auxNodes = nodes.slice(1);
  let aux = auxNodes.length > 0 ? `(${auxNodes.map(_serializeUrlTreeNode).join("//")})` : "";
  let children = _serializeChildren(nodes[0]);
  return `${main}${aux}${children}`;
}

function _serializeChildren(node: TreeNode<UrlSegment>): string {
  if (node.children.length > 0) {
    let slash = isBlank(node.children[0].value.segment) ? "" : "/";
    return `${slash}${_serializeUrlTreeNodes(node.children)}`;
  } else {
    return "";
  }
}

var SEGMENT_RE = RegExpWrapper.create('^[^\\/\\(\\)\\?;=&#]+');
function matchUrlSegment(str: string): string {
  var match = RegExpWrapper.firstMatch(SEGMENT_RE, str);
  return isPresent(match) ? match[0] : '';
}
var QUERY_PARAM_VALUE_RE = RegExpWrapper.create('^[^\\(\\)\\?;&#]+');
function matchUrlQueryParamValue(str: string): string {
  var match = RegExpWrapper.firstMatch(QUERY_PARAM_VALUE_RE, str);
  return isPresent(match) ? match[0] : '';
}

class _UrlParser {
  private _remaining: string;

  peekStartsWith(str: string): boolean { return this._remaining.startsWith(str); }

  capture(str: string): void {
    if (!this._remaining.startsWith(str)) {
      throw new BaseException(`Expected "${str}".`);
    }
    this._remaining = this._remaining.substring(str.length);
  }

  parse(url: string): TreeNode<UrlSegment> {
    this._remaining = url;
    if (url == '' || url == '/') {
      return new TreeNode<UrlSegment>(new UrlSegment('', {}, null), []);
    } else {
      return this.parseRoot();
    }
  }

  parseRoot(): TreeNode<UrlSegment> {
    let segments = this.parseSegments();
    let queryParams = this.peekStartsWith('?') ? this.parseQueryParams() : {};
    return new TreeNode<UrlSegment>(new UrlSegment('', queryParams, null), segments);
  }

  parseSegments(outletName: string = null): TreeNode<UrlSegment>[] {
    if (this._remaining.length == 0) {
      return [];
    }
    if (this.peekStartsWith('/')) {
      this.capture('/');
    }
    var path = matchUrlSegment(this._remaining);
    this.capture(path);


    if (path.indexOf(":") > -1) {
      let parts = path.split(":");
      outletName = parts[0];
      path = parts[1];
    }

    var matrixParams: {[key: string]: any} = null;
    if (this.peekStartsWith(';')) {
      matrixParams = this.parseMatrixParams();
    }

    var aux = [];
    if (this.peekStartsWith('(')) {
      aux = this.parseAuxiliaryRoutes();
    }

    var children: TreeNode<UrlSegment>[] = [];
    if (this.peekStartsWith('/') && !this.peekStartsWith('//')) {
      this.capture('/');
      children = this.parseSegments();
    }

    if (isPresent(matrixParams)) {
      let matrixParamsSegment = new UrlSegment(null, matrixParams, null);
      let matrixParamsNode = new TreeNode<UrlSegment>(matrixParamsSegment, children);
      let segment = new UrlSegment(path, null, outletName);
      return [new TreeNode<UrlSegment>(segment, [matrixParamsNode].concat(aux))];
    } else {
      let segment = new UrlSegment(path, null, outletName);
      let node = new TreeNode<UrlSegment>(segment, children);
      return [node].concat(aux);
    }
  }

  parseQueryParams(): {[key: string]: any} {
    var params: {[key: string]: any} = {};
    this.capture('?');
    this.parseQueryParam(params);
    while (this._remaining.length > 0 && this.peekStartsWith('&')) {
      this.capture('&');
      this.parseQueryParam(params);
    }
    return params;
  }

  parseMatrixParams(): {[key: string]: any} {
    var params: {[key: string]: any} = {};
    while (this._remaining.length > 0 && this.peekStartsWith(';')) {
      this.capture(';');
      this.parseParam(params);
    }
    return params;
  }

  parseParam(params: {[key: string]: any}): void {
    var key = matchUrlSegment(this._remaining);
    if (isBlank(key)) {
      return;
    }
    this.capture(key);
    var value: any = "true";
    if (this.peekStartsWith('=')) {
      this.capture('=');
      var valueMatch = matchUrlSegment(this._remaining);
      if (isPresent(valueMatch)) {
        value = valueMatch;
        this.capture(value);
      }
    }

    params[key] = value;
  }

  parseQueryParam(params: {[key: string]: any}): void {
    var key = matchUrlSegment(this._remaining);
    if (isBlank(key)) {
      return;
    }
    this.capture(key);
    var value: any = "true";
    if (this.peekStartsWith('=')) {
      this.capture('=');
      var valueMatch = matchUrlQueryParamValue(this._remaining);
      if (isPresent(valueMatch)) {
        value = valueMatch;
        this.capture(value);
      }
    }

    params[key] = value;
  }

  parseAuxiliaryRoutes(): TreeNode<UrlSegment>[] {
    var segments = [];
    this.capture('(');

    while (!this.peekStartsWith(')') && this._remaining.length > 0) {
      segments = segments.concat(this.parseSegments("aux"));
      if (this.peekStartsWith('//')) {
        this.capture('//');
      }
    }
    this.capture(')');

    return segments;
  }
}
