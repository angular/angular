import { Subject, Subscription } from "rxjs";

import "rxjs/operators";

function getGlobal() {
    const __globalThis = "undefined" !== typeof globalThis && globalThis;
    const __window = "undefined" !== typeof window && window;
    const __self = "undefined" !== typeof self && "undefined" !== typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && self;
    const __global = "undefined" !== typeof global && global;
    return __globalThis || __global || __window || __self;
}

const _global = getGlobal();

let _symbolIterator = null;

function getSymbolIterator() {
    if (!_symbolIterator) {
        const Symbol = _global["Symbol"];
        if (Symbol && Symbol.iterator) _symbolIterator = Symbol.iterator; else {
            const keys = Object.getOwnPropertyNames(Map.prototype);
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                if ("entries" !== key && "size" !== key && Map.prototype[key] === Map.prototype["entries"]) _symbolIterator = key;
            }
        }
    }
    return _symbolIterator;
}

if ("undefined" === typeof ngI18nClosureMode) _global["ngI18nClosureMode"] = "undefined" !== typeof goog && "function" === typeof goog.getMsg;

function flatten(list, dst) {
    if (void 0 === dst) dst = list;
    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        if (Array.isArray(item)) {
            if (dst === list) dst = list.slice(0, i);
            flatten(item, dst);
        } else if (dst !== list) dst.push(item);
    }
    return dst;
}

class EventEmitter extends Subject {
    constructor(isAsync = false) {
        super();
        this.__isAsync = isAsync;
    }
    emit(value) {
        super.next(value);
    }
    subscribe(generatorOrNext, error, complete) {
        let schedulerFn;
        let errorFn = err => null;
        let completeFn = () => null;
        if (generatorOrNext && "object" === typeof generatorOrNext) {
            schedulerFn = this.__isAsync ? value => {
                setTimeout(() => generatorOrNext.next(value));
            } : value => {
                generatorOrNext.next(value);
            };
            if (generatorOrNext.error) errorFn = this.__isAsync ? err => {
                setTimeout(() => generatorOrNext.error(err));
            } : err => {
                generatorOrNext.error(err);
            };
            if (generatorOrNext.complete) completeFn = this.__isAsync ? () => {
                setTimeout(() => generatorOrNext.complete());
            } : () => {
                generatorOrNext.complete();
            };
        } else {
            schedulerFn = this.__isAsync ? value => {
                setTimeout(() => generatorOrNext(value));
            } : value => {
                generatorOrNext(value);
            };
            if (error) errorFn = this.__isAsync ? err => {
                setTimeout(() => error(err));
            } : err => {
                error(err);
            };
            if (complete) completeFn = this.__isAsync ? () => {
                setTimeout(() => complete());
            } : () => {
                complete();
            };
        }
        const sink = super.subscribe(schedulerFn, errorFn, completeFn);
        if (generatorOrNext instanceof Subscription) generatorOrNext.add(sink);
        return sink;
    }
}

class QueryList {
    constructor() {
        this.dirty = true;
        this._results = [];
        this.changes = new EventEmitter();
        this.length = 0;
    }
    map(fn) {
        return this._results.map(fn);
    }
    filter(fn) {
        return this._results.filter(fn);
    }
    find(fn) {
        return this._results.find(fn);
    }
    reduce(fn, init) {
        return this._results.reduce(fn, init);
    }
    forEach(fn) {
        this._results.forEach(fn);
    }
    some(fn) {
        return this._results.some(fn);
    }
    toArray() {
        return this._results.slice();
    }
    [getSymbolIterator()]() {
        return this._results[getSymbolIterator()]();
    }
    toString() {
        return this._results.toString();
    }
    reset(resultsTree) {
        this._results = flatten(resultsTree);
        this.dirty = false;
        this.length = this._results.length;
        this.last = this._results[this.length - 1];
        this.first = this._results[0];
    }
    notifyOnChanges() {
        this.changes.emit(this);
    }
    setDirty() {
        this.dirty = true;
    }
    destroy() {
        this.changes.complete();
        this.changes.unsubscribe();
    }
}
