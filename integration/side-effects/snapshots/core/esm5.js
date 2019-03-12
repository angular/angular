import "tslib";

import "rxjs";

import "rxjs/operators";

function getGlobal() {
    var __globalThis = "undefined" !== typeof globalThis && globalThis;
    var __window = "undefined" !== typeof window && window;
    var __self = "undefined" !== typeof self && "undefined" !== typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && self;
    var __global = "undefined" !== typeof global && global;
    return __globalThis || __global || __window || __self;
}

var _global = getGlobal();

if ("undefined" === typeof ngI18nClosureMode) _global["ngI18nClosureMode"] = "undefined" !== typeof goog && "function" === typeof goog.getMsg;
