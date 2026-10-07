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
    "for_both_aliased_and_original_variables.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_both_aliased_and_original_variables.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @for (item of items; track item; let idx = $index, f = $first; let l = $last, ev = $even, o = $odd; let co = $count) {
        Original index: {{$index}}
        Original first: {{$first}}
        Original last: {{$last}}
        Original even: {{$even}}
        Original odd: {{$odd}}
        Original count: {{$count}}
        <hr>
        Aliased index: {{idx}}
        Aliased first: {{f}}
        Aliased last: {{l}}
        Aliased even: {{ev}}
        Aliased odd: {{o}}
        Aliased count: {{co}}
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
