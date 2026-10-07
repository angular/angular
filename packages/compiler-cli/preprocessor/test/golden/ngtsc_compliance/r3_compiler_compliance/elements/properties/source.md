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
    "properties.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /properties.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component', template: '<div [id]="id"></div>',
    standalone: false
})
export class MyComponent {
  id = 'one';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
