# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "comp-a.ts", "comp-b.ts", "pipe-a.ts"]
}
```

# /comp-a.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'comp-a',
  template: 'Component A',
  standalone: true
})
export class CompA {}
```

# /comp-b.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'comp-b',
  template: 'Component B',
  standalone: true
})
export class CompB {}
```

# /pipe-a.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pipeA',
  standalone: true
})
export class PipeA implements PipeTransform {
  transform(val: any) { return val; }
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { CompA } from './comp-a';
import { CompB } from './comp-b';
import { PipeA } from './pipe-a';

@Component({
  selector: 'app-comp',
  standalone: true,
  imports: [CompA, CompB, PipeA],
  deferredImports: {
    blockA: [CompA],
    blockB: [CompB, PipeA],
  },
  template: `
    @defer (name blockA) {
      <comp-a />
    }
    @defer (name blockB) {
      <comp-b />
      {{ 123 | pipeA }}
    }
  `
})
export class AppComponent {}
```
