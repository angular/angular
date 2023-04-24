import "rxjs";

import "rxjs/operators";

const __globalThis = typeof globalThis !== "undefined" && globalThis;

const __window = typeof window !== "undefined" && window;

const __self = typeof self !== "undefined" && typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope && self;

const __global = typeof global !== "undefined" && global;

const _global = __globalThis || __global || __window || __self;

if (typeof ngDevMode !== "undefined" && ngDevMode) _global.$localize = _global.$localize || function() {
    throw new Error("It looks like your application or one of its dependencies is using i18n.\n" + "Angular 9 introduced a global `$localize()` function that needs to be loaded.\n" + "Please run `ng add @angular/localize` from the Angular CLI.\n" + "(For non-CLI projects, add `import '@angular/localize/init';` to your `polyfills.ts` file.\n" + "For server-side rendering applications add the import to your `main.server.ts` file.)");
};
