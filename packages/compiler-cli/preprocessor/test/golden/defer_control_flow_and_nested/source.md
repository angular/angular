# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "app.component.ts",
    "cmp-a.ts",
    "cmp-b.ts",
    "cmp-nested.ts",
    "pipe-a.ts",
    "pipe-b.ts",
    "pipe-nested.ts"
  ]
}
```

# /cmp-a.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'cmp-a',
  template: 'A',
  standalone: true
})
export class CmpA {}
```

# /cmp-b.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'cmp-b',
  template: 'B',
  standalone: true
})
export class CmpB {}
```

# /cmp-nested.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'cmp-nested',
  template: 'Nested',
  standalone: true
})
export class CmpNested {}
```

# /pipe-a.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pipeA',
  standalone: true
})
export class PipeA implements PipeTransform {
  transform(v: any): boolean { return !!v; }
}
```

# /pipe-b.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pipeB',
  standalone: true
})
export class PipeB implements PipeTransform {
  transform(v: string[]): string[] { return v; }
}
```

# /pipe-nested.ts
```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pipeNested',
  standalone: true
})
export class PipeNested implements PipeTransform {
  transform(v: any): string { return String(v); }
}
```

# /app.component.ts
```ts
import { Component } from '@angular/core';
import { CmpA } from './cmp-a';
import { CmpB } from './cmp-b';
import { CmpNested } from './cmp-nested';
import { PipeA } from './pipe-a';
import { PipeB } from './pipe-b';
import { PipeNested } from './pipe-nested';

@Component({
  selector: 'app-root',
  template: `
    @defer {
      @if (show | pipeA) {
        <cmp-a/>
      }
      @for (item of items | pipeB; track item) {
        <cmp-b/>
      }
      @defer {
        <cmp-nested/>
        <span>{{ 'inner' | pipeNested }}</span>
      }
    }
  `,
  standalone: true,
  imports: [CmpA, CmpB, CmpNested, PipeA, PipeB, PipeNested]
})
export class AppComponent {
  show = true;
  items = ['one', 'two'];
}
```
