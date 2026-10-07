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
    "self_closing_tags.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /self_closing_tags.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <ng-container i18n>
    <img src="logo.png" title="Logo" /> is my logo #1
  </ng-container>
  <ng-template i18n>
    <img src="logo.png" title="Logo" /> is my logo #2
  </ng-template>
`,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
