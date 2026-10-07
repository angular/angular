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
    "backtick_quotes.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /backtick_quotes.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: '<div i18n>`{{ count }}`</div>',
    standalone: false
})
export class MyComponent {
  count = 1;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
