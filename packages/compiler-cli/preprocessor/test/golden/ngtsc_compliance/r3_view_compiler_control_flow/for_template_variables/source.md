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
    "for_template_variables.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_template_variables.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @for (item of items; track item) {
        Index: {{$index}}
        First: {{$first}}
        Last: {{$last}}
        Even: {{$even}}
        Odd: {{$odd}}
        Count: {{$count}}
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  items = [];
}
```
