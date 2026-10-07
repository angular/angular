# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node",
    "sourceMap": true
  },
  "files": [
    "i18n_message_placeholder.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /i18n_message_placeholder.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div i18n>Hello, {{name}}!</div>',
    standalone: false
})
export class TestCmp {
  name: string = '';
}
```
