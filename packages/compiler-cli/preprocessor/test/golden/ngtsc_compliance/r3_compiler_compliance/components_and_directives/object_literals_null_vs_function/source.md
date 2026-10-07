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
    "object_literals_null_vs_function.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /object_literals_null_vs_function.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    template: `
    <div [dir]="{foo: null}"></div>
    <div [dir]="{foo: getFoo()}"></div>
  `,
    standalone: false
})
export class MyApp {
  getFoo() {
    return 'foo!';
  }
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
```
