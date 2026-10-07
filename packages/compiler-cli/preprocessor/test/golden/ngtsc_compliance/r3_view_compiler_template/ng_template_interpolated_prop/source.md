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
    "ng_template_interpolated_prop.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_template_interpolated_prop.ts
```ts
import {Component, Directive, Input} from '@angular/core';

@Directive({
    selector: '[dir]',
    standalone: false
})
class WithInput {
  @Input() dir: string = '';
}

@Component({
    selector: 'my-app',
    template: '<ng-template dir="{{ message }}"></ng-template>',
    standalone: false
})
export class TestComp {
  message = 'Hello';
}
```
