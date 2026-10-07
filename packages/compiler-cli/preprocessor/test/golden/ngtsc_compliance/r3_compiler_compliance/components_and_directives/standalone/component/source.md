# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "component.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /component.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'other-cmp',
  template: '',
})
export class OtherCmp {
}

@Component({
  template: '<other-cmp></other-cmp>',
  imports: [OtherCmp],
})
export class StandaloneCmp {
}
```
