import "tslib";

import "rxjs";

import "rxjs/operators";

var __globalThis = "undefined" !== typeof globalThis && globalThis;

var __window = "undefined" !== typeof window && window;

var __self = "undefined" !== typeof self && "undefined" !== typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && self;

var __global = "undefined" !== typeof global && global;

var _global = __globalThis || __global || __window || __self;

if (ngDevMode) _global.$localize = _global.$localize || function() {
    throw new Error("The global function `$localize` is missing. Please add `import '@angular/localize';` to your polyfills.ts file.");
};
