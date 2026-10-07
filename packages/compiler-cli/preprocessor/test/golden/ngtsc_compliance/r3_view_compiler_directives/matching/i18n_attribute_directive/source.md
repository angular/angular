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
    "i18n_attribute_directive.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /i18n_attribute_directive.ts
```ts
import {Component, Directive, NgModule} from '@angular/core';

@Directive({
    selector: '[i18n]',
    standalone: false
})
export class I18nDirective {
}

@Component({
    selector: 'my-component', template: '<div i18n></div>',
    standalone: false
})
export class MyComponent {
}

@NgModule({declarations: [I18nDirective, MyComponent]})
export class MyModule {
}
```
