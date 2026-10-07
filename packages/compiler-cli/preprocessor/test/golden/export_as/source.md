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
import { Component, Directive } from '@angular/core';

@Directive({
  selector: '[myDir]',
  exportAs: 'myDirAlias',
  standalone: true
})
export class MyDir {
  value = 'hello';
}

@Component({
  selector: 'app-root',
  template: '<div myDir #dir="myDirAlias">{{ dir.value }}</div>',
  standalone: true,
  imports: [MyDir]
})
export class AppComponent {}
```
