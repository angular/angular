import {KeyMetadataError} from './exceptions';
import {MapWrapper, Map} from 'angular2/src/facade/collection';
import {int, isPresent} from 'angular2/src/facade/lang';

export class Key {
  token;
  id:int;
  metadata:any;
  constructor(token, id:int) {
    this.token = token;
    this.id = id;
    this.metadata = null;
  }

  static setMetadata(key:Key, metadata):Key {
    if (isPresent(key.metadata) && key.metadata !== metadata) {
      throw new KeyMetadataError();
    }
    key.metadata = metadata;
    return key;
  }

  static get(token):Key {
    return _globalKeyRegistry.get(token);
  }

  static get numberOfKeys():int {
    return _globalKeyRegistry.numberOfKeys;
  }
}

export class KeyRegistry {
  _allKeys:Map;
  constructor() {
    this._allKeys = MapWrapper.create();
  }

  get(token):Key {
    if (token instanceof Key) return token;

    if (MapWrapper.contains(this._allKeys, token)) {
      return MapWrapper.get(this._allKeys, token);
    }

    var newKey = new Key(token, Key.numberOfKeys);
    MapWrapper.set(this._allKeys, token, newKey);
    return newKey;
  }

  get numberOfKeys():int {
    return MapWrapper.size(this._allKeys);
  }
}

var _globalKeyRegistry = new KeyRegistry();
