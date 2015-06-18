import {isPresent, isBlank, StringWrapper} from 'angular2/src/facade/lang';
import {Map, MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';

function paramParser(rawParams: string): Map<string, List<string>> {
  var map: Map<string, List<string>> = new Map();
  var params: List<string> = StringWrapper.split(rawParams, '&');
  ListWrapper.forEach(params, (param: string) => {
    var split: List<string> = StringWrapper.split(param, '=');
    var key = ListWrapper.get(split, 0);
    var val = ListWrapper.get(split, 1);
    var list = map.get(key) || [];
    list.push(val);
    map.set(key, list);
  });
  return map;
}

export class URLSearchParams {
  paramsMap: Map<string, List<string>>;
  constructor(public rawParams: string) { this.paramsMap = paramParser(rawParams); }

  has(param: string): boolean { return this.paramsMap.has(param); }

  get(param: string): string { return ListWrapper.first(this.paramsMap.get(param)); }

  getAll(param: string): List<string> { return this.paramsMap.get(param) || []; }

  append(param: string, val: string): void {
    var list = this.paramsMap.get(param) || [];
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

  delete (param): void { MapWrapper.delete(this.paramsMap, param); }
}
