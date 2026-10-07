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
    "class_binding_on_structural.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /class_binding_on_structural.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
		<div *ngIf="true" [class.bar]="field"></div>
	`
})
export class MyComponent {
  field!: any;
}
```
