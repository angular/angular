import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';

export class TouchMap {
  map: {[key: string]: string} = {};
  keys: {[key: string]: boolean} = {};

  constructor(map: {[key: string]: any}) {
    if (isPresent(map)) {
      StringMapWrapper.forEach(map, (value, key) => {
        this.map[key] = isPresent(value) ? value.toString() : null;
        this.keys[key] = true;
      });
    }
  }

  get(key: string): string {
    StringMapWrapper.delete(this.keys, key);
    return this.map[key];
  }

  getUnused(): {[key: string]: any} {
    var unused: {[key: string]: any} = {};
    var keys = StringMapWrapper.keys(this.keys);
    keys.forEach(key => unused[key] = StringMapWrapper.get(this.map, key));
    return unused;
  }
}


export function normalizeString(obj: any): string {
  if (isBlank(obj)) {
    return null;
  } else {
    return obj.toString();
  }
}
