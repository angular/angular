# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "deferred.cmp.ts", "queried.cmp.ts", "twins.cmp.ts"]
}
```

# /deferred.cmp.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-deferred',
  template: 'Deferred content',
  standalone: true,
})
export class DeferredComponent {}
```

# /queried.cmp.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-queried',
  template: 'Queried content',
  standalone: true,
})
export class QueriedComponent {}
```

# /twins.cmp.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-deferred-twin',
  template: 'Deferred twin',
  standalone: true,
})
export class DeferredTwin {}

@Component({
  selector: 'app-eager-twin',
  template: 'Eager twin',
  standalone: true,
})
export class EagerTwin {}
```

# /app.component.ts
```ts
// Of the three imports below, only `./deferred.cmp` may be dropped in favour of a dynamic
// `import()`: it is reached from inside the `@defer` block and nowhere else in this file.
// `./queried.cmp` is also named by `@ViewChild`, and `./twins.cmp` also binds a component the
// template uses eagerly — deferral is all-or-nothing per import statement, as in ngtsc.
import { Component, ViewChild } from '@angular/core';
import { DeferredComponent } from './deferred.cmp';
import { QueriedComponent } from './queried.cmp';
import { DeferredTwin, EagerTwin } from './twins.cmp';

@Component({
  selector: 'app-root',
  template: `
    <app-eager-twin />
    @defer {
      <app-deferred />
      <app-queried />
      <app-deferred-twin />
    } @placeholder {
      Placeholder
    }
  `,
  standalone: true,
  imports: [DeferredComponent, QueriedComponent, DeferredTwin, EagerTwin],
})
export class AppComponent {
  // A reference the compiler does not remove: the query predicate is emitted into `viewQuery`,
  // so dropping this import would leave a dangling identifier behind. `QueriedComponent` is
  // therefore not deferrable, even though the template reaches it only from the `@defer` block.
  @ViewChild(QueriedComponent) queried?: QueriedComponent;
}
```
