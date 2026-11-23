# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true
  },
  "files": [
    "styles.ts",
    "test.component.ts"
  ]
}
```

# /styles.ts
```ts
export const BORDER = 2;
export const SHARED_STYLES = [
  '.a { margin: 0; }',
  `.b { gap: ${BORDER * 4}px; }`,
];
```

# /test.component.ts
```ts
import { Component } from '@angular/core';
import { BORDER, SHARED_STYLES } from './styles';

const HEIGHT = 1000;
const WIDTH = 1000;
const SIZE = 100;

@Component({
  selector: 'test-cmp',
  template: `<div class="box"></div>`,
  styles: [
    `:host {
      display: block;
      height: ${HEIGHT}px;
      width: ${WIDTH}px;
      border: ${BORDER}px solid black;
    }`,
    `.box {
      height: ${SIZE}px;
      width: ${SIZE}px;
      position: absolute;
      top: ${HEIGHT / 2 - SIZE / 2}px;
      left: ${WIDTH / 2 - SIZE / 2}px;
    }`,
    ...SHARED_STYLES,
  ],
})
export class TestComponent {}
```
