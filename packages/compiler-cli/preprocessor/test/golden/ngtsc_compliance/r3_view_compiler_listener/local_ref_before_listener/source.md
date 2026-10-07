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
    "local_ref_before_listener.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /local_ref_before_listener.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <button (click)="onClick(user.value)">Save</button>
    <input #user>
  `,
    standalone: false
})
export class MyComponent {
  onClick(v: any) {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
