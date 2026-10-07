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
    "self_closing.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /self_closing.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <img src="logo.png" i18n />
  <img src="logo.png" i18n *ngIf="visible" />
  <img src="logo.png" i18n *ngIf="visible" i18n-title title="App logo #{{ id }}" />
  `,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
