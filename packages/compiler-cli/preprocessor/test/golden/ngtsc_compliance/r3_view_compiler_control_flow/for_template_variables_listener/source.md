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
    "for_template_variables_listener.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_template_variables_listener.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @for (item of items; track item; let ev = $even) {
        <div (click)="log($index, ev, $first, $count)"></div>
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  items = [];
  log(..._: any[]) {}
}
```
