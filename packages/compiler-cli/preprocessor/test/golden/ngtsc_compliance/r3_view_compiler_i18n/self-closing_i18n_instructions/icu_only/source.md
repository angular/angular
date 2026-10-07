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
    "icu_only.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /icu_only.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>{age, select, 10 {ten} 20 {twenty} other {other}}</div>
  `,
    standalone: false
})
export class MyComponent {
  age = 1;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
