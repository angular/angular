import {KeyMetadataError} from './exceptions';
import {MapWrapper, Map} from 'facade/collection';
import {FIELD, int, isPresent} from 'facade/lang';

var _allKeys = MapWrapper.create();

export class Key {
  @FIELD('final token')
  @FIELD('final id:int')
  @FIELD('metadata:Object')
  constructor(token, id:int) {
    this.token = token;
    this.id = id;
    this.metadata = null;
  }

  static get(token):Key {
    if (token instanceof Key) return token;

    if (MapWrapper.contains(_allKeys, token)) {
      return MapWrapper.get(_allKeys, token);
    }

    var newKey = new Key(token, Key.numberOfKeys);
    MapWrapper.set(_allKeys, token, newKey);
    return newKey;
  }

  static setMetadata(key:Key, metadata):Key {
    if (isPresent(key.metadata) && key.metadata !== metadata) {
      throw new KeyMetadataError();
    }
    key.metadata = metadata;
    return key;
  }

  static clear() {
    _allKeys = MapWrapper.create();
  }

  static get numberOfKeys():int {
    return MapWrapper.size(_allKeys);
  }
}
