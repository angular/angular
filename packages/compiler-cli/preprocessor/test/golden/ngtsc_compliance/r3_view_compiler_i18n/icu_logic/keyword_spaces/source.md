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
    "keyword_spaces.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /keyword_spaces.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>
    {count, select , 1 {one} other {more than one}}
    {count, plural , =1 {one} other {more than one}}
  </div>
`,
    standalone: false
})
export class MyComponent {
  count = 0;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
