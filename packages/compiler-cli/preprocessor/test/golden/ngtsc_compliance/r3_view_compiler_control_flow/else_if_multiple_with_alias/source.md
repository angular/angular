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
    "else_if_multiple_with_alias.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /else_if_multiple_with_alias.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    <div>
      {{message}}
      @if (one; as foo) {
        One: {{foo}}
      } @else if (two) {
        Two: {{two}}
      } @else if (three; as bar) {
        Three: {{bar}}
      } @else if (four; as baz) {
        Four: {{baz}}
      } @else if (five) {
        Five: {{five}}
      }
    </div>
  `,
})
export class MyApp {
  message = 'hello';
  one = 1;
  two = 2;
  three = 3;
  four = 4;
  five = 5;
}
```
