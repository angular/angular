import {isPresent, isBlank, StringWrapper} from 'angular2/src/facade/lang';
import {Map, MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';

function paramParser(rawParams: string): Map<string, List<string>> {
  var map: Map<string, List<string>> = MapWrapper.create();
  var params: List<string> = StringWrapper.split(rawParams, '&');
  ListWrapper.forEach(params, (param: string) => {
    var split: List<string> = StringWrapper.split(param, '=');
    var key = ListWrapper.get(split, 0);
    var val = ListWrapper.get(split, 1);
    var list = MapWrapper.get(map, key) || ListWrapper.create();
    ListWrapper.push(list, val);
    MapWrapper.set(map, key, list);
  });
  return map;
}

export class URLSearchParams {
  paramsMap: Map<string, List<string>>;
  constructor(public rawParams: string) { this.paramsMap = paramParser(rawParams); }

  has(param: string): boolean { return MapWrapper.contains(this.paramsMap, param); }

  get(param: string): string { return ListWrapper.first(MapWrapper.get(this.paramsMap, param)); }

  getAll(param: string): List<string> {
    return MapWrapper.get(this.paramsMap, param) || ListWrapper.create();
  }

  append(param: string, val: string): void {
    var list = MapWrapper.get(this.paramsMap, param) || ListWrapper.create();
    ListWrapper.push(list, val);
    MapWrapper.set(this.paramsMap, param, list);
  }

  toString(): string {
    var paramsList = ListWrapper.create();
    MapWrapper.forEach(this.paramsMap, (values, k) => {
      ListWrapper.forEach(values, v => { ListWrapper.push(paramsList, k + '=' + v); });
    });
    return ListWrapper.join(paramsList, '&');
  }

  delete (param): void { MapWrapper.delete(this.paramsMap, param); }
}
