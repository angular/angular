# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "deferred-a.ts", "deferred-b.ts"]
}
```

# /deferred-a.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'deferred-a',
  template: 'A'
})
export default class DefCompA {}
```

# /deferred-b.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'deferred-b',
  template: 'B'
})
export default class DefCompB {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import DefCompA from './deferred-a';
import DefCompB from './deferred-b';

@Component({
  selector: 'app-root',
  deferredImports: {
    block: [DefCompA, DefCompB],
  },
  template: `
    @defer (name block) {
      <deferred-a />
      <deferred-b />
    }
  `
})
export class AppComponent {}
```
