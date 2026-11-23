# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "foo.component.ts", "bar.directive.ts"]
}
```

# /foo.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'lib-foo',
  template: '<span>Foo</span>',
})
export class FooComponent {}
```

# /bar.directive.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[libBar]',
})
export class BarDirective {}
```

# /shared.ts
```ts
import { FooComponent } from './foo.component';
import { BarDirective } from './bar.directive';

export const SHARED = [FooComponent, BarDirective];
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { SHARED } from './shared';

@Component({
  selector: 'app-root',
  template: '<lib-foo libBar></lib-foo>',
  imports: SHARED,
})
export class AppComponent {}
```
