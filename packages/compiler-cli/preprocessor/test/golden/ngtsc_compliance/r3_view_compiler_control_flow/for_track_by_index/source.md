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
    "for_track_by_index.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_track_by_index.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @for (item of items; track $index) {
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
