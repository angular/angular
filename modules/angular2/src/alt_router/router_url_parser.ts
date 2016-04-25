import {UrlSegment, Tree, TreeNode} from './segments';
import {BaseException} from 'angular2/src/facade/exceptions';
import {isBlank, isPresent, RegExpWrapper} from 'angular2/src/facade/lang';
import {DEFAULT_OUTLET_NAME} from './constants';

export abstract class RouterUrlParser { abstract parse(url: string): Tree<UrlSegment>; }

export class DefaultRouterUrlParser extends RouterUrlParser {
  parse(url: string): Tree<UrlSegment> {
    if (url.length === 0) {
      throw new BaseException(`Invalid url '${url}'`);
    }
    let root = new _UrlParser().parse(url);
    return new Tree<UrlSegment>(root);
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
      return new TreeNode<UrlSegment>(new UrlSegment('', {}, DEFAULT_OUTLET_NAME), []);
    } else {
      return this.parseRoot();
    }
  }

  parseRoot(): TreeNode<UrlSegment> {
    let segments = this.parseSegments(DEFAULT_OUTLET_NAME);
    let queryParams = this.peekStartsWith('?') ? this.parseQueryParams() : {};
    return new TreeNode<UrlSegment>(new UrlSegment('', queryParams, DEFAULT_OUTLET_NAME), segments);
  }

  parseSegments(outletName: string): TreeNode<UrlSegment>[] {
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

    var matrixParams: {[key: string]: any} = {};
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
      children = this.parseSegments(DEFAULT_OUTLET_NAME);
    }

    let segment = new UrlSegment(path, matrixParams, outletName);
    let node = new TreeNode<UrlSegment>(segment, children);
    return [node].concat(aux);
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
