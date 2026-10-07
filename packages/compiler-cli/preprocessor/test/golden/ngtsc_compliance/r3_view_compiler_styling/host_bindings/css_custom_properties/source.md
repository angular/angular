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
    "css_custom_properties.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /css_custom_properties.ts
```ts
import {Directive} from '@angular/core';

@Directive({
    selector: 'my-dir',
    host: {
        '[style.--camelCase]': 'value',
        '[style.--kebab-case]': 'value',
        'style': '--camelCase: foo; --kebab-case: foo',
    },
    standalone: false
})
export class MyDirective {
  value: any;
}
```
