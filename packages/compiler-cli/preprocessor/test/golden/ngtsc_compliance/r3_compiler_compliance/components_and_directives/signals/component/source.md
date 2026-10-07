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
  // @ts-ignore
  signals: true,
  selector: 'other-cmp',
  template: '',
})
export class OtherCmp {
}

@Component({
  // @ts-ignore
  signals: true,
  template: '<other-cmp></other-cmp>',
  imports: [OtherCmp],
})
export class SignalCmp {
}
```
