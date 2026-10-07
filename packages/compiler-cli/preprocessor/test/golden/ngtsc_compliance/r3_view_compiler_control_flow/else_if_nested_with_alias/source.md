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
    "else_if_nested_with_alias.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /else_if_nested_with_alias.ts
```ts
import {Component} from '@angular/core';

@Component({
  template: `
    @if (foo) {
      foo
    } @else if (value(); as root) {
      Root: {{value()}}/{{root}}

      @if (foo) {
        foo
      } @else if (value(); as inner) {
        Inner: {{value()}}/{{root}}/{{inner}}

        @if (foo) {
          foo
        } @else if (value(); as innermost) {
          Innermost: {{value()}}/{{root}}/{{inner}}/{{innermost}}
        }
      }
    }
  `,
})
export class MyApp {
  foo = false;
  value = () => 1;
}
```
