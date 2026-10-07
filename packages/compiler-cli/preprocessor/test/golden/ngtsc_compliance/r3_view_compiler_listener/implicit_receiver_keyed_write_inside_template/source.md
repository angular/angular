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
    "implicit_receiver_keyed_write_inside_template.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /implicit_receiver_keyed_write_inside_template.ts
```ts
import { Component, NgModule } from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <ng-template #template>
      <button (click)="$any(this)['mes' + 'sage'] = 'hello'">Click me</button>
    </ng-template>
  `,
    standalone: false
})
export class MyComponent {
  message = '';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
