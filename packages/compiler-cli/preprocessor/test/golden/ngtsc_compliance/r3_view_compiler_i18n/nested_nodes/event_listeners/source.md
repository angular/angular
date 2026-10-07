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
    "event_listeners.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /event_listeners.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n (click)="onClick()">Hello</div>
  `,
    standalone: false
})
export class MyComponent {
  onClick() {}
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
