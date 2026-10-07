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
    "binding_slots.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /binding_slots.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component-with-interpolation',
    template: `
    <div class="foo foo-{{ fooId }}"></div>
  `,
    standalone: false
})
export class MyComponentWithInterpolation {
  fooId = '123';
}

@Component({
    selector: 'my-component-with-muchos-interpolation',
    template: `
    <div class="foo foo-{{ fooId }}-{{ fooUsername }}"></div>
  `,
    standalone: false
})
export class MyComponentWithMuchosInterpolation {
  fooId = '123';
  fooUsername = 'superfoo';
}

@Component({
    selector: 'my-component-without-interpolation',
    template: `
    <div [class]="exp"></div>
  `,
    standalone: false
})
export class MyComponentWithoutInterpolation {
  exp = 'bar';
}

@NgModule({
  declarations: [
    MyComponentWithInterpolation, MyComponentWithMuchosInterpolation,
    MyComponentWithoutInterpolation
  ]
})
export class MyModule {
}
```
