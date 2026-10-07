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
    "host_binding_slots.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /host_binding_slots.ts
```ts
import {Component, Directive, NgModule} from '@angular/core';

@Directive({
    selector: '[my-dir]',
    host: {
        '[title]': 'title',
        '[class.foo]': 'foo',
        '[@anim]': `{
      value: _animValue,
      params: {
        param1: _animParam1,
        param2: _animParam2
      }
    }`
    },
    standalone: false
})
export class MyDir {
  title = '';
  foo = true;
  _animValue = null;
  _animParam1 = null;
  _animParam2 = null;
}

@Component({
    selector: 'my-app',
    template: `
    <div my-dir></div>
  `,
    standalone: false
})
export class MyAppComp {
}

@NgModule({declarations: [MyAppComp, MyDir]})
export class MyModule {
}
```
