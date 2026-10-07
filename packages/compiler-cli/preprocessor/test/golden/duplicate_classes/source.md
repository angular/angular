# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["app.ts"]
}
```

# /app.ts
```ts
import {Component, Directive} from '@angular/core';

export function runTest() {
  @Component({
    selector: 'test-cmp',
    template: `<div>Class 1</div>`,
    standalone: true,
  })
  class TestComponent {
    foo: string = '';
  }
}

export function runTest2() {
  @Component({
    selector: 'test-cmp',
    template: `<div>Class 1</div>`,
    standalone: true,
  })
  class TestComponent {
    foo: string = '';
  }
}
```
