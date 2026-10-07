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
    "object_literals_null_vs_empty.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /object_literals_null_vs_empty.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: {}}"></div>
  `,
    standalone: false
})
export class MyApp {
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
```
