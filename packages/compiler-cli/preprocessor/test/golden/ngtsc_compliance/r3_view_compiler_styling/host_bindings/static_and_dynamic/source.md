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
    "static_and_dynamic.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /static_and_dynamic.ts
```ts
import {Component, HostBinding, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: '',
    host: { 'style': 'width:200px; height:500px', 'class': 'foo baz' },
    standalone: false
})
export class MyComponent {
  @HostBinding('style') myStyle = {width: '100px'};

  @HostBinding('class') myClass = {bar: false};

  @HostBinding('style.color') myColorProp = 'red';

  @HostBinding('class.foo') myFooClass = 'red';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
