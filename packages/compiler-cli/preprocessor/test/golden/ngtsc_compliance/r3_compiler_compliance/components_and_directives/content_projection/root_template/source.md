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
    "root_template.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /root_template.ts
```ts
import {Component, Directive, NgModule, TemplateRef} from '@angular/core';

@Component({
    selector: 'simple', template: '<div><ng-content></ng-content></div>',
    standalone: false
})
export class SimpleComponent {
}

@Component({
    selector: 'complex',
    template: `
    <div id="first"><ng-content select="span[title=toFirst]"></ng-content></div>
    <div id="second"><ng-content SELECT="span[title=toSecond]"></ng-content></div>`,
    standalone: false
})
export class ComplexComponent {
}

@Component({
    selector: 'my-app', template: '<simple>content</simple> <complex></complex>',
    standalone: false
})
export class MyApp {
}

@NgModule({declarations: [SimpleComponent, ComplexComponent, MyApp]})
export class MyModule {
}
```
