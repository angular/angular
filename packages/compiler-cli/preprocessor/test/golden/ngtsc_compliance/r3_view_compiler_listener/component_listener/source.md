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
    "component_listener.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /component_listener.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app', template: `<div>My App</div>`,
    standalone: false
})
export class MyApp {
}

@Component({
    selector: 'my-component', template: `<my-app (click)="onClick($event);"></my-app>`,
    standalone: false
})
export class MyComponent {
  onClick(event: any) {}
}

@NgModule({declarations: [MyComponent, MyApp]})
export class MyModule {
}
```
