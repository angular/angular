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
    "safe_access_deep.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /safe_access_deep.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    template: `
  <span>Safe Property: {{ p?.a?.b?.c?.d }}</span>
  <span>Safe Keyed: {{ p?.['a']?.['b']?.['c']?.['d'] }}</span>
  <span>Mixed Property: {{ p?.a?.b.c.d?.e?.f?.g.h }}</span>
  <span>Mixed Property and Keyed: {{ p.a['b'].c.d?.['e']?.['f']?.g['h']['i']?.j.k }}</span>
`,
    standalone: false
})
export class MyApp {
  p: any = null;
}

@NgModule({declarations: [MyApp]})
export class MyModule {
}
```
