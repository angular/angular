# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /names.ts
```ts
export const EXPORT_AS = 'tooltip';
export const MULTI = 'first, second';
```

# /tooltip.ts
```ts
import { Directive } from '@angular/core';
import { EXPORT_AS, MULTI } from './names';

@Directive({ selector: '[tooltip]', exportAs: EXPORT_AS })
export class Tooltip {
  show() {}
}

// A comma-separated list is split after evaluation, as ngtsc does.
@Directive({ selector: '[multi]', exportAs: MULTI })
export class Multi {
  toggle() {}
}
```

# /app.ts
```ts
import { Component } from '@angular/core';
import { Multi, Tooltip } from './tooltip';

@Component({
  selector: 'app-root',
  template: `
    <button tooltip #t="tooltip" (click)="t.show()">a</button>
    <span multi #m="second" (click)="m.toggle()">b</span>
  `,
  imports: [Tooltip, Multi],
})
export class App {}
```
