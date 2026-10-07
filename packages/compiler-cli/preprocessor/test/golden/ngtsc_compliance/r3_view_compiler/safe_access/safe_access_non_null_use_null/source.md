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
    "safe_access_non_null_use_null.ts"
  ],
  "angularCompilerOptions": {
    "legacyOptionalChaining": true
  }
}
```

# /safe_access_non_null_use_null.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    template: `
    {{ val?.foo!.bar }}
    {{ val?.[0].foo!.bar }}
    {{ foo(val)?.foo!.bar }}
    {{ $any(val)?.foo!.bar }}
  `,
    standalone: false
})
export class MyApp {
  val: any = null;

  foo(val: unknown) {
    return val;
  }
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
```
