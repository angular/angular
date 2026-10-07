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
    "let_variable_and_reference.ts"
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

# /let_variable_and_reference.ts
```ts
import {Component, NgModule} from '@angular/core';
import {ForOfDirective} from './for_of';

@Component({
    selector: 'my-component',
    template: `<ul><li *for="let item of items">{{item.name}}</li></ul>`,
    standalone: false
})
export class MyComponent {
  items = [{name: 'one'}, {name: 'two'}];
}

@NgModule({declarations: [MyComponent, ForOfDirective]})
export class MyModule {
}
```
