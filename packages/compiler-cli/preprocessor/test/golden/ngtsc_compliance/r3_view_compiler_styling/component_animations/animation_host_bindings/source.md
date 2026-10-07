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
    "animation_host_bindings.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /animation_host_bindings.ts
```ts
import {Component, Directive, NgModule} from '@angular/core';

@Directive({
    selector: '[my-anim-dir]',
    host: { '[@myAnim]': 'myAnimState', '(@myAnim.start)': 'onStart()', '(@myAnim.done)': 'onDone()' },
    standalone: false
})
class MyAnimDir {
  onStart() {}
  onDone() {}
  myAnimState = '123';
}

@Component({
    selector: 'my-cmp',
    template: `
    <div my-anim-dir></div>
  `,
    standalone: false
})
class MyComponent {
}

@NgModule({declarations: [MyComponent, MyAnimDir]})
export class MyModule {
}
```
