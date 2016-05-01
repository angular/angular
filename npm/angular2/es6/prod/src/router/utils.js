import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
export class TouchMap {
    constructor(map) {
        this.map = {};
        this.keys = {};
        if (isPresent(map)) {
            StringMapWrapper.forEach(map, (value, key) => {
                this.map[key] = isPresent(value) ? value.toString() : null;
                this.keys[key] = true;
            });
        }
    }
    get(key) {
        StringMapWrapper.delete(this.keys, key);
        return this.map[key];
    }
    getUnused() {
        var unused = {};
        var keys = StringMapWrapper.keys(this.keys);
        keys.forEach(key => unused[key] = StringMapWrapper.get(this.map, key));
        return unused;
    }
}
export function normalizeString(obj) {
    if (isBlank(obj)) {
        return null;
    }
    else {
        return obj.toString();
    }
}
