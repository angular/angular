import {MapWrapper} from 'facade/collection';
import {FIELD, int, isPresent} from 'facade/lang';

var _allKeys = {};
var _id:int = 0;

export class Key {
  @FIELD('final token')
  @FIELD('final id:int')
  constructor(token, id:int) {
    this.token = token;
    this.id = id;
  }

  static get(token) {
    if (token instanceof Key) return token;

    var obj = MapWrapper.get(_allKeys, token);
    if (isPresent(obj)) return obj;

    var newKey = new Key(token, ++_id);
    MapWrapper.set(_allKeys, token, newKey);
    return newKey;
  }

  static numberOfKeys() {
    return _id;
  }
}
