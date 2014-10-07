import {MapWrapper} from 'facade/collection';
import {FIELD, int, bool} from 'facade/lang';

var _allKeys = {};
var _id:int = 0;

//TODO: vsavkin: move to binding once cyclic deps are supported
@FIELD('final key:Key')
@FIELD('final asFuture:bool')
@FIELD('final lazy:bool')
export class Dependency {
  constructor(key:Key, asFuture:bool, lazy:bool) {
    this.key = key;
    this.asFuture = asFuture;
    this.lazy = lazy;
  }
}

@FIELD('final token')
@FIELD('final id:int')
export class Key {
  constructor(token, id:int) {
    this.token = token;
    this.id = id;
  }

  static get(token) {
    if (MapWrapper.contains(_allKeys, token)) {
      return MapWrapper.get(_allKeys, token)
    }

    var newKey = new Key(token, ++_id);
    MapWrapper.set(_allKeys, token, newKey);
    return newKey;
  }

  static numberOfKeys() {
    return _id;
  }
}