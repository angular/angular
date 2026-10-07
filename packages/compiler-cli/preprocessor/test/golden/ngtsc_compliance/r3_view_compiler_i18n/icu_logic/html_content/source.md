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
    "html_content.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /html_content.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    template: `
  <div i18n>
    {gender, select, male {male - <b>male</b>} female {female <b>female</b>} other {<div class="other"><i>other</i></div>}}
    <b>Other content</b>
    <div class="other"><i>Another content</i></div>
  </div>
`,
    standalone: false
})
export class MyComponent {
  gender = 'female';
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```
