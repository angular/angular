# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "foo.component.ts"]
}
```

# /foo.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'lib-foo',
  template: '<span>Foo</span>',
  standalone: true,
})
export class FooComponent {}
```

# /shared.ts
```ts
import { FooComponent } from './foo.component';

export const SHARED_IMPORTS = [FooComponent];
```

# /inner.ts
```ts
export * from './shared';
```

# /barrel.ts
```ts
export { SHARED_IMPORTS } from './inner';
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { SHARED_IMPORTS } from './barrel';

@Component({
  selector: 'app-root',
  template: '<lib-foo></lib-foo>',
  standalone: true,
  imports: [...SHARED_IMPORTS],
})
export class AppComponent {}
```
