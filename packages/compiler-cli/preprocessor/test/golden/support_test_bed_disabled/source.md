# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "angularCompilerOptions": {
    "supportTestBed": false
  },
  "files": ["test.component.ts"]
}
```

# /test.component.ts
```ts
import { Component, Injectable, Input } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TestService {}

@Component({
  selector: 'test-comp',
  template: '<span>{{ name }}</span>',
})
export class TestComponent {
  @Input() name = '';

  constructor(readonly service: TestService) {}
}
```
