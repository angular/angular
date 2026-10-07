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
    "icus.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /icus.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <ng-container i18n>{gender, select, male {male} female {female} other {other}}</ng-container>
  <ng-template i18n>{age, select, 10 {ten} 20 {twenty} other {other}}</ng-template>
`,
    standalone: false
})
export class MyComponent {
  gender = 'female';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
