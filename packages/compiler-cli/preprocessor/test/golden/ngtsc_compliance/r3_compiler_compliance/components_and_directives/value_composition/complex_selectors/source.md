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
    "complex_selectors.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /complex_selectors.ts
```ts
import {Directive, NgModule} from '@angular/core';

@Directive({
    selector: 'div.foo[some-directive]:not([title]):not(.baz)',
    standalone: false
})
export class SomeDirective {
}

@Directive({
    selector: ':not(span[title]):not(.baz)',
    standalone: false
})
export class OtherDirective {
}

@NgModule({declarations: [SomeDirective, OtherDirective]})
export class MyModule {
}
```
