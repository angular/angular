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
    "object_literals.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /object_literals.ts
```ts
import {Component, Input, NgModule} from '@angular/core';

@Component({
    selector: 'object-comp',
    template: `
    <p> {{ config['duration'] }} </p>
    <p> {{ config.animation }} </p>
  `,
    standalone: false
})
export class ObjectComp {
  @Input() config!: {[key: string]: any};
}

@Component({
    selector: 'my-app',
    template: `
  <object-comp [config]="{'duration': 500, animation: name}"></object-comp>
`,
    standalone: false
})
export class MyApp {
  name = 'slide';
}

@NgModule({declarations: [ObjectComp, MyApp]})
export class MyModule {
}
```
