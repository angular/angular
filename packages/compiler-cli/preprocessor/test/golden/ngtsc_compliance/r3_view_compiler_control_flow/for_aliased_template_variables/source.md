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
    "for_aliased_template_variables.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_aliased_template_variables.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @for (item of items; track item; let idx = $index, f = $first; let l = $last, ev = $even, o = $odd; let co = $count) {
        Index: {{idx}}
        First: {{f}}
        Last: {{l}}
        Even: {{ev}}
        Odd: {{o}}
        Count: {{co}}
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
