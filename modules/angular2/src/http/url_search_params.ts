import {isPresent, isBlank, StringWrapper} from 'angular2/src/facade/lang';
import {
  Map,
  MapWrapper,
  List,
  ListWrapper,
  isListLikeIterable
} from 'angular2/src/facade/collection';

function paramParser(rawParams: string): Map<string, List<string>> {
  var map: Map<string, List<string>> = new Map();
  var params: List<string> = StringWrapper.split(rawParams, new RegExp('&'));
  ListWrapper.forEach(params, (param: string) => {
    var split: List<string> = StringWrapper.split(param, new RegExp('='));
    var key = ListWrapper.get(split, 0);
    var val = ListWrapper.get(split, 1);
    var list = isPresent(map.get(key)) ? map.get(key) : [];
    list.push(val);
    map.set(key, list);
  });
  return map;
}

/**
 * Map-like representation of url search parameters, based on
 * [URLSearchParams](https://url.spec.whatwg.org/#urlsearchparams) in the url living standard.
 *
 */
export class URLSearchParams {
  paramsMap: Map<string, List<string>>;
  constructor(public rawParams: string) { this.paramsMap = paramParser(rawParams); }

  has(param: string): boolean { return this.paramsMap.has(param); }

  get(param: string): string {
    var storedParam = this.paramsMap.get(param);
    if (isListLikeIterable(storedParam)) {
      return ListWrapper.first(storedParam);
    } else {
      return null;
    }
  }

  getAll(param: string): List<string> {
    var mapParam = this.paramsMap.get(param);
    return isPresent(mapParam) ? mapParam : [];
  }

  append(param: string, val: string): void {
    var mapParam = this.paramsMap.get(param);
    var list = isPresent(mapParam) ? mapParam : [];
    list.push(val);
    this.paramsMap.set(param, list);
  }

  toString(): string {
    var paramsList = [];
    MapWrapper.forEach(this.paramsMap, (values, k) => {
      ListWrapper.forEach(values, v => { paramsList.push(k + '=' + v); });
    });
    return ListWrapper.join(paramsList, '&');
  }

  delete (param: string): void { MapWrapper.delete(this.paramsMap, param); }
}
