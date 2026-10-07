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
    "let_in_listener.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /let_in_listener.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @let one = value + 1;
    @let two = one + 1;

    <button (click)="callback(one, two)"></button>
  `,
})
export class MyApp {
  value = 1;

  callback(one: number, two: number) {
    console.log(one, two);
  }
}
```
