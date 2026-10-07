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
    "root_icu_with_elements.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /root_icu_with_elements.ts
```ts
import {Component} from '@angular/core';

@Component({
  selector: 'my-component',
  template: `
    <span i18n="someText1">{
      someField,
      select,
      WEBSITE {
        <strong>someText</strong>
      }
    }</span>

    <span>
    {
      someField,
      select,
      WEBSITE {
        <strong>someText</strong>
      }
    }
    </span>
`,
})
export class MyComponent {
  someField!: any;
}
```
