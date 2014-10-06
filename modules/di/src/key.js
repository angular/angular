import {MapWrapper} from 'facade/collection';

var _allKeys = {};
var _id = 0;

//TODO: vsavkin: move to binding once cyclic deps are supported
export class Dependency {
  constructor(key:Key, asFuture, lazy){
    this.key = key;
    this.asFuture = asFuture;
    this.lazy = lazy;
  }
}

export class Key {
  constructor(token, id) {
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