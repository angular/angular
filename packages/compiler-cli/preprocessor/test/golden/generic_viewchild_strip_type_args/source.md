# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "ignoreDeprecations": "6.0"
  },
  "files": [
    "src/test.ts"
  ]
}
```

# /src/test.ts
```ts
import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'child-comp',
  template: '<div>Child</div>',
})
export class ChildComponent<T> {
  item!: T;
}

@Component({
  selector: 'parent-comp',
  template: '<div>Parent</div>',
})
export class ParentComponent<T> {
  @ViewChild(ChildComponent<T>) child?: ChildComponent<T>;
}
```
