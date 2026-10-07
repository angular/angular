# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import { Component } from '@angular/core';

// `host` is typed `{[key: string]: string}`, so the numeric and boolean values below are
// already TypeScript type errors, and ngtsc's partial evaluator rejects them a second time
// with `NG1010: Decorator host metadata must be a string -> string object, but found
// unparseable value` — real ngc emits no definition at all for this class. Having no
// diagnostics channel here, those entries are dropped and the well-typed ones still compile.
// What must not happen is inventing an attribute value out of the rejected source text.
// TODO(parity): once the evaluator feeds a diagnostics channel, report NG1010 and emit no
// definition for the class, as ngtsc does, instead of dropping the offending entries.
@Component({
  selector: 'host-literals-comp',
  template: 'Host Literals',
  host: {
    'tabindex': 0,
    '[class.disabled]': true,
    '[attr.aria-expanded]': 'expanded ? "true" : "false"',
  }
})
export class HostLiteralsComponent {
  expanded = false;
}
```
