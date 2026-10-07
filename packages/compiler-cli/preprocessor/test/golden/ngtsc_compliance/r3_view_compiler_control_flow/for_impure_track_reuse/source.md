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
    "for_impure_track_reuse.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_impure_track_reuse.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    @for (item of items; track trackFn(item, message)) {
      {{item.name}}
    }

    @for (otherItem of otherItems; track trackFn(otherItem, message)) {
      {{otherItem.name}}
    }
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  items = [{name: 'one'}, {name: 'two'}, {name: 'three'}];
  otherItems = [{name: 'four'}, {name: 'five'}, {name: 'six'}];

  trackFn(item: any, message: string) {
    return message + item.name;
  }
}
```
