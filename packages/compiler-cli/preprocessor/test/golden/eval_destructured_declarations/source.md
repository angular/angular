# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts"]
}
```

# /app.component.ts
```ts
import { Component, Directive } from '@angular/core';

const CONFIG = {
  selector: 'app-root',
  meta: { names: ['inner-cmp', 'other-cmp'] },
};
const LOCAL = { tag: 'local-cmp', aliases: ['first-alias', 'second-alias'] };

// Object destructuring: shorthand, aliased, nested, and a defaulted (but present) property.
const { selector, meta: { names: [innerSelector, otherSelector] } } = CONFIG;
const { tag: localSelector, aliases: [primaryAlias] = [] } = LOCAL;

// Array destructuring, including an elided hole.
const [, secondAlias] = LOCAL.aliases;

// ngtsc does not special-case rest bindings: an object rest is keyed by its own name and an
// array rest by its position, so these resolve to `REST_SRC.rest` and `ARR_SRC[1]` rather
// than to the collected remainder. Locked here so the quirk is not "fixed" into a divergence.
const REST_SRC: any = { used: 'ignored', rest: 'obj-rest-cmp' };
const { used, ...rest } = REST_SRC;

const ARR_SRC: any = ['arr-head', 'arr-rest-cmp'];
const [arrHead, ...arrRest] = ARR_SRC;

@Component({ selector, template: '<h1>Hello</h1>' })
export class AppComponent {}

@Component({ selector: innerSelector, template: 'inner' })
export class InnerComponent {}

@Directive({ selector: `[${otherSelector}][${primaryAlias}]` })
export class OtherDirective {}

@Directive({ selector: `[${localSelector}][${secondAlias}]` })
export class LocalDirective {}

@Directive({ selector: `[${rest}]` })
export class ObjectRestDirective {}

@Directive({ selector: `[${arrRest}]` })
export class ArrayRestDirective {}
```
