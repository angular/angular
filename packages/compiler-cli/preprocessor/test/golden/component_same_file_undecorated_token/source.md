# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": ["test.ts"]
}
```

# /test.ts
```ts
import { Component } from '@angular/core';

export class PlainService {}

@Component({
  selector: 'app-foo',
  template: '<div>Foo</div>',
  standalone: true,
})
export class Foo {
  constructor(private s: PlainService) {}
}
```
