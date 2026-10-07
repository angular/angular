# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "eager.ts", "deferred.ts"]
}
```

# /eager.ts
```ts
import { Directive, Pipe, PipeTransform } from '@angular/core';

@Directive({
  selector: '[eagerDir]',
})
export class EagerDirective {}

@Pipe({
  name: 'eagerPipe',
})
export class EagerPipe implements PipeTransform {
  transform(v: any) { return v; }
}
```

# /deferred.ts
```ts
import { Directive, Pipe, PipeTransform } from '@angular/core';

@Directive({
  selector: '[deferredDir]',
})
export class DeferredDirective {}

@Pipe({
  name: 'deferredPipe',
})
export class DeferredPipe implements PipeTransform {
  transform(v: any) { return v; }
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { EagerDirective, EagerPipe } from './eager';
import { DeferredDirective, DeferredPipe } from './deferred';

@Component({
  selector: 'app-root',
  imports: [EagerDirective, DeferredDirective, EagerPipe, DeferredPipe],
  template: `
    <div eagerDir>{{ 1 | eagerPipe }}</div>
    @defer {
      <div deferredDir>{{ 2 | deferredPipe }}</div>
    }
  `,
})
export class AppComponent {}
```
