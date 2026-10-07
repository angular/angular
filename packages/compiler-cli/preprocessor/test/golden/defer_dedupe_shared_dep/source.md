# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "shared.cmp.ts", "other.cmp.ts"]
}
```

# /shared.cmp.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'shared-dep',
  template: 'Shared',
  standalone: true
})
export class SharedDep {}
```

# /other.cmp.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'other-dep',
  template: 'Other',
  standalone: true
})
export class OtherDep {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { SharedDep } from './shared.cmp';
import { OtherDep } from './other.cmp';

@Component({
  template: `
    @defer {
      <shared-dep/>
    }

    @defer {
      <shared-dep/>
    }

    @defer {
      <other-dep/>
    }
  `,
  standalone: true,
  imports: [SharedDep, OtherDep]
})
export class AppComponent {}
```
