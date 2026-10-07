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
    "exclude_bindings_from_consts.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /exclude_bindings_from_consts.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app',
    template: `<a
    target="_blank"
    [title]="1"
    [attr.foo]="'one'"
    (customEvent)="doThings()"
    [attr.bar]="'two'"
    [id]="2"
    aria-label="link"
    [attr.baz]="three"></a>`,
    standalone: false
})
export class MyComponent {
  doThings() {}
  three!: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
