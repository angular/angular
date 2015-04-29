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

// (@jeffbcross): This is implemented mostly to spec, except that the entries method has been
// removed because it doesn't exist in dart, and it doesn't seem worth adding it to the facade.

export class Headers {
  _headersMap: Map<string, List<string>>;
  constructor(headers?: Headers | Object) {
    if (isBlank(headers)) {
      this._headersMap = MapWrapper.create();
      return;
    }

    if (isPresent((<Headers>headers)._headersMap)) {
      this._headersMap = (<Headers>headers)._headersMap;
    } else if (isJsObject(headers)) {
      this._headersMap = MapWrapper.createFromStringMap(headers);
      MapWrapper.forEach(this._headersMap, (v, k) => {
        if (!isListLikeIterable(v)) {
          var list = ListWrapper.create();
          ListWrapper.push(list, v);
          MapWrapper.set(this._headersMap, k, list);
        }
      });
    }
  }

  append(name: string, value: string): void {
    var list = MapWrapper.get(this._headersMap, name) || ListWrapper.create();
    ListWrapper.push(list, value);
    MapWrapper.set(this._headersMap, name, list);
  }

  delete (name: string): void { MapWrapper.delete(this._headersMap, name); }

  forEach(fn: Function) { return MapWrapper.forEach(this._headersMap, fn); }

  get(header: string): string {
    return ListWrapper.first(MapWrapper.get(this._headersMap, header));
  }

  has(header: string) { return MapWrapper.contains(this._headersMap, header); }

  keys() { return MapWrapper.keys(this._headersMap); }

  // TODO: this implementation seems wrong. create list then check if it's iterable?
  set(header: string, value: string | List<string>): void {
    var list = ListWrapper.create();
    if (!isListLikeIterable(value)) {
      ListWrapper.push(list, value);
    } else {
      ListWrapper.push(list, ListWrapper.toString((<List<string>>value)));
    }

    MapWrapper.set(this._headersMap, header, list);
  }

  values() { return MapWrapper.values(this._headersMap); }

  getAll(header: string): Array<string> {
    return MapWrapper.get(this._headersMap, header) || ListWrapper.create();
  }

  entries() { throw new BaseException('"entries" method is not implemented on Headers class'); }
}
