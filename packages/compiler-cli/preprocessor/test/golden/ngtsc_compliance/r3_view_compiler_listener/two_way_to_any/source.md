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
    "two_way_to_any.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /two_way_to_any.ts
```ts
import {Component, Directive, model} from '@angular/core';

@Directive({selector: '[ngModel]'})
export class NgModelDirective {
  ngModel = model('');
}

@Component({
  selector: 'test-cmp',
  template: '<input [(ngModel)]="$any(value)">',
  imports: [NgModelDirective],
})
export class TestCmp {
  value = 123;
}
```
