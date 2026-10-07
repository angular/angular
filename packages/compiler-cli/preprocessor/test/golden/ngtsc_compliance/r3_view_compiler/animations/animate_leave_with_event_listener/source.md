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
    "animate_leave_with_event_listener.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /animate_leave_with_event_listener.ts
```ts
import {Component, AnimationCallbackEvent} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
    <div>
      <p (animate.leave)="fadeFn($event)">Fading Content</p>
    </div>
  `,
})
export class MyComponent {
  fadeFn(event: AnimationCallbackEvent) {
    event.target.classList.add('fade-out');
  }
}
```
