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
    "static_attributes_structural.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /static_attributes_structural.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div *ngIf="exp" id="static" i18n-title="m|d" title="introduction"></div>
  `,
    standalone: false
})
export class MyComponent {
  exp = true;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
