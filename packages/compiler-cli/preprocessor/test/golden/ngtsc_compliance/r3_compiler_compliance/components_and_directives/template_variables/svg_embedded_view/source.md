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
    "for_of.ts",
    "svg_embedded_view.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /for_of.ts
```ts
import {Directive, Input, SimpleChanges, TemplateRef, ViewContainerRef} from '@angular/core';

export interface ForOfContext {
  $implicit: any;
  index: number;
  even: boolean;
  odd: boolean;
}

@Directive({
    selector: '[forOf]',
    standalone: false
})
export class ForOfDirective {
  private previous!: any[];

  constructor(private view: ViewContainerRef, private template: TemplateRef<any>) {}

  @Input() forOf!: any[];

  ngOnChanges(simpleChanges: SimpleChanges) {}
}
```

# /svg_embedded_view.ts
```ts
import {Component, NgModule} from '@angular/core';
import {ForOfDirective} from './for_of';

@Component({
    selector: 'my-component',
    template: `<svg><g *for="let item of items"><circle></circle></g></svg>`,
    standalone: false
})
export class MyComponent {
  items = [{data: 42}, {data: 42}];
}

@NgModule({declarations: [MyComponent, ForOfDirective]})
export class MyModule {
}
```
