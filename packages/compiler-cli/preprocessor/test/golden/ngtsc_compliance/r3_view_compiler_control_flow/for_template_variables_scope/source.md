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
    "for_template_variables_scope.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_template_variables_scope.ts
```ts
import {Component} from '@angular/core';

@Component({
    template: `
    {{$index}} {{$count}} {{$first}} {{$last}}

    @for (item of items; track item) {
      {{$index}} {{$count}} {{$first}} {{$last}}
    }

    {{$index}} {{$count}} {{$first}} {{$last}}
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  items = [];

  // These variables are defined so that the template type checker doesn't raise an error.
  $index: any;
  $count: any;
  $first: any;
  $last: any;
}
```
