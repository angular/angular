# Rules for `Object.create(null)` and Prototype Collision Prevention

This guide outlines the technical rules and evaluation criteria for using `Object.create(null)` versus standard object literals (`{}`) or `Map` in the Angular codebase.

---

## 1. When `Object.create(null)` is Appropriate

Using `Object.create(null)` (or `Map`) is appropriate when **all** of the following conditions are met:

1. The object is used as an **internal key-value lookup map or set**.
2. The keys are **arbitrary or untrusted dynamic strings** (e.g., URL query parameters in `$locationShim`, HTML sanitizer tag sets, or `jsaction` DOM event-type resolvers).
3. Property existence is checked via direct indexing or key checks (e.g., `map[key] !== undefined` or `key in map`), where a key matching an `Object.prototype` member (such as `'toString'`, `'constructor'`, or `'hasOwnProperty'`) causes false positive matches or incorrect behavior.

---

## 2. Handling Public API and Boundary Objects

If an object receives untrusted dynamic keys **and** is exposed to public consumers or third-party code (e.g., `SimpleChanges` in `ngOnChanges`):

- **Do NOT blindly change the object to `Object.create(null)`**: Stripping `Object.prototype` from public objects is a breaking API change. Consumer code calling `.hasOwnProperty()`, `.toString()`, `.valueOf()`, or using string interpolation (`` `${obj}` ``) will fail at runtime (`TypeError: obj.hasOwnProperty is not a function`).
- **Safe Alternatives for Public Objects:**
  - **`Object.hasOwn(obj, key)`**: Use `Object.hasOwn` for internal framework property lookups instead of direct index or `in` checks. This prevents prototype collision during internal reads without breaking the object's prototype for consumers.
  - **Input Key Sanitization**: Filter or delete dangerous key names (`__proto__`, `constructor`, `prototype`) when populating the object.
  - **`Map` or Custom Classes**: For new public APIs requiring key-value stores with dynamic keys, prefer `Map<K, V>` or dedicated classes with explicit `.get()` and `.has()` methods.
  - **Deprecation / Breaking Change Process**: If changing a public object's prototype to `null` is unavoidable, it must follow Angular's formal deprecation and major version breaking change process.

---

## 3. When `Object.create(null)` Should NOT Be Used

Do not replace `{}` with `Object.create(null)` in the following scenarios:

1. **Fixed-Shape Structs and DTOs:** Objects with hardcoded static property names (e.g., `let sortedBreakpoints: {breakpoints?: number[]} = {}`). `Object.assign({}, ...)` only copies _own_ enumerable properties, so prototype properties on sources are never copied.
2. **Numeric-Key Maps:** Objects indexed by numbers (e.g., `tasksByHandleId: {[id: number]: Task}`). Numeric keys do not collide with `Object.prototype` string members.
3. **Reference Sentinels:** Objects used purely for reference identity checks (e.g., `const EMPTY_OBJECT = {}` or `const IN_PROGRESS_RESOLUTION = {}`).
4. **Internal Compiler AST and Visitor State:** Temporary objects with internally generated keys where untrusted user input cannot poison key names.
5. **Hot Performance Paths and Size-Critical Bundles:** Standard `{}` literals use V8 fast hidden classes and monomorphic inline caching. `Object.create(null)` forces V8 dictionary mode and increases minified bundle size (e.g., in inline polyfills like `event-dispatch-contract` or SSR hydration bundles).
