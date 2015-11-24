import { isJsObject, global, isPresent, isBlank, isArray, getSymbolIterator } from 'angular2/src/facade/lang';
export var Map = global.Map;
export var Set = global.Set;
// Safari and Internet Explorer do not support the iterable parameter to the
// Map constructor.  We work around that by manually adding the items.
var createMapFromPairs = (function () {
    try {
        if (new Map([[1, 2]]).size === 1) {
            return function createMapFromPairs(pairs) { return new Map(pairs); };
        }
    }
    catch (e) {
    }
    return function createMapAndPopulateFromPairs(pairs) {
        var map = new Map();
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            map.set(pair[0], pair[1]);
        }
        return map;
    };
})();
var createMapFromMap = (function () {
    try {
        if (new Map(new Map())) {
            return function createMapFromMap(m) { return new Map(m); };
        }
    }
    catch (e) {
    }
    return function createMapAndPopulateFromMap(m) {
        var map = new Map();
        m.forEach((v, k) => { map.set(k, v); });
        return map;
    };
})();
var _clearValues = (function () {
    if ((new Map()).keys().next) {
        return function _clearValues(m) {
            var keyIterator = m.keys();
            var k;
            while (!((k = keyIterator.next()).done)) {
                m.set(k.value, null);
            }
        };
    }
    else {
        return function _clearValuesWithForeEach(m) {
            m.forEach((v, k) => { m.set(k, null); });
        };
    }
})();
// Safari doesn't implement MapIterator.next(), which is used is Traceur's polyfill of Array.from
// TODO(mlaval): remove the work around once we have a working polyfill of Array.from
var _arrayFromMap = (function () {
    try {
        if ((new Map()).values().next) {
            return function createArrayFromMap(m, getValues) {
                return getValues ? Array.from(m.values()) : Array.from(m.keys());
            };
        }
    }
    catch (e) {
    }
    return function createArrayFromMapWithForeach(m, getValues) {
        var res = ListWrapper.createFixedSize(m.size), i = 0;
        m.forEach((v, k) => {
            res[i] = getValues ? v : k;
            i++;
        });
        return res;
    };
})();
export class MapWrapper {
    static clone(m) { return createMapFromMap(m); }
    static createFromStringMap(stringMap) {
        var result = new Map();
        for (var prop in stringMap) {
            result.set(prop, stringMap[prop]);
        }
        return result;
    }
    static toStringMap(m) {
        var r = {};
        m.forEach((v, k) => r[k] = v);
        return r;
    }
    static createFromPairs(pairs) { return createMapFromPairs(pairs); }
    static clearValues(m) { _clearValues(m); }
    static iterable(m) { return m; }
    static keys(m) { return _arrayFromMap(m, false); }
    static values(m) { return _arrayFromMap(m, true); }
}
/**
 * Wraps Javascript Objects
 */
export class StringMapWrapper {
    static create() {
        // Note: We are not using Object.create(null) here due to
        // performance!
        // http://jsperf.com/ng2-object-create-null
        return {};
    }
    static contains(map, key) {
        return map.hasOwnProperty(key);
    }
    static get(map, key) {
        return map.hasOwnProperty(key) ? map[key] : undefined;
    }
    static set(map, key, value) { map[key] = value; }
    static keys(map) { return Object.keys(map); }
    static isEmpty(map) {
        for (var prop in map) {
            return false;
        }
        return true;
    }
    static delete(map, key) { delete map[key]; }
    static forEach(map, callback) {
        for (var prop in map) {
            if (map.hasOwnProperty(prop)) {
                callback(map[prop], prop);
            }
        }
    }
    static merge(m1, m2) {
        var m = {};
        for (var attr in m1) {
            if (m1.hasOwnProperty(attr)) {
                m[attr] = m1[attr];
            }
        }
        for (var attr in m2) {
            if (m2.hasOwnProperty(attr)) {
                m[attr] = m2[attr];
            }
        }
        return m;
    }
    static equals(m1, m2) {
        var k1 = Object.keys(m1);
        var k2 = Object.keys(m2);
        if (k1.length != k2.length) {
            return false;
        }
        var key;
        for (var i = 0; i < k1.length; i++) {
            key = k1[i];
            if (m1[key] !== m2[key]) {
                return false;
            }
        }
        return true;
    }
}
export class ListWrapper {
    // JS has no way to express a statically fixed size list, but dart does so we
    // keep both methods.
    static createFixedSize(size) { return new Array(size); }
    static createGrowableSize(size) { return new Array(size); }
    static clone(array) { return array.slice(0); }
    static forEachWithIndex(array, fn) {
        for (var i = 0; i < array.length; i++) {
            fn(array[i], i);
        }
    }
    static first(array) {
        if (!array)
            return null;
        return array[0];
    }
    static last(array) {
        if (!array || array.length == 0)
            return null;
        return array[array.length - 1];
    }
    static indexOf(array, value, startIndex = 0) {
        return array.indexOf(value, startIndex);
    }
    static contains(list, el) { return list.indexOf(el) !== -1; }
    static reversed(array) {
        var a = ListWrapper.clone(array);
        return a.reverse();
    }
    static concat(a, b) { return a.concat(b); }
    static insert(list, index, value) { list.splice(index, 0, value); }
    static removeAt(list, index) {
        var res = list[index];
        list.splice(index, 1);
        return res;
    }
    static removeAll(list, items) {
        for (var i = 0; i < items.length; ++i) {
            var index = list.indexOf(items[i]);
            list.splice(index, 1);
        }
    }
    static remove(list, el) {
        var index = list.indexOf(el);
        if (index > -1) {
            list.splice(index, 1);
            return true;
        }
        return false;
    }
    static clear(list) { list.length = 0; }
    static isEmpty(list) { return list.length == 0; }
    static fill(list, value, start = 0, end = null) {
        list.fill(value, start, end === null ? list.length : end);
    }
    static equals(a, b) {
        if (a.length != b.length)
            return false;
        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i])
                return false;
        }
        return true;
    }
    static slice(l, from = 0, to = null) {
        return l.slice(from, to === null ? undefined : to);
    }
    static splice(l, from, length) { return l.splice(from, length); }
    static sort(l, compareFn) {
        if (isPresent(compareFn)) {
            l.sort(compareFn);
        }
        else {
            l.sort();
        }
    }
    static toString(l) { return l.toString(); }
    static toJSON(l) { return JSON.stringify(l); }
    static maximum(list, predicate) {
        if (list.length == 0) {
            return null;
        }
        var solution = null;
        var maxValue = -Infinity;
        for (var index = 0; index < list.length; index++) {
            var candidate = list[index];
            if (isBlank(candidate)) {
                continue;
            }
            var candidateValue = predicate(candidate);
            if (candidateValue > maxValue) {
                solution = candidate;
                maxValue = candidateValue;
            }
        }
        return solution;
    }
}
export function isListLikeIterable(obj) {
    if (!isJsObject(obj))
        return false;
    return isArray(obj) ||
        (!(obj instanceof Map) &&
            getSymbolIterator() in obj); // JS Iterable have a Symbol.iterator prop
}
export function iterateListLike(obj, fn) {
    if (isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
            fn(obj[i]);
        }
    }
    else {
        var iterator = obj[getSymbolIterator()]();
        var item;
        while (!((item = iterator.next()).done)) {
            fn(item.value);
        }
    }
}
// Safari and Internet Explorer do not support the iterable parameter to the
// Set constructor.  We work around that by manually adding the items.
var createSetFromList = (function () {
    var test = new Set([1, 2, 3]);
    if (test.size === 3) {
        return function createSetFromList(lst) { return new Set(lst); };
    }
    else {
        return function createSetAndPopulateFromList(lst) {
            var res = new Set(lst);
            if (res.size !== lst.length) {
                for (var i = 0; i < lst.length; i++) {
                    res.add(lst[i]);
                }
            }
            return res;
        };
    }
})();
export class SetWrapper {
    static createFromList(lst) { return createSetFromList(lst); }
    static has(s, key) { return s.has(key); }
    static delete(m, k) { m.delete(k); }
}
//# sourceMappingURL=collection.js.map