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
    "css_custom_properties.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /css_custom_properties.ts
```ts
import {Component} from '@angular/core';

@Component({
    selector: 'my-dir',
    template: `
    <div 
      [style.--camelCase]="value" 
      [style.--kebab-case]="value" 
      style="--camelCase: foo; --kebab-case: foo">
    </div>
  `,
    standalone: false
})
export class MyComponent {
  value: any;
}
```
