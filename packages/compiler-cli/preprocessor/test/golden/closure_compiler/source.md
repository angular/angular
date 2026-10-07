# /tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "es2022",
    "module": "es2022",
    "moduleResolution": "node"
  },
  "angularCompilerOptions": {
    "annotateForClosureCompiler": true
  },
  "files": ["index.ts"]
}
```

# /index.ts
```ts
import {Component, Injectable} from '@angular/core';

@Injectable()
export class MyService {}


@Component({
    selector: 'my-app',
   template: '<div>This is a very long template string designed to exceed the one hundred character threshold of the constant pool sharing mechanism in the Angular compiler when annotateForClosureCompiler is enabled.</div>',
   styles: ['div { color: red; --long-prop: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; }']
})
export class MyApp {
  show = true;
}

@Component({
    selector: 'my-other-app',
   template: '<div>Short template</div>',
   styles: ['div { color: red; --long-prop: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; }']
})
export class MyOtherApp {}
```
