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
    "for_track_by_field.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_track_by_field.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @for (item of items; track item.name[0].toUpperCase()) {
        {{item.name}}
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  items = [{name: 'one'}, {name: 'two'}, {name: 'three'}];
}
```
