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
    "two_way_binding_to_signal_loop_variable.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /two_way_binding_to_signal_loop_variable.ts
```ts
import {Component, Directive, model, signal} from '@angular/core';

@Directive({
  selector: '[ngModel]',
})
export class NgModelDirective {
  ngModel = model.required<string>();
}

@Component({
  template: `
    @for (name of names; track $index) {
      <input [(ngModel)]="name" />
    }
  `,
  imports: [NgModelDirective],
})
export class TestCmp {
  names = [signal('Angular')];
}
```
