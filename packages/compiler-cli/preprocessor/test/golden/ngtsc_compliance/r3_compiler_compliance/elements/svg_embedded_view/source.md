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
    "svg_embedded_view.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /svg_embedded_view.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <svg>
      <ng-template [ngIf]="condition">
        <text>Hello</text>
      </ng-template>
    </svg>
  `,
    standalone: false
})
export class MyComponent {
  condition = true;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
