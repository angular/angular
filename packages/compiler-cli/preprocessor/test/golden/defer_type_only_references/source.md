# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.component.ts", "comp-a.ts", "comp-b.ts", "comp-c.ts", "comp-d.ts"]
}
```

# /comp-a.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'comp-a',
  template: 'Component A',
})
export class CompA {}
```

# /comp-b.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'comp-b',
  template: 'Component B',
})
export class CompB {}
```

# /comp-c.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'comp-c',
  template: 'Component C',
})
export class CompC {}
```

# /comp-d.ts
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'comp-d',
  template: 'Component D',
})
export default class CompD {}
```

# /app.component.ts
```ts
import { Component, ViewChild } from '@angular/core';
import { CompA, type CompA as CompAType } from './comp-a';
import { CompB } from './comp-b';
import { CompC, type CompC as UnusedType } from './comp-c';
import CompD from './comp-d';

@Component({
  selector: 'app-comp',
  deferredImports: {
    blockA: [CompA, CompB, CompC, CompD],
  },
  template: `
    @defer (when isReady; name blockA) {
      <comp-a #compA />
      <comp-b #compB />
      <comp-c />
      <comp-d #compD />
    }
  `,
})
export class AppComponent {
  isReady = true;
  @ViewChild('compA')
  compA?: CompAType;
  @ViewChild('compB')
  compB?: CompB;
  @ViewChild('compD')
  compD?: CompD;
}
```
