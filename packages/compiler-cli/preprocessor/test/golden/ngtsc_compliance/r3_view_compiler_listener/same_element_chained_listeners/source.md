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
    "same_element_chained_listeners.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /same_element_chained_listeners.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `<div (click)="click()" (change)="change()"></div>`,
    standalone: false
})
export class MyComponent {
  click() {}
  change() {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
