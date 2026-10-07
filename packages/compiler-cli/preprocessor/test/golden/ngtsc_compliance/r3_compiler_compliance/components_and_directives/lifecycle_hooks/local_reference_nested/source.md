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
    "local_reference_nested.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /local_reference_nested.ts
```ts
import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

@Directive({
    selector: '[if]',
    standalone: false
})
export class IfDirective {
  constructor(template: TemplateRef<any>) {}
}

@Component({
    selector: 'my-component',
    template: `
    <div #foo></div>
    {{foo}}
    <div *if>
      {{foo}}-{{bar}}
      <span *if>{{foo}}-{{bar}}-{{baz}}</span>
      <span #bar></span>
    </div>
    <div #baz></div>
    `,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [IfDirective, MyComponent]})
export class MyModule {
}
```
