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
    "parent_template_variable.ts"
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

# /parent_template_variable.ts
```ts
import {Component, NgModule} from '@angular/core';
import {ForOfDirective} from './for_of';

@Component({
    selector: 'my-component',
    template: `
  <ul>
    <li *for="let item of items">
      <div>{{item.name}}</div>
      <ul>
        <li *for="let info of item.infos">
          {{item.name}}: {{info.description}}
        </li>
      </ul>
    </li>
  </ul>`,
    standalone: false
})
export class MyComponent {
  items = [
    {name: 'one', infos: [{description: '11'}, {description: '12'}]},
    {name: 'two', infos: [{description: '21'}, {description: '22'}]}
  ];
}

@NgModule({declarations: [MyComponent, ForOfDirective]})
export class MyModule {
}
```
