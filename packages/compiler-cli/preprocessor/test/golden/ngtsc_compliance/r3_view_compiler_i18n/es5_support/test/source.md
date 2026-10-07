# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES5",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node",
    "ignoreDeprecations": "6.0"
  },
  "files": [
    "test.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /test.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: '<div i18n="meaning:A|descA@@idA">Content A</div>',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
