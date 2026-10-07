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
    "let_with_pipe.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /let_with_pipe.ts
```ts
import {Component, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'double',
})
export class DoublePipe implements PipeTransform {
  transform(value: number) {
    return value * 2;
  }
}

@Component({
  template: `
    @let one = value + 1;
    @let result = one | double;
    The result is {{result}}
  `,
  imports: [DoublePipe],
})
export class MyApp {
  value = 1;
}
```
