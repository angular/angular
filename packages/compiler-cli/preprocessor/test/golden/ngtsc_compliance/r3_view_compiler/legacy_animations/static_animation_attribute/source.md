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
    "static_animation_attribute.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /static_animation_attribute.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-app', template: '<div @attr [@binding]="exp"></div>',
    standalone: false
})
export class MyApp {
  exp!: any;
  any!: any;
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
```
