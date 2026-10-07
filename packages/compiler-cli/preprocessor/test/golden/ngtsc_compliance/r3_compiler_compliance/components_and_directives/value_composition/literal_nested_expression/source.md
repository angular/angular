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
    "literal_nested_expression.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /literal_nested_expression.ts
```ts
import {Component, Input, NgModule} from '@angular/core';

@Component({
    selector: 'nested-comp',
    template: `
    <p> {{ config.animation }} </p>
    <p> {{config.actions[0].opacity }} </p>
    <p> {{config.actions[1].duration }} </p>
  `,
    standalone: false
})
export class NestedComp {
  @Input() config!: {[key: string]: any};
}

@Component({
    selector: 'my-app',
    template: `
  <nested-comp [config]="{animation: name, actions: [{ opacity: 0, duration: 0}, {opacity: 1, duration: duration }]}">
  </nested-comp>
`,
    standalone: false
})
export class MyApp {
  name = 'slide';
  duration = 100;
}

@NgModule({declarations: [NestedComp, MyApp]})
export class MyModule {
}
```
