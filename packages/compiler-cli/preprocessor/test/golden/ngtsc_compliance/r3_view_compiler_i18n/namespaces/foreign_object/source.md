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
    "foreign_object.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /foreign_object.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <svg xmlns="http://www.w3.org/2000/svg">
    <foreignObject i18n>
      <xhtml:div xmlns="http://www.w3.org/1999/xhtml">
        Count: <span>5</span>
      </xhtml:div>
    </foreignObject>
  </svg>
`,
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
