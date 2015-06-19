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
  ListWrapper,
  StringMap
} from 'angular2/src/facade/collection';

/**
 * Polyfill for [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers), as
 * specified in the [Fetch Spec](https://fetch.spec.whatwg.org/#headers-class). The only known
 * difference from the spec is the lack of an `entries` method.
 */
export class Headers {
  _headersMap: Map<string, List<string>>;
  constructor(headers?: Headers | StringMap<string, any>) {
    if (isBlank(headers)) {
      this._headersMap = new Map();
      return;
    }

    if (headers instanceof Headers) {
      this._headersMap = (<Headers>headers)._headersMap;
    } else if (headers instanceof StringMap) {
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
    var mapName = this._headersMap.get(name);
    var list = isListLikeIterable(mapName) ? mapName : [];
    list.push(value);
    this._headersMap.set(name, list);
  }

  delete (name: string): void { MapWrapper.delete(this._headersMap, name); }

  forEach(fn: Function) { MapWrapper.forEach(this._headersMap, fn); }

  get(header: string): string { return ListWrapper.first(this._headersMap.get(header)); }

  has(header: string): boolean { return this._headersMap.has(header); }

  keys(): List<string> { return MapWrapper.keys(this._headersMap); }

  set(header: string, value: string | List<string>): void {
    var list = [];
    var isDart = false;
    // Dart hack
    if (list.toString().length === 2) {
      isDart = true;
    }
    if (isListLikeIterable(value)) {
      var pushValue = (<List<string>>value).toString();
      if (isDart) pushValue = pushValue.substring(1, pushValue.length - 1);
      list.push(pushValue);
    } else {
      list.push(value);
    }

    this._headersMap.set(header, list);
  }

  values(): List<List<string>> { return MapWrapper.values(this._headersMap); }

  getAll(header: string): Array<string> {
    var headers = this._headersMap.get(header);
    return isListLikeIterable(headers) ? headers : [];
  }

  entries() { throw new BaseException('"entries" method is not implemented on Headers class'); }
}
