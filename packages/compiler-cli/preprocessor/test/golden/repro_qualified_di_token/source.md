# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["service.ts", "component.ts"]
}
```

# /service.ts
```ts
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class MyService {}
```

# /component.ts
```ts
import { Component } from '@angular/core';
import * as ns from './service';

@Component({
  selector: 'repro-comp',
  template: '',
  standalone: false,
})
export class ReproComponent {
  constructor(private readonly service: ns.MyService) {}
}
```
