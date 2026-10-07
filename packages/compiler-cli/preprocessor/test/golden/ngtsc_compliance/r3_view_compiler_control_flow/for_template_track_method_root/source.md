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
    "for_template_track_method_root.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_template_track_method_root.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @for (item of items; track trackFn($index, item)) {}
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  items = [{name: 'one'}, {name: 'two'}, {name: 'three'}];

  trackFn(_index: number, item: any) {
    return item;
  }
}
```
