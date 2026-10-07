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
    "single_ng-container.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /single_ng-container.ts
```ts
import {Component, NgModule, Pipe} from '@angular/core';

@Pipe({
    name: 'uppercase',
    standalone: false
})
export class UppercasePipe {
  transform(v: any) {}
}

@Component({
    selector: 'my-component',
    template: `
  <ng-container i18n>Some content: {{ valueA | uppercase }}</ng-container>
`,
    standalone: false
})
export class MyComponent {
  valueA = '';
}

@NgModule({declarations: [MyComponent, UppercasePipe]})
export class MyModule {
}
```
