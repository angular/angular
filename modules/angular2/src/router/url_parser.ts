import {StringMapWrapper} from 'angular2/src/core/facade/collection';
import {
  isPresent,
  isBlank,
  StringWrapper,
  RegExpWrapper,
  CONST_EXPR
} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';

/**
 * This class represents a parsed URL
 */
export class Url {
  constructor(public path: string, public child: Url = null,
              public auxiliary: Url[] = CONST_EXPR([]),
              public params: {[key: string]: any} = null) {}

  toString(): string {
    return this.path + this._matrixParamsToString() + this._auxToString() + this._childString();
  }

  segmentToString(): string { return this.path + this._matrixParamsToString(); }

  /** @internal */
  _auxToString(): string {
    return this.auxiliary.length > 0 ?
               ('(' + this.auxiliary.map(sibling => sibling.toString()).join('//') + ')') :
               '';
  }

  private _matrixParamsToString(): string {
    if (isBlank(this.params)) {
      return '';
    }

    return ';' + serializeParams(this.params).join(';');
  }

  /** @internal */
  _childString(): string { return isPresent(this.child) ? ('/' + this.child.toString()) : ''; }
}

export class RootUrl extends Url {
  constructor(path: string, child: Url = null, auxiliary: Url[] = CONST_EXPR([]),
              params: {[key: string]: any} = null) {
    super(path, child, auxiliary, params);
  }

  toString(): string {
    return this.path + this._auxToString() + this._childString() + this._queryParamsToString();
  }

  segmentToString(): string { return this.path + this._queryParamsToString(); }

  private _queryParamsToString(): string {
    if (isBlank(this.params)) {
      return '';
    }

    return '?' + serializeParams(this.params).join('&');
  }
}

export function pathSegmentsToUrl(pathSegments: string[]): Url {
  var url = new Url(pathSegments[pathSegments.length - 1]);
  for (var i = pathSegments.length - 2; i >= 0; i -= 1) {
    url = new Url(pathSegments[i], url);
  }
  return url;
}

var SEGMENT_RE = RegExpWrapper.create('^[^\\/\\(\\)\\?;=&#]+');
function matchUrlSegment(str: string): string {
  var match = RegExpWrapper.firstMatch(SEGMENT_RE, str);
  return isPresent(match) ? match[0] : '';
}

export class UrlParser {
  private _remaining: string;

  peekStartsWith(str: string): boolean { return StringWrapper.startsWith(this._remaining, str); }

  capture(str: string): void {
    if (!StringWrapper.startsWith(this._remaining, str)) {
      throw new BaseException(`Expected "${str}".`);
    }
    this._remaining = this._remaining.substring(str.length);
  }

  parse(url: string): Url {
    this._remaining = url;
    if (url == '' || url == '/') {
      return new Url('');
    }
    return this.parseRoot();
  }

  // segment + (aux segments) + (query params)
  parseRoot(): Url {
    if (this.peekStartsWith('/')) {
      this.capture('/');
    }
    var path = matchUrlSegment(this._remaining);
    this.capture(path);

    var aux = [];
    if (this.peekStartsWith('(')) {
      aux = this.parseAuxiliaryRoutes();
    }
    if (this.peekStartsWith(';')) {
      // TODO: should these params just be dropped?
      this.parseMatrixParams();
    }
    var child = null;
    if (this.peekStartsWith('/') && !this.peekStartsWith('//')) {
      this.capture('/');
      child = this.parseSegment();
    }
    var queryParams = null;
    if (this.peekStartsWith('?')) {
      queryParams = this.parseQueryParams();
    }
    return new RootUrl(path, child, aux, queryParams);
  }

  // segment + (matrix params) + (aux segments)
  parseSegment(): Url {
    if (this._remaining.length == 0) {
      return null;
    }
    if (this.peekStartsWith('/')) {
      this.capture('/');
    }
    var path = matchUrlSegment(this._remaining);
    this.capture(path);

    var matrixParams = null;
    if (this.peekStartsWith(';')) {
      matrixParams = this.parseMatrixParams();
    }
    var aux = [];
    if (this.peekStartsWith('(')) {
      aux = this.parseAuxiliaryRoutes();
    }
    var child = null;
    if (this.peekStartsWith('/') && !this.peekStartsWith('//')) {
      this.capture('/');
      child = this.parseSegment();
    }
    return new Url(path, child, aux, matrixParams);
  }

  parseQueryParams(): {[key: string]: any} {
    var params = {};
    this.capture('?');
    this.parseParam(params);
    while (this._remaining.length > 0 && this.peekStartsWith('&')) {
      this.capture('&');
      this.parseParam(params);
    }
    return params;
  }

  parseMatrixParams(): {[key: string]: any} {
    var params = {};
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
    var value: any = true;
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

  parseAuxiliaryRoutes(): Url[] {
    var routes = [];
    this.capture('(');

    while (!this.peekStartsWith(')') && this._remaining.length > 0) {
      routes.push(this.parseSegment());
      if (this.peekStartsWith('//')) {
        this.capture('//');
      }
    }
    this.capture(')');

    return routes;
  }
}

export var parser = new UrlParser();

export function serializeParams(paramMap: {[key: string]: any}): string[] {
  var params = [];
  if (isPresent(paramMap)) {
    StringMapWrapper.forEach(paramMap, (value, key) => {
      if (value == true) {
        params.push(key);
      } else {
        params.push(key + '=' + value);
      }
    });
  }
  return params;
}
