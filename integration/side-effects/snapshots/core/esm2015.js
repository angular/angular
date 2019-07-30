import "rxjs";

import "rxjs/operators";

const __globalThis = "undefined" !== typeof globalThis && globalThis;

const __window = "undefined" !== typeof window && window;

const __self = "undefined" !== typeof self && "undefined" !== typeof WorkerGlobalScope && self instanceof WorkerGlobalScope && self;

const __global = "undefined" !== typeof global && global;

const _global = __globalThis || __global || __window || __self;

if (ngDevMode) _global.$localize = _global.$localize || function() {
    throw new Error("The global function `$localize` is missing. Please add `import '@angular/localize';` to your polyfills.ts file.");
};
