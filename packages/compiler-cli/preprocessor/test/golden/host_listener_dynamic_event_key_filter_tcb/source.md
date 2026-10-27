# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "ignoreDeprecations": "6.0"
  },
  "files": [
    "src/test.ts"
  ]
}
```

# /src/test.ts
```ts
import { Component, HostListener } from '@angular/core';

export const SHORTCUT_RESET_TO_INITIAL_TRANSFORM = {
  eventName: 'window:keydown.r',
  description: 'Reset the ruler zoom and translation to the original state',
};

@Component({
  selector: 'repro-cmp',
  template: '<div></div>',
})
export class ReproComponent {
  @HostListener(`${SHORTCUT_RESET_TO_INITIAL_TRANSFORM.eventName}`, ['$event'])
  resetToInitialTransform(event?: KeyboardEvent) {}

  @HostListener('window:keyup.escape', ['$event'])
  literalResetToInitialTransform(event?: Event) {}
}
```
