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
    "conditional_same_component_names.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /conditional_same_component_names.ts
```ts
import {Component} from '@angular/core';

function it(_desc: string, fn: () => void) {}

it('case 1', () => {
  @Component({
    template: `
      @if (true) {
        First
      } @else {
        Second
      }
    `,
    standalone: false
})
  class TestComponent {
  }
});

it('case 2', () => {
  @Component({
    template: `
      @if (true) {
        First
      } @else {
        Second
      }
    `,
    standalone: false
})
  class TestComponent {
  }
});
```
