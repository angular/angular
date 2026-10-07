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
    "for_with_pipe.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_with_pipe.ts
```ts
import {Component, Pipe} from '@angular/core';

@Pipe({name: 'test'})
export class TestPipe {
  transform(value: unknown) {
    return value;
  }
}

@Component({
  template: `
    <div>
      {{message}}
      @for (item of items | test; track item) {
        {{item}}
      }
    </div>
  `,
  imports: [TestPipe],
})
export class MyApp {
  message = 'hello';
  items = [1, 2, 3];
}
```
