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
    "shared_placeholder.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /shared_placeholder.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>
    {gender, select, male {male} female {female} other {other}}
    <div>
      {gender, select, male {male} female {female} other {other}}
    </div>
    <div *ngIf="visible">
      {gender, select, male {male} female {female} other {other}}
    </div>
  </div>
`,
    standalone: false
})
export class MyComponent {
  gender = 'male';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
