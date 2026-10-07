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
    "inline_template_legacy_normalized.ts"
  ],
  "angularCompilerOptions": {
    "i18nNormalizeLineEndingsInICUs": true,
    "enableI18nLegacyMessageIdFormat": true
  }
}
```

# /inline_template_legacy_normalized.ts
```ts
import {Component, NgModule} from '@angular/core';

@Component({
    selector: 'my-component',
    // NOTE: This template has escaped `\r\n` line-endings markers that will be converted to real
    // `\r\n` line-ending chars when loaded from the test file-system.
    template: `
<div title="abc
def" i18n-title i18n>
Some Message
{
  value,
  select,
  =0 {
    zero
  }
}</div>`,
    standalone: false
})
export class MyComponent {
  value!: any;
}

@NgModule({declarations: [MyComponent]})
export class MyModule {
}
```

# /template.html
```html
<!--
  NOTE: This template has escaped `\r\n` line-endings markers that will be converted to real `\r\n` line-ending chars when loaded from the test file-system.
        This conversion happens in the monkeyPatchReadFile() function, which changes `fs.readFile()`.
-->
<div title="abc
def" i18n-title i18n>
  Some Message
  {
    value,
    select,
    =0 {
      zero
    }
  }</div>
```
