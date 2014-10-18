import {MapWrapper, Map} from 'facade/collection';
import {FIELD, int, isPresent} from 'facade/lang';

var _allKeys = MapWrapper.create();
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

    if (MapWrapper.contains(_allKeys, token)) {
      return MapWrapper.get(_allKeys, token);
    }

    var newKey = new Key(token, ++_id);
    MapWrapper.set(_allKeys, token, newKey);
    return newKey;
  }

  static numberOfKeys() {
    return _id;
  }
}
