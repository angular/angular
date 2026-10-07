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
    "i18n_message_interpolation_whitespace.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /i18n_message_interpolation_whitespace.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div i18n title="  pre-title {{titleValue}}  post-title" i18n-title>  pre-body {{bodyValue}}  post-body</div>',
    standalone: false
})
export class TestCmp {
  titleValue: string = '';
  bodyValue: string = '';
}
```
