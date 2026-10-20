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
// Simulates a dynamic/external import that cannot be statically resolved.
declare function getExternalComp(): any;
export const ExternalComp = getExternalComp();
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
