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
    "input_transform.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /input_transform.ts
```ts
import {Directive, Input, NgModule} from '@angular/core';

function toNumber(value: number|string) {
  return value ? 1 : 0;
}

@Directive({
    selector: '[my-directive]',
    standalone: false
})
export class MyDirective {
  @Input({transform: toNumber}) functionDeclarationInput: any;

  // There's an extra `_` parameter, because full compilation strips the parentheses around the
  // parameters while partial compilation keeps them. This ensures consistent output.
  // @ts-ignore
  @Input({transform: (value: string|number, _: any) => value ? 1 : 0}) inlineFunctionInput: any;
}

@NgModule({declarations: [MyDirective]})
export class MyModule {
}
```
