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
import { Attribute, Component } from '@angular/core';

function getAttrName() {
  return 'my-attr';
}

@Component({
  selector: 'app-test',
  template: '<div>Test</div>',
  standalone: true,
})
export class TestComponent {
  constructor(
    @Attribute('literal-attr') public literalAttr: string,
    @Attribute(getAttrName()) public dynamicAttr: string,
  ) {}
}
```
