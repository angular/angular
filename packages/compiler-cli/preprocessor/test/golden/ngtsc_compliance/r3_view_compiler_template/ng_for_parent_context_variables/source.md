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
    "ng_for_parent_context_variables.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /ng_for_parent_context_variables.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div *ngFor="let item of items; index as i">
        <span *ngIf="showing">
          {{ i }} - {{ item }}
        </span>
    </div>`,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
