# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "foo.component.ts", "bar.directive.ts", "baz.component.ts"]
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

# /bar.directive.ts
```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[libBar]',
  standalone: true,
})
export class BarDirective {}
```

# /baz.component.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'lib-baz',
  template: '<span>Baz</span>',
  standalone: true,
})
export class BazComponent {}
```

# /more.ts
```ts
import { BarDirective } from './bar.directive';

export const MORE = [BarDirective];
```

# /shared.ts
```ts
import { FooComponent } from './foo.component';
import { BazComponent } from './baz.component';
import { MORE } from './more';

const LOCAL = [FooComponent, ...MORE];
const OTHER = [BazComponent];

// `SHARED` is `LOCAL`; the export named `LOCAL` is a different array.
export { LOCAL as SHARED, OTHER as LOCAL };
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { SHARED } from './shared';

@Component({
  selector: 'app-root',
  template: '<lib-foo libBar></lib-foo>',
  standalone: true,
  imports: SHARED,
})
export class AppComponent {}
```
