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
    "component_host_binding_slots.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /component_host_binding_slots.ts
```ts
import {Component, HostBinding, Input, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: '',
    host: { 'style': 'width:200px; height:500px', 'class': 'foo baz', 'title': 'foo title' },
    standalone: false
})
export class MyComponent {
  @HostBinding('style') myStyle = {width: '100px'};

  @HostBinding('class') myClass = {bar: false};

  @HostBinding('id') id = 'some id';

  @HostBinding('title') title = 'some title';

  @Input('name') name = '';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
