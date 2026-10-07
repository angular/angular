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
    "i18n_message_placeholder_entities.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /i18n_message_placeholder_entities.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div i18n>Interpolation: {{ one }}&nbsp;Interpolation: {{ two }}</div>',
    standalone: false
})
export class TestCmp {
  one = 1;
  two = 2;
}
```
