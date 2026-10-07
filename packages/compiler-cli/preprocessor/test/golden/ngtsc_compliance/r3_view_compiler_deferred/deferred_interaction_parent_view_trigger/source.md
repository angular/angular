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
    "deferred_interaction_parent_view_trigger.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /deferred_interaction_parent_view_trigger.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    <ng-template>
      {{message}}
      <button #button>Click me</button>

      <ng-template>
        <ng-template>
          @defer (on interaction(button); prefetch on interaction(button)) {}
        </ng-template>
      </ng-template>
    </ng-template>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
}
```
