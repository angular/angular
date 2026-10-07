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
    "i18n_message_element_whitespace.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /i18n_message_element_whitespace.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div i18n>\n  pre-p\n  <p>\n    in-p\n  </p>\n  post-p\n</div>',
    standalone: false
})
export class TestCmp {
}
```
