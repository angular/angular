import {MapWrapper} from 'facade/collection';

var _allKeys = {};
var _id = 0;

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