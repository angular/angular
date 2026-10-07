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
    "bound_attributes.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /bound_attributes.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div
  [title]="title" i18n-title
  [attr.label]="label" i18n-attr.label>
  </div>
  `,
    standalone: false
})
export class MyComponent {
  title = '';
  label = '';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
