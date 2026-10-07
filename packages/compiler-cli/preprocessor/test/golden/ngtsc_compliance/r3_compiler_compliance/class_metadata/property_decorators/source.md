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
    "property_decorators.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /property_decorators.ts
```ts
import {Directive, Input, Output} from '@angular/core';
import {CustomPropDecorator} from './custom';

@Directive()
export class MyDir {
  @Input() foo!: string;

  @Input('baz') bar!: string;

  @CustomPropDecorator() custom!: string;

  @Input() @Output() @CustomPropDecorator() mixed!: string;

  none!: string;
}
```

# /test_cmp_template.html
```html
<span>Test template</span>
```
