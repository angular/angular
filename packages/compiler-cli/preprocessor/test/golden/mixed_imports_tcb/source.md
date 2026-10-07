# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "local.ts", "external.ts"]
}
```

# /local.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'local-comp',
  template: 'Local',
})
export class LocalComp {}
```

# /external.ts
```ts
// No Angular decorators, just a regular class.
// This simulates an external component or a non-Angular dependency.
export class ExternalComp {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { LocalComp } from './local';
import { ExternalComp } from './external';

@Component({
  selector: 'app-root',
  imports: [LocalComp, ExternalComp],
  template: `
    <local-comp></local-comp>
    <external-comp></external-comp>
  `,
})
export class AppComponent {}
```
