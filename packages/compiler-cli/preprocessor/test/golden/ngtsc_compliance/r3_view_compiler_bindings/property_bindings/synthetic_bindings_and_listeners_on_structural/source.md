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
    "synthetic_bindings_and_listeners_on_structural.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /synthetic_bindings_and_listeners_on_structural.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-cmp',
  template: `
    <button
      *ngIf="true"
      [@anim]="field"
      (@anim.start)="fn($event)">
    </button>
  `
})
export class MyComponent {
  field!: any;
  fn!: any;
}
```
