import {
  isPresent,
  isBlank,
  isJsObject,
  isType,
  StringWrapper,
  BaseException
} from 'angular2/src/facade/lang';
import {
  isListLikeIterable,
  List,
  Map,
  MapWrapper,
  ListWrapper
} from 'angular2/src/facade/collection';

/**
 * Polyfill for [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers), as
 * specified in the [Fetch Spec](https://fetch.spec.whatwg.org/#headers-class). The only known
 * difference from the spec is the lack of an `entries` method.
 */
export class Headers {
  _headersMap: Map<string, List<string>>;
  constructor(headers?: Headers | Object) {
    if (isBlank(headers)) {
      this._headersMap = new Map();
      return;
    }

    if (isPresent((<Headers>headers)._headersMap)) {
      this._headersMap = (<Headers>headers)._headersMap;
    } else if (isJsObject(headers)) {
      this._headersMap = MapWrapper.createFromStringMap(headers);
      MapWrapper.forEach(this._headersMap, (v, k) => {
        if (!isListLikeIterable(v)) {
          var list = [];
          list.push(v);
          this._headersMap.set(k, list);
        }
      });
    }
  }

  append(name: string, value: string): void {
    var list = this._headersMap.get(name) || [];
    list.push(value);
    this._headersMap.set(name, list);
  }

  delete (name: string): void { MapWrapper.delete(this._headersMap, name); }

  forEach(fn: Function) { return MapWrapper.forEach(this._headersMap, fn); }

  get(header: string): string { return ListWrapper.first(this._headersMap.get(header)); }

  has(header: string) { return this._headersMap.has(header); }

  keys() { return MapWrapper.keys(this._headersMap); }

  // TODO: this implementation seems wrong. create list then check if it's iterable?
  set(header: string, value: string | List<string>): void {
    var list = [];
    if (!isListLikeIterable(value)) {
      list.push(value);
    } else {
      list.push(ListWrapper.toString((<List<string>>value)));
    }

    this._headersMap.set(header, list);
  }

  values() { return MapWrapper.values(this._headersMap); }

  getAll(header: string): Array<string> { return this._headersMap.get(header) || []; }

  entries() { throw new BaseException('"entries" method is not implemented on Headers class'); }
}
