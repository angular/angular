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
    "animate_enter_with_event_listener.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /animate_enter_with_event_listener.ts
```ts
import {Component, AnimationCallbackEvent} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p (animate.enter)="slideFn($event)">Sliding Content</p>
    </div>
  `,
})
export class MyComponent {
  slideFn(event: AnimationCallbackEvent) {
    event.target.classList.add('slide-in');
  }
}
```
