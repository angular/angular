# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "deferred.cmp.ts", "deferred.pipe.ts", "eager.cmp.ts"]
}
```

# /deferred.cmp.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-deferred',
  template: 'Deferred content',
  standalone: true
})
export class DeferredComponent {}
```

# /deferred.pipe.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'deferredPipe',
  standalone: true
})
export class DeferredPipe implements PipeTransform {
  transform(value: string): string {
    return value + ' transformed';
  }
}
```

# /eager.cmp.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-eager',
  template: 'Eager content',
  standalone: true
})
export class EagerComponent {}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { DeferredComponent } from './deferred.cmp';
import { DeferredPipe } from './deferred.pipe';
import { EagerComponent } from './eager.cmp';

@Component({
  selector: 'app-root',
  template: `
    <app-eager/>
    @defer {
      <app-deferred/>
      {{ 'hello' | deferredPipe }}
    } @placeholder {
      Placeholder
    }
  `,
  standalone: true,
  imports: [EagerComponent],
  deferredImports: [DeferredComponent, DeferredPipe]
})
export class AppComponent {}
```
